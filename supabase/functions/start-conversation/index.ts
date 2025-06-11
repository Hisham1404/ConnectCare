import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StartConversationRequest {
  agent_id: string;
  patient_id?: string;
  conversation_context?: {
    patient_name?: string;
    recovery_stage?: string;
    medications?: string[];
    recent_symptoms?: string[];
    pain_level?: number;
  };
}

interface StartConversationResponse {
  success: boolean;
  conversation_id?: string;
  signed_url?: string;
  error?: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get environment variables
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY')
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY')

    if (!PICA_SECRET_KEY || !PICA_ELEVENLABS_CONNECTION_KEY) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error. Missing API credentials.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const requestBody: StartConversationRequest = await req.json()
    const { agent_id, patient_id, conversation_context } = requestBody

    if (!agent_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'agent_id is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare conversation initiation data
    const conversationData: any = {
      agent_id: agent_id
    }

    // Add patient context if provided
    if (conversation_context) {
      conversationData.client_data = {
        patient_id: patient_id,
        patient_name: conversation_context.patient_name,
        recovery_stage: conversation_context.recovery_stage,
        medications: conversation_context.medications,
        recent_symptoms: conversation_context.recent_symptoms,
        pain_level: conversation_context.pain_level,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Starting conversation with data:', JSON.stringify(conversationData, null, 2))

    // Make request to start conversation via Pica API
    const response = await fetch('https://api.picaos.com/v1/passthrough/v1/convai/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::start_conversation'
      },
      body: JSON.stringify(conversationData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pica API error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to start conversation: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Conversation started successfully:', result)

    const successResponse: StartConversationResponse = {
      success: true,
      conversation_id: result.conversation_id,
      signed_url: result.signed_url,
      message: 'Conversation started successfully'
    }

    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in start-conversation function:', error)
    
    const errorResponse: StartConversationResponse = {
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})