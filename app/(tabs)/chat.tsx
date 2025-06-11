import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { Mic, Bot, MicOff, Volume2, VolumeX, Heart, Headphones, Type, X, Play, MessageCircle, Phone, PhoneOff } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import ConversationalAgentChat from '../../components/chat/ConversationalAgentChat';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isVoice?: boolean;
  duration?: number;
}

type ChatMode = 'welcome' | 'voice' | 'text' | 'conversation';

export default function DailyCheckinScreen() {
  const { profile } = useAuth();
  const [chatMode, setChatMode] = useState<ChatMode>('welcome');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationTranscript, setConversationTranscript] = useState('');
  
  const recordingTimer = useRef<NodeJS.Timeout>();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rippleAnimation = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const voiceModeAnimation = useRef(new Animated.Value(0)).current;
  const voiceOrbAnimation = useRef(new Animated.Value(1)).current;

  const questions = [
    "Good morning! How are you feeling today?",
    "On a scale of 1 to 10, how would you rate your pain level?",
    "Did you take your morning medications?",
    "How did you sleep last night?",
    "Have you experienced any unusual symptoms?",
    "Thank you for completing your daily check-in!"
  ];

  // Mock patient context for the conversational agent
  const patientContext = {
    patient_name: profile?.full_name || "Patient",
    recovery_stage: "Week 2 post-surgery",
    medications: ["Metoprolol 50mg", "Aspirin 81mg", "Atorvastatin 20mg"],
    recent_symptoms: ["mild pain", "fatigue"],
    pain_level: 3
  };

  useEffect(() => {
    // Gentle breathing animation for the central icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (chatMode === 'voice') {
      // Animate to voice mode
      Animated.timing(voiceModeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Animate back to normal mode
      Animated.timing(voiceModeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [chatMode]);

  const handleStartVoiceCheckin = () => {
    setChatMode('conversation');
  };

  const handleStartTextCheckin = () => {
    setChatMode('text');
    setCurrentQuestion(0);
    setMessages([{
      id: '1',
      text: questions[0],
      sender: 'ai',
      timestamp: new Date(),
    }]);
  };

  const handleConversationStart = (conversationId: string) => {
    console.log('Conversation started with ID:', conversationId);
    // You can store the conversation ID for tracking
  };

  const handleConversationEnd = (transcript: string, duration: number) => {
    console.log('Conversation ended:', { transcript, duration });
    setConversationTranscript(transcript);
    
    // Add the conversation summary to messages
    if (transcript) {
      const summaryMessage: Message = {
        id: Date.now().toString(),
        text: `Voice check-in completed (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})\n\nTranscript: ${transcript}`,
        sender: 'ai',
        timestamp: new Date(),
        isVoice: true,
        duration: duration
      };
      setMessages(prev => [...prev, summaryMessage]);
    }
    
    // Return to welcome mode
    setChatMode('welcome');
  };

  const handleConversationError = (error: string) => {
    console.error('Conversation error:', error);
    
    // Add error message
    const errorMessage: Message = {
      id: Date.now().toString(),
      text: `Sorry, there was an issue with the voice check-in: ${error}. Please try again or use text mode.`,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, errorMessage]);
    
    // Return to welcome mode
    setChatMode('welcome');
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: textInput.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      setIsProcessing(true);
      setTextInput('');
      
      setTimeout(() => {
        setIsProcessing(false);
        
        if (currentQuestion < questions.length - 1) {
          const nextQuestion = currentQuestion + 1;
          setCurrentQuestion(nextQuestion);
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: questions[nextQuestion],
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          // End of questions
          const finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Thank you for completing your daily check-in! Your responses have been recorded and your healthcare team will be notified if any concerns arise.",
            sender: 'ai',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, finalMessage]);
          
          // Return to welcome after a delay
          setTimeout(() => {
            setChatMode('welcome');
            setMessages([]);
            setCurrentQuestion(0);
          }, 3000);
        }
      }, 1500);
    }
  };

  const resetToWelcome = () => {
    setChatMode('welcome');
    setMessages([]);
    setCurrentQuestion(0);
    setTextInput('');
    setIsProcessing(false);
    setConversationTranscript('');
  };

  // Render different modes
  if (chatMode === 'conversation') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiHeaderAvatar}>
              <Bot color={Colors.accent} size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Voice Check-in</Text>
              <Text style={styles.headerSubtitle}>AI-powered health conversation</Text>
            </View>
          </View>
          
          <FeedbackButton 
            onPress={resetToWelcome}
            style={styles.exitButton}
          >
            <X color={Colors.textSecondary} size={20} />
          </FeedbackButton>
        </View>

        {/* Conversational Agent Chat */}
        <ConversationalAgentChat
          patientId={profile?.id}
          patientContext={patientContext}
          onConversationStart={handleConversationStart}
          onConversationEnd={handleConversationEnd}
          onError={handleConversationError}
        />
      </View>
    );
  }

  if (chatMode === 'text') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiHeaderAvatar}>
              <MessageCircle color={Colors.accent} size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Text Check-in</Text>
              <Text style={styles.headerSubtitle}>Question {currentQuestion + 1} of {questions.length}</Text>
            </View>
          </View>
          
          <FeedbackButton 
            onPress={resetToWelcome}
            style={styles.exitButton}
          >
            <X color={Colors.textSecondary} size={20} />
          </FeedbackButton>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          
          {isProcessing && (
            <View style={[styles.messageContainer, styles.aiMessage]}>
              <Text style={styles.aiMessageText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Text Input */}
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer here..."
            placeholderTextColor={Colors.textTertiary}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            autoFocus
          />
          <FeedbackButton
            onPress={handleTextSubmit}
            disabled={!textInput.trim() || isProcessing}
            style={[styles.submitButton, textInput.trim() && styles.submitButtonActive]}
            hapticFeedback={true}
          >
            <Text style={styles.submitButtonText}>Send</Text>
          </FeedbackButton>
        </View>
      </View>
    );
  }

  // Welcome Mode (Default)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <Bot color={Colors.accent} size={20} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>Daily check-in & health monitoring</Text>
          </View>
        </View>
        
        <FeedbackButton 
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          style={styles.speakerButton}
        >
          {isSpeakerOn ? (
            <Volume2 color={Colors.accent} size={20} />
          ) : (
            <VolumeX color={Colors.textSecondary} size={20} />
          )}
        </FeedbackButton>
      </View>

      {/* Main Content - Welcome */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Ready for your daily check-in?</Text>
          <Text style={styles.welcomeSubtitle}>
            Choose how you'd like to complete your health check-in today. I'll ask you about your symptoms, pain level, medications, and overall well-being.
          </Text>
          
          {/* Voice Check-in Option */}
          <FeedbackButton
            onPress={handleStartVoiceCheckin}
            style={styles.checkinOptionButton}
            hapticFeedback={true}
          >
            <Animated.View style={[
              styles.checkinOptionInner,
              { 
                transform: [
                  { scale: breathingAnimation }
                ] 
              }
            ]}>
              <Phone color={Colors.surface} size={32} />
            </Animated.View>
            <View style={styles.checkinOptionText}>
              <Text style={styles.checkinOptionTitle}>Voice Check-in</Text>
              <Text style={styles.checkinOptionSubtitle}>Natural conversation with AI</Text>
            </View>
          </FeedbackButton>

          {/* Text Check-in Option */}
          <FeedbackButton
            onPress={handleStartTextCheckin}
            style={[styles.checkinOptionButton, styles.textCheckinButton]}
            hapticFeedback={true}
          >
            <View style={styles.checkinOptionInner}>
              <MessageCircle color={Colors.accent} size={32} />
            </View>
            <View style={styles.checkinOptionText}>
              <Text style={[styles.checkinOptionTitle, styles.textCheckinTitle]}>Text Check-in</Text>
              <Text style={styles.checkinOptionSubtitle}>Type your responses</Text>
            </View>
          </FeedbackButton>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Heart color={Colors.heartRate} size={16} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureText}>Personalized health insights</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Bot color={Colors.success} size={16} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureText}>AI-powered analysis</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Headphones color={Colors.accent} size={16} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureText}>Natural conversation experience</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Conversations */}
        {conversationTranscript && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Check-in</Text>
            <View style={styles.recentCard}>
              <View style={styles.recentTextContainer}>
                <Text style={styles.recentText} numberOfLines={3}>
                {conversationTranscript}
                </Text>
              </View>
              <Text style={styles.recentTime}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
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
  headerLeft: {
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
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  checkinOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  textCheckinButton: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  checkinOptionInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  checkinOptionText: {
    flex: 1,
  },
  checkinOptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.surface,
    marginBottom: 4,
  },
  textCheckinTitle: {
    color: Colors.textPrimary,
  },
  checkinOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresList: {
    gap: 16,
    marginTop: 40,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  featureTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  recentSection: {
    marginTop: 32,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  recentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  recentTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  recentTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 16,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: Colors.surface,
  },
  aiMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
  },
  textInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    gap: 12,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: Colors.textTertiary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});