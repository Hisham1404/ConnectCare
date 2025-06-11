import { supabase } from './supabase';

export interface ConversationalAgentConfig {
  patientId?: string;
  patientName?: string;
  medicalCondition?: string;
  customPrompt?: string;
  voiceId?: string;
  language?: string;
}

export interface ConversationSession {
  agentId: string;
  conversationId: string;
  websocketUrl: string;
  sessionToken: string;
  patientId: string;
}

export interface HealthMetrics {
  painLevel?: number;
  symptoms?: string[];
  medicationCompliance?: boolean;
  overallMood?: string;
  concerns?: string[];
}

export class ConversationalAgentService {
  private static instance: ConversationalAgentService;
  private currentSession: ConversationSession | null = null;

  static getInstance(): ConversationalAgentService {
    if (!ConversationalAgentService.instance) {
      ConversationalAgentService.instance = new ConversationalAgentService();
    }
    return ConversationalAgentService.instance;
  }

  /**
   * Create a new conversational agent for a patient
   */
  async createAgent(config: ConversationalAgentConfig): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('create-conversational-agent', {
        body: config
      });

      if (error) {
        throw new Error(`Failed to create agent: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error creating agent');
      }

      console.log('✅ Conversational agent created:', data.agent_id);
      return data.agent_id;
    } catch (error) {
      console.error('❌ Error creating conversational agent:', error);
      throw error;
    }
  }

  /**
   * Start a conversation with an existing agent
   */
  async startConversation(
    agentId: string, 
    patientId: string,
    sessionData?: any
  ): Promise<ConversationSession> {
    try {
      const { data, error } = await supabase.functions.invoke('start-conversation', {
        body: {
          agentId,
          patientId,
          sessionData
        }
      });

      if (error) {
        throw new Error(`Failed to start conversation: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error starting conversation');
      }

      this.currentSession = {
        agentId,
        conversationId: data.conversation_id,
        websocketUrl: data.websocket_url,
        sessionToken: data.session_token,
        patientId
      };

      console.log('🎙️ Conversation started:', this.currentSession.conversationId);
      return this.currentSession;
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      throw error;
    }
  }

  /**
   * End the current conversation and save data
   */
  async endConversation(
    transcript?: string,
    summary?: string,
    duration?: number,
    healthMetrics?: HealthMetrics
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active conversation to end');
    }

    try {
      const { data, error } = await supabase.functions.invoke('end-conversation', {
        body: {
          conversationId: this.currentSession.conversationId,
          patientId: this.currentSession.patientId,
          transcript,
          summary,
          duration,
          healthMetrics
        }
      });

      if (error) {
        console.warn('Warning ending conversation:', error.message);
      }

      console.log('🏁 Conversation ended successfully');
      this.currentSession = null;
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      // Don't throw here - we want to clean up even if the API call fails
      this.currentSession = null;
    }
  }

  /**
   * Get the current active session
   */
  getCurrentSession(): ConversationSession | null {
    return this.currentSession;
  }

  /**
   * Check if there's an active conversation
   */
  hasActiveConversation(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Create a quick agent for daily check-ins
   */
  async createDailyCheckinAgent(patientName: string, patientId: string): Promise<string> {
    return this.createAgent({
      patientId,
      patientName,
      medicalCondition: 'post-surgery recovery',
      voiceId: 'cjVigY5qzO86Huf0OWal', // Warm, professional voice
      language: 'en'
    });
  }

  /**
   * Start a daily check-in conversation
   */
  async startDailyCheckin(patientId: string, patientName: string): Promise<ConversationSession> {
    // Create agent for this check-in
    const agentId = await this.createDailyCheckinAgent(patientName, patientId);
    
    // Start conversation with patient context
    return this.startConversation(agentId, patientId, {
      patientName,
      lastCheckinDate: new Date().toISOString().split('T')[0],
      sessionType: 'daily_checkin'
    });
  }
}

// Export singleton instance
export const conversationalAgent = ConversationalAgentService.getInstance();