import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client with service role key for database operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Add this to your environment variables
const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET!; // Add this to your environment variables

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, xi-signature',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the raw body for signature verification
    const body = await request.text();
    // ElevenLabs sends HMAC signature in the `ElevenLabs-Signature` header.
    // Older examples (or other APIs) may use `xi-signature`, so we keep it as a fallback.
    const signatureHeader =
      request.headers.get('ElevenLabs-Signature') ||
      request.headers.get('elevenlabs-signature') ||
      request.headers.get('xi-signature');

    // Validate environment variables
    if (!webhookSecret) {
      console.error('ELEVENLABS_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Database connection not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // This code now runs on every request, enforcing signature validation.
    // The development bypass has been removed.
    if (!signatureHeader) {
      console.error('Missing signature header from ElevenLabs');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let valid = false;

    // Case 1: New format t=timestamp,v0=hash
    if (signatureHeader.includes('v0=')) {
      const parts = signatureHeader.split(',');
      const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1];
      const hash = parts.find((p) => p.startsWith('v0='))?.split('=')[1];

      if (!timestamp || !hash) {
        console.error('Invalid signature header format');
        return new Response(
          JSON.stringify({ error: 'Invalid signature header format' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const base = `${timestamp}.${body}`;
      const expected = crypto.createHmac('sha256', webhookSecret).update(base).digest('hex');
      valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
    } else {
      // Case 2: Legacy format sha256=<hash>
      const provided = signatureHeader.replace('sha256=', '');
      const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    }

    if (!valid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine event type (new docs use `type`)
    const eventType = webhookData.type ?? webhookData.event_type;

    // Validate that this is a post_call_transcription event
    if (eventType !== 'post_call_transcription') {
      console.log('Ignoring non-transcription event:', eventType);
      return new Response(
        JSON.stringify({ message: 'Event ignored' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract patient_id from the webhook metadata
    const patientId =
      webhookData.data?.metadata?.patient_id ||
      webhookData.data?.conversation_initiation_client_data?.dynamic_variables?.patient_id ||
      webhookData.data?.user_id ||
      webhookData.metadata?.patient_id;

    // The logic for a default patient ID is removed. The patientId must now be passed from the client.
    if (!patientId) {
      console.error('No patient_id found in webhook data:', {
        metadata: webhookData.data?.metadata,
        user_id: webhookData.data?.user_id,
        webhook_metadata: webhookData.metadata
      });
      return new Response(
        JSON.stringify({ error: 'Patient ID not found in webhook data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that the patient exists in our database
    const { data: patient, error: patientError } = await supabase
      .from('profiles')
      .select('id', 'role')
      .eq('id', patientId)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient) {
      console.error('Patient not found:', patientId, patientError);
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Insert the conversation data into the database
    const { data: conversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        patient_id: patientId,
        conversation_data: webhookData.data // Store the entire data object
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert conversation:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save conversation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Successfully saved conversation:', {
      conversationId: conversation.id,
      patientId: patientId,
      eventType: eventType
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId: conversation.id,
        message: 'Conversation saved successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return new Response(
    JSON.stringify({ message: 'ElevenLabs webhook endpoint - POST only' }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    }
  );
} 