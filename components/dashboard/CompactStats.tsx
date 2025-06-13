import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { shadow } from '@/utils/shadowStyle';

interface StatsData {
  totalPatients: number;
  criticalCases: number;
  stablePatients: number;
  pendingReviews: number;
}

interface CompactStatsProps {
  stats: StatsData;
}

export default function CompactStats({ stats }: CompactStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalPatients}</Text>
        <Text style={styles.statLabel}>Total Patients</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.criticalCases}</Text>
        <Text style={styles.statLabel}>Critical</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.stablePatients}</Text>
        <Text style={styles.statLabel}>Stable</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.pendingReviews}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...shadow(2),
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});