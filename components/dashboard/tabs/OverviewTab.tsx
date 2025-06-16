import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { TriangleAlert as AlertTriangle, Calendar, TrendingUp, TrendingDown, User } from 'lucide-react-native';
import CompactStats from '../CompactStats';
import { shadow } from '@/utils/shadowStyle';

interface OverviewTabProps {
  dashboardStats: any;
  todaysAppointments: any[];
  refreshing: boolean;
  onRefresh: () => void;
}

export default function OverviewTab({ 
  dashboardStats, 
  todaysAppointments, 
  refreshing, 
  onRefresh 
}: OverviewTabProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Compact Statistics */}
      <CompactStats stats={dashboardStats} />

      {/* Critical Alerts Banner */}
      {dashboardStats.criticalCases > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle color="#ef4444" size={20} />
          <Text style={styles.alertText}>
            {dashboardStats.criticalCases} patient(s) need immediate attention
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Today's Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity>
            <Calendar color="#3b82f6" size={20} />
          </TouchableOpacity>
        </View>
        
        {todaysAppointments.map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
                          <View style={styles.appointmentAvatar}>
                <User size={16} color="#ffffff" />
              </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentPatient}>{appointment.patientName}</Text>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
            </View>
            <View style={[
              styles.appointmentStatus,
              { backgroundColor: `${getStatusColor(appointment.status)}15` }
            ]}>
              <Text style={[
                styles.appointmentStatusText,
                { color: getStatusColor(appointment.status) }
              ]}>
                {appointment.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>4.8/5</Text>
            <Text style={styles.metricLabel}>Patient Satisfaction</Text>
            <TrendingUp color="#10b981" size={16} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>12 min</Text>
            <Text style={styles.metricLabel}>Avg Response Time</Text>
            <TrendingDown color="#ef4444" size={16} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Recovery Rate</Text>
            <TrendingUp color="#10b981" size={16} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 8,
  },
  alertButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  alertButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow(2),
  },
  appointmentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  appointmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appointmentStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadow(2),
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
});