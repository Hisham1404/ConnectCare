import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, MessageCircle, Loader } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../ui/FeedbackButton';
import LoadingSpinner from '../ui/LoadingSpinner';
import { conversationalAgent, ConversationContext } from '../../lib/conversationalAgent';

const { width, height } = Dimensions.get('window');

interface ConversationalAgentChatProps {
  agentId?: string;
  patientId?: string;
  patientContext?: ConversationContext;
  onConversationStart?: (conversationId: string) => void;
  onConversationEnd?: (transcript: string, duration: number) => void;
  onError?: (error: string) => void;
}

type ConversationState = 'idle' | 'creating' | 'connecting' | 'active' | 'ending' | 'error';

export default function ConversationalAgentChat({
  agentId,
  patientId,
  patientContext,
  onConversationStart,
  onConversationEnd,
  onError
}: ConversationalAgentChatProps) {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(agentId || null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversationDuration, setConversationDuration] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Animations
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rippleAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  // Timer for conversation duration
  const durationTimer = useRef<NodeJS.Timeout>();
  const statusCheckTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (conversationState === 'active') {
      // Start duration timer
      durationTimer.current = setInterval(() => {
        setConversationDuration(prev => prev + 1);
      }, 1000);

      // Start status checking
      if (conversationId) {
        statusCheckTimer.current = setInterval(() => {
          checkConversationStatus();
        }, 2000);
      }
    } else {
      // Clear timers
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      if (statusCheckTimer.current) {
        clearInterval(statusCheckTimer.current);
      }
    }

    return () => {
      if (durationTimer.current) clearInterval(durationTimer.current);
      if (statusCheckTimer.current) clearInterval(statusCheckTimer.current);
    };
  }, [conversationState, conversationId]);

  useEffect(() => {
    // Pulse animation for active state
    if (conversationState === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [conversationState]);

  const checkConversationStatus = async () => {
    if (!conversationId) return;

    try {
      const response = await conversationalAgent.getConversationStatus(conversationId);
      if (response.success && response.status) {
        if (response.status === 'completed' || response.status === 'ended') {
          handleConversationEnd(response.transcript || '', response.duration || conversationDuration);
        }
      }
    } catch (error) {
      console.error('Error checking conversation status:', error);
    }
  };

  const createAgent = async () => {
    setConversationState('creating');
    setStatusMessage('Creating AI assistant...');

    try {
      const response = await conversationalAgent.createHealthAssistantAgent();
      
      if (response.success && response.agent_id) {
        setCurrentAgentId(response.agent_id);
        setStatusMessage('AI assistant created successfully');
        return response.agent_id;
      } else {
        throw new Error(response.error || 'Failed to create agent');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create AI assistant';
      setConversationState('error');
      setStatusMessage(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  };

  const startConversation = async () => {
    let agentToUse = currentAgentId;

    // Create agent if not provided
    if (!agentToUse) {
      agentToUse = await createAgent();
      if (!agentToUse) return;
    }

    setConversationState('connecting');
    setStatusMessage('Connecting to AI assistant...');

    try {
      const response = await conversationalAgent.startConversation(
        agentToUse,
        patientId,
        patientContext
      );

      if (response.success && response.conversation_id) {
        setConversationId(response.conversation_id);
        setConversationState('active');
        setStatusMessage('Connected! Start speaking...');
        setConversationDuration(0);
        onConversationStart?.(response.conversation_id);

        // If there's a signed URL for web integration, you could use it here
        if (response.signed_url) {
          console.log('Conversation URL:', response.signed_url);
        }
      } else {
        throw new Error(response.error || 'Failed to start conversation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setConversationState('error');
      setStatusMessage(errorMessage);
      onError?.(errorMessage);
    }
  };

  const endConversation = async () => {
    setConversationState('ending');
    setStatusMessage('Ending conversation...');

    // Get final status and transcript
    if (conversationId) {
      try {
        const response = await conversationalAgent.getConversationStatus(conversationId);
        if (response.success) {
          handleConversationEnd(response.transcript || '', response.duration || conversationDuration);
          return;
        }
      } catch (error) {
        console.error('Error getting final conversation status:', error);
      }
    }

    // Fallback if status check fails
    handleConversationEnd('', conversationDuration);
  };

  const handleConversationEnd = (transcript: string, duration: number) => {
    setConversationState('idle');
    setConversationId(null);
    setConversationDuration(0);
    setStatusMessage('');
    setIsListening(false);
    setIsSpeaking(false);
    onConversationEnd?.(transcript, duration);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (conversationState) {
      case 'active': return Colors.success;
      case 'connecting': 
      case 'creating': return Colors.warning;
      case 'error': return Colors.error;
      default: return Colors.primary;
    }
  };

  const getStateIcon = () => {
    switch (conversationState) {
      case 'active': return PhoneOff;
      case 'connecting':
      case 'creating':
      case 'ending': return Loader;
      case 'error': return MessageCircle;
      default: return Phone;
    }
  };

  const getStateText = () => {
    switch (conversationState) {
      case 'idle': return 'Start Health Check-in';
      case 'creating': return 'Creating Assistant...';
      case 'connecting': return 'Connecting...';
      case 'active': return 'End Check-in';
      case 'ending': return 'Ending...';
      case 'error': return 'Try Again';
      default: return 'Start Check-in';
    }
  };

  const handleMainAction = () => {
    switch (conversationState) {
      case 'idle':
      case 'error':
        startConversation();
        break;
      case 'active':
        endConversation();
        break;
      default:
        // Do nothing during transitional states
        break;
    }
  };

  const StateIcon = getStateIcon();

  return (
    <View style={styles.container}>
      {/* Status Display */}
      {(conversationState !== 'idle' || statusMessage) && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
          {conversationState === 'active' && (
            <Text style={styles.durationText}>
              Duration: {formatDuration(conversationDuration)}
            </Text>
          )}
        </View>
      )}

      {/* Main Action Button */}
      <View style={styles.mainButtonContainer}>
        <Animated.View style={[
          styles.rippleContainer,
          { transform: [{ scale: pulseAnimation }] }
        ]}>
          <FeedbackButton
            onPress={handleMainAction}
            disabled={conversationState === 'connecting' || conversationState === 'creating' || conversationState === 'ending'}
            style={[
              styles.mainButton,
              { backgroundColor: getStateColor() }
            ]}
            hapticFeedback={true}
          >
            {conversationState === 'creating' || conversationState === 'connecting' || conversationState === 'ending' ? (
              <LoadingSpinner size="medium" color={Colors.surface} />
            ) : (
              <StateIcon color={Colors.surface} size={32} />
            )}
          </FeedbackButton>
        </Animated.View>
      </View>

      <Text style={styles.mainButtonText}>{getStateText()}</Text>

      {/* Control Buttons */}
      {conversationState === 'active' && (
        <View style={styles.controlsContainer}>
          <FeedbackButton
            onPress={toggleMute}
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive
            ]}
          >
            {isMuted ? (
              <VolumeX color={isMuted ? Colors.surface : Colors.textSecondary} size={20} />
            ) : (
              <Volume2 color={Colors.textSecondary} size={20} />
            )}
          </FeedbackButton>

          <View style={styles.statusIndicators}>
            {isListening && (
              <View style={[styles.statusIndicator, { backgroundColor: Colors.success }]}>
                <Mic color={Colors.surface} size={16} />
                <Text style={styles.statusIndicatorText}>Listening</Text>
              </View>
            )}
            
            {isSpeaking && (
              <View style={[styles.statusIndicator, { backgroundColor: Colors.accent }]}>
                <Volume2 color={Colors.surface} size={16} />
                <Text style={styles.statusIndicatorText}>Speaking</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Voice Health Check-in</Text>
        <Text style={styles.instructionsText}>
          {conversationState === 'idle' 
            ? "Tap to start a voice conversation with your AI health assistant. You'll be asked about your symptoms, pain level, and medication compliance."
            : conversationState === 'active'
            ? "Speak naturally with your AI assistant. It will guide you through your daily health check-in."
            : "Please wait while we set up your health assistant..."
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.background,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statusMessage: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mainButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rippleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButtonActive: {
    backgroundColor: Colors.error,
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIndicatorText: {
    fontSize: 12,
    color: Colors.surface,
    fontWeight: '600',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});