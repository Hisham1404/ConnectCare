import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Mic,
  MicOff,
  Send,
  Settings,
  Bookmark,
  History,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  Zap,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  MoreHorizontal,
  X,
  ChevronDown,
  Sparkles,
  Brain,
  Coffee,
  Briefcase,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'image' | 'file' | 'suggestion';
  isBookmarked?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  action: string;
}

export default function VirtualAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [communicationStyle, setCommunicationStyle] = useState<'casual' | 'professional'>('casual');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const listeningAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const quickActions: QuickAction[] = [
    { id: '1', title: 'Schedule Meeting', icon: Briefcase, action: 'schedule_meeting' },
    { id: '2', title: 'Set Reminder', icon: Zap, action: 'set_reminder' },
    { id: '3', title: 'Weather Update', icon: Coffee, action: 'weather' },
    { id: '4', title: 'Brainstorm Ideas', icon: Brain, action: 'brainstorm' },
  ];

  const suggestions = [
    "What's the weather like today?",
    "Help me write an email",
    "Set a reminder for 3 PM",
    "Summarize this document",
  ];

  useEffect(() => {
    if (isListening) {
      startListeningAnimation();
    } else {
      stopListeningAnimation();
    }
  }, [isListening]);

  const startListeningAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(listeningAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const stopListeningAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(listeningAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateNewMessage = () => {
    messageAnim.setValue(0);
    Animated.spring(messageAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    animateNewMessage();

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand! Let me help you with that.",
        "That's a great question. Here's what I think...",
        "I can definitely assist you with this task.",
        "Let me process that information for you.",
        "Based on what you've told me, I recommend...",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      animateNewMessage();
    }, 1500);
  };

  const toggleListening = () => {
    if (Platform.OS === 'web') {
      // Web implementation would use Web Speech API
      setIsListening(!isListening);
      if (!isListening) {
        setTranscriptionText('Listening...');
        // Simulate transcription
        setTimeout(() => {
          setTranscriptionText('How can I help you today?');
        }, 2000);
      } else {
        setTranscriptionText('');
      }
    } else {
      // Mobile implementation would use expo-speech or similar
      setIsListening(!isListening);
    }
  };

  const toggleBookmark = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isBookmarked: !msg.isBookmarked }
          : msg
      )
    );
  };

  const handleQuickAction = (action: string) => {
    const actionTexts = {
      schedule_meeting: "Schedule a meeting for tomorrow at 2 PM",
      set_reminder: "Set a reminder to call John at 5 PM",
      weather: "What's the weather forecast for today?",
      brainstorm: "Help me brainstorm ideas for my project",
    };
    
    sendMessage(actionTexts[action as keyof typeof actionTexts] || action);
    setShowQuickActions(false);
  };

  const colors = {
    background: isDarkMode ? '#0A0A0A' : '#FFFFFF',
    surface: isDarkMode ? '#1A1A1A' : '#F8F9FA',
    surfaceElevated: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    primary: '#00D4AA',
    primaryDark: '#00B894',
    accent: '#6C5CE7',
    text: isDarkMode ? '#FFFFFF' : '#2D3436',
    textSecondary: isDarkMode ? '#B2BEC3' : '#636E72',
    textTertiary: isDarkMode ? '#74B9FF' : '#A29BFE',
    border: isDarkMode ? '#2D3436' : '#DDD',
    error: '#FF6B6B',
    success: '#00D4AA',
    warning: '#FDCB6E',
  };

  const renderMessage = (message: Message, index: number) => (
    <Animated.View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
        {
          backgroundColor: message.isUser ? colors.primary : colors.surfaceElevated,
          transform: [{ scale: messageAnim }],
        },
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color: message.isUser ? '#FFFFFF' : colors.text },
        ]}
      >
        {message.text}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.messageTime,
            { color: message.isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {!message.isUser && (
          <TouchableOpacity
            onPress={() => toggleBookmark(message.id)}
            style={styles.bookmarkButton}
          >
            <Bookmark
              size={14}
              color={message.isBookmarked ? colors.warning : colors.textSecondary}
              fill={message.isBookmarked ? colors.warning : 'none'}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderVoiceInterface = () => (
    <View style={[styles.voiceInterface, { backgroundColor: colors.surface }]}>
      <Animated.View
        style={[
          styles.voiceButton,
          {
            backgroundColor: isListening ? colors.error : colors.primary,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleListening}
          style={styles.voiceButtonInner}
          activeOpacity={0.8}
        >
          {isListening ? (
            <MicOff size={32} color="#FFFFFF" />
          ) : (
            <Mic size={32} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {isListening && (
        <Animated.View
          style={[
            styles.listeningIndicator,
            {
              opacity: listeningAnim,
              backgroundColor: colors.surfaceElevated,
            },
          ]}
        >
          <Text style={[styles.listeningText, { color: colors.text }]}>
            {transcriptionText || 'Listening...'}
          </Text>
          <View style={styles.waveform}>
            {[...Array(5)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { backgroundColor: colors.primary },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <Modal
      visible={showQuickActions}
      transparent
      animationType="slide"
      onRequestClose={() => setShowQuickActions(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.quickActionsModal, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Quick Actions</Text>
            <TouchableOpacity onPress={() => setShowQuickActions(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionItem, { backgroundColor: colors.surface }]}
                onPress={() => handleQuickAction(action.action)}
              >
                <action.icon size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSettings = () => (
    <Modal
      visible={showSettings}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.settingsModal, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Toggle dark/light theme
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Voice Input</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Enable voice commands
                </Text>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={setVoiceEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Communication Style</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Choose your preferred tone
                </Text>
              </View>
              <View style={styles.styleToggle}>
                <TouchableOpacity
                  style={[
                    styles.styleButton,
                    communicationStyle === 'casual' && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setCommunicationStyle('casual')}
                >
                  <Text
                    style={[
                      styles.styleButtonText,
                      { color: communicationStyle === 'casual' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    Casual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.styleButton,
                    communicationStyle === 'professional' && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setCommunicationStyle('professional')}
                >
                  <Text
                    style={[
                      styles.styleButtonText,
                      { color: communicationStyle === 'professional' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    Professional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.assistantAvatar, { backgroundColor: colors.primary }]}>
            <Sparkles size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.assistantName, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.assistantStatus, { color: colors.textSecondary }]}>
              {isProcessing ? 'Thinking...' : 'Online'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowHistory(true)}
            style={[styles.headerButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <History size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={[styles.headerButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}

        {isProcessing && (
          <View style={[styles.typingIndicator, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.typingDots}>
              {[...Array(3)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.typingDot, { backgroundColor: colors.textSecondary }]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Suggestions */}
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
              Try asking:
            </Text>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionChip, { backgroundColor: colors.surface }]}
                onPress={() => sendMessage(suggestion)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Voice Interface */}
      {voiceEnabled && renderVoiceInterface()}

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated }]}>
          <TouchableOpacity
            onPress={() => setShowQuickActions(true)}
            style={styles.attachButton}
          >
            <Zap size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.border,
              },
            ]}
            disabled={!inputText.trim()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modals */}
      {renderQuickActions()}
      {renderSettings()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  assistantStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 100,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTime: {
    fontSize: 12,
  },
  bookmarkButton: {
    padding: 4,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    fontSize: 14,
  },
  voiceInterface: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningIndicator: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  waveform: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  waveBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  quickActionsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  settingsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  quickActionItem: {
    width: (width - 72) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  settingsContent: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  styleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  styleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});