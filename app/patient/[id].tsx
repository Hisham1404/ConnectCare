import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, User, Heart, Activity, Thermometer, Droplets, Calendar, Target, Award, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { supabase } from '../../lib/supabase';
import MetricCard from '../../components/health/MetricCard';
import GoalCard from '../../components/health/GoalCard';

const { width } = Dimensions.get('window');

// Define types for our data
interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  doctor_id: string;
}

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  unit: string;
  created_at: string;
}

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient profile data
  const fetchPatientProfile = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      throw err;
    }
  };

  // Fetch patient health metrics
  const fetchPatientHealthMetrics = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health metrics:', err);
      throw err;
    }
  };

  // Fetch patient health goals
  const fetchPatientHealthGoals = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health goals:', err);
      throw err;
    }
  };

  // Load all patient data
  const loadPatientData = async () => {
    if (!id) return;

    try {
      setError(null);
      const [profileData, metricsData, goalsData] = await Promise.all([
        fetchPatientProfile(id),
        fetchPatientHealthMetrics(id),
        fetchPatientHealthGoals(id)
      ]);

      setPatient(profileData);
      setHealthMetrics(metricsData);
      setHealthGoals(goalsData);
    } catch (err) {
      console.error('Error loading patient data:', err);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadPatientData();
  }, [id]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientData();
    setRefreshing(false);
  };

  // Get the most recent metrics for key health indicators
  const getLatestMetricByType = (type: string) => {
    return healthMetrics.find(metric => metric.type.toLowerCase() === type.toLowerCase());
  };

  // Transform health metrics for MetricCard component
  const transformedMetrics = [
    {
      id: '1',
      label: 'Heart Rate',
      icon: Heart,
      color: Colors.heartRate || '#ef4444',
      data: getLatestMetricByType('Heart Rate')
    },
    {
      id: '2',
      label: 'Blood Pressure',
      icon: Activity,
      color: Colors.bloodPressure || '#3b82f6',
      data: getLatestMetricByType('Blood Pressure')
    },
    {
      id: '3',
      label: 'Temperature',
      icon: Thermometer,
      color: Colors.temperature || '#f59e0b',
      data: getLatestMetricByType('Temperature')
    },
    {
      id: '4',
      label: 'Oxygen Level',
      icon: Droplets,
      color: Colors.oxygen || '#10b981',
      data: getLatestMetricByType('Oxygen Level')
    }
  ].filter(metric => metric.data); // Only show metrics that have data

  // Transform health goals for GoalCard component
  const transformedGoals = healthGoals.map(goal => ({
    id: goal.id,
    title: goal.title,
    current: 0, // This could be enhanced with actual progress data
    target: 100,
    unit: 'points',
    progress: goal.status === 'completed' ? 100 : goal.status === 'in_progress' ? 50 : 0,
    icon: Target,
    color: Colors.accent || '#3b82f6',
    description: goal.description,
    status: goal.status
  }));

  const getMetricIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'heart rate': return Heart;
      case 'blood pressure': return Activity;
      case 'temperature': return Thermometer;
      case 'oxygen level': return Droplets;
      default: return Activity;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'heart rate': return '#ef4444';
      case 'blood pressure': return '#3b82f6';
      case 'temperature': return '#f59e0b';
      case 'oxygen level': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading patient details...</Text>
      </View>
    );
  }

  if (error || !patient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Patient</Text>
        <Text style={styles.errorText}>{error || 'Patient not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Profile */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <User size={32} color="#ffffff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.patientName}>{patient.full_name}</Text>
                <Text style={styles.patientEmail}>{patient.email}</Text>
                <Text style={styles.patientSince}>
                  Patient since {new Date(patient.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Health Metrics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Health Metrics</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{healthMetrics.length}</Text>
            </View>
          </View>

          {transformedMetrics.length > 0 ? (
            <View style={styles.metricsGrid}>
              {transformedMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <View key={metric.id} style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
                        <IconComponent color={metric.color} size={20} />
                      </View>
                      <Text style={styles.metricLabel}>{metric.label}</Text>
                    </View>
                    <Text style={styles.metricValue}>
                      {metric.data?.value || '--'}
                      <Text style={styles.metricUnit}> {metric.data?.unit || ''}</Text>
                    </Text>
                    <Text style={styles.metricTime}>
                      {metric.data ? 
                        `Recorded ${new Date(metric.data.created_at).toLocaleDateString()}` : 
                        'No data available'
                      }
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Activity color="#6b7280" size={48} />
              <Text style={styles.emptyStateTitle}>No Health Metrics</Text>
              <Text style={styles.emptyStateText}>
                This patient hasn't recorded any health metrics yet.
              </Text>
            </View>
          )}
        </View>

        {/* Health Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Goals</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{healthGoals.length}</Text>
            </View>
          </View>

          {transformedGoals.length > 0 ? (
            <View style={styles.goalsContainer}>
              {transformedGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalIconContainer}>
                      <Target color={goal.color} size={20} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    </View>
                    <View style={[
                      styles.goalStatus,
                      { backgroundColor: getStatusColor(goal.status) }
                    ]}>
                      <Text style={styles.goalStatusText}>
                        {goal.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.goalProgress}>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[
                          styles.goalProgressFill,
                          { 
                            width: `${goal.progress}%`,
                            backgroundColor: goal.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.goalProgressText}>{goal.progress}%</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Target color="#6b7280" size={48} />
              <Text style={styles.emptyStateTitle}>No Health Goals</Text>
              <Text style={styles.emptyStateText}>
                This patient hasn't set any health goals yet.
              </Text>
            </View>
          )}
        </View>

        {/* All Health Metrics History */}
        {healthMetrics.length > 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Health Metrics</Text>
            <View style={styles.metricsHistory}>
              {healthMetrics.map((metric) => {
                const IconComponent = getMetricIcon(metric.type);
                const color = getMetricColor(metric.type);
                return (
                  <View key={metric.id} style={styles.historyItem}>
                    <View style={[styles.historyIcon, { backgroundColor: `${color}15` }]}>
                      <IconComponent color={color} size={16} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyType}>{metric.type}</Text>
                      <Text style={styles.historyTime}>
                        {new Date(metric.created_at).toLocaleDateString()} at{' '}
                        {new Date(metric.created_at).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.historyValue}>
                      {metric.value} {metric.unit}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#10b981';
    case 'in_progress': return '#f59e0b';
    case 'not_started': return '#6b7280';
    default: return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  patientSince: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  goalsContainer: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  goalStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 35,
    textAlign: 'right',
  },
  metricsHistory: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
}); 