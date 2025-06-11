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
} from 'react-native';
import { Mic, Bot, MicOff, Volume2, VolumeX, Heart, Headphones, Type, X, Play } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import { conversationalAgent, ConversationSession } from '../../lib/conversationalAgent';
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

export default function DailyCheckinScreen() {
  const { profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationSession, setConversationSession] = useState<ConversationSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
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
    if (isVoiceMode) {
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
  }, [isVoiceMode]);

  useEffect(() => {
    if (isRecording) {
      // Voice orb animation during recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(voiceOrbAnimation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(voiceOrbAnimation, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ripple effect
      Animated.loop(
        Animated.timing(rippleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      voiceOrbAnimation.setValue(1);
      rippleAnimation.setValue(0);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnimation, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnimation.setValue(1);
    }
  }, [isProcessing]);

  const handleStartCheckin = () => {
    startConversationalCheckin();
  };

  const startConversationalCheckin = async () => {
    if (!profile?.full_name || !profile?.id) {
      console.error('Missing profile information');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Start conversational AI session
      const session = await conversationalAgent.startDailyCheckin(
        profile.id,
        profile.full_name
      );
      
      setConversationSession(session);
      setHasStarted(true);
      setIsVoiceMode(true);
      
      console.log('🎙️ Conversational check-in started:', session.conversationId);
    } catch (error) {
      console.error('❌ Failed to start conversational check-in:', error);
      // Fallback to regular check-in
      setHasStarted(true);
      setIsVoiceMode(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVoiceRecording = () => {
    if (Platform.OS === 'web') {
      console.log('Voice recording placeholder - would work on mobile devices');
      
      // If we have a conversational session, we would connect to the WebSocket here
      if (conversationSession) {
        console.log('🔗 Would connect to WebSocket:', conversationSession.websocketUrl);
        // In a real implementation, you would:
        // 1. Connect to the WebSocket URL
        // 2. Stream audio data to ElevenLabs
        // 3. Receive and play back AI responses
        // 4. Handle conversation flow automatically
      }
    }
    
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      
      setIsProcessing(true);
      
      setTimeout(async () => {
        setIsProcessing(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          setIsVoiceMode(false);
          setHasStarted(false);
          setCurrentQuestion(0);
          await endConversationalSession();
        }
        setRecordingDuration(0);
      }, 2000);
    }
  };

  const endConversationalSession = async () => {
    if (conversationSession) {
      try {
        await conversationalAgent.endConversation(
          'Voice conversation completed via web interface',
          'Daily check-in completed successfully',
          recordingDuration,
          {
            painLevel: Math.floor(Math.random() * 10) + 1, // Mock data for demo
            medicationCompliance: true,
            overallMood: 'positive',
            symptoms: []
          }
        );
        console.log('✅ Conversational session ended successfully');
      } catch (error) {
        console.error('❌ Error ending conversational session:', error);
      } finally {
        setConversationSession(null);
      }
    }
  };
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setIsProcessing(true);
      setTextInput('');
      setShowTextInput(false);
      
      setTimeout(() => {
        setIsProcessing(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          setHasStarted(false);
          setCurrentQuestion(0);
        }
      }, 1500);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetCheckin = () => {
    setCurrentQuestion(0);
    setIsRecording(false);
    setIsProcessing(false);
    setShowTextInput(false);
    setTextInput('');
    setRecordingDuration(0);
    setIsVoiceMode(false);
    setHasStarted(false);
    endConversationalSession();
  };

  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    setIsRecording(false);
    setHasStarted(false);
    endConversationalSession();
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    setRecordingDuration(0);
  };

  // Voice Mode Full Screen Interface
  if (isVoiceMode) {
    return (
      <Animated.View style={[
        styles.voiceModeContainer,
        {
          backgroundColor: voiceModeAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)'],
          }),
        }
      ]}>
        {/* Exit Button */}
        <FeedbackButton 
          onPress={exitVoiceMode}
          style={styles.exitButton}
        >
          <X color={Colors.surface} size={24} />
        </FeedbackButton>

        {/* Voice Animation Container */}
        <View style={styles.voiceModeContent}>
          {/* Ripple Effects */}
          {isRecording && (
            <>
              {[...Array(3)].map((_, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.voiceRipple,
                    {
                      width: 200 + (i * 60),
                      height: 200 + (i * 60),
                      opacity: rippleAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6 - (i * 0.2), 0],
                      }),
                      transform: [{
                        scale: rippleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2 + (i * 0.3)],
                        }),
                      }],
                    }
                  ]} 
                />
              ))}
            </>
          )}

          {/* Central Voice Orb */}
          <Animated.View style={[
            styles.voiceOrb,
            {
              transform: [{ scale: voiceOrbAnimation }],
              opacity: fadeAnimation,
            }
          ]}>
            <FeedbackButton
              onPress={handleVoiceRecording}
              style={styles.voiceOrbButton}
              hapticFeedback={true}
            >
              {isProcessing ? (
                <Heart color={Colors.surface} size={48} />
              ) : isRecording ? (
                <MicOff color={Colors.surface} size={48} />
              ) : (
                <Mic color={Colors.surface} size={48} />
              )}
            </FeedbackButton>
          </Animated.View>

          {/* Voice Status Text */}
          <Animated.View style={[
            styles.voiceStatusContainer,
            { opacity: fadeAnimation }
          ]}>
            <Text style={styles.voiceStatusText}>
              {isProcessing ? 'Processing your response...' :
               isRecording ? `Recording... ${formatDuration(recordingDuration)}` :
               'Tap to speak your answer'}
            </Text>
            
            {/* Voice Waveform */}
            {isRecording && (
              <View style={styles.voiceWaveform}>
                {[...Array(5)].map((_, i) => (
                  <Animated.View 
                    key={i} 
                    style={[
                      styles.voiceWaveBar,
                      {
                        height: rippleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [6, Math.random() * 30 + 10],
                        }),
                      }
                    ]} 
                  />
                ))}
              </View>
            )}
          </Animated.View>

          {/* Question Display in Voice Mode */}
          <Animated.View style={[
            styles.voiceQuestionContainer,
            { opacity: fadeAnimation }
          ]}>
            <Text style={styles.voiceQuestionText}>
              {questions[currentQuestion]}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  // Initial Start Check-in Interface
  if (!hasStarted) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiHeaderAvatar}>
              <Bot color={Colors.accent} size={20} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Daily Check-in</Text>
              <Text style={styles.headerSubtitle}>Voice-first health monitoring</Text>
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

        {/* Main Content - Start Check-in */}
        <View style={styles.startCheckinContainer}>
          <View style={styles.startCheckinContent}>
            <Text style={styles.startCheckinTitle}>Ready for your daily check-in?</Text>
            <Text style={styles.startCheckinSubtitle}>
              I'll ask you a few questions about how you're feeling today. This usually takes about 2-3 minutes.
            </Text>
            
            {/* Large Start Button */}
            <FeedbackButton
              onPress={handleStartCheckin}
              disabled={isConnecting}
              style={styles.startCheckinButton}
              hapticFeedback={true}
            >
              <Animated.View style={[
                styles.startButtonInner,
                { 
                  transform: [
                    { scale: breathingAnimation }
                  ] 
                }
              ]}>
                {isConnecting ? (
                  <Heart color={Colors.surface} size={40} />
                ) : (
                  <Play color={Colors.surface} size={40} />
                )}
              </Animated.View>
              <Text style={styles.startButtonText}>
                {isConnecting ? 'Connecting...' : 'Start Check-in'}
              </Text>
            </FeedbackButton>

            {/* Features List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Mic color={Colors.accent} size={16} />
                <Text style={styles.featureText}>AI-powered voice conversations</Text>
              </View>
              <View style={styles.featureItem}>
                <Heart color={Colors.heartRate} size={16} />
                <Text style={styles.featureText}>Health insights & analysis</Text>
              </View>
              <View style={styles.featureItem}>
                <Bot color={Colors.success} size={16} />
                <Text style={styles.featureText}>ElevenLabs conversational AI</Text>
              </View>
            </View>
          </View>

          {/* Alternative Options */}
          <View style={styles.alternativeOptions}>
            <FeedbackButton
              onPress={() => {
                setHasStarted(true);
                setShowTextInput(true);
              }}
              style={styles.alternativeButton}
            >
              <Type color={Colors.textSecondary} size={20} />
              <Text style={styles.alternativeButtonText}>Use Text Instead</Text>
            </FeedbackButton>
          </View>
        </View>
      </View>
    );
  }

  // Normal Interface (when started but not in voice mode)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <Bot color={Colors.accent} size={20} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Daily Check-in</Text>
            <Text style={styles.headerSubtitle}>Voice-first health monitoring</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.speakerButton}
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
        >
          {isSpeakerOn ? (
            <Volume2 color={Colors.accent} size={20} />
          ) : (
            <VolumeX color={Colors.textSecondary} size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Central Reminder Display */}
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderTitle}>Daily Health Check-in</Text>
          <Text style={styles.reminderSubtitle}>Question {currentQuestion + 1} of {questions.length}</Text>
          
          <Animated.View style={[
            styles.questionContainer,
            { opacity: fadeAnimation }
          ]}>
            <Text style={styles.questionText}>{questions[currentQuestion]}</Text>
          </Animated.View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </Text>
          </View>
        </View>

        {/* Central Voice Interface */}
        <View style={styles.voiceInterface}>
          {/* Main Voice Button */}
          <FeedbackButton
            onPress={handleVoiceRecording}
            disabled={isProcessing}
            style={[
              styles.mainVoiceButton,
              isRecording && styles.recordingButton,
              isProcessing && styles.processingButton
            ]}
            hapticFeedback={true}
          >
            <Animated.View style={[
              styles.voiceButtonInner,
              { 
                transform: [
                  { scale: breathingAnimation }
                ] 
              }
            ]}>
              {isProcessing ? (
                <Heart color={Colors.surface} size={32} />
              ) : (
                <Mic color={Colors.surface} size={32} />
              )}
            </Animated.View>
          </FeedbackButton>

          {/* Status Text */}
          <Text style={styles.statusText}>
            Tap to speak your answer
          </Text>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <FeedbackButton
            onPress={() => setShowTextInput(!showTextInput)}
            style={styles.actionButton}
          >
            <Type color={Colors.textSecondary} size={20} />
            <Text style={styles.actionButtonText}>Type Instead</Text>
          </FeedbackButton>

          <FeedbackButton
            onPress={resetCheckin}
            style={styles.actionButton}
          >
            <Headphones color={Colors.textSecondary} size={20} />
            <Text style={styles.actionButtonText}>Start Over</Text>
          </FeedbackButton>
        </View>

        {/* Text Input (when enabled) */}
        {showTextInput && (
          <Animated.View style={styles.textInputContainer}>
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
              disabled={!textInput.trim()}
              style={[styles.submitButton, textInput.trim() && styles.submitButtonActive]}
              hapticFeedback={true}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </FeedbackButton>
          </Animated.View>
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
  startCheckinContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  startCheckinContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startCheckinTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  startCheckinSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  startCheckinButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  featuresList: {
    gap: 16,
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
  alternativeOptions: {
    alignItems: 'center',
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alternativeButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  reminderContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  reminderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  questionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  voiceInterface: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  mainVoiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  recordingButton: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  processingButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  voiceButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 120,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  textInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.textTertiary,
    borderRadius: 12,
    paddingVertical: 12,
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
  // Voice Mode Styles
  voiceModeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    position: '