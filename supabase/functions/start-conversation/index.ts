import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface StartConversationRequest {
  agentId: string;
  patientId?: string;
  sessionData?: {
    patientName?: string;
    lastCheckinDate?: string;
    currentMedications?: string[];
    recentSymptoms?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      agentId, 
      patientId,
      sessionData 
    }: StartConversationRequest = await req.json()

    if (!agentId) {
      throw new Error('Agent ID is required to start conversation')
    }

    // Get environment variables
    const picaSecretKey = Deno.env.get('PICA_SECRET_KEY')
    const picaConnectionKey = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY')

    if (!picaSecretKey || !picaConnectionKey) {
      throw new Error('Missing required environment variables')
    }

    // Prepare conversation initialization data
    const conversationConfig = {
      agent_id: agentId,
      client_data: {
        patient_id: patientId,
        session_start: new Date().toISOString(),
        patient_context: sessionData || {},
        app_version: 'ConnectCare AI v1.0.0'
      }
    }

    // Start conversation via Pica API
    const response = await fetch('https://api.picaos.com/v1/passthrough/v1/convai/conversations/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': picaSecretKey,
        'x-pica-connection-key': picaConnectionKey,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::start_conversation_action_id'
      },
      body: JSON.stringify(conversationConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to start conversation: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    console.log(`🎙️ Conversation started for patient ${patientId} with agent ${agentId}`)

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: result.conversation_id,
        agent_id: agentId,
        patient_id: patientId,
        websocket_url: result.websocket_url,
        session_token: result.session_token,
        started_at: new Date().toISOString(),
        message: 'Conversation started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error starting conversation:', error)
    
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