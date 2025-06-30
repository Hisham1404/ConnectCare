'use dom';

import { Mic } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';

import tools from '../utils/tools';
import { useTranscript } from '../context/TranscriptContext';
import { supabase } from '@/lib/supabase';

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

async function requestMicrophonePermission() {
  try {
    // For React Native, use Expo Audio permissions
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Microphone permission denied', error);
    return false;
  }
}

// Helper function to fetch the most recent conversation summary
async function fetchLastConversationSummary(patientId: string): Promise<string | null> {
  try {
    // Validate UUID format before querying [[memory:2158610215576665254]]
    if (!isValidUUID(patientId)) {
      console.log('Invalid UUID format for patientId:', patientId);
      return null;
    }

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
  agentId,
  get_battery_level,
  change_brightness,
  flash_screen,
  addMessage,
  clearTranscript,
  setIsRecording,
}: {
  dom?: any; // Keep for compatibility but ignore
  platform: string;
  patientId?: string;
  agentId?: string;
  get_battery_level: typeof tools.get_battery_level;
  change_brightness: typeof tools.change_brightness;
  flash_screen: typeof tools.flash_screen;
  addMessage?: (message: { role: string; text: string }) => void;
  clearTranscript?: () => void;
  setIsRecording?: (recording: boolean) => void;
}) {
  // Use passed props or fallback to context
  const transcriptContext = useTranscript();
  const finalAddMessage = addMessage || transcriptContext.addMessage;
  const finalClearTranscript = clearTranscript || transcriptContext.clearTranscript;
  const finalSetIsRecording = setIsRecording || transcriptContext.setIsRecording;

  const [isConnected, setIsConnected] = useState(false);

  const startConversation = useCallback(async () => {
    finalClearTranscript(); // Clear previous conversation
    finalSetIsRecording(true);
    setIsConnected(true);
    
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone permission is required to use the voice assistant.');
      finalSetIsRecording(false);
      setIsConnected(false);
      return;
    }

    // Fetch previous conversation summary for context
    let previousSummary = null;
    if (patientId) {
      previousSummary = await fetchLastConversationSummary(patientId);
    }

    // For production builds, this will need ElevenLabs integration
    // This is a simplified version for build compatibility
    console.log('Starting conversation with:', {
      platform,
      patientId,
      agentId,
      previousSummary
    });

    // Add a demo message to show the component works
    setTimeout(() => {
      finalAddMessage({ role: 'assistant', text: 'Hello! How can I help you today?' });
    }, 1000);

  }, [platform, patientId, agentId, finalClearTranscript, finalSetIsRecording]);

  const stopConversation = useCallback(async () => {
    finalSetIsRecording(false);
    setIsConnected(false);
    console.log('Conversation ended');
  }, [finalSetIsRecording]);

  return (
    <Pressable
      style={[styles.callButton, isConnected && styles.callButtonActive]}
      onPress={!isConnected ? startConversation : stopConversation}
    >
      <View style={[styles.buttonInner, isConnected && styles.buttonInnerActive]}>
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