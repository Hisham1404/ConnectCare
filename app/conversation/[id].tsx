import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { 
  ArrowLeft, 
  MessageCircle, 
  Clock, 
  User, 
  Bot, 
  Share, 
  Download 
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useConversation } from '@/hooks/useConversations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ElevenLabsTranscriptSegment } from '@/types/models';

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { conversation, loading, error } = useConversation(id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (error || !conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <View style={styles.errorContainer}>
          <MessageCircle color="#EF4444" size={48} />
          <Text style={styles.errorTitle}>Conversation Not Found</Text>
          <Text style={styles.errorDescription}>
            {error || 'This conversation could not be loaded.'}
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={16} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handleShare = () => {
    Alert.alert(
      'Share Conversation',
      'Would you like to share this conversation transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // TODO: Implement sharing functionality
          Alert.alert('Coming Soon', 'Sharing functionality will be available soon.');
        }}
      ]
    );
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Transcript',
      'Would you like to download this conversation transcript?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => {
          // TODO: Implement download functionality
          Alert.alert('Coming Soon', 'Download functionality will be available soon.');
        }}
      ]
    );
  };

  const conversationData = conversation.conversation_data;
  const transcript = conversationData.transcript || [];
  const summary = conversationData.analysis?.transcript_summary || 
                 conversationData.summary || 
                 conversationData.analysis?.summary || 
                 'No summary available';
  
  const duration = conversationData.metadata?.call_duration;
  const keyTopics = conversationData.analysis?.key_topics || [];
  const actionItems = conversationData.analysis?.action_items || [];

  // Determine if segment is spoken by the user (default) or the assistant/agent.
  const isUserSpeaker = (segment: Partial<ElevenLabsTranscriptSegment & { speaker?: string; role?: string }>) => {
    const role = (segment.role || segment.speaker || '').toLowerCase();
    return role !== 'agent' && role !== 'assistant';
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/chat');
            }
          }}
        >
          <ArrowLeft color="#E2E8F0" size={20} />
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Conversation</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(conversation.created_at)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Share color="#E2E8F0" size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDownload}>
            <Download color="#E2E8F0" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Conversation Metadata */}
        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Clock color="#64748B" size={16} />
              <Text style={styles.metadataLabel}>Time</Text>
              <Text style={styles.metadataValue}>
                {formatTime(conversation.created_at)}
              </Text>
            </View>
            
            {duration && (
              <View style={styles.metadataItem}>
                <MessageCircle color="#64748B" size={16} />
                <Text style={styles.metadataLabel}>Duration</Text>
                <Text style={styles.metadataValue}>
                  {formatDuration(duration)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        {summary && summary !== 'No summary available' && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Key Topics */}
        {keyTopics.length > 0 && (
          <View style={styles.topicsContainer}>
            <Text style={styles.sectionTitle}>Key Topics</Text>
            <View style={styles.topicsGrid}>
              {keyTopics.map((topic, index) => (
                <View key={index} style={styles.topicTag}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Items */}
        {actionItems.length > 0 && (
          <View style={styles.actionItemsContainer}>
            <Text style={styles.sectionTitle}>Action Items</Text>
            {actionItems.map((item, index) => (
              <View key={index} style={styles.actionItem}>
                <View style={styles.actionItemBullet} />
                <Text style={styles.actionItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transcript */}
        <View style={styles.transcriptContainer}>
          <Text style={styles.sectionTitle}>Full Transcript</Text>
          
          {transcript.length === 0 ? (
            <View style={styles.emptyTranscript}>
              <MessageCircle color="#64748B" size={32} />
              <Text style={styles.emptyTranscriptText}>
                No transcript available for this conversation
              </Text>
            </View>
          ) : (
            <View style={styles.transcriptContent}>
              {transcript.map((segment: any, index: number) => {
                const isUser = isUserSpeaker(segment);
                const messageText = segment.content ?? segment.text ?? segment.message ?? '';
                return (
                  <View key={index} style={styles.transcriptSegment}>
                    <View style={styles.speakerContainer}>
                      <View style={[
                        styles.speakerIcon,
                        isUser ? styles.userSpeakerIcon : styles.assistantSpeakerIcon
                      ]}>
                        {isUser ? (
                          <User color="#3B82F6" size={14} />
                        ) : (
                          <Bot color="#10B981" size={14} />
                        )}
                      </View>
                      <Text style={styles.speakerName}>
                        {isUser ? 'You' : 'Assistant'}
                      </Text>
                      {segment.start_time !== undefined && (
                        <Text style={styles.timestamp}>
                          {formatDuration(segment.start_time)}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.transcriptText}>{messageText}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  metadataContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metadataItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  topicsContainer: {
    marginBottom: 20,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  actionItemsContainer: {
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  actionItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 7,
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  transcriptContainer: {
    marginBottom: 24,
  },
  transcriptContent: {
    gap: 16,
  },
  emptyTranscript: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTranscriptText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  transcriptSegment: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  speakerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSpeakerIcon: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  assistantSpeakerIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  speakerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    flex: 1,
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
  },
  transcriptText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
}); 