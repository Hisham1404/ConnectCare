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

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    const { 
      agentId, 
      patientId,
      sessionData 
    }: StartConversationRequest = await req.json()

    if (!agentId) {
      throw new Error('Agent ID is required to start conversation')
    }

    // Get environment variables
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    if (!elevenLabsApiKey) {
      throw new Error('Missing required environment variable: ELEVENLABS_API_KEY')
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

    // Start conversation via ElevenLabs API
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify(conversationConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
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
        websocket_url: result.websocket_url || result.signed_url,
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