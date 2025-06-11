import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConversationalAgentRequest {
  prompt?: string;
  first_message?: string;
  voice_id?: string;
  agent_name?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ConversationalAgentResponse {
  success: boolean;
  agent_id?: string;
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
    const requestBody: ConversationalAgentRequest = await req.json()

    // Set default values
    const {
      prompt = "You are a helpful AI health assistant for ConnectCare AI, a remote patient monitoring application. You help patients with their daily health check-ins, answer questions about their recovery, and provide supportive guidance. Be empathetic, professional, and encouraging. Always remind users to consult their healthcare provider for serious medical concerns.",
      first_message = "Hello! I'm your ConnectCare AI assistant. How are you feeling today? I'm here to help with your daily check-in and answer any questions about your health and recovery.",
      voice_id = "cjVigY5qzO86Huf0OWal", // Default ElevenLabs voice
      agent_name = "ConnectCare AI Health Assistant",
      language = "en",
      temperature = 0.7,
      max_tokens = 512
    } = requestBody

    // Construct the request payload for ElevenLabs via Pica
    const payload = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: prompt,
            llm: "claude-3-5-sonnet",
            temperature: temperature,
            max_tokens: max_tokens
          },
          first_message: first_message,
          language: language,
          dynamic_variables: {
            dynamic_variable_placeholders: {}
          }
        },
        asr: {
          quality: "high",
          provider: "elevenlabs",
          user_input_audio_format: null,
          keywords: ["health", "pain", "medication", "symptoms", "recovery", "doctor", "emergency"]
        },
        turn: {
          turn_timeout: 30000,
          mode: null
        },
        tts: {
          model_id: null,
          voice_id: voice_id,
          agent_output_audio_format: null,
          optimize_streaming_latency: 3,
          stability: 0.5,
          similarity_boost: 0.75,
          pronunciation_dictionary_locators: []
        },
        conversation: {
          max_duration_seconds: 1800, // 30 minutes max conversation
          client_events: [null]
        }
      },
      platform_settings: {
        auth: {
          enable_auth: false,
          allowlist: [],
          shareable_token: ""
        },
        evaluation: {
          criteria: []
        },
        widget: {
          variant: null,
          avatar: {
            type: "default",
            url: ""
          },
          feedback_mode: null,
          bg_color: "#ffffff",
          text_color: "#1f2937",
          btn_color: "#FF5722",
          btn_text_color: "#ffffff",
          border_color: "#e5e7eb",
          focus_color: "#FF5722",
          border_radius: 12,
          btn_radius: 8,
          action_text: "Start Conversation",
          start_call_text: "Start Health Check-in",
          end_call_text: "End Check-in",
          expand_text: "Expand",
          listening_text: "Listening...",
          speaking_text: "Speaking...",
          shareable_page_text: "ConnectCare AI Health Assistant",
          terms_text: "By using this service, you agree to our terms and conditions.",
          terms_html: "",
          terms_key: "",
          language_selector: false,
          custom_avatar_path: ""
        },
        data_collection: {},
        overrides: {
          conversation_config_override: {
            agent: {
              prompt: false,
              first_message: false,
              language: false
            },
            tts: {
              voice_id: false
            }
          },
          custom_llm_extra_body: false,
          enable_conversation_initiation_client_data_from_webhook: false
        },
        call_limits: {
          agent_concurrency_limit: 10,
          daily_limit: 100
        },
        privacy: {
          record_voice: true,
          retention_days: 30,
          delete_transcript_and_pii: false,
          delete_audio: false,
          apply_to_existing_conversations: false
        },
        safety: {
          ivc: {
            is_unsafe: false,
            llm_reason: "",
            safety_prompt_version: 1,
            matched_rule_id: [null]
          },
          non_ivc: {
            is_unsafe: false,
            llm_reason: "",
            safety_prompt_version: 1,
            matched_rule_id: [null]
          }
        }
      },
      name: agent_name
    }

    console.log('Creating conversational agent with payload:', JSON.stringify(payload, null, 2))

    // Make request to Pica API
    const response = await fetch('https://api.picaos.com/v1/passthrough/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::create_agent'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pica API error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create conversational agent: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Conversational agent created successfully:', result)

    const successResponse: ConversationalAgentResponse = {
      success: true,
      agent_id: result.agent_id,
      message: 'Conversational agent created successfully'
    }

    return new Response(
      JSON.stringify(successResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-conversational-agent function:', error)
    
    const errorResponse: ConversationalAgentResponse = {
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