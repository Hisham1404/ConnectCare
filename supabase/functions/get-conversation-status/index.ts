import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface ConversationStatusResponse {
  success: boolean;
  conversation_id?: string;
  status?: string;
  transcript?: string;
  duration?: number;
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
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use GET.' 
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

    // Get conversation_id from URL parameters
    const url = new URL(req.url)
    const conversation_id = url.searchParams.get('conversation_id')

    if (!conversation_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'conversation_id parameter is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting conversation status for:', conversation_id)

    // Make request to get conversation status via Pica API
    const response = await fetch(`https://api.picaos.com/v1/passthrough/v1/convai/conversations/${conversation_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::get_conversation_status_action_id' // You'll need to get the correct action ID
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pica API error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to get conversation status: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Conversation status retrieved successfully:', result)

    const successResponse: ConversationStatusResponse = {
      success: true,
      conversation_id: result.conversation_id,
      status: result.status,
      transcript: result.transcript,
      duration: result.duration,
      message: 'Conversation status retrieved successfully'
    }

    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-conversation-status function:', error)
    
    const errorResponse: ConversationStatusResponse = {
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