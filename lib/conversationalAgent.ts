import { supabase } from './supabase';

export interface ConversationalAgentConfig {
  prompt?: string;
  first_message?: string;
  voice_id?: string;
  agent_name?: string;
  language?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ConversationContext {
  patient_name?: string;
  recovery_stage?: string;
  medications?: string[];
  recent_symptoms?: string[];
  pain_level?: number;
}

export interface ConversationalAgentResponse {
  success: boolean;
  agent_id?: string;
  error?: string;
  message?: string;
}

export interface StartConversationResponse {
  success: boolean;
  conversation_id?: string;
  signed_url?: string;
  error?: string;
  message?: string;
}

export interface ConversationStatusResponse {
  success: boolean;
  conversation_id?: string;
  status?: string;
  transcript?: string;
  duration?: number;
  error?: string;
  message?: string;
}

/**
 * Service for managing ElevenLabs conversational agents via Pica API
 */
export class ConversationalAgentService {
  
  /**
   * Create a new conversational agent
   */
  static async createAgent(config: ConversationalAgentConfig = {}): Promise<ConversationalAgentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-conversational-agent', {
        body: config
      });

      if (error) {
        console.error('Error creating conversational agent:', error);
        return {
          success: false,
          error: error.message || 'Failed to create conversational agent'
        };
      }

      return data;
    } catch (error) {
      console.error('Error in createAgent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Start a conversation with an existing agent
   */
  static async startConversation(
    agentId: string, 
    patientId?: string, 
    context?: ConversationContext
  ): Promise<StartConversationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('start-conversation', {
        body: {
          agent_id: agentId,
          patient_id: patientId,
          conversation_context: context
        }
      });

      if (error) {
        console.error('Error starting conversation:', error);
        return {
          success: false,
          error: error.message || 'Failed to start conversation'
        };
      }

      return data;
    } catch (error) {
      console.error('Error in startConversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the status of an ongoing conversation
   */
  static async getConversationStatus(conversationId: string): Promise<ConversationStatusResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('get-conversation-status', {
        body: { conversation_id: conversationId }
      });

      if (error) {
        console.error('Error getting conversation status:', error);
        return {
          success: false,
          error: error.message || 'Failed to get conversation status'
        };
      }

      return data;
    } catch (error) {
      console.error('Error in getConversationStatus:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a default health assistant agent for ConnectCare AI
   */
  static async createHealthAssistantAgent(): Promise<ConversationalAgentResponse> {
    const config: ConversationalAgentConfig = {
      prompt: `You are a helpful AI health assistant for ConnectCare AI, a remote patient monitoring application used in India. You help patients with their daily health check-ins, answer questions about their recovery, and provide supportive guidance.

Key responsibilities:
- Conduct daily health check-ins with patients
- Ask about pain levels, medication compliance, symptoms, and mood
- Provide encouragement and support during recovery
- Collect health data in a conversational manner
- Be culturally sensitive to Indian patients and healthcare practices

Guidelines:
- Be empathetic, professional, and encouraging
- Use simple, clear language that patients can understand
- Always remind users to consult their healthcare provider for serious medical concerns
- Respect patient privacy and maintain confidentiality
- Be patient and understanding with elderly patients or those with limited technology experience

Remember: You are not a replacement for medical professionals, but a supportive tool to help patients stay connected with their healthcare team.`,
      
      first_message: "Namaste! I'm your ConnectCare AI health assistant. I'm here to help with your daily health check-in. How are you feeling today?",
      
      agent_name: "ConnectCare AI Health Assistant",
      language: "en",
      temperature: 0.7,
      max_tokens: 512,
      voice_id: "cjVigY5qzO86Huf0OWal" // Default ElevenLabs voice - you can change this
    };

    return this.createAgent(config);
  }

  /**
   * Start a health check-in conversation with patient context
   */
  static async startHealthCheckin(
    agentId: string,
    patientId: string,
    patientData: {
      name: string;
      recoveryStage?: string;
      medications?: string[];
      recentSymptoms?: string[];
      lastPainLevel?: number;
    }
  ): Promise<StartConversationResponse> {
    const context: ConversationContext = {
      patient_name: patientData.name,
      recovery_stage: patientData.recoveryStage,
      medications: patientData.medications,
      recent_symptoms: patientData.recentSymptoms,
      pain_level: patientData.lastPainLevel
    };

    return this.startConversation(agentId, patientId, context);
  }
}

// Export default instance for easy usage
export const conversationalAgent = ConversationalAgentService;