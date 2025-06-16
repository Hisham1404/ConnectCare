import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList, Modal, SafeAreaView } from 'react-native';
import { FileText, TrendingUp, TriangleAlert as AlertTriangle, MessageSquare, Clock, User, Bot, ChevronDown, Users, X } from 'lucide-react-native';
import { useTranscript } from '../../../context/TranscriptContext';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/lib/supabase';

interface ReportsTabProps {
  refreshing: boolean;
  onRefresh: () => void;
}

interface Patient {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export default function ReportsTab({ refreshing, onRefresh }: ReportsTabProps) {
  const { transcript } = useTranscript();
  const { user } = useAuth();
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Get conversations for selected patient
  const { conversations, loading: conversationsLoading, getConversationSummary } = useConversations({
    patientId: selectedPatient?.id,
    limit: 50,
    realtime: false
  });

  // Fetch doctor's patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) return;

      try {
        setLoadingPatients(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, created_at')
          .eq('doctor_id', user.id)
          .eq('role', 'patient')
          .order('full_name', { ascending: true });

        if (error) throw error;

        setPatients(data || []);
        if (data && data.length > 0 && !selectedPatient) {
          setSelectedPatient(data[0]);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [user?.id]);

  const handleGenerateReport = () => {
    setIsLoading(true);
    
    let reportContent = '';

    // Add patient information
    if (selectedPatient) {
      reportContent += `CLINICAL REPORT\n`;
      reportContent += `Patient: ${selectedPatient.full_name}\n`;
      reportContent += `Email: ${selectedPatient.email}\n`;
      reportContent += `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
      
      reportContent += `AI CONVERSATION SUMMARY\n`;
      reportContent += `Total Conversations: ${conversations.length}\n\n`;

      if (conversations.length > 0) {
        conversations.forEach((conversation, index) => {
          const summary = getConversationSummary(conversation);
          const date = new Date(conversation.created_at).toLocaleDateString();
          
          reportContent += `--- Conversation ${index + 1} (${date}) ---\n`;
          reportContent += `Duration: ${summary.duration}\n`;
          reportContent += `Summary: ${summary.summary}\n`;
          
          if (summary.keyTopics.length > 0) {
            reportContent += `Key Topics: ${summary.keyTopics.join(', ')}\n`;
          }
          
          reportContent += '\n';
        });
      } else {
        reportContent += 'No AI conversations found for this patient.\n\n';
      }
    }

    // Add current session transcript if available
    if (transcript.length > 0) {
      reportContent += `CURRENT SESSION TRANSCRIPT\n`;
      const formattedTranscript = transcript
        .map((msg) => `${msg.role === 'user' ? 'Patient' : 'AI Assistant'}: ${msg.text}`)
        .join('\n\n');
      reportContent += formattedTranscript;
    }

    setTimeout(() => {
      setReport(reportContent);
      setIsLoading(false);
    }, 500);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderPatientSelectorModal = () => (
    <Modal
      visible={showPatientSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPatientSelector(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Patient</Text>
            <TouchableOpacity onPress={() => setShowPatientSelector(false)}>
              <X color="#6b7280" size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientDropdownItem}
                onPress={() => {
                  setSelectedPatient(item);
                  setShowPatientSelector(false);
                }}
              >
                <View style={styles.patientInfoContainer}>
                  <Text style={styles.patientDropdownText}>{item.full_name}</Text>
                  <Text style={styles.patientDropdownEmail}>{item.email}</Text>
                </View>
                {selectedPatient?.id === item.id && (
                   <View style={styles.selectedTick} />
                )}
              </TouchableOpacity>
            )}
            style={styles.patientDropdownList}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.generateSection}>
          <Text style={styles.sectionTitle}>Generate Clinical Report</Text>
          <Text style={styles.sectionDescription}>
            Generate a comprehensive clinical report including patient AI conversation history and summaries.
          </Text>

          {/* Patient Selection */}
          {loadingPatients ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#3b82f6" />
              <Text style={styles.loadingText}>Loading patients...</Text>
            </View>
          ) : patients.length > 0 ? (
            <TouchableOpacity 
              style={styles.patientSelectorButton}
              onPress={() => setShowPatientSelector(true)}
            >
              <Users color="#3b82f6" size={20} />
              <Text style={styles.patientSelectorText}>
                {selectedPatient ? selectedPatient.full_name : 'Select Patient'}
              </Text>
              <ChevronDown color="#6b7280" size={16} />
            </TouchableOpacity>
          ) : (
            <View style={styles.noPatientsContainer}>
              <Users color="#9ca3af" size={32} />
              <Text style={styles.noPatientsTitle}>No patients assigned</Text>
              <Text style={styles.noPatientsDescription}>
                You don't have any assigned patients yet.
              </Text>
            </View>
          )}

          {/* Patient Conversation Summary */}
          {selectedPatient && (
            <View style={styles.patientSummary}>
              <View style={styles.summaryHeader}>
                <MessageSquare color="#3b82f6" size={20} />
                <Text style={styles.summaryTitle}>
                  {selectedPatient.full_name}'s AI Conversations
                </Text>
              </View>
              
              {conversationsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#3b82f6" />
                  <Text style={styles.loadingText}>Loading conversations...</Text>
                </View>
              ) : (
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{conversations.length}</Text>
                    <Text style={styles.statLabel}>Total Conversations</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {conversations.filter(c => {
                        const date = new Date(c.created_at);
                        const today = new Date();
                        return date.toDateString() === today.toDateString();
                      }).length}
                    </Text>
                    <Text style={styles.statLabel}>Today</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {conversations.filter(c => {
                        const date = new Date(c.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return date >= weekAgo;
                      }).length}
                    </Text>
                    <Text style={styles.statLabel}>This Week</Text>
                  </View>
                  {conversations.length > 0 && (
                    <View style={styles.statItem}>
                      <Clock color="#6b7280" size={14} />
                      <Text style={styles.statTime}>
                        Last: {new Date(conversations[0].created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Recent Conversations Preview */}
              {conversations.length > 0 && (
                <View style={styles.conversationsPreview}>
                  <Text style={styles.conversationsPreviewTitle}>Recent Conversations</Text>
                  {conversations.slice(0, 3).map((conversation, index) => {
                    const summary = getConversationSummary(conversation);
                    return (
                      <View key={conversation.id} style={styles.conversationPreviewItem}>
                        <View style={styles.conversationPreviewHeader}>
                          <Text style={styles.conversationPreviewDate}>
                            {new Date(conversation.created_at).toLocaleDateString()}
                          </Text>
                          <Text style={styles.conversationPreviewDuration}>
                            {summary.duration}
                          </Text>
                        </View>
                        <Text style={styles.conversationPreviewSummary} numberOfLines={2}>
                          {summary.summary}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Current Session Summary */}
          {transcript.length > 0 && (
            <View style={styles.conversationSummary}>
              <View style={styles.summaryHeader}>
                <MessageSquare color="#10b981" size={20} />
                <Text style={styles.summaryTitle}>Current Session</Text>
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
              (!selectedPatient && transcript.length === 0) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateReport}
            disabled={(!selectedPatient && transcript.length === 0) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <View style={styles.generateButtonContent}>
                <FileText color="#ffffff" size={20} />
                <Text style={styles.generateButtonText}>
                  Generate Clinical Report
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {!selectedPatient && transcript.length === 0 && (
            <View style={styles.noDataContainer}>
              <MessageSquare color="#9ca3af" size={32} />
              <Text style={styles.noDataTitle}>No Data Available</Text>
              <Text style={styles.noDataDescription}>
                Select a patient to view their conversation history or start a new AI conversation.
              </Text>
            </View>
          )}
        </View>

        {report && (
          <View style={styles.reportContainer}>
            <View style={styles.reportHeader}>
              <FileText color="#10b981" size={24} />
              <Text style={styles.reportTitle}>Clinical Report</Text>
            </View>
            
            <View style={styles.reportContent}>
              <Text style={styles.reportText}>{report}</Text>
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
      {renderPatientSelectorModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  generateSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  patientSelector: {
    marginBottom: 20,
  },
  patientSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  patientSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  patientDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientDropdownList: {
    maxHeight: 250,
  },
  patientDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  patientInfoContainer: {
    flex: 1,
  },
  patientDropdownText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  patientDropdownEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  noPatientsContainer: {
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  noPatientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  noPatientsDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  patientSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conversationSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statTime: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
  },
  conversationsPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  conversationsPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  conversationPreviewItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  conversationPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  conversationPreviewDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  conversationPreviewDuration: {
    fontSize: 11,
    color: '#6b7280',
  },
  conversationPreviewSummary: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  noDataDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  reportContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reportContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  reportText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  otherReportsSection: {
    padding: 20,
    paddingTop: 0,
  },
  reportCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  reportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reportCardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  reportCardButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  reportCardButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  selectedTick: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});