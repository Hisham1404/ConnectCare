import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { TriangleAlert as AlertTriangle, Calendar, TrendingUp, TrendingDown, User } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import CompactStats from '../CompactStats';
import { shadow } from '@/utils/shadowStyle';
import { playDemoAudio, stopDemoAudio } from '@/utils/audioPlayer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from 'expo-router';

interface OverviewTabProps {
  todaysAppointments: any[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface HealthMetric {
  id: string;
  patient_id: string;
  type: string;
  value: string;
  unit: string;
  created_at: string;
}

interface CalculatedStats {
  totalPatients: number;
  criticalCases: number;
  stablePatients: number;
  pendingReviews: number;
  avgHeartRate: number;
  totalMetrics: number;
  recentMetrics: number;
}

export default function OverviewTab({ 
  todaysAppointments, 
  refreshing, 
  onRefresh 
}: OverviewTabProps) {
  
  const { user } = useAuth();
  const [stats, setStats] = useState<CalculatedStats>({
    totalPatients: 0,
    criticalCases: 0,
    stablePatients: 0,
    pendingReviews: 0,
    avgHeartRate: 0,
    totalMetrics: 0,
    recentMetrics: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stop audio on blur
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopDemoAudio();
      };
    }, [])
  );

  // Fetch doctor's patients and calculate real statistics
  const fetchAndCalculateStats = async () => {
    if (!user?.id) return;

    try {
      setError(null);

      // Step 1: Fetch doctor's patients
      const { data: patients, error: patientsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('doctor_id', user.id)
        .eq('role', 'patient');

      if (patientsError) throw patientsError;

      const patientIds = (patients || []).map(p => p.id);
      
      // Step 2: Fetch all health metrics for these patients
      let allMetrics: HealthMetric[] = [];
      if (patientIds.length > 0) {
        const { data: metrics, error: metricsError } = await supabase
          .from('health_metrics')
          .select('*')
          .in('patient_id', patientIds)
          .order('created_at', { ascending: false });

        if (metricsError) throw metricsError;
        allMetrics = metrics || [];
      }

      // Step 3: Calculate statistics
      const totalPatients = patients?.length || 0;
      
      // Calculate average heart rate
      const heartRateMetrics = allMetrics.filter(m => 
        m.type.toLowerCase().includes('heart rate') || 
        m.type.toLowerCase().includes('heart') ||
        m.type.toLowerCase() === 'pulse'
      );
      
      const avgHeartRate = heartRateMetrics.length > 0 
        ? Math.round(heartRateMetrics.reduce((sum, metric) => {
            const value = parseInt(metric.value) || 0;
            return sum + value;
          }, 0) / heartRateMetrics.length)
        : 0;

      // Calculate recent metrics (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const recentMetrics = allMetrics.filter(m => 
        new Date(m.created_at) > oneDayAgo
      ).length;

      // Mock priority calculations (you can enhance this with real priority logic)
      const criticalCases = Math.floor(totalPatients * 0.15); // 15% critical
      const stablePatients = totalPatients - criticalCases;
      const pendingReviews = recentMetrics; // Recent metrics need review

      setStats({
        totalPatients,
        criticalCases,
        stablePatients,
        pendingReviews,
        avgHeartRate,
        totalMetrics: allMetrics.length,
        recentMetrics,
      });

    } catch (err) {
      console.error('Error calculating dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCalculateStats();
  }, [user?.id]);

  const handleRefresh = async () => {
    await fetchAndCalculateStats();
    onRefresh();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (error) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchAndCalculateStats} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Overview Dashboard</Text>
                 {/* Demo Button */}
         <Pressable 
           style={styles.demoButton}
           onPress={() => playDemoAudio('doctor-overview')}
         >
          <Ionicons name="play-circle-outline" size={18} color="#3b82f6" />
          <Text style={styles.demoButtonText}>Demo</Text>
        </Pressable>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
      {/* Dynamic Statistics */}
      <CompactStats stats={stats} />

      {/* Critical Alerts Banner */}
      {stats.criticalCases > 0 && (
        <View style={styles.alertBanner}>
          <AlertTriangle color="#ef4444" size={20} />
          <Text style={styles.alertText}>
            {stats.criticalCases} patient(s) need immediate attention
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Real-time Metrics Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Metrics Overview</Text>
        </View>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.avgHeartRate || '--'}</Text>
            <Text style={styles.metricLabel}>Avg Heart Rate (BPM)</Text>
            {stats.avgHeartRate > 0 && (
              <TrendingUp color={stats.avgHeartRate > 80 ? "#f59e0b" : "#10b981"} size={16} />
            )}
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.totalMetrics}</Text>
            <Text style={styles.metricLabel}>Total Metrics</Text>
            <TrendingUp color="#10b981" size={16} />
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.recentMetrics}</Text>
            <Text style={styles.metricLabel}>Recent (24h)</Text>
            {stats.recentMetrics > 0 && <TrendingUp color="#10b981" size={16} />}
          </View>
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity>
            <Calendar color="#3b82f6" size={20} />
          </TouchableOpacity>
        </View>
        
        {todaysAppointments.length > 0 ? (
          todaysAppointments.map((appointment) => (
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
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  scrollContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  demoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow(2),
  },
  demoButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});