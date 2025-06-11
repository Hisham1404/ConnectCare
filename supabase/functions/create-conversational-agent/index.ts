import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ConversationalAgentRequest {
  patientId?: string;
  patientName?: string;
  medicalCondition?: string;
  customPrompt?: string;
  voiceId?: string;
  language?: string;
}

interface ElevenLabsAgentConfig {
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
        llm: string;
        temperature: number;
        max_tokens: number;
      };
      first_message: string;
      language: string;
    };
    asr: {
      quality: string;
      provider: string;
    };
    tts: {
      voice_id: string;
      optimize_streaming_latency: number;
      stability: number;
      similarity_boost: number;
    };
    conversation: {
      max_duration_seconds: number;
    };
  };
  platform_settings: {
    auth: {
      enable_auth: boolean;
    };
    privacy: {
      record_voice: boolean;
      retention_days: number;
      delete_transcript_and_pii: boolean;
      delete_audio: boolean;
    };
  };
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      patientId, 
      patientName = 'Patient',
      medicalCondition = 'post-surgery recovery',
      customPrompt,
      voiceId = 'cjVigY5qzO86Huf0OWal', // Default ElevenLabs voice
      language = 'en'
    }: ConversationalAgentRequest = await req.json()

    // Get environment variables
    const picaSecretKey = Deno.env.get('PICA_SECRET_KEY')
    const picaConnectionKey = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY')

    if (!picaSecretKey || !picaConnectionKey) {
      throw new Error('Missing required environment variables: PICA_SECRET_KEY or PICA_ELEVENLABS_CONNECTION_KEY')
    }

    // Create comprehensive medical prompt for ConnectCare AI
    const medicalPrompt = customPrompt || `You are a compassionate AI health assistant for ConnectCare AI, specifically designed to conduct daily health check-ins for patients recovering from medical procedures.

PATIENT CONTEXT:
- Patient Name: ${patientName}
- Medical Condition: ${medicalCondition}
- Patient ID: ${patientId || 'Not specified'}

YOUR ROLE:
You are conducting a daily health check-in to monitor the patient's recovery progress. Your responses should be:
- Warm, empathetic, and professional
- Medically informed but not diagnostic
- Focused on gathering accurate health information
- Encouraging and supportive

CONVERSATION FLOW:
1. Greet the patient warmly and ask how they're feeling today
2. Ask about pain levels (scale 1-10)
3. Inquire about medication compliance
4. Check on sleep quality and appetite
5. Ask about any concerning symptoms
6. Provide encouragement and next steps

IMPORTANT GUIDELINES:
- Always maintain a caring, professional tone
- Ask one question at a time for clarity
- Listen carefully to responses and ask follow-up questions when needed
- If patient reports concerning symptoms, advise them to contact their healthcare provider
- Never provide specific medical advice or diagnoses
- Focus on data collection for healthcare team review
- End with positive reinforcement and care instructions

Remember: You are a supportive health companion, not a replacement for medical professionals. Your goal is to help patients feel heard and cared for while gathering important health data.`

    // Configure the ElevenLabs conversational agent
    const agentConfig: ElevenLabsAgentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: medicalPrompt,
            llm: 'claude-3-5-sonnet',
            temperature: 0.3, // Lower temperature for more consistent medical responses
            max_tokens: 512
          },
          first_message: `Hello ${patientName}! I'm your ConnectCare AI assistant. I'm here for your daily health check-in. How are you feeling today?`,
          language: language
        },
        asr: {
          quality: 'high',
          provider: 'elevenlabs'
        },
        tts: {
          voice_id: voiceId,
          optimize_streaming_latency: 3, // Optimize for real-time conversation
          stability: 0.7, // Balanced stability for natural speech
          similarity_boost: 0.8 // High similarity for consistent voice
        },
        conversation: {
          max_duration_seconds: 600 // 10 minutes max per check-in
        }
      },
      platform_settings: {
        auth: {
          enable_auth: false // Simplified for healthcare use
        },
        privacy: {
          record_voice: true, // Record for medical documentation
          retention_days: 90, // Retain for 90 days for medical records
          delete_transcript_and_pii: false, // Keep for medical continuity
          delete_audio: false // Keep audio for medical review
        }
      },
      name: `ConnectCare AI - ${patientName} Daily Check-in`
    }

    // Make request to Pica Passthrough API
    const response = await fetch('https://api.picaos.com/v1/passthrough/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': picaSecretKey,
        'x-pica-connection-key': picaConnectionKey,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::xNo_w809TEu2pRzqcCQ4_w'
      },
      body: JSON.stringify(agentConfig)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pica API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    // Log successful creation for monitoring
    console.log(`✅ Conversational agent created successfully for patient ${patientId}:`, result.agent_id)

    return new Response(
      JSON.stringify({
        success: true,
        agent_id: result.agent_id,
        patient_id: patientId,
        patient_name: patientName,
        voice_id: voiceId,
        language: language,
        created_at: new Date().toISOString(),
        message: 'Conversational agent created successfully for ConnectCare AI'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error creating conversational agent:', error)
    
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