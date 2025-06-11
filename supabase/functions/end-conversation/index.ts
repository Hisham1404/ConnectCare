import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EndConversationRequest {
  conversationId: string;
  patientId: string;
  transcript?: string;
  summary?: string;
  duration?: number;
  healthMetrics?: {
    painLevel?: number;
    symptoms?: string[];
    medicationCompliance?: boolean;
    overallMood?: string;
    concerns?: string[];
  };
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const { 
      conversationId,
      patientId,
      transcript,
      summary,
      duration,
      healthMetrics
    }: EndConversationRequest = await req.json()

    if (!conversationId || !patientId) {
      throw new Error('Conversation ID and Patient ID are required')
    }

    // Get environment variables
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!elevenLabsApiKey) {
      console.warn('Missing ELEVENLABS_API_KEY - conversation will not be ended via API')
    }

    // End conversation via ElevenLabs API if key is available
    if (elevenLabsApiKey) {
      try {
        const endResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/end`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
          }
        })

        if (!endResponse.ok) {
          console.warn(`Failed to end conversation via ElevenLabs API: ${endResponse.status}`)
        }
      } catch (error) {
        console.warn('Error ending conversation via API:', error)
      }
    }

    // Save conversation data to Supabase if available
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Create a daily check-in record
      const checkinData = {
        patient_id: patientId,
        checkin_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        patient_notes: transcript || 'Voice conversation completed',
        ai_analysis: {
          conversation_id: conversationId,
          summary: summary,
          duration_seconds: duration,
          health_metrics: healthMetrics,
          analysis_type: 'elevenlabs_conversation',
          processed_at: new Date().toISOString()
        },
        completed_at: new Date().toISOString(),
        // Extract health metrics if available
        pain_level: healthMetrics?.painLevel,
        symptoms: healthMetrics?.symptoms,
        medications_taken: healthMetrics?.medicationCompliance || false
      }

      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert(checkinData, {
          onConflict: 'patient_id,checkin_date'
        })
        .select()

      if (error) {
        console.error('Error saving check-in to database:', error)
      } else {
        console.log('✅ Check-in saved to database:', data?.[0]?.id)
      }
    }

    console.log(`🏁 Conversation ended for patient ${patientId}: ${conversationId}`)

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversationId,
        patient_id: patientId,
        ended_at: new Date().toISOString(),
        transcript_saved: !!transcript,
        database_saved: !!(supabaseUrl && supabaseServiceKey),
        message: 'Conversation ended and data saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error ending conversation:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})