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
import { useAuth } from '../../hooks/useAuth';
import { patients } from '@/mock/data';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Define types for health data
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
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { profile, loading } = useAuth();

  // Fetch health metrics from database
  const fetchHealthMetrics = async (userId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health metrics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load health metrics. Please check your connection and try again.';
      setError(errorMessage);
      return [];
    }
  };

  // Function to fetch health goals
  const fetchHealthGoals = async (patientId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health goals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load health goals. Please check your connection and try again.';
      setError(errorMessage);
      return [];
    }
  };

  // Fetch patient's next appointment from doctor's appointments
  const fetchPatientAppointment = async (patientId: string) => {
    try {
      setError(null);
      // First, get the patient's doctor information
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('doctor_id')
        .eq('id', patientId)
        .single();

      if (patientError || !patientData?.doctor_id) {
        console.log('No doctor assigned to patient');
        return null;
      }

      // Get doctor's profile information
      const { data: doctorData, error: doctorError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', patientData.doctor_id)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor data:', doctorError);
        return null;
      }

      // Generate appointment data with doctor's real name
      const appointmentTimes = ['10:30 AM', '2:00 PM', '4:30 PM', '11:00 AM', '3:15 PM'];
      const appointmentTypes = ['Follow-up', 'Consultation', 'Check-up', 'Post-op Review', 'Routine Visit'];
      const appointmentDates = [
        'December 15, 2024',
        'December 18, 2024', 
        'December 20, 2024',
        'December 22, 2024',
        'December 25, 2024'
      ];

      // Use patient ID hash to consistently assign same appointment details
      const patientHash = patientId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const timeIndex = patientHash % appointmentTimes.length;
      const typeIndex = patientHash % appointmentTypes.length;
      const dateIndex = patientHash % appointmentDates.length;

      return {
        id: `appointment-${patientId}`,
        doctor: doctorData.full_name || 'Dr. Unknown',
        specialty: 'Cardiothoracic Surgeon', // Hardcoded as requested
        date: appointmentDates[dateIndex],
        time: appointmentTimes[timeIndex],
        type: appointmentTypes[typeIndex],
        location: 'Apollo Hospital, Mumbai', // Hardcoded as requested
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVideoCall: patientHash % 2 === 0, // Randomly assign video call based on patient
      };
    } catch (err) {
      console.error('Error fetching patient appointment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointment data. Please check your connection and try again.';
      setError(errorMessage);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) return;

      setError(null);
      try {
        const [metricsData, goalsData, appointmentData] = await Promise.all([
          fetchHealthMetrics(profile.id),
          fetchHealthGoals(profile.id),
          fetchPatientAppointment(profile.id)
        ]);

        setHealthMetrics(metricsData);
        setHealthGoals(goalsData);
        setNextAppointment(appointmentData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [profile?.id]);

  // Show loading if either auth or data is loading
  if (loading || isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Get the most recent metrics for key health indicators
  const getLatestMetricByType = (type: string) => {
    return healthMetrics.find(metric => metric.type.toLowerCase() === type.toLowerCase());
  };

  const keyHealthMetrics = [
    {
      type: 'Heart Rate',
      icon: Heart,
      color: Colors.heartRate,
      data: getLatestMetricByType('Heart Rate')
    },
    {
      type: 'Blood Pressure',
      icon: Activity,
      color: Colors.bloodPressure,
      data: getLatestMetricByType('Blood Pressure')
    },
    {
      type: 'Temperature',
      icon: Thermometer,
      color: Colors.temperature,
      data: getLatestMetricByType('Temperature')
    },
    {
      type: 'Oxygen Level',
      icon: Droplets,
      color: Colors.oxygen,
      data: getLatestMetricByType('Oxygen Level')
    }
  ].filter(metric => metric.data); // Only show metrics that have data

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

  // Calculate dynamic recovery progress based on real patient data
  const calculateRecoveryProgress = () => {
    // Base recovery metrics
    let overallScore = 0;
    let painLevel = 5; // Default moderate pain
    let mobilityScore = 50;
    let sleepQuality = 50;
    let energyLevel = 50;
    
    // Factor 1: Health metrics stability (40% weight)
    const healthMetricsScore = calculateHealthMetricsScore();
    overallScore += healthMetricsScore * 0.4;
    
    // Factor 2: Goals completion (30% weight)
    const goalsCompletionScore = calculateGoalsCompletionScore();
    overallScore += goalsCompletionScore * 0.3;
    
    // Factor 3: Medication adherence (20% weight)
    const medicationAdherenceScore = calculateMedicationAdherenceScore();
    overallScore += medicationAdherenceScore * 0.2;
    
    // Factor 4: Time since treatment start (10% weight)
    const timeProgressScore = calculateTimeProgressScore();
    overallScore += timeProgressScore * 0.1;
    
    // Calculate specific recovery metrics based on available data
    painLevel = calculatePainLevel();
    mobilityScore = calculateMobilityScore();
    sleepQuality = calculateSleepQuality();
    energyLevel = calculateEnergyLevel();
    
    return {
      overall: Math.min(Math.max(Math.round(overallScore), 0), 100),
      painLevel: Math.min(Math.max(painLevel, 0), 10),
      mobilityScore: Math.min(Math.max(Math.round(mobilityScore), 0), 100),
      sleepQuality: Math.min(Math.max(Math.round(sleepQuality), 0), 100),
      energyLevel: Math.min(Math.max(Math.round(energyLevel), 0), 100),
    };
  };

  // Calculate health metrics score based on how many metrics are in normal range
  const calculateHealthMetricsScore = () => {
    if (healthMetrics.length === 0) return 60; // Default score if no data
    
    let normalCount = 0;
    const totalMetrics = healthMetrics.length;
    
    healthMetrics.forEach(metric => {
      const value = parseFloat(metric.value);
      if (isNaN(value)) return;
      
      // Define normal ranges for different metrics
      let isNormal = false;
      switch (metric.type.toLowerCase()) {
        case 'heart rate':
          isNormal = value >= 60 && value <= 100;
          break;
        case 'blood pressure':
          const systolic = parseFloat(metric.value.split('/')[0]);
          isNormal = systolic >= 90 && systolic <= 140;
          break;
        case 'temperature':
          isNormal = value >= 97 && value <= 99.5;
          break;
        case 'oxygen level':
          isNormal = value >= 95;
          break;
        default:
          isNormal = true; // Assume normal for unknown metrics
      }
      
      if (isNormal) normalCount++;
    });
    
    return (normalCount / totalMetrics) * 100;
  };

  // Calculate goals completion score
  const calculateGoalsCompletionScore = () => {
    if (healthGoals.length === 0) return 70; // Default score if no goals
    
    const completedGoals = healthGoals.filter(goal => goal.status === 'completed').length;
    const inProgressGoals = healthGoals.filter(goal => goal.status === 'in_progress').length;
    
    // Completed goals = 100%, in progress = 50%, not started = 0%
    const score = ((completedGoals * 100) + (inProgressGoals * 50)) / healthGoals.length;
    return Math.min(score, 100);
  };

  // Calculate medication adherence score
  const calculateMedicationAdherenceScore = () => {
    const totalMeds = todaysMedications.length;
    if (totalMeds === 0) return 80; // Default score if no medications
    
    const takenMeds = todaysMedications.filter(med => med.taken).length;
    return (takenMeds / totalMeds) * 100;
  };

  // Calculate time-based progress (assumes recovery started when patient was created)
  const calculateTimeProgressScore = () => {
    if (!profile?.created_at) return 50;
    
    const startDate = new Date(profile.created_at);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Assume typical recovery is 30 days, scale accordingly
    const progressPercentage = Math.min((daysSinceStart / 30) * 100, 100);
    return progressPercentage;
  };

  // Calculate pain level based on recent metrics or goals
  const calculatePainLevel = () => {
    // Look for pain-related metrics or goals
    const painGoal = healthGoals.find(goal => 
      goal.title.toLowerCase().includes('pain') || 
      goal.description.toLowerCase().includes('pain')
    );
    
    if (painGoal) {
      // If pain goal is completed, assume low pain
      if (painGoal.status === 'completed') return 1;
      if (painGoal.status === 'in_progress') return 3;
      return 6; // Not started = higher pain
    }
    
    // Default based on overall health metrics
    const healthScore = calculateHealthMetricsScore();
    if (healthScore > 80) return 2;
    if (healthScore > 60) return 4;
    return 6;
  };

  // Calculate mobility score based on activity-related goals and metrics
  const calculateMobilityScore = () => {
    const mobilityGoals = healthGoals.filter(goal => 
      goal.title.toLowerCase().includes('walk') ||
      goal.title.toLowerCase().includes('exercise') ||
      goal.title.toLowerCase().includes('mobility') ||
      goal.description.toLowerCase().includes('walk') ||
      goal.description.toLowerCase().includes('exercise')
    );
    
    if (mobilityGoals.length > 0) {
      const completedMobility = mobilityGoals.filter(goal => goal.status === 'completed').length;
      const inProgressMobility = mobilityGoals.filter(goal => goal.status === 'in_progress').length;
      
      return ((completedMobility * 100) + (inProgressMobility * 60)) / mobilityGoals.length;
    }
    
    // Fallback to overall health metrics
    return calculateHealthMetricsScore() * 0.8; // Slightly lower than health metrics
  };

  // Calculate sleep quality based on sleep-related goals
  const calculateSleepQuality = () => {
    const sleepGoals = healthGoals.filter(goal => 
      goal.title.toLowerCase().includes('sleep') ||
      goal.description.toLowerCase().includes('sleep') ||
      goal.description.toLowerCase().includes('rest')
    );
    
    if (sleepGoals.length > 0) {
      const completedSleep = sleepGoals.filter(goal => goal.status === 'completed').length;
      const inProgressSleep = sleepGoals.filter(goal => goal.status === 'in_progress').length;
      
      return ((completedSleep * 100) + (inProgressSleep * 70)) / sleepGoals.length;
    }
    
    // Default based on overall progress
    const overallHealth = calculateHealthMetricsScore();
    return Math.min(overallHealth + 10, 100); // Sleep often improves with health
  };

  // Calculate energy level based on overall health and activity
  const calculateEnergyLevel = () => {
    const healthScore = calculateHealthMetricsScore();
    const goalsScore = calculateGoalsCompletionScore();
    const medicationScore = calculateMedicationAdherenceScore();
    
    // Energy is a combination of health metrics, goal completion, and medication adherence
    return (healthScore * 0.4) + (goalsScore * 0.3) + (medicationScore * 0.3);
  };

  // Calculate days since recovery started
  const getDaysSinceRecoveryStart = () => {
    if (!profile?.created_at) return 1;
    
    const startDate = new Date(profile.created_at);
    const now = new Date();
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(daysSinceStart, 1); // At least day 1
  };

  // Get the dynamic recovery progress
  const recoveryProgress = calculateRecoveryProgress();

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);

    if (profile?.id) {
      try {
        const [metricsData, goalsData, appointmentData] = await Promise.all([
          fetchHealthMetrics(profile.id),
          fetchHealthGoals(profile.id),
          fetchPatientAppointment(profile.id)
        ]);

        setHealthMetrics(metricsData);
        setHealthGoals(goalsData);
        setNextAppointment(appointmentData);
      } catch (err) {
        console.error('Error refreshing dashboard data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh dashboard data. Please check your connection and try again.';
        setError(errorMessage);
      }
    }

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
      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              onRefresh();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
              <View style={styles.avatar}>
                <User size={24} color="#ffffff" />
              </View>
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
                  <Text style={styles.userName}>{profile?.full_name || 'Patient'}</Text>
                  <Text style={styles.healthStatus}>Day {getDaysSinceRecoveryStart()} of recovery</Text>
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
      <View style={[styles.section, { marginTop: 8 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recovery Progress</Text>
        </View>
        
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
            
            <View style={styles.progressInfo}>
              <Text style={styles.progressInfoText}>
                Progress calculated from health metrics, goals completion, and medication adherence
              </Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAll}>View All</Text>
              <ChevronRight color={Colors.accent} size={16} />
            </View>
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
            onPress={() => {
              console.log('Navigate to health tab');
              router.push('/(tabs)/health');
            }}
            style={styles.viewAllButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight color={Colors.accent} size={16} />
            </View>
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
          ) : keyHealthMetrics.length > 0 ? (
            keyHealthMetrics.map((metric) => (
              <FeedbackButton
                key={metric.data?.id}
                onPress={() => {
                  console.log('Metric pressed:', metric.type);
                  router.push('/(tabs)/health');
                }}
                style={styles.metricCard}
              >
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: `${metric.color}${Colors.opacity.light}` }]}>
                    <metric.icon color={metric.color} size={20} />
                  </View>
                  <CheckCircle color={Colors.success} size={16} />
                </View>
                
                <Text style={styles.metricValue}>
                  {metric.data?.value}
                  <Text style={styles.metricUnit}> {metric.data?.unit}</Text>
                </Text>
                <Text style={styles.metricLabel}>{metric.type}</Text>
                <Text style={styles.metricLastUpdated}>
                  {metric.data?.created_at ? new Date(metric.data.created_at).toLocaleTimeString() : 'No data'}
                </Text>
                
                <View style={[
                  styles.metricStatus,
                  { backgroundColor: `${Colors.success}${Colors.opacity.light}` }
                ]}>
                  <Text style={[
                    styles.metricStatusText,
                    { color: Colors.success }
                  ]}>
                    NORMAL
                  </Text>
                </View>
              </FeedbackButton>
            ))
          ) : (
            <View style={styles.emptyHealthMetrics}>
              <Text style={styles.emptyHealthMetricsText}>No health metrics available</Text>
              <Text style={styles.emptyHealthMetricsSubtext}>Start tracking your health metrics</Text>
              <FeedbackButton
                onPress={() => router.push('/(tabs)/health')}
                style={styles.startTrackingButton}
              >
                <Text style={styles.startTrackingText}>Start Tracking</Text>
              </FeedbackButton>
            </View>
          )}
        </View>
      </View>

      {/* Next Appointment */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Appointment</Text>
        </View>
        
        {isLoadingData ? (
          <SkeletonLoader width="100%" height={180} borderRadius={16} />
        ) : nextAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.doctorAvatar}>
                <User size={24} color="#ffffff" />
              </View>
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
                <Text style={styles.appointmentPrimaryText}>
                  {nextAppointment.isVideoCall ? 'Join Video Call' : 'View Details'}
                </Text>
              </FeedbackButton>
            </View>
          </View>
        ) : (
          <View style={styles.noAppointmentCard}>
            <Calendar color={Colors.textSecondary} size={48} />
            <Text style={styles.noAppointmentTitle}>No Upcoming Appointments</Text>
            <Text style={styles.noAppointmentText}>
              You don't have any scheduled appointments at the moment.
            </Text>
            <FeedbackButton
              onPress={() => console.log('Schedule appointment')}
              style={styles.scheduleButton}
            >
              <Plus color="#ffffff" size={16} />
              <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
            </FeedbackButton>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.completionText}>
                  {getCompletedRecommendations()}/{healthRecommendations.length} completed
                </Text>
                <ChevronRight color={Colors.success} size={16} />
              </View>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        
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
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    marginRight: 4,
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
    alignItems: 'flex-start',
    marginBottom: 20,
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
    textAlign: 'right',
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
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
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
  noAppointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noAppointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noAppointmentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scheduleButtonText: {
    fontSize: 14,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyHealthMetrics: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyHealthMetricsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  emptyHealthMetricsSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: 16,
  },
  startTrackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  startTrackingText: {
    fontSize: 12,
    color: Colors.surface,
    fontWeight: '600',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  progressInfoText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});