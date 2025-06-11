import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Pill, Heart, Activity, Calendar, Clock, User, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Apple, Dumbbell, Thermometer, Droplets, Zap, Target, Award, Bell, Phone, Video, MessageSquare, Plus } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Colors, SemanticColors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function PatientDashboard() {
  const { profile, switchToDoctorMode } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock patient data
  const todaysMedications = [
    {
      id: '1',
      name: 'Metoprolol',
      dosage: '50mg',
      time: '08:00 AM',
      taken: true,
      type: 'Heart medication',
      nextDose: '8:00 PM',
    },
    {
      id: '2',
      name: 'Aspirin',
      dosage: '81mg',
      time: '12:00 PM',
      taken: false,
      type: 'Blood thinner',
      nextDose: 'Now',
    },
    {
      id: '3',
      name: 'Atorvastatin',
      dosage: '20mg',
      time: '08:00 PM',
      taken: false,
      type: 'Cholesterol medication',
      nextDose: '8:00 PM',
    },
  ];

  const healthMetrics = [
    {
      id: '1',
      label: 'Heart Rate',
      value: '72',
      unit: 'BPM',
      icon: Heart,
      color: Colors.heartRate,
      status: 'normal',
      trend: 'stable',
      lastUpdated: '2 min ago',
    },
    {
      id: '2',
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      icon: Activity,
      color: Colors.bloodPressure,
      status: 'normal',
      trend: 'improving',
      lastUpdated: '1 hour ago',
    },
    {
      id: '3',
      label: 'Temperature',
      value: '98.6',
      unit: '°F',
      icon: Thermometer,
      color: Colors.temperature,
      status: 'normal',
      trend: 'stable',
      lastUpdated: '3 hours ago',
    },
    {
      id: '4',
      label: 'Oxygen Level',
      value: '98',
      unit: '%',
      icon: Droplets,
      color: Colors.oxygen,
      status: 'excellent',
      trend: 'stable',
      lastUpdated: '1 hour ago',
    },
  ];

  const nextAppointment = {
    doctor: 'Dr. Rajesh Kumar',
    specialty: 'Cardiothoracic Surgeon',
    date: 'December 15, 2024',
    time: '10:30 AM',
    type: 'Follow-up Consultation',
    location: 'Apollo Hospital, Mumbai',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    isVideoCall: true,
  };

  const healthRecommendations = [
    {
      id: '1',
      category: 'Exercise',
      title: 'Daily Walking Routine',
      description: 'Take a 20-minute walk after breakfast to improve cardiovascular health.',
      icon: Dumbbell,
      color: Colors.accent,
      completed: false,
      progress: 85,
    },
    {
      id: '2',
      category: 'Diet',
      title: 'Heart-Healthy Breakfast',
      description: 'Include oatmeal with berries and nuts for omega-3 fatty acids.',
      icon: Apple,
      color: Colors.success,
      completed: true,
      progress: 100,
    },
    {
      id: '3',
      category: 'Wellness',
      title: 'Stress Management',
      description: 'Practice 10 minutes of deep breathing exercises before bed.',
      icon: Target,
      color: Colors.accent,
      completed: false,
      progress: 60,
    },
    {
      id: '4',
      category: 'Monitoring',
      title: 'Blood Pressure Check',
      description: 'Record your blood pressure twice daily as prescribed.',
      icon: Activity,
      color: Colors.heartRate,
      completed: true,
      progress: 100,
    },
  ];

  const recoveryProgress = {
    overall: 85,
    painLevel: 3,
    mobilityScore: 78,
    sleepQuality: 82,
    energyLevel: 75,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return Colors.success;
      case 'normal': return Colors.accent;
      case 'warning': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'stable': return CheckCircle;
      case 'declining': return AlertCircle;
      default: return CheckCircle;
    }
  };

  const getPendingMedications = () => {
    return todaysMedications.filter(med => !med.taken);
  };

  const getCompletedRecommendations = () => {
    return healthRecommendations.filter(rec => rec.completed).length;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: profile?.avatar_url }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>{profile?.full_name}</Text>
            <Text style={styles.healthStatus}>Day 12 of recovery</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell color={Colors.textSecondary} size={24} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{getPendingMedications().length}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.switchModeButton}
            onPress={switchToDoctorMode}
          >
            <User color={Colors.accent} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recovery Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery Progress</Text>
        
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Recovery</Text>
            <Text style={styles.progressPercentage}>{recoveryProgress.overall}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${recoveryProgress.overall}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.progressMetrics}>
            <View style={styles.progressMetric}>
              <Text style={styles.progressMetricLabel}>Pain Level</Text>
              <Text style={styles.progressMetricValue}>{recoveryProgress.painLevel}/10</Text>
            </View>
            <View style={styles.progressMetric}>
              <Text style={styles.progressMetricLabel}>Mobility</Text>
              <Text style={styles.progressMetricValue}>{recoveryProgress.mobilityScore}%</Text>
            </View>
            <View style={styles.progressMetric}>
              <Text style={styles.progressMetricLabel}>Sleep</Text>
              <Text style={styles.progressMetricValue}>{recoveryProgress.sleepQuality}%</Text>
            </View>
            <View style={styles.progressMetric}>
              <Text style={styles.progressMetricLabel}>Energy</Text>
              <Text style={styles.progressMetricValue}>{recoveryProgress.energyLevel}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Today's Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {todaysMedications.map((medication) => (
          <View key={medication.id} style={styles.medicationCard}>
            <View style={styles.medicationLeft}>
              <View style={[
                styles.medicationIcon,
                { backgroundColor: medication.taken ? `${Colors.success}${Colors.opacity.light}` : `${Colors.warning}${Colors.opacity.light}` }
              ]}>
                <Pill color={medication.taken ? Colors.success : Colors.warning} size={20} />
              </View>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationType}>{medication.type}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage} • {medication.time}</Text>
                {!medication.taken && (
                  <Text style={styles.nextDose}>Next: {medication.nextDose}</Text>
                )}
              </View>
            </View>
            
            <TouchableOpacity style={[
              styles.medicationStatus,
              { backgroundColor: medication.taken ? Colors.success : Colors.warning }
            ]}>
              {medication.taken ? (
                <CheckCircle color="#ffffff\" size={16} />
              ) : (
                <Clock color="#ffffff" size={16} />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Health Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Health Metrics</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus color={Colors.accent} size={16} />
            <Text style={styles.addButtonText}>Log</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => {
            const TrendIcon = getTrendIcon(metric.trend);
            return (
              <View key={metric.id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: `${metric.color}${Colors.opacity.light}` }]}>
                    <metric.icon color={metric.color} size={20} />
                  </View>
                  <TrendIcon color={getStatusColor(metric.status)} size={16} />
                </View>
                
                <Text style={styles.metricValue}>
                  {metric.value}
                  <Text style={styles.metricUnit}> {metric.unit}</Text>
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricLastUpdated}>{metric.lastUpdated}</Text>
                
                <View style={[
                  styles.metricStatus,
                  { backgroundColor: `${getStatusColor(metric.status)}${Colors.opacity.light}` }
                ]}>
                  <Text style={[
                    styles.metricStatusText,
                    { color: getStatusColor(metric.status) }
                  ]}>
                    {metric.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Next Appointment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Image source={{ uri: nextAppointment.avatar }} style={styles.doctorAvatar} />
            <View style={styles.appointmentInfo}>
              <Text style={styles.doctorName}>{nextAppointment.doctor}</Text>
              <Text style={styles.doctorSpecialty}>{nextAppointment.specialty}</Text>
              <Text style={styles.appointmentType}>{nextAppointment.type}</Text>
            </View>
            <View style={styles.appointmentBadge}>
              {nextAppointment.isVideoCall ? (
                <Video color={Colors.accent} size={16} />
              ) : (
                <Calendar color={Colors.accent} size={16} />
              )}
            </View>
          </View>
          
          <View style={styles.appointmentDetails}>
            <View style={styles.appointmentDetailItem}>
              <Calendar color={Colors.textSecondary} size={16} />
              <Text style={styles.appointmentDetailText}>{nextAppointment.date}</Text>
            </View>
            <View style={styles.appointmentDetailItem}>
              <Clock color={Colors.textSecondary} size={16} />
              <Text style={styles.appointmentDetailText}>{nextAppointment.time}</Text>
            </View>
          </View>
          
          <View style={styles.appointmentActions}>
            <TouchableOpacity style={styles.appointmentSecondaryButton}>
              <Phone color={Colors.textSecondary} size={16} />
              <Text style={styles.appointmentSecondaryText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.appointmentSecondaryButton}>
              <MessageSquare color={Colors.textSecondary} size={16} />
              <Text style={styles.appointmentSecondaryText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.appointmentPrimaryButton}>
              <Video color="#ffffff" size={16} />
              <Text style={styles.appointmentPrimaryText}>Join Video Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Health Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Health Plan</Text>
          <Text style={styles.completionText}>
            {getCompletedRecommendations()}/{healthRecommendations.length} completed
          </Text>
        </View>
        
        {healthRecommendations.map((recommendation) => (
          <View key={recommendation.id} style={styles.recommendationCard}>
            <View style={styles.recommendationLeft}>
              <View style={[
                styles.recommendationIcon,
                { backgroundColor: `${recommendation.color}${Colors.opacity.light}` }
              ]}>
                <recommendation.icon color={recommendation.color} size={20} />
              </View>
              <View style={styles.recommendationInfo}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationCategory}>{recommendation.category}</Text>
                  {recommendation.completed && (
                    <View style={styles.completedBadge}>
                      <CheckCircle color={Colors.success} size={12} />
                    </View>
                  )}
                </View>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
                
                <View style={styles.recommendationProgress}>
                  <View style={styles.recommendationProgressBar}>
                    <View 
                      style={[
                        styles.recommendationProgressFill,
                        { 
                          width: `${recommendation.progress}%`,
                          backgroundColor: recommendation.color 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.recommendationProgressText}>{recommendation.progress}%</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={[
              styles.recommendationAction,
              recommendation.completed && styles.recommendationCompleted
            ]}>
              {recommendation.completed ? (
                <CheckCircle color={Colors.success} size={20} />
              ) : (
                <Target color={Colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.error}${Colors.opacity.light}` }]}>
              <Zap color={Colors.error} size={24} />
            </View>
            <Text style={styles.quickActionTitle}>Emergency Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.accent}${Colors.opacity.light}` }]}>
              <Activity color={Colors.accent} size={24} />
            </View>
            <Text style={styles.quickActionTitle}>Log Symptoms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.success}${Colors.opacity.light}` }]}>
              <Award color={Colors.success} size={24} />
            </View>
            <Text style={styles.quickActionTitle}>Health Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.warning}${Colors.opacity.light}` }]}>
              <Calendar color={Colors.warning} size={24} />
            </View>
            <Text style={styles.quickActionTitle}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  healthStatus: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  switchModeButton: {
    padding: 8,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    borderRadius: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  completionText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.success,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMetric: {
    alignItems: 'center',
  },
  progressMetricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  medicationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  medicationType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  nextDose: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  medicationStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricLastUpdated: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  metricStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  metricStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.accent,
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  appointmentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  appointmentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  appointmentSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  appointmentSecondaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  appointmentPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 8,
  },
  appointmentPrimaryText: {
    fontSize: 12,
    color: Colors.surface,
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recommendationCategory: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${Colors.success}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  recommendationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 2,
  },
  recommendationProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recommendationProgressText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  recommendationAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationCompleted: {
    backgroundColor: `${Colors.success}${Colors.opacity.light}`,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});