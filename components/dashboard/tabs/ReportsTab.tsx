import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { FileText, TrendingUp, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface ReportsTabProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ReportsTab({ refreshing, onRefresh }: ReportsTabProps) {
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Reports & Analytics</Text>
      
      <View style={styles.reportCard}>
        <FileText color="#3b82f6" size={24} />
        <Text style={styles.reportTitle}>Weekly Patient Summary</Text>
        <Text style={styles.reportDescription}>Comprehensive overview of all patients this week</Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Generate Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportCard}>
        <TrendingUp color="#10b981" size={24} />
        <Text style={styles.reportTitle}>Recovery Analytics</Text>
        <Text style={styles.reportDescription}>Patient recovery trends and outcomes</Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>View Analytics</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reportCard}>
        <AlertTriangle color="#f59e0b" size={24} />
        <Text style={styles.reportTitle}>Critical Events Log</Text>
        <Text style={styles.reportDescription}>History of critical patient events</Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>View Log</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 16,
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
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  reportDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  reportButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});