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
import { Mic, Bot, MicOff, Volume2, VolumeX, Heart, Headphones, Type, X } from 'lucide-react-native';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  const handleVoiceRecording = () => {
    if (Platform.OS === 'web') {
      console.log('Voice recording placeholder - would work on mobile devices');
    }
    
    if (!isRecording) {
      setIsVoiceMode(true);
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
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsVoiceMode(false);
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
        }
        setRecordingDuration(0);
      }, 2000);
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
  };

  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    setIsRecording(false);
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
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={exitVoiceMode}
        >
          <X color="#ffffff" size={24} />
        </TouchableOpacity>

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
            <TouchableOpacity
              style={styles.voiceOrbButton}
              onPress={handleVoiceRecording}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <Heart color="#ffffff\" size={48} />
              ) : isRecording ? (
                <MicOff color="#ffffff\" size={48} />
              ) : (
                <Mic color="#ffffff" size={48} />
              )}
            </TouchableOpacity>
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

  // Normal Interface
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiHeaderAvatar}>
            <Bot color="#3b82f6" size={20} />
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
            <Volume2 color="#3b82f6\" size={20} />
          ) : (
            <VolumeX color="#6b7280\" size={20} />
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
          <TouchableOpacity
            style={[
              styles.mainVoiceButton,
              isRecording && styles.recordingButton,
              isProcessing && styles.processingButton
            ]}
            onPress={handleVoiceRecording}
            disabled={isProcessing}
            activeOpacity={0.8}
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
                <Heart color="#ffffff\" size={32} />
              ) : (
                <Mic color="#ffffff\" size={32} />
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Status Text */}
          <Text style={styles.statusText}>
            Tap to speak your answer
          </Text>
        </View>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowTextInput(!showTextInput)}
          >
            <Type color="#6b7280" size={20} />
            <Text style={styles.actionButtonText}>Type Instead</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetCheckin}
          >
            <Headphones color="#6b7280" size={20} />
            <Text style={styles.actionButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>

        {/* Text Input (when enabled) */}
        {showTextInput && (
          <Animated.View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#9ca3af"
              value={textInput}
              onChangeText={setTextInput}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[styles.submitButton, textInput.trim() && styles.submitButtonActive]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim()}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
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
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
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
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  recordingButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  processingButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  voiceButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
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
    color: '#6b7280',
    fontWeight: '600',
  },
  textInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#ffffff',
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
    borderColor: 'rgba(59, 130, 246, 0.3)',
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
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
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
    color: '#ffffff',
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
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});