import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { MessageCircle, Bot, Mic, MicOff, Phone, PhoneOff, Zap, Activity, Heart } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ElevenLabs Conversation import for web platform
let Conversation: any = null;
if (Platform.OS === 'web') {
  try {
    // Dynamic import for web platform only
    import('@elevenlabs/client').then((module) => {
      Conversation = module.Conversation;
    });
  } catch (error) {
    console.warn('ElevenLabs client not available:', error);
  }
}

export default function ChatScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentMode, setAgentMode] = useState<'listening' | 'speaking' | 'thinking'>('listening');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const conversationRef = useRef<any>(null);

  // System prompt for the AI agent
  const systemPrompt = `You are a compassionate healthcare AI assistant for ConnectCare AI, specializing in post-surgery patient care and elderly health monitoring. Your role is to:

1. Conduct daily health check-ins with patients
2. Monitor vital signs and symptoms
3. Provide emotional support and encouragement
4. Alert healthcare providers to concerning changes
5. Guide patients through recovery exercises and medication reminders

Keep responses concise, empathetic, and medically appropriate. Always prioritize patient safety and encourage them to contact their healthcare provider for urgent concerns.`;

  // Check microphone permissions on component mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        setHasPermission(true);
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setHasPermission(false);
        setError('Microphone access is required for voice conversations. Please allow microphone access and refresh the page.');
      }
    } else {
      // For mobile platforms, we'll assume permission is granted for now
      // In a real implementation, you'd use expo-av or similar to check permissions
      setHasPermission(true);
    }
  };

  const startConversation = async () => {
    if (!hasPermission) {
      await checkMicrophonePermission();
      return;
    }

    if (Platform.OS !== 'web') {
      setError('Voice conversations are currently only supported on web platform.');
      return;
    }

    if (!Conversation) {
      setError('ElevenLabs client is not available. Please refresh the page.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Replace 'YOUR_AGENT_ID' with your actual ElevenLabs agent ID
      const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || 'YOUR_AGENT_ID';
      
      if (agentId === 'YOUR_AGENT_ID') {
        throw new Error('Please configure your ElevenLabs Agent ID in environment variables');
      }

      conversationRef.current = await Conversation.startSession({
        agentId: agentId,
        onConnect: () => {
          console.log('Connected to ElevenLabs agent');
          setIsConnected(true);
          setIsConnecting(false);
          setAgentMode('listening');
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs agent');
          setIsConnected(false);
          setIsConnecting(false);
          setAgentMode('listening');
        },
        onError: (error: any) => {
          console.error('ElevenLabs conversation error:', error);
          setError(`Connection error: ${error.message || 'Unknown error'}`);
          setIsConnecting(false);
          setIsConnected(false);
        },
        onModeChange: (mode: any) => {
          console.log('Agent mode changed:', mode.mode);
          setAgentMode(mode.mode === 'speaking' ? 'speaking' : 'listening');
        },
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setError(`Failed to start conversation: ${error.message || 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const stopConversation = async () => {
    if (conversationRef.current) {
      try {
        await conversationRef.current.endSession();
        conversationRef.current = null;
        setIsConnected(false);
        setAgentMode('listening');
      } catch (error: any) {
        console.error('Error stopping conversation:', error);
        setError(`Error stopping conversation: ${error.message}`);
      }
    }
  };

  const getStatusColor = () => {
    if (error) return Colors.error;
    if (isConnected) return Colors.success;
    if (isConnecting) return Colors.warning;
    return Colors.textSecondary;
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getAgentModeIcon = () => {
    switch (agentMode) {
      case 'speaking':
        return <Activity color={Colors.accent} size={20} />;
      case 'thinking':
        return <LoadingSpinner size="small" color={Colors.accent} />;
      case 'listening':
      default:
        return <Mic color={Colors.success} size={20} />;
    }
  };

  const getAgentModeText = () => {
    switch (agentMode) {
      case 'speaking':
        return 'AI is speaking...';
      case 'thinking':
        return 'AI is thinking...';
      case 'listening':
      default:
        return 'AI is listening...';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiHeaderAvatar}>
            <Bot color={Colors.accent} size={24} />
          </View>
          <Text style={styles.headerTitle}>AI Health Assistant</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>Status: {getStatusText()}</Text>
          </View>
          
          {isConnected && (
            <View style={styles.statusRow}>
              {getAgentModeIcon()}
              <Text style={styles.agentModeText}>{getAgentModeText()}</Text>
            </View>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <FeedbackButton
              onPress={() => setError(null)}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </FeedbackButton>
          </View>
        )}

        {/* Permission Request */}
        {hasPermission === false && (
          <View style={styles.permissionContainer}>
            <Mic color={Colors.warning} size={48} />
            <Text style={styles.permissionTitle}>Microphone Access Required</Text>
            <Text style={styles.permissionDescription}>
              To use the voice assistant, please allow microphone access in your browser settings.
            </Text>
            <FeedbackButton
              onPress={checkMicrophonePermission}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionButtonText}>Check Permission</Text>
            </FeedbackButton>
          </View>
        )}

        {/* Conversation Controls */}
        {hasPermission && !error && (
          <View style={styles.controlsContainer}>
            <View style={styles.conversationVisualizer}>
              <View style={[
                styles.visualizerCircle,
                isConnected && styles.visualizerActive,
                agentMode === 'speaking' && styles.visualizerSpeaking
              ]}>
                {isConnecting ? (
                  <LoadingSpinner size="large" color={Colors.accent} />
                ) : isConnected ? (
                  agentMode === 'speaking' ? (
                    <Activity color={Colors.surface} size={48} />
                  ) : (
                    <Mic color={Colors.surface} size={48} />
                  )
                ) : (
                  <Bot color={Colors.textSecondary} size={48} />
                )}
              </View>
            </View>

            <Text style={styles.instructionText}>
              {isConnected 
                ? 'Speak naturally with your AI health assistant'
                : 'Tap the button below to start your health conversation'
              }
            </Text>

            <View style={styles.buttonContainer}>
              {!isConnected ? (
                <FeedbackButton
                  onPress={startConversation}
                  style={[styles.actionButton, styles.startButton]}
                  disabled={isConnecting || !hasPermission}
                >
                  {isConnecting ? (
                    <LoadingSpinner size="small" color={Colors.surface} />
                  ) : (
                    <>
                      <Phone color={Colors.surface} size={20} />
                      <Text style={styles.actionButtonText}>Start Conversation</Text>
                    </>
                  )}
                </FeedbackButton>
              ) : (
                <FeedbackButton
                  onPress={stopConversation}
                  style={[styles.actionButton, styles.stopButton]}
                >
                  <PhoneOff color={Colors.surface} size={20} />
                  <Text style={styles.actionButtonText}>End Conversation</Text>
                </FeedbackButton>
              )}
            </View>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What I can help you with:</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Heart color={Colors.heartRate} size={16} />
              <Text style={styles.featureText}>Daily health check-ins</Text>
            </View>
            <View style={styles.featureItem}>
              <Activity color={Colors.accent} size={16} />
              <Text style={styles.featureText}>Symptom monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap color={Colors.warning} size={16} />
              <Text style={styles.featureText}>Medication reminders</Text>
            </View>
            <View style={styles.featureItem}>
              <Bot color={Colors.success} size={16} />
              <Text style={styles.featureText}>Recovery guidance</Text>
            </View>
          </View>
        </View>

        {/* Platform Notice */}
        {Platform.OS !== 'web' && (
          <View style={styles.platformNotice}>
            <Text style={styles.platformNoticeText}>
              Voice conversations are currently available on web platform only.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  statusContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  agentModeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 20,
  },
  dismissButton: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  dismissButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  conversationVisualizer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  visualizerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.textTertiary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  visualizerActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
  visualizerSpeaking: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  instructionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  startButton: {
    backgroundColor: Colors.success,
  },
  stopButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  platformNotice: {
    backgroundColor: `${Colors.warning}${Colors.opacity.light}`,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  platformNoticeText: {
    color: Colors.warning,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});