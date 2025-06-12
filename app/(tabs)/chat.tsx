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
import { Audio } from 'expo-av';
import { Mic, Bot, MicOff, Volume2, VolumeX, Heart, Type, X, Play, CircleCheck as CheckCircle, Clock, MessageCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';

const { width, height } = Dimensions.get('window');

// System prompt that defines the AI's persona and guidelines
// This would be used in a real LLM integration to guide the AI's responses
const systemPrompt = `You are a compassionate AI health assistant for ConnectCare AI, specializing in post-surgery patient monitoring and daily check-ins. Your role is to:

- Conduct empathetic daily health assessments with patients recovering from surgery
- Ask clear, medically-relevant questions about pain levels, medication adherence, and symptoms
- Provide supportive and encouraging responses to patient concerns
- Maintain a professional yet caring and warm tone throughout the conversation
- Focus specifically on recovery progress, symptom monitoring, and overall well-being
- Acknowledge patient responses with understanding and provide gentle guidance
- Keep responses concise but meaningful, suitable for voice conversation
- Show genuine concern for the patient's comfort and recovery journey
- Escalate any concerning symptoms appropriately while remaining calm and reassuring

Remember: You are speaking to patients who may be in discomfort or anxiety about their recovery. Always be patient, understanding, and encouraging while gathering important health information.`;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isVoice?: boolean;
  duration?: number;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'completed';

export default function DailyCheckinScreen() {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  
  const recordingTimer = useRef<NodeJS.Timeout>();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rippleAnimation = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const voiceModeAnimation = useRef(new Animated.Value(0)).current;
  const voiceOrbAnimation = useRef(new Animated.Value(1)).current;
  const waveformAnimations = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;

  const questions = [
    "Good morning! How are you feeling today?",
    "On a scale of 1 to 10, how would you rate your pain level?",
    "Did you take your morning medications?",
    "How did you sleep last night?",
    "Have you experienced any unusual symptoms?",
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

    // Configure audio session
    configureAudio();

    return () => {
      // Cleanup audio resources
      cleanupAudio();
    };
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
    // Handle different conversation states with appropriate animations
    switch (conversationState) {
      case 'listening':
        startListeningAnimations();
        break;
      case 'processing':
        startProcessingAnimations();
        break;
      case 'speaking':
        startSpeakingAnimations();
        break;
      case 'idle':
      case 'completed':
        stopAllAnimations();
        break;
    }
  }, [conversationState]);

  const startListeningAnimations = () => {
    // Voice orb pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(voiceOrbAnimation, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(voiceOrbAnimation, {
          toValue: 0.9,
          duration: 800,
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

    // Waveform animation
    startWaveformAnimation();
  };

  const startProcessingAnimations = () => {
    // Gentle pulsing for processing
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 0.6,
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
  };

  const startSpeakingAnimations = () => {
    // Different animation for AI speaking
    Animated.loop(
      Animated.sequence([
        Animated.timing(voiceOrbAnimation, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(voiceOrbAnimation, {
          toValue: 0.95,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Speaking waveform
    startWaveformAnimation(true);
  };

  const startWaveformAnimation = (isSpeaking = false) => {
    waveformAnimations.forEach((animation, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 300 + (index * 100),
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 0.1,
            duration: 300 + (index * 100),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  };

  const stopAllAnimations = () => {
    voiceOrbAnimation.setValue(1);
    rippleAnimation.setValue(0);
    fadeAnimation.setValue(1);
    waveformAnimations.forEach(animation => animation.setValue(0.3));
  };

  const configureAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to configure audio:', error);
    }
  };

  const cleanupAudio = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      if (sound) {
        await sound.unloadAsync();
      }
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
  };

  const handleStartCheckin = () => {
    setHasStarted(true);
    setIsVoiceMode(true);
    setConversationState('idle');
    
    // Start the conversation with AI greeting
    setTimeout(() => {
      if (isSpeakerOn) {
        handleTextToSpeech(questions[currentQuestion]);
      }
    }, 500);
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('Web recording not supported in this demo');
        return null;
      }

      // Stop any playing audio first
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      return recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return null;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return null;

      setRecording(null);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  };

  const playAudioFromBase64 = async (base64Audio: string) => {
    try {
      // Stop any existing audio first
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setConversationState('speaking');
      
      // Create audio URI from base64
      const audioUri = `data:audio/mpeg;base64,${base64Audio}`;
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, volume: 1.0 }
      );
      
      setSound(newSound);
      
      // Set up playback status update
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setConversationState('idle');
          setSound(null);
          
          // Move to next question after AI finishes speaking
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
          } else {
            // Complete the check-in if this was the last question
            completeCheckin();
          }
        }
      });
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      setConversationState('idle');
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // In a real implementation, this is where the systemPrompt would be used
    // to guide the LLM's response generation. The systemPrompt would be sent
    // along with the user's input to ensure the AI maintains its persona and
    // follows the defined guidelines for compassionate healthcare assistance.
    
    // Simulate AI processing with contextual responses based on current question
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responses = [
      "Thank you for sharing how you're feeling. That's helpful information for your recovery.",
      "I understand your pain level. Let's make sure your doctor is aware of this.",
      "It's great that you're staying on top of your medications. Consistency is key for recovery.",
      "Sleep quality is very important for healing. I'll note this in your record.",
      "Thank you for reporting your symptoms. This helps us monitor your progress effectively."
    ];
    
    return responses[currentQuestion] || "Thank you for your response. Your healthcare team will review this information.";
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'text-to-speech',
          text: text,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('TTS Error:', data.error);
        setConversationState('idle');
        return;
      }

      if (data.audioData) {
        await playAudioFromBase64(data.audioData);
      }
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      setConversationState('idle');
    }
  };

  const handleSpeechToText = async (audioUri: string): Promise<string> => {
    try {
      // For now, we'll simulate STT since ElevenLabs doesn't provide STT
      // In a real implementation, you would use OpenAI Whisper or another STT service
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a simulated response based on the current question
      const simulatedResponses = [
        "I'm feeling much better today, thank you for asking.",
        "My pain level is about a 3 out of 10 today.",
        "Yes, I took all my morning medications as prescribed.",
        "I slept well last night, about 7 hours of sleep.",
        "No unusual symptoms today, everything seems normal."
      ];
      
      return simulatedResponses[currentQuestion] || "Thank you for the question.";
    } catch (error) {
      console.error('Failed to convert speech to text:', error);
      return "Sorry, I couldn't understand that. Could you please try again?";
    }
  };

  const processUserResponse = async (userInput: string) => {
    // Add user message to conversation history
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
      isVoice: true,
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    // Generate AI response
    setConversationState('processing');
    const aiResponseText = await generateAIResponse(userInput);
    
    // Add AI message to conversation history
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'ai',
      timestamp: new Date(),
      isVoice: true,
    };
    
    setConversationHistory(prev => [...prev, aiMessage]);
    
    // Convert AI response to speech if speaker is on
    if (isSpeakerOn) {
      await handleTextToSpeech(aiResponseText);
      // Note: Question progression now happens in playAudioFromBase64 
      // when the AI finishes speaking, ensuring proper turn-based flow
    } else {
      // If speaker is off, move to next question immediately
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        completeCheckin();
      }
    }
  };

  const handleVoiceRecording = async () => {
    if (Platform.OS === 'web') {
      console.log('Voice recording placeholder - would work on mobile devices');
      // For web demo, simulate the voice interaction
      setConversationState('listening');
      setRecordingDuration(0);
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setConversationState('processing');
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
        
        // Simulate STT processing
        setTimeout(async () => {
          const simulatedUserInput = `I'm feeling much better today, thank you for asking.`;
          await processUserResponse(simulatedUserInput);
          setRecordingDuration(0);
        }, 2000);
      }, 3000);
      
      return;
    }
    
    if (conversationState === 'idle') {
      // Start recording
      setConversationState('listening');
      setRecordingDuration(0);
      
      const recordingInstance = await startRecording();
      
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else if (conversationState === 'listening') {
      // Stop recording
      setConversationState('processing');
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      
      const audioUri = await stopRecording();
      
      if (audioUri) {
        // Convert speech to text
        const transcribedText = await handleSpeechToText(audioUri);
        
        // Process the user's response
        await processUserResponse(transcribedText);
      }
      
      setRecordingDuration(0);
    }
  };

  const handleTextSubmit = async () => {
    if (textInput.trim()) {
      const userInput = textInput.trim();
      setTextInput('');
      
      // Process the user's text response
      await processUserResponse(userInput);
      
      setShowTextInput(false);
    }
  };

  const completeCheckin = async () => {
    try {
      setConversationState('completed');
      console.log('💾 Completing daily check-in');

      // Simulate check-in completion
      console.log('✅ Check-in completed successfully');
      
      // Add completion message
      const completionMessage: Message = {
        id: Date.now().toString(),
        text: "Thank you for completing your daily check-in! Your responses have been saved and your healthcare team has been notified.",
        sender: 'ai',
        timestamp: new Date(),
        isVoice: true,
      };
      
      setConversationHistory(prev => [...prev, completionMessage]);
      
      // Speak the completion message
      if (isSpeakerOn) {
        await handleTextToSpeech(completionMessage.text);
      }
      
      // Show completion message
      setCurrentQuestion(questions.length);
      
      // Reset after a delay
      setTimeout(() => {
        resetToInitialState();
      }, 5000);
    } catch (error) {
      console.error('❌ Error completing check-in:', error);
    }
  };

  const resetToInitialState = () => {
    setIsVoiceMode(false);
    setHasStarted(false);
    setCurrentQuestion(0);
    setConversationHistory([]);
    setConversationState('idle');
    setRecordingDuration(0);
    setShowTextInput(false);
    setTextInput('');
    
    // Stop any playing audio
    if (sound) {
      sound.stopAsync();
    }
    
    // Clear timers
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
  };

  const exitVoiceMode = () => {
    resetToInitialState();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOrbColor = () => {
    switch (conversationState) {
      case 'listening':
        return Colors.error;
      case 'processing':
        return Colors.warning;
      case 'speaking':
        return Colors.accent;
      case 'completed':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const getStatusText = () => {
    switch (conversationState) {
      case 'listening':
        return `Recording... ${formatDuration(recordingDuration)}`;
      case 'processing':
        return 'Processing your response...';
      case 'speaking':
        return 'AI is speaking...';
      case 'completed':
        return 'Check-in completed!';
      default:
        return 'Tap to speak your answer';
    }
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
          {(conversationState === 'listening' || conversationState === 'speaking') && (
            <>
              {[...Array(3)].map((_, i) => (
                <Animated.View 
                  key={i}
                  style={[
                    styles.voiceRipple,
                    {
                      width: 200 + (i * 60),
                      height: 200 + (i * 60),
                      borderColor: `${getOrbColor()}30`,
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
              style={[
                styles.voiceOrbButton,
                { backgroundColor: getOrbColor() }
              ]}
              hapticFeedback={true}
              disabled={conversationState === 'speaking' || conversationState === 'processing'}
              disabled={conversationState === 'speaking' || conversationState === 'processing'}
            >
              {conversationState === 'processing' ? (
                <Heart color={Colors.surface} size={48} />
              ) : conversationState === 'speaking' ? (
                <Volume2 color={Colors.surface} size={48} />
              ) : conversationState === 'listening' ? (
                <MicOff color={Colors.surface} size={48} />
              ) : conversationState === 'completed' ? (
                <CheckCircle color={Colors.surface} size={48} />
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
              {getStatusText()}
            </Text>
            
            {/* Voice Waveform */}
            {(conversationState === 'listening' || conversationState === 'speaking') && (
              <View style={styles.voiceWaveform}>
                {waveformAnimations.map((animation, i) => (
                  <Animated.View 
                    key={i} 
                    style={[
                      styles.voiceWaveBar,
                      {
                        height: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [6, 40],
                        }),
                        backgroundColor: conversationState === 'speaking' ? Colors.accent : getOrbColor(),
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

          {/* Progress Indicator */}
          <View style={styles.voiceProgressContainer}>
            <Text style={styles.voiceProgressText}>
              {currentQuestion < questions.length 
                ? `Question ${currentQuestion + 1} of ${questions.length}`
                : "Complete"}
            </Text>
            <View style={styles.voiceProgressBar}>
              <View style={[
                styles.voiceProgressFill,
                { width: `${Math.min(((currentQuestion + 1) / questions.length) * 100, 100)}%` }
              ]} />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Initial Start Check-in Interface
  if (!hasStarted) {
    return (
      <View style={styles.container}>
        {/* Simplified Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.aiHeaderAvatar}>
              <Bot color={Colors.accent} size={24} />
            </View>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
          </View>
          
          <FeedbackButton 
            disabled={conversationState !== 'idle'}
          >
            {isSpeakerOn ? (
              <Volume2 color={Colors.accent} size={20} />
            ) : (
              <VolumeX color={Colors.textSecondary} size={20} />
            )}
          </FeedbackButton>
        </View>

        {/* Main Content */}
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
              disabled={conversationState !== 'idle'}
              disabled={conversationState !== 'idle'}
              style={[
                styles.mainVoiceButton,
                conversationState === 'listening' && styles.recordingButton,
                conversationState !== 'idle' && styles.busyButton
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
                {conversationState === 'processing' ? (
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
              ? getStatusText()
              : 'Check-in completed successfully!'}
          </Text>
        </View>

        {/* Bottom Action Buttons */}
        {currentQuestion < questions.length && (
          <View style={styles.bottomActions}>
            <FeedbackButton
              onPress={() => setShowTextInput(!showTextInput)}
              style={styles.actionButton}
              disabled={conversationState !== 'idle'}
            >
              <Type color={Colors.textSecondary} size={20} />
              <Text style={styles.actionButtonText}>Type Instead</Text>
            </FeedbackButton>

            <FeedbackButton
              onPress={resetToInitialState}
              style={styles.actionButton}
              disabled={conversationState !== 'idle'}
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
              disabled={!textInput.trim() || conversationState !== 'idle'}
              disabled={!textInput.trim() || conversationState !== 'idle'}
              style={[
                styles.submitButton, 
                textInput.trim() && conversationState === 'idle' && styles.submitButtonActive
              ]}
              hapticFeedback={true}
            >
              <Text style={styles.submitButtonText}>
                {conversationState === 'processing' ? 'Processing...' : 'Submit'}
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

  // EXISTING STYLES (updated)
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
    fontWeight: '600',
  },
  voiceInterface: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  mainVoiceButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  busyButton: {
    opacity: 0.7,
  },
  voiceButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionIcon: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  textInputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  textInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: '600',
  },

  // Voice Mode Styles (updated)
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
    backgroundColor: `${Colors.surface}${Colors.opacity.medium}`,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  voiceModeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  voiceRipple: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
  },
  voiceOrb: {
    marginBottom: 40,
  },
  voiceOrbButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
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
    fontWeight: '600',
    marginBottom: 20,
  },
  voiceWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 50,
  },
  voiceWaveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 6,
  },
  voiceQuestionContainer: {
    backgroundColor: `${Colors.surface}${Colors.opacity.medium}`,
    borderRadius: 20,
    padding: 24,
    maxWidth: '90%',
    marginBottom: 40,
  },
  voiceQuestionText: {
    fontSize: 20,
    color: Colors.surface,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  voiceProgressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  voiceProgressText: {
    fontSize: 14,
    color: `${Colors.surface}${Colors.opacity.heavy}`,
    marginBottom: 12,
    fontWeight: '600',
  },
  voiceProgressBar: {
    width: '80%',
    height: 4,
    backgroundColor: `${Colors.surface}${Colors.opacity.light}`,
    borderRadius: 2,
  },
  voiceProgressFill: {
    height: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 2,
  },
});