import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { Play, Pause, Heart, Activity, Target, Monitor, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  unit: string;
  created_at: string;
}

interface PatientVitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  oxygenLevel: string;
}

interface MonitoringTabProps {
  patients: any[];
  isMonitoring: boolean;
  selectedPatientForMonitoring: string;
  refreshing: boolean;
  onToggleMonitoring: () => void;
  onSelectPatient: (patientId: string) => void;
  onRefresh: () => void;
}

export default function MonitoringTab({
  patients,
  isMonitoring,
  selectedPatientForMonitoring,
  refreshing,
  onToggleMonitoring,
  onSelectPatient,
  onRefresh
}: MonitoringTabProps) {
  const [patientVitals, setPatientVitals] = useState<PatientVitals>({
    heartRate: '--',
    bloodPressure: '--',
    temperature: '--',
    oxygenLevel: '--'
  });
  const [vitalsTrends, setVitalsTrends] = useState<{[key: string]: number[]}>({
    heartRate: [],
    bloodPressure: [],
    temperature: [],
    oxygenLevel: []
  });
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient health metrics from database
  const fetchPatientVitals = async (patientId: string) => {
    if (!patientId) return;
    
    setLoadingVitals(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50); // Get recent metrics for trends

      if (error) throw error;

      // Process the data to get latest vitals and trends
      const vitals: PatientVitals = {
        heartRate: '--',
        bloodPressure: '--',
        temperature: '--',
        oxygenLevel: '--'
      };

      const trends: {[key: string]: number[]} = {
        heartRate: [],
        bloodPressure: [],
        temperature: [],
        oxygenLevel: []
      };

      if (data && data.length > 0) {
        // Get the latest value for each metric type
        const heartRateMetrics = data.filter(m => m.type.toLowerCase() === 'heart rate');
        const bloodPressureMetrics = data.filter(m => m.type.toLowerCase() === 'blood pressure');
        const temperatureMetrics = data.filter(m => m.type.toLowerCase() === 'temperature');
        const oxygenMetrics = data.filter(m => m.type.toLowerCase() === 'oxygen level');

        // Set latest values
        if (heartRateMetrics.length > 0) {
          vitals.heartRate = heartRateMetrics[0].value;
          trends.heartRate = heartRateMetrics.slice(0, 7).map(m => parseFloat(m.value)).reverse();
        }
        if (bloodPressureMetrics.length > 0) {
          vitals.bloodPressure = bloodPressureMetrics[0].value;
          // For blood pressure, extract systolic for trend chart
          trends.bloodPressure = bloodPressureMetrics.slice(0, 7)
            .map(m => parseFloat(m.value.split('/')[0]) || 120).reverse();
        }
        if (temperatureMetrics.length > 0) {
          vitals.temperature = temperatureMetrics[0].value;
          trends.temperature = temperatureMetrics.slice(0, 7).map(m => parseFloat(m.value)).reverse();
        }
        if (oxygenMetrics.length > 0) {
          vitals.oxygenLevel = oxygenMetrics[0].value;
          trends.oxygenLevel = oxygenMetrics.slice(0, 7).map(m => parseFloat(m.value)).reverse();
        }
      }

      // Fill trends with mock data if not enough real data points (for demo purposes)
      Object.keys(trends).forEach(key => {
        if (trends[key].length < 7) {
          const currentValue = parseFloat(vitals[key as keyof PatientVitals]) || 0;
          if (currentValue > 0) {
            trends[key] = Array.from({ length: 7 }, (_, i) => {
              const variation = (Math.random() - 0.5) * (currentValue * 0.1);
              return Math.max(currentValue + variation, currentValue * 0.8);
            });
          }
        }
      });

      setPatientVitals(vitals);
      setVitalsTrends(trends);
    } catch (err) {
      console.error('Error fetching patient vitals:', err);
      setError('Failed to load patient vitals');
      // Set default values on error
      setPatientVitals({
        heartRate: '--',
        bloodPressure: '--',
        temperature: '--',
        oxygenLevel: '--'
      });
    } finally {
      setLoadingVitals(false);
    }
  };

  // Load vitals when selected patient changes
  useEffect(() => {
    if (selectedPatientForMonitoring) {
      fetchPatientVitals(selectedPatientForMonitoring);
    }
  }, [selectedPatientForMonitoring]);

  // Refresh vitals when monitoring is active (simulate real-time updates)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring && selectedPatientForMonitoring) {
      interval = setInterval(() => {
        fetchPatientVitals(selectedPatientForMonitoring);
      }, 10000); // Refresh every 10 seconds when monitoring is active
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, selectedPatientForMonitoring]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'stable': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleRefresh = async () => {
    await onRefresh();
    if (selectedPatientForMonitoring) {
      await fetchPatientVitals(selectedPatientForMonitoring);
    }
  };

  // Define vitals configuration with real data
  const vitalsConfig = [
    { 
      label: 'Heart Rate', 
      value: patientVitals.heartRate, 
      unit: 'BPM', 
      icon: Heart, 
      color: '#ef4444', 
      trend: vitalsTrends.heartRate 
    },
    { 
      label: 'Blood Pressure', 
      value: patientVitals.bloodPressure, 
      unit: 'mmHg', 
      icon: Activity, 
      color: '#3b82f6', 
      trend: vitalsTrends.bloodPressure 
    },
    { 
      label: 'Temperature', 
      value: patientVitals.temperature, 
      unit: '°F', 
      icon: Target, 
      color: '#f59e0b', 
      trend: vitalsTrends.temperature 
    },
    { 
      label: 'Oxygen Sat', 
      value: patientVitals.oxygenLevel, 
      unit: '%', 
      icon: Monitor, 
      color: '#10b981', 
      trend: vitalsTrends.oxygenLevel 
    },
  ];

  return (
    <View style={styles.container}>
      {/* Compact Monitoring Controls */}
      <View style={styles.monitoringControls}>
        <View style={styles.monitoringHeader}>
          <Text style={styles.monitoringTitle}>Live Patient Monitoring</Text>
          <TouchableOpacity
            style={[
              styles.monitoringToggle,
              { backgroundColor: isMonitoring ? '#ef4444' : '#10b981' }
            ]}
            onPress={onToggleMonitoring}
          >
            {isMonitoring ? (
              <Pause color="#ffffff" size={14} />
            ) : (
              <Play color="#ffffff" size={14} />
            )}
            <Text style={styles.monitoringToggleText}>
              {isMonitoring ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compact Patient Selector */}
        <View style={styles.patientSelectorContainer}>
          {patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={[
                styles.patientSelectorCard,
                selectedPatientForMonitoring === patient.id && styles.selectedPatientCard
              ]}
              onPress={() => onSelectPatient(patient.id)}
            >
              <View style={styles.selectorAvatar}>
                <User size={16} color="#ffffff" />
              </View>
              <Text style={styles.selectorName}>{patient.name.split(' ')[0]}</Text>
              <View style={[
                styles.selectorPriority,
                { backgroundColor: getPriorityColor(patient.priority) }
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live Vitals */}
      <ScrollView 
        style={styles.vitalsContainer}
        refreshControl={<RefreshControl refreshing={refreshing || loadingVitals} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.vitalsTitle}>Real-time Vitals</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => selectedPatientForMonitoring && fetchPatientVitals(selectedPatientForMonitoring)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.vitalsGrid}>
          {vitalsConfig.map((vital, index) => (
            <View key={index} style={styles.vitalCard}>
              <View style={styles.vitalCardHeader}>
                <View style={[styles.vitalIcon, { backgroundColor: `${vital.color}15` }]}>
                  <vital.icon color={vital.color} size={18} />
                </View>
                <View style={[
                  styles.vitalStatus,
                  { backgroundColor: isMonitoring ? '#10b98115' : '#6b728015' }
                ]}>
                  <Text style={[
                    styles.vitalStatusText,
                    { color: isMonitoring ? '#10b981' : '#6b7280' }
                  ]}>
                    {isMonitoring ? 'LIVE' : 'OFF'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.vitalCardValue}>
                {vital.value}
                <Text style={styles.vitalCardUnit}> {vital.unit}</Text>
              </Text>
              <Text style={styles.vitalCardLabel}>{vital.label}</Text>
              
              {/* Mini Chart */}
              <View style={styles.miniChart}>
                {vital.trend.length > 0 ? vital.trend.map((value, i) => {
                  const maxValue = Math.max(...vital.trend);
                  const minValue = Math.min(...vital.trend);
                  const range = maxValue - minValue || 1;
                  const height = ((value - minValue) / range) * 25 + 4;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.chartBar,
                        {
                          height,
                          backgroundColor: vital.color,
                          opacity: i === vital.trend.length - 1 ? 1 : 0.6,
                        }
                      ]}
                    />
                  );
                }) : (
                  // Show placeholder bars when no data
                  Array.from({ length: 7 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.chartBar,
                        {
                          height: 10,
                          backgroundColor: '#e5e7eb',
                          opacity: 0.5,
                        }
                      ]}
                    />
                  ))
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Show selected patient info */}
        {selectedPatientForMonitoring && patients.length > 0 && (
          <View style={styles.selectedPatientInfo}>
            <Text style={styles.selectedPatientTitle}>
              Monitoring: {patients.find(p => p.id === selectedPatientForMonitoring)?.name || 'Unknown Patient'}
            </Text>
            <Text style={styles.selectedPatientSubtitle}>
              Status: {patients.find(p => p.id === selectedPatientForMonitoring)?.priority || 'Unknown'} • 
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monitoringControls: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monitoringTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  monitoringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  monitoringToggleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  patientSelectorContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  patientSelectorCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  selectedPatientCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  selectorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 3,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 3,
  },
  selectorPriority: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vitalsContainer: {
    flex: 1,
  },
  vitalsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: (width - 50) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vitalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vitalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vitalStatus: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  vitalStatusText: {
    fontSize: 7,
    fontWeight: '700',
  },
  vitalCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 2,
  },
  vitalCardUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  vitalCardLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 25,
    gap: 1,
  },
  chartBar: {
    flex: 1,
    borderRadius: 1,
  },
  selectedPatientInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPatientTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedPatientSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});