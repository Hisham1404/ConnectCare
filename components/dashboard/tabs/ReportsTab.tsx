import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { FileText, TrendingUp, TriangleAlert as AlertTriangle, MessageSquare, Clock, User, Bot } from 'lucide-react-native';
import { useTranscript } from '../../../context/TranscriptContext';

interface ReportsTabProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ReportsTab({ refreshing, onRefresh }: ReportsTabProps) {
  const { transcript } = useTranscript();
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = () => {
    setIsLoading(true);
    
    // Format the transcript for display
    const formattedTranscript = transcript
      .map((msg) => `${msg.role === 'user' ? 'Patient' : 'AI Assistant'}: ${msg.text}`)
      .join('\n\n');

    // NOTE: In the future, you would send `formattedTranscript` to an LLM for summarization.
    // For now, we will just display the raw transcript as the report.
    setTimeout(() => {
      setReport(formattedTranscript);
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.generateSection}>
        <Text style={styles.sectionTitle}>Generate Clinical Report</Text>
        <Text style={styles.sectionDescription}>
          Generate a comprehensive report from the latest AI Health Assistant conversation. 
          The transcript will be formatted and displayed for clinical review.
        </Text>

        {transcript.length > 0 && (
          <View style={styles.conversationSummary}>
            <View style={styles.summaryHeader}>
              <MessageSquare color="#3b82f6" size={20} />
              <Text style={styles.summaryTitle}>Latest Conversation</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{transcript.length}</Text>
                <Text style={styles.statLabel}>Messages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {transcript.filter(m => m.role === 'user').length}
                </Text>
                <Text style={styles.statLabel}>Patient</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {transcript.filter(m => m.role === 'assistant').length}
                </Text>
                <Text style={styles.statLabel}>AI Assistant</Text>
              </View>
              {transcript.length > 0 && (
                <View style={styles.statItem}>
                  <Clock color="#6b7280" size={14} />
                  <Text style={styles.statTime}>
                    {formatTimestamp(transcript[transcript.length - 1].timestamp)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.generateButton,
            transcript.length === 0 && styles.generateButtonDisabled
          ]}
          onPress={handleGenerateReport}
          disabled={transcript.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <View style={styles.generateButtonContent}>
              <FileText color="#ffffff" size={20} />
              <Text style={styles.generateButtonText}>
                Generate Report from Last Conversation
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {transcript.length === 0 && (
          <View style={styles.noDataContainer}>
            <MessageSquare color="#9ca3af" size={32} />
            <Text style={styles.noDataTitle}>No Conversation Available</Text>
            <Text style={styles.noDataDescription}>
              Start a conversation with the AI Health Assistant to generate reports.
            </Text>
          </View>
        )}
      </View>

      {report && (
        <View style={styles.reportContainer}>
          <View style={styles.reportHeader}>
            <FileText color="#10b981" size={24} />
            <Text style={styles.reportTitle}>Conversation Transcript</Text>
          </View>
          
          <View style={styles.reportMeta}>
            <Text style={styles.reportMetaText}>
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.reportMetaText}>
              Total Messages: {transcript.length}
            </Text>
          </View>

          <View style={styles.reportContent}>
            {transcript.map((message, index) => (
              <View key={message.id} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageRole}>
                    {message.role === 'user' ? (
                      <User color="#3b82f6" size={16} />
                    ) : (
                      <Bot color="#10b981" size={16} />
                    )}
                    <Text style={[
                      styles.messageRoleText,
                      message.role === 'user' ? styles.userRoleText : styles.assistantRoleText
                    ]}>
                      {message.role === 'user' ? 'Patient' : 'AI Assistant'}
                    </Text>
                  </View>
                  <Text style={styles.messageTimestamp}>
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </View>
                <Text style={styles.messageText}>{message.text}</Text>
                {index < transcript.length - 1 && <View style={styles.messageDivider} />}
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.otherReportsSection}>
        <Text style={styles.sectionTitle}>Other Reports & Analytics</Text>
        
        <View style={styles.reportCard}>
          <TrendingUp color="#10b981" size={24} />
          <Text style={styles.reportCardTitle}>Recovery Analytics</Text>
          <Text style={styles.reportCardDescription}>
            Patient recovery trends and outcomes analysis
          </Text>
          <TouchableOpacity style={styles.reportCardButton}>
            <Text style={styles.reportCardButtonText}>View Analytics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportCard}>
          <AlertTriangle color="#f59e0b" size={24} />
          <Text style={styles.reportCardTitle}>Critical Events Log</Text>
          <Text style={styles.reportCardDescription}>
            History of critical patient events and interventions
          </Text>
          <TouchableOpacity style={styles.reportCardButton}>
            <Text style={styles.reportCardButtonText}>View Log</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  generateSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  conversationSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  statTime: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 4,
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  noDataDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  reportContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  reportMeta: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  reportMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  reportContent: {
    gap: 16,
  },
  messageItem: {
    paddingBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageRoleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRoleText: {
    color: '#3b82f6',
  },
  assistantRoleText: {
    color: '#10b981',
  },
  messageTimestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    paddingLeft: 22,
  },
  messageDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginTop: 16,
  },
  otherReportsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  reportCardDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  reportCardButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  reportCardButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});