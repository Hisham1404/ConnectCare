'use dom';

import { useConversation, Message } from '@elevenlabs/react';
import { Mic } from 'lucide-react-native';
import { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import tools from '../utils/tools';
import { useTranscript } from '../context/TranscriptContext';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/models';

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied', error);
    return false;
  }
}

// Helper function to fetch the most recent conversation summary
async function fetchLastConversationSummary(patientId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('conversation_data')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Handle the case where no conversations exist (not an error)
      if (error.code === 'PGRST116') {
        console.log('No previous conversations found for patient:', patientId);
        return null;
      }
      throw error;
    }

    if (!data?.conversation_data) {
      console.log('No conversation data found for patient:', patientId);
      return null;
    }

    const conversationData = data.conversation_data;
    
    // Extract summary from various possible locations in the data
    const summary = conversationData.analysis?.transcript_summary ||
                   conversationData.summary ||
                   conversationData.analysis?.summary ||
                   null;

    if (summary) {
      console.log('Found previous conversation summary for patient:', patientId);
      
      // Truncate summary if too long to prevent overwhelming the agent
      const maxLength = 300;
      if (summary.length > maxLength) {
        return summary.substring(0, maxLength) + '...';
      }
      
      return summary;
    }

    // If no summary is available, try to create a basic one from transcript
    if (conversationData.transcript && Array.isArray(conversationData.transcript)) {
      const transcript = conversationData.transcript;
      const userMessages = transcript
        .filter(segment => segment.speaker?.toLowerCase() === 'user')
        .map(segment => segment.text)
        .join(' ');
      
      if (userMessages.trim()) {
        const basicSummary = `Previous conversation topics: ${userMessages.substring(0, 200)}...`;
        console.log('Created basic summary from transcript for patient:', patientId);
        return basicSummary;
      }
    }

    console.log('No usable conversation data found for patient:', patientId);
    return null;
  } catch (error) {
    console.error('Error fetching last conversation summary:', error);
    return null;
  }
}

export default function ConvAiDOMComponent({
  platform,
  patientId,
  get_battery_level,
  change_brightness,
  flash_screen,
}: {
  dom?: import('expo/dom').DOMProps;
  platform: string;
  patientId?: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
}) {
  const { addMessage, clearTranscript, setIsRecording } = useTranscript();

  const onMessage = (message: Message) => {
    console.log('Received message:', message);
    
    // Only add messages that have final text content
    if (message.type === 'user_transcript' && message.text && message.text.trim()) {
      addMessage({ role: 'user', text: message.text.trim() });
    } else if (message.type === 'agent_response' && message.text && message.text.trim()) {
      addMessage({ role: 'assistant', text: message.text.trim() });
    }
  };

  const conversation = useConversation({
    agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID',
    elevenLabsApiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY',
    onMessage: onMessage,
  });

  const startConversation = useCallback(async () => {
    clearTranscript(); // Clear previous conversation
    setIsRecording(true);
    
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert('Microphone permission is required.');
      setIsRecording(false);
      return;
    }

    // Fetch previous conversation summary for context
    let previousSummary = null;
    if (patientId) {
      previousSummary = await fetchLastConversationSummary(patientId);
    }

    // Prepare dynamic variables with previous context
    const dynamicVariables: { [key: string]: any } = {
      platform,
      patient_id: patientId,
    };

    // Add previous summary if available
    if (previousSummary) {
      dynamicVariables.previous_summary = previousSummary;
      console.log('Starting conversation with context from previous call');
    } else {
      dynamicVariables.previous_summary = "This is our first conversation.";
      console.log('Starting conversation without previous context');
    }
    
    await conversation.startSession({
      dynamicVariables,
      clientTools: { get_battery_level, change_brightness, flash_screen },
    });
  }, [conversation, platform, patientId, get_battery_level, change_brightness, flash_screen, clearTranscript, setIsRecording]);

  const stopConversation = useCallback(async () => {
    setIsRecording(false);
    await conversation.endSession();
  }, [conversation, setIsRecording]);

  return (
    <Pressable
      style={[styles.callButton, conversation.status === 'connected' && styles.callButtonActive]}
      onPress={conversation.status === 'disconnected' ? startConversation : stopConversation}
    >
      <View style={[styles.buttonInner, conversation.status === 'connected' && styles.buttonInnerActive]}>
        <Mic size={32} color="#E2E8F0" strokeWidth={1.5} style={styles.buttonIcon} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callButton: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  callButtonActive: { 
    backgroundColor: 'rgba(239, 68, 68, 0.2)' 
  },
  buttonInner: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#3B82F6', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#3B82F6', 
    shadowOffset: { width: 0, height: 0 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 5 
  },
  buttonInnerActive: { 
    backgroundColor: '#EF4444', 
    shadowColor: '#EF4444' 
  },
  buttonIcon: { 
    transform: [{ translateY: 2 }] 
  },
});

export default ConvAiDOMComponent