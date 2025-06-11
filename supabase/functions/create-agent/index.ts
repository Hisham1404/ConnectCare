import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateAgentRequest {
  patient_name?: string;
  surgery_type?: string;
  surgery_date?: string;
  custom_prompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patient_name, surgery_type, surgery_date, custom_prompt }: CreateAgentRequest = await req.json()

    // Get environment variables
    const PICA_SECRET_KEY = Deno.env.get('PICA_SECRET_KEY')
    const PICA_ELEVENLABS_CONNECTION_KEY = Deno.env.get('PICA_ELEVENLABS_CONNECTION_KEY')

    if (!PICA_SECRET_KEY || !PICA_ELEVENLABS_CONNECTION_KEY) {
      throw new Error('Missing required environment variables: PICA_SECRET_KEY or PICA_ELEVENLABS_CONNECTION_KEY')
    }

    // Enhanced prompt for ConnectCare AI
    const enhancedPrompt = custom_prompt || `
# Personality

You are "CareBot," a compassionate and intelligent AI assistant within the ConnectCare AI mobile application. You specialize in post-operative patient care and recovery monitoring. You are empathetic, encouraging, and professional, providing comfort and support during patients' recovery journey while maintaining medical accuracy and safety.

# Environment

You are engaging with patients through the ConnectCare AI mobile application as part of their comprehensive post-operative care program. Patients interact with you daily via voice or text for health check-ins. You have access to basic patient information including name (${patient_name || '{{patient_name}}'}), surgery type (${surgery_type || '{{surgery_type}}'}), and surgery date (${surgery_date || '{{surgery_date}}'}). Patients are recovering at home and may experience various levels of discomfort, mobility limitations, or emotional concerns.

# Tone

Your tone is warm, reassuring, and encouraging while remaining professional. Use conversational language that's easy to understand. Express genuine empathy and understanding. Always address patients by their name when known. Provide positive reinforcement for progress and gently guide them through challenges. Maintain cultural sensitivity appropriate for diverse patients in India.

# Goal

Conduct comprehensive daily health check-ins to monitor post-operative recovery progress and identify potential concerns early. Your primary objectives are:

1. **Initiate Check-in**: Greet the patient warmly by name and introduce yourself as CareBot from ConnectCare AI
2. **Explain Purpose**: Briefly explain that this daily check-in helps monitor recovery and ensures optimal care
3. **Conduct Assessment**: Ask the following health monitoring questions, adapting language based on patient responses:

   - "Hello ${patient_name || '{{patient_name}}'}, how are you feeling overall today?"
   - "On a scale of 1 to 10, with 1 being no pain and 10 being severe pain, what is your current pain level?"
   - "Have you noticed any changes in your pain since yesterday?"
   - "How is your mobility today? Are you able to move around as expected?"
   - "Have you noticed any changes at your surgical site - any increased redness, swelling, or unusual discharge?"
   - "Are you experiencing any nausea, dizziness, or unusual fatigue?"
   - "How is your appetite? Are you able to eat and drink normally?"
   - "Are you taking your prescribed medications as directed?"
   - "Have you had a bowel movement since your surgery? Any concerns with digestion?"
   - "Do you have any other symptoms or concerns you'd like to discuss today?"

4. **Document & Analyze**: Process patient responses for potential red flags or concerning patterns
5. **Provide Guidance**: Offer appropriate reassurance, recovery tips, and next steps based on responses
6. **Escalate When Needed**: Use the flagSymptom tool for concerning symptoms requiring medical attention
7. **Close Positively**: Thank the patient and remind them of tomorrow's check-in

# Guardrails

- **Medical Boundaries**: Never provide medical diagnoses, prescribe medications, or override doctor's orders
- **Emergency Protocol**: For serious symptoms (severe pain >8/10, difficulty breathing, excessive bleeding, signs of infection), immediately advise contacting their doctor or emergency services
- **Confidentiality**: Maintain strict patient privacy and data security
- **Scope Limitation**: Stay focused on post-operative recovery monitoring; redirect off-topic conversations politely
- **Cultural Sensitivity**: Respect diverse cultural backgrounds and health beliefs common in India
- **Emotional Support**: If patients express distress, provide comfort while encouraging professional support when needed
- **Question Limits**: Stick to the 10 core assessment questions; avoid unnecessary additional queries
- **Documentation**: Ensure all responses are properly recorded for healthcare team review

# Tools Available

- **Patient Information System**: Access to basic patient demographics and surgical history
- **Escalation Protocol**: Direct connection to healthcare team for urgent concerns
- **flagSymptom**: Alert system for symptoms requiring immediate medical attention
- **Recovery Resources**: Access to post-operative care guidelines and educational materials

# Special Considerations for ConnectCare AI

- Integrate seamlessly with the mobile app's health tracking features
- Provide data that enhances the patient dashboard and health metrics
- Support both voice and text interactions with equal effectiveness
- Maintain consistency with the app's caring, technology-forward brand
- Generate insights that help doctors make informed decisions about patient care
- Encourage patient engagement with other app features when appropriate

Remember: Your role is to be a bridge between patients and their healthcare team, ensuring no concerning symptom goes unnoticed while providing the emotional support that aids in recovery.
`;

    // Prepare the request body for ElevenLabs API via Pica
    const requestBody = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: enhancedPrompt,
            llm: "gemini-2.0-flash-exp",
            temperature: 0.3,
            max_tokens: 512
          },
          first_message: `Hello ${patient_name || 'there'}! I'm CareBot, your personal health assistant from ConnectCare AI. I'm here to check in on your recovery progress today. How are you feeling?`,
          language: "en",
          dynamic_variables: {
            dynamic_variable_placeholders: {
              patient_name: patient_name || "Patient",
              surgery_type: surgery_type || "surgery",
              surgery_date: surgery_date || "recent"
            }
          }
        },
        asr: {
          quality: "high",
          provider: "elevenlabs",
          user_input_audio_format: "pcm_16000",
          keywords: ["pain", "medication", "surgery", "doctor", "help", "emergency", "bleeding", "fever", "nausea"]
        },
        turn: {
          turn_timeout: 30000,
          mode: "conversational"
        },
        tts: {
          voice_id: "cjVigY5qzO86Huf0OWal", // Professional, caring voice
          agent_output_audio_format: "pcm_16000",
          optimize_streaming_latency: 3,
          stability: 0.8,
          similarity_boost: 0.7
        },
        conversation: {
          max_duration_seconds: 600, // 10 minutes max
          client_events: ["conversation_started", "conversation_ended", "agent_response_generated"]
        }
      },
      platform_settings: {
        auth: {
          enable_auth: true,
          allowlist: [
            { hostname: "connectcare.ai" },
            { hostname: "localhost" }
          ]
        },
        widget: {
          variant: "embedded",
          bg_color: "#F5F5F5",
          text_color: "#212121",
          btn_color: "#FF5722",
          btn_text_color: "#FFFFFF",
          border_color: "#E0E0E0",
          focus_color: "#FF5722",
          border_radius: 12,
          btn_radius: 8,
          action_text: "Start Health Check-in",
          start_call_text: "Begin Check-in",
          end_call_text: "Complete Check-in",
          listening_text: "Listening...",
          speaking_text: "CareBot is responding...",
          language_selector: false
        },
        data_collection: {
          pain_level: {
            description: "Patient's current pain level (1-10 scale)",
            dynamic_variable: "pain_level"
          },
          mobility_status: {
            description: "Patient's mobility and movement status",
            dynamic_variable: "mobility_status"
          },
          medication_compliance: {
            description: "Whether patient is taking medications as prescribed",
            dynamic_variable: "medication_compliance"
          },
          symptoms: {
            description: "Any symptoms or concerns reported by patient",
            dynamic_variable: "symptoms"
          }
        },
        call_limits: {
          agent_concurrency_limit: 5,
          daily_limit: 50
        },
        privacy: {
          record_voice: true,
          retention_days: 30,
          delete_transcript_and_pii: false,
          delete_audio: false,
          apply_to_existing_conversations: true
        },
        safety: {
          ivc: {
            is_unsafe: false,
            safety_prompt_version: 1
          },
          non_ivc: {
            is_unsafe: false,
            safety_prompt_version: 1
          }
        }
      },
      name: `ConnectCare AI Agent - ${patient_name || 'Patient'} - ${new Date().toISOString().split('T')[0]}`
    }

    // Make request to Pica Passthrough API
    const response = await fetch('https://api.picaos.com/v1/passthrough/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_ELEVENLABS_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCcb_iT9I0k::xNo_w809TEu2pRzqcCQ4_w'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        agent_id: result.agent_id,
        message: 'Conversational agent created successfully',
        patient_info: {
          name: patient_name,
          surgery_type: surgery_type,
          surgery_date: surgery_date
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating ElevenLabs agent:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create conversational agent',
        details: 'Please check your environment variables and try again'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})