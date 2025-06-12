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
import { Mic, Bot, MicOff, Volume2, VolumeX, Heart, Type, X, Play, CircleCheck as CheckCircle, Clock, MessageCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseService } from '../../lib/database';

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
  const [patientData, setPatientData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  ];

  // Load patient data on component mount
  useEffect(() => {
    loadPatientData();
  }, [profile]);

  const loadPatientData = async () => {
    if (profile?.role === 'patient') {
      try {
        const patient = await DatabaseService.getPatientById(profile.id);
        setPatientData(patient);
      } catch (error) {
        console.error('Error loading patient data:', error);
      }
    }
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
    setHasStarted(true);
    setIsVoiceMode(true);
  };

  const handleVoiceRecording = () => {
    if (Platform.OS === 'web') {
      console.log('Voice recording placeholder - would work on mobile devices');
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
      
      // Simulate processing and save the response
      setTimeout(async () => {
        setIsProcessing(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          // Complete the check-in
          await completeCheckin();
        }
        setRecordingDuration(0);
      }, 2000);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setIsProcessing(true);
      
      const response = textInput.trim();
      setTextInput('');
      
      setTimeout(async () => {
        setIsProcessing(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        } else {
          // Complete the check-in
          await completeCheckin();
        }
        setShowTextInput(false);
      }, 1500);
    }
  };

  const completeCheckin = async () => {
    if (!patientData) {
      console.error('No patient data available for checkin');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('💾 Completing daily check-in for patient:', patientData.id);

      // Create a new daily checkin record
      const checkinData = {
        patient_id: patientData.id,
        checkin_date: new Date().toISOString().split('T')[0],
        status: 'completed' as const,
        patient_notes: 'Daily check-in completed via voice/text interface',
        completed_at: new Date().toISOString(),
        // You could add more specific data based on the questions answered
        pain_level: Math.floor(Math.random() * 5) + 1, // Mock data for demo
        mood_rating: Math.floor(Math.random() * 5) + 1, // Mock data for demo
        medications_taken: true,
      };

      const result = await DatabaseService.createCheckin(checkinData);
      
      if (result) {
        console.log('✅ Check-in completed successfully:', result.id);
        
        // Show completion message
        setCurrentQuestion(questions.length); // This will show "Thank you" message
        
        // Reset after a delay
        setTimeout(() => {
          setIsVoiceMode(false);
          setHasStarted(false);
          setCurrentQuestion(0);
        }, 3000);
      } else {
        console.error('❌ Failed to save check-in');
        // Handle error - maybe show an error message to user
      }
    } catch (error) {
      console.error('❌ Error completing check-in:', error);
    } finally {
      setIsSubmitting(false);
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
  };

  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    setIsRecording(false);
    setHasStarted(false);
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
              {currentQuestion < questions.length 
                ? questions[currentQuestion] 
                : "Thank you for completing your daily check-in! Your responses have been saved."}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    );
  }

  // Initial Start Check-in Interface - REDESIGNED
  if (!hasStarted) {
    return (
      <View style={styles.container}>
        {/* Simplified Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiHeaderAvatar}>
              <Bot color={Colors.accent} size={24} />
            </View>
            <Text style={styles.headerTitle}>Daily Check-in</Text>
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

        {/* Main Content - Redesigned for Focus */}
        <View style={styles.mainContentContainer}>
          {/* Central Focus Area */}
          <View style={styles.centralFocusArea}>
            {/* Main Title */}
            <Text style={styles.mainTitle}>Ready for your daily check-in?</Text>
            
            {/* Subtitle */}
            <Text style={styles.subtitle}>
              I'll ask you a few questions about how you're feeling today. This usually takes 2-3 minutes.
            </Text>
            
            {/* Primary Action Button */}
            <FeedbackButton
              onPress={handleStartCheckin}
              style={styles.primaryActionButton}
              hapticFeedback={true}
            >
              <Animated.View style={[
                styles.actionButtonInner,
                { 
                  transform: [{ scale: breathingAnimation }] 
                }
              ]}>
                <Mic color={Colors.surface} size={32} />
              </Animated.View>
              <Text style={styles.primaryActionText}>Start Voice Check-in</Text>
            </FeedbackButton>
          </View>

          {/* Secondary Actions */}
          <View style={styles.secondaryActionsContainer}>
            <FeedbackButton
              onPress={() => {
                setHasStarted(true);
                setShowTextInput(true);
              }}
              style={styles.secondaryActionButton}
            >
              <Type color={Colors.textSecondary} size={20} />
              <Text style={styles.secondaryActionText}>Use Text Instead</Text>
            </FeedbackButton>
          </View>

          {/* Subtle Feature Indicators */}
          <View style={styles.featureIndicators}>
            <View style={styles.featureIndicator}>
              <MessageCircle color={Colors.accent} size={16} />
              <Text style={styles.featureIndicatorText}>Voice-powered</Text>
            </View>
            <View style={styles.featureIndicator}>
              <Heart color={Colors.heartRate} size={16} />
              <Text style={styles.featureIndicatorText}>Health insights</Text>
            </View>
            <View style={styles.featureIndicator}>
              <CheckCircle color={Colors.success} size={16} />
              <Text style={styles.featureIndicatorText}>AI analysis</Text>
            </View>
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
          <Text style={styles.reminderSubtitle}>
            {currentQuestion < questions.length 
              ? `Question ${currentQuestion + 1} of ${questions.length}`
              : "Check-in Complete"}
          </Text>
          
          <Animated.View style={[
            styles.questionContainer,
            { opacity: fadeAnimation }
          ]}>
            <Text style={styles.questionText}>
              {currentQuestion < questions.length 
                ? questions[currentQuestion] 
                : "Thank you for completing your daily check-in! Your responses have been saved and your healthcare team has been notified."}
            </Text>
          </Animated.View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${Math.min(((currentQuestion + 1) / questions.length) * 100, 100)}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(Math.min(((currentQuestion + 1) / questions.length) * 100, 100))}% Complete
            </Text>
          </View>
        </View>

        {/* Central Voice Interface */}
        <View style={styles.voiceInterface}>
          {/* Main Voice Button */}
          {currentQuestion < questions.length ? (
            <FeedbackButton
              onPress={handleVoiceRecording}
              disabled={isProcessing || isSubmitting}
              style={[
                styles.mainVoiceButton,
                isRecording && styles.recordingButton,
                (isProcessing || isSubmitting) && styles.processingButton
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
                {isProcessing || isSubmitting ? (
                  <Heart color={Colors.surface} size={32} />
                ) : (
                  <Mic color={Colors.surface} size={32} />
                )}
              </Animated.View>
            </FeedbackButton>
          ) : (
            <View style={styles.completionIcon}>
              <CheckCircle color={Colors.success} size={64} />
            </View>
          )}

          {/* Status Text */}
          <Text style={styles.statusText}>
            {currentQuestion < questions.length 
              ? (isSubmitting ? 'Saving your check-in...' : 'Tap to speak your answer')
              : 'Check-in completed successfully!'}
          </Text>
        </View>

        {/* Bottom Action Buttons */}
        {currentQuestion < questions.length && (
          <View style={styles.bottomActions}>
            <FeedbackButton
              onPress={() => setShowTextInput(!showTextInput)}
              style={styles.actionButton}
              disabled={isSubmitting}
            >
              <Type color={Colors.textSecondary} size={20} />
              <Text style={styles.actionButtonText}>Type Instead</Text>
            </FeedbackButton>

            <FeedbackButton
              onPress={resetCheckin}
              style={styles.actionButton}
              disabled={isSubmitting}
            >
              <Clock color={Colors.textSecondary} size={20} />
              <Text style={styles.actionButtonText}>Start Over</Text>
            </FeedbackButton>
          </View>
        )}

        {/* Text Input (when enabled) */}
        {showTextInput && currentQuestion < questions.length && (
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
              disabled={!textInput.trim() || isSubmitting}
              style={[
                styles.submitButton, 
                textInput.trim() && !isSubmitting && styles.submitButtonActive
              ]}
              hapticFeedback={true}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  
  // REDESIGNED INITIAL SCREEN STYLES
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  centralFocusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  primaryActionButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  actionButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  primaryActionText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryActionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  secondaryActionButton: {
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
  secondaryActionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  featureIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  featureIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  featureIndicatorText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },

  // EXISTING STYLES (unchanged)
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
  completionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    position: 'absolute',
    top: 60,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  voiceModeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  voiceRipple: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: `${Colors.primary}30`,
  },
  voiceOrb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  voiceOrbButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}CC`,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  voiceStatusContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  voiceStatusText: {
    fontSize: 18,
    color: Colors.surface,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
  },
  voiceWaveBar: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 3,
  },
  voiceQuestionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    backdropFilter: 'blur(10px)',
  },
  voiceQuestionText: {
    fontSize: 16,
    color: Colors.surface,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});