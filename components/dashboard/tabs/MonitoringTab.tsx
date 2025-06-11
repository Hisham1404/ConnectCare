import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Image, RefreshControl, Dimensions } from 'react-native';
import { Play, Pause, Heart, Activity, Target, Monitor } from 'lucide-react-native';

const { width } = Dimensions.get('window');

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'stable': return '#10b981';
      default: return '#6b7280';
    }
  };

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
              <Pause color="#ffffff\" size={14} />
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
              <Image source={{ uri: patient.avatar }} style={styles.selectorAvatar} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.vitalsTitle}>Real-time Vitals</Text>
        
        <View style={styles.vitalsGrid}>
          {[
            { label: 'Heart Rate', value: '72', unit: 'BPM', icon: Heart, color: '#ef4444', trend: [68, 70, 72, 75, 73, 71, 72] },
            { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, color: '#3b82f6', trend: [130, 128, 125, 122, 120, 118, 120] },
            { label: 'Temperature', value: '98.6', unit: '°F', icon: Target, color: '#f59e0b', trend: [98.4, 98.6, 98.8, 98.7, 98.6, 98.5, 98.6] },
            { label: 'Oxygen Sat', value: '98', unit: '%', icon: Monitor, color: '#10b981', trend: [97, 98, 97, 98, 99, 98, 98] },
          ].map((vital, index) => (
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
                {vital.trend.map((value, i) => {
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
                })}
              </View>
            </View>
          ))}
        </View>
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
});