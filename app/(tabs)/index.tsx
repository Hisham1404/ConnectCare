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
  FlatList,
  LogBox,
  Platform,
} from 'react-native';
import { Pill, Heart, Activity, Calendar, Clock, User, TrendingUp, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Apple, Dumbbell, Thermometer, Droplets, Zap, Target, Award, Bell, Phone, Video, MessageSquare, Plus, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, SemanticColors } from '../../constants/Colors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import FeedbackButton from '../../components/ui/FeedbackButton';
import { shadow, textShadow } from '@/utils/shadowStyle';

const { width } = Dimensions.get('window');

// Silence remaining deprecation warnings until all styles are migrated
if (Platform.OS === 'web') {
  LogBox.ignoreLogs([
    '"shadow*" style props are deprecated',
    '"textShadow*" style props are deprecated',
  ]);
}

export default function PatientDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Mock profile data
  const mockProfile = {
    id: 'demo-patient-id',
    email: 'patient@connectcare.ai',
    full_name: 'Rajesh Kumar',
    phone: '+91 98765 43220',
    role: 'patient',
    avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  };

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoadingData(false);
    };
    
    loadData();
  }, []);

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
    {
      id: '4',
      name: 'Lisinopril',
      dosage: '10mg',
      time: '06:00 AM',
      taken: true,
      type: 'Blood pressure',
      nextDose: 'Tomorrow 6:00 AM',
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
    {
      id: '5',
      category: 'Recovery',
      title: 'Wound Care',
      description: 'Clean and dress surgical site as instructed.',
      icon: Heart,
      color: Colors.primary,
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

  const renderMedicationCard = ({ item }: { item: any }) => (
    <FeedbackButton
      onPress={() => console.log('Medication card pressed:', item.name)}
      style={styles.medicationCarouselCard}
      scaleEffect={true}
    >
      <View style={styles.medicationCarouselHeader}>
        <View style={[
          styles.medicationCarouselIcon,
          { backgroundColor: item.taken ? `${Colors.success}${Colors.opacity.light}` : `${Colors.warning}${Colors.opacity.light}` }
        ]}>
          <Pill color={item.taken ? Colors.success : Colors.warning} size={18} />
        </View>
        <View style={[
          styles.medicationCarouselStatus,
          { backgroundColor: item.taken ? Colors.success : Colors.warning }
        ]}>
          {item.taken ? (
            <CheckCircle color="#ffffff" size={12} />
          ) : (
            <Clock color="#ffffff" size={12} />
          )}
        </View>
      </View>
      
      <Text style={styles.medicationCarouselName}>{item.name}</Text>
      <Text style={styles.medicationCarouselDosage}>{item.dosage}</Text>
      <Text style={styles.medicationCarouselTime}>{item.time}</Text>
      
      {!item.taken && (
        <Text style={styles.medicationCarouselNext}>Next: {item.nextDose}</Text>
      )}
    </FeedbackButton>
  );

  const renderRecommendationCard = ({ item }: { item: any }) => (
    <FeedbackButton
      onPress={() => console.log('Recommendation card pressed:', item.title)}
      style={styles.recommendationCarouselCard}
      scaleEffect={true}
    >
      <View style={styles.recommendationCarouselHeader}>
        <View style={[
          styles.recommendationCarouselIcon,
          { backgroundColor: `${item.color}${Colors.opacity.light}` }
        ]}>
          <item.icon color={item.color} size={16} />
        </View>
        {item.completed && (
          <View style={styles.recommendationCarouselBadge}>
            <CheckCircle color={Colors.success} size={10} />
          </View>
        )}
      </View>
      
      <Text style={styles.recommendationCarouselCategory}>{item.category}</Text>
      <Text style={styles.recommendationCarouselTitle}>{item.title}</Text>
      
      <View style={styles.recommendationCarouselProgress}>
        <View style={styles.recommendationCarouselProgressBar}>
          <View 
            style={[
              styles.recommendationCarouselProgressFill,
              { 
                width: `${item.progress}%`,
                backgroundColor: item.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.recommendationCarouselProgressText}>{item.progress}%</Text>
      </View>
    </FeedbackButton>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <FeedbackButton
          onPress={() => {
            console.log('Back button pressed - navigating to home');
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          style={styles.backButton}
        >
          <ArrowLeft color={Colors.textSecondary} size={24} />
        </FeedbackButton>
        
        <View style={styles.headerContentContainer}>
          <View style={styles.headerLeft}>
            {isLoadingData ? (
              <SkeletonLoader width={48} height={48} borderRadius={24} style={styles.avatar} />
            ) : (
              <Image 
                source={{ uri: mockProfile?.avatar_url }} 
                style={styles.avatar} 
              />
            )}
            <View>
              {isLoadingData ? (
                <>
                  <SkeletonLoader width={80} height={14} style={{ marginBottom: 4 }} />
                  <SkeletonLoader width={120} height={18} style={{ marginBottom: 4 }} />
                  <SkeletonLoader width={100} height={12} />
                </>
              ) : (
                <>
                  <Text style={styles.greeting}>Good Morning</Text>
                  <Text style={styles.userName}>{mockProfile?.full_name}</Text>
                  <Text style={styles.healthStatus}>Day 12 of recovery</Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <FeedbackButton
              onPress={() => console.log('Notifications pressed')}
              style={styles.notificationButton}
            >
              <Bell color={Colors.textSecondary} size={24} />
              {!isLoadingData && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{getPendingMedications().length}</Text>
                </View>
              )}
            </FeedbackButton>
          </View>
        </View>
      </View>

      {/* Recovery Progress Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recovery Progress</Text>
        
        {isLoadingData ? (
          <View style={styles.progressCard}>
            <SkeletonLoader width="100%" height={120} />
          </View>
        ) : (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Recovery</Text>
              <Text style={styles.progressPercentageEnhanced}>{recoveryProgress.overall}%</Text>
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
        )}
      </View>

      {/* Today's Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          <FeedbackButton
            onPress={() => console.log('View all medications')}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAll}>View All</Text>
            <ChevronRight color={Colors.accent} size={16} />
          </FeedbackButton>
        </View>

        {isLoadingData ? (
          <View style={styles.carouselContainer}>
            <SkeletonLoader width={140} height={120} borderRadius={12} style={{ marginRight: 12 }} />
            <SkeletonLoader width={140} height={120} borderRadius={12} style={{ marginRight: 12 }} />
            <SkeletonLoader width={140} height={120} borderRadius={12} />
          </View>
        ) : (
          <FlatList
            data={todaysMedications}
            renderItem={renderMedicationCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        )}
      </View>

      {/* Health Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Health Metrics</Text>
          <FeedbackButton
            onPress={() => console.log('Log health metrics')}
            style={styles.addButton}
          >
            <Plus color={Colors.accent} size={16} />
            <Text style={styles.addButtonText}>Log</Text>
          </FeedbackButton>
        </View>
        
        <View style={styles.metricsGrid}>
          {isLoadingData ? (
            <>
              <SkeletonLoader width={(width - 52) / 2} height={140} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={140} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={140} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={140} borderRadius={16} />
            </>
          ) : (
            healthMetrics.map((metric) => {
              const TrendIcon = getTrendIcon(metric.trend);
              return (
                <FeedbackButton
                  key={metric.id}
                  onPress={() => console.log('Metric pressed:', metric.label)}
                  style={styles.metricCard}
                >
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
                </FeedbackButton>
              );
            })
          )}
        </View>
      </View>

      {/* Next Appointment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        
        {isLoadingData ? (
          <SkeletonLoader width="100%" height={180} borderRadius={16} />
        ) : (
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
              <FeedbackButton
                onPress={() => console.log('Call doctor')}
                style={styles.appointmentSecondaryButton}
              >
                <Phone color={Colors.textSecondary} size={16} />
                <Text style={styles.appointmentSecondaryText}>Call</Text>
              </FeedbackButton>
              
              <FeedbackButton
                onPress={() => console.log('Message doctor')}
                style={styles.appointmentSecondaryButton}
              >
                <MessageSquare color={Colors.textSecondary} size={16} />
                <Text style={styles.appointmentSecondaryText}>Message</Text>
              </FeedbackButton>
              
              <FeedbackButton
                onPress={() => console.log('Join video call')}
                style={styles.appointmentPrimaryButton}
              >
                <Video color="#ffffff" size={16} />
                <Text style={styles.appointmentPrimaryText}>Join Video Call</Text>
              </FeedbackButton>
            </View>
          </View>
        )}
      </View>

      {/* Health Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Health Plan</Text>
          <View style={styles.completionContainer}>
            {isLoadingData ? (
              <SkeletonLoader width={80} height={16} />
            ) : (
              <>
                <Text style={styles.completionText}>
                  {getCompletedRecommendations()}/{healthRecommendations.length} completed
                </Text>
                <ChevronRight color={Colors.success} size={16} />
              </>
            )}
          </View>
        </View>
        
        {isLoadingData ? (
          <View style={styles.carouselContainer}>
            <SkeletonLoader width={160} height={140} borderRadius={12} style={{ marginRight: 12 }} />
            <SkeletonLoader width={160} height={140} borderRadius={12} style={{ marginRight: 12 }} />
            <SkeletonLoader width={160} height={140} borderRadius={12} />
          </View>
        ) : (
          <FlatList
            data={healthRecommendations}
            renderItem={renderRecommendationCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          {isLoadingData ? (
            <>
              <SkeletonLoader width={(width - 52) / 2} height={100} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={100} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={100} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={100} borderRadius={16} />
            </>
          ) : (
            <>
              <FeedbackButton
                onPress={() => console.log('Emergency call')}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.error}${Colors.opacity.light}` }]}>
                  <Zap color={Colors.error} size={24} />
                </View>
                <Text style={styles.quickActionTitle}>Emergency Call</Text>
              </FeedbackButton>
              
              <FeedbackButton
                onPress={() => console.log('Log symptoms')}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.accent}${Colors.opacity.light}` }]}>
                  <Activity color={Colors.accent} size={24} />
                </View>
                <Text style={styles.quickActionTitle}>Log Symptoms</Text>
              </FeedbackButton>
              
              <FeedbackButton
                onPress={() => console.log('Health goals')}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.success}${Colors.opacity.light}` }]}>
                  <Award color={Colors.success} size={24} />
                </View>
                <Text style={styles.quickActionTitle}>Health Goals</Text>
              </FeedbackButton>
              
              <FeedbackButton
                onPress={() => console.log('Schedule visit')}
                style={styles.quickActionCard}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.warning}${Colors.opacity.light}` }]}>
                  <Calendar color={Colors.warning} size={24} />
                </View>
                <Text style={styles.quickActionTitle}>Schedule Visit</Text>
              </FeedbackButton>
            </>
          )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    ...shadow(2),
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
  progressPercentageEnhanced: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    ...textShadow(`${Colors.primary}${Colors.opacity.light}`, 2),
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
    backgroundColor: Colors.primary,
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
  carouselContainer: {
    paddingLeft: 0,
    paddingRight: 20,
    flexDirection: 'row',
  },
  medicationCarouselCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    width: 140,
    ...shadow(2),
  },
  medicationCarouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationCarouselIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationCarouselStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationCarouselName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  medicationCarouselDosage: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  medicationCarouselTime: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
    marginBottom: 8,
  },
  medicationCarouselNext: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '600',
  },
  recommendationCarouselCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    width: 160,
    ...shadow(2),
  },
  recommendationCarouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationCarouselIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationCarouselBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: `${Colors.success}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationCarouselCategory: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recommendationCarouselTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 16,
  },
  recommendationCarouselProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationCarouselProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 2,
  },
  recommendationCarouselProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recommendationCarouselProgressText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 8,
  },
  appointmentPrimaryText: {
    fontSize: 12,
    color: Colors.surface,
    fontWeight: '600',
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