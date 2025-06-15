import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MessageCircle, Trash2 } from 'lucide-react-native';

import ConvAiDOMComponent from '../../components/ConvAI';
import tools from '../../utils/tools';
import { useTranscript } from '../../context/TranscriptContext';

export default function ChatScreen() {
  const { transcript, clearTranscript, isRecording, addMessage, setIsRecording } = useTranscript();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Text style={styles.title}>AI Health Assistant</Text>
        <Text style={styles.description}>
          {isRecording ? 'Listening...' : 'Press the button to talk to the assistant.'}
        </Text>
        
        {/* Transcript Display */}
        {transcript.length > 0 && (
          <View style={styles.transcriptContainer}>
            <View style={styles.transcriptHeader}>
              <View style={styles.transcriptTitleContainer}>
                <MessageCircle color="#94A3B8" size={16} />
                <Text style={styles.transcriptTitle}>Conversation</Text>
              </View>
              <TouchableOpacity onPress={clearTranscript} style={styles.clearButton}>
                <Trash2 color="#EF4444" size={16} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.transcriptScroll} showsVerticalScrollIndicator={false}>
              {transcript.map((message) => (
                <View 
                  key={message.id} 
                  style={[
                    styles.messageContainer,
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  ]}
                >
                  <Text style={styles.messageRole}>
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text style={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.domComponentContainer}>
        <ConvAiDOMComponent
          dom={{ style: styles.domComponent }}
          platform={Platform.OS}
          get_battery_level={tools.get_battery_level}
          change_brightness={tools.change_brightness}
          flash_screen={tools.flash_screen}
          addMessage={addMessage}
          clearTranscript={clearTranscript}
          setIsRecording={setIsRecording}
        />
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  content: { 
    flex: 1,
    alignItems: 'center', 
    paddingHorizontal: 24,
    width: '100%'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#E2E8F0', 
    marginBottom: 16 
  },
  description: { 
    fontSize: 16, 
    color: '#94A3B8', 
    textAlign: 'center',
    marginBottom: 20
  },
  transcriptContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    maxHeight: 400,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transcriptTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  clearButton: {
    padding: 4,
  },
  transcriptScroll: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  assistantMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#64748B',
  },
  domComponentContainer: { 
    width: 120, 
    height: 120, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  domComponent: { 
    width: 120, 
    height: 120 
  },
});