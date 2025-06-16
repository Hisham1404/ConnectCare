import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MessageCircle, Trash2, Plus, Clock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useState } from 'react';

import ConvAiDOMComponent from '../../components/ConvAI';
import tools from '../../utils/tools';
import { useTranscript } from '../../context/TranscriptContext';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Conversation } from '@/types/models';

export default function ChatScreen() {
  const { transcript, clearTranscript, isRecording, addMessage, setIsRecording } = useTranscript();
  const { profile, loading } = useAuth();
  const { conversations, loading: conversationsLoading, error, refresh, getConversationSummary } = useConversations({
    patientId: profile?.id,
    limit: 20,
    realtime: true
  });
  const [showNewCall, setShowNewCall] = useState(false);

  if (loading || conversationsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  const exitCallView = () => {
    clearTranscript();
    setShowNewCall(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const summary = getConversationSummary(item);
    
    return (
      <Link href={`/conversation/${item.id}`} asChild>
        <TouchableOpacity style={styles.conversationItem}>
          <View style={styles.conversationHeader}>
            <View style={styles.conversationIconContainer}>
              <MessageCircle color="#3B82F6" size={20} />
            </View>
            <View style={styles.conversationInfo}>
              <View style={styles.conversationTitleRow}>
                <Text style={styles.conversationDate}>
                  {formatDate(item.created_at)}
                </Text>
                <View style={styles.conversationMeta}>
                  <Clock color="#64748B" size={12} />
                  <Text style={styles.conversationDuration}>{summary.duration}</Text>
                </View>
              </View>
              <Text style={styles.conversationSummary} numberOfLines={2}>
                {summary.summary}
              </Text>
              {summary.keyTopics.length > 0 && (
                <View style={styles.topicsContainer}>
                  {summary.keyTopics.slice(0, 3).map((topic, index) => (
                    <View key={index} style={styles.topicTag}>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <ChevronRight color="#64748B" size={16} />
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        {showNewCall ? (
          <>
            {/* In-Call View */}
            <View style={styles.callHeader}>
              <TouchableOpacity onPress={exitCallView} style={styles.backButton}>
                <ArrowLeft color="#E2E8F0" size={18} />
                <Text style={styles.backButtonText}>History</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.callContent}>
              <Text style={styles.description}>
                {isRecording ? 'Listening...' : 'Press the button to talk to the assistant.'}
              </Text>
              
              <View style={styles.transcriptContainer}>
                <View style={styles.transcriptHeader}>
                  <View style={styles.transcriptTitleContainer}>
                    <MessageCircle color="#94A3B8" size={16} />
                    <Text style={styles.transcriptTitle}>Current Conversation</Text>
                  </View>
                  {transcript.length > 0 && (
                    <TouchableOpacity onPress={clearTranscript} style={styles.clearButton}>
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  )}
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
                  {transcript.length === 0 && (
                    <View style={styles.emptyTranscriptContainer}>
                      <Text style={styles.emptyTranscriptText}>
                        Your conversation will appear here.
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* AI Voice Component */}
              <View style={styles.domComponentContainer}>
                <ConvAiDOMComponent
                  dom={{ style: styles.domComponent }}
                  platform={Platform.OS}
                  patientId={profile?.id}
                  get_battery_level={tools.get_battery_level}
                  change_brightness={tools.change_brightness}
                  flash_screen={tools.flash_screen}
                  addMessage={addMessage}
                  clearTranscript={clearTranscript}
                  setIsRecording={setIsRecording}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* History View */}
            <Text style={styles.title}>AI Health Assistant</Text>
            
            <View style={styles.newCallContainer}>
              <Text style={styles.description}>
                Start a new conversation or review past sessions
              </Text>
              
              <TouchableOpacity onPress={() => setShowNewCall(true)} style={styles.newCallButton}>
                <Plus color="#FFFFFF" size={20} />
                <Text style={styles.newCallButtonText}>Start New Call</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Past Conversations</Text>
                <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load conversations</Text>
                  <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                    <Text style={styles.retryText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MessageCircle color="#475569" size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyTitle}>No Conversation History</Text>
                  <Text style={styles.emptyDescription}>
                    Your past conversations will appear here after your first call.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={conversations}
                  renderItem={renderConversationItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.conversationsList}
                  contentContainerStyle={styles.conversationsListContent}
                />
              )}
            </View>
          </>
        )}
      </View>
      
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingTop: 40,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  newCallContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  description: { 
    fontSize: 16, 
    color: '#94A3B8', 
    textAlign: 'center',
    marginBottom: 16
  },
  newCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  newCallButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '500',
  },
  callContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  transcriptContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  emptyTranscriptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTranscriptText: {
    color: '#64748B',
    fontSize: 14,
  },
  historyContainer: {
    flex: 1,
    width: '100%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  refreshText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  conversationsList: {
    flex: 1,
  },
  conversationsListContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  conversationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conversationDuration: {
    fontSize: 12,
    color: '#64748B',
  },
  conversationSummary: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 8,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  topicTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topicText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
  },
  retryText: {
    color: '#F1F5F9',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CBD5E1',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  domComponentContainer: { 
    width: 120, 
    height: 120, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 'auto',
    paddingBottom: 24,
  },
  domComponent: { 
    width: 120, 
    height: 120 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});