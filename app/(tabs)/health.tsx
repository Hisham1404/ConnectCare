import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Heart, Activity, Thermometer, Droplets, Weight, Ruler, TrendingUp, TrendingDown, Calendar, Clock, Plus, ChartBar as BarChart3, ChartLine as LineChart, Target, Award, Zap } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import MetricCard from '@/components/health/MetricCard';
import GoalCard from '@/components/health/GoalCard';

const { width } = Dimensions.get('window');

// Define types for our data
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

export default function HealthScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  // Fetch health metrics from database
  const fetchHealthMetrics = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health metrics:', err);
      setError('Failed to load health metrics');
      return [];
    }
  };

  // Fetch health goals from database
  const fetchHealthGoals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching health goals:', err);
      setError('Failed to load health goals');
      return [];
    }
  };

  // Load data when user is available
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        const [metricsData, goalsData] = await Promise.all([
          fetchHealthMetrics(user.id),
          fetchHealthGoals(user.id)
        ]);
        
        setHealthMetrics(metricsData);
        setHealthGoals(goalsData);
      } catch (err) {
        console.error('Error loading health data:', err);
        setError('Failed to load health data');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const periods = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: '3months', label: '3 Months' },
  ];

  const onRefresh = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      const [metricsData, goalsData] = await Promise.all([
        fetchHealthMetrics(user.id),
        fetchHealthGoals(user.id)
      ]);
      
      setHealthMetrics(metricsData);
      setHealthGoals(goalsData);
    } catch (err) {
      console.error('Error refreshing health data:', err);
      setError('Failed to refresh health data');
    } finally {
      setRefreshing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      case 'stable': return BarChart3;
      default: return BarChart3;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return Colors.success;
      case 'declining': return Colors.error;
      case 'stable': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return Colors.success;
      case 'warning': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'heart rate': return Heart;
      case 'blood pressure': return Activity;
      case 'temperature': return Thermometer;
      case 'oxygen level': return Droplets;
      case 'weight': return Weight;
      default: return Activity;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'heart rate': return Colors.heartRate;
      case 'blood pressure': return Colors.bloodPressure;
      case 'temperature': return Colors.temperature;
      case 'oxygen level': return Colors.oxygen;
      case 'weight': return Colors.accent;
      default: return Colors.accent;
    }
  };

  const renderMiniChart = (readings: number[], color: string) => {
    const maxValue = Math.max(...readings);
    const minValue = Math.min(...readings);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.miniChart}>
        {readings.map((value, index) => {
          const height = ((value - minValue) / range) * 40 + 8;
          return (
            <View
              key={index}
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor: color,
                  opacity: index === readings.length - 1 ? 1 : 0.6,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Transform database metrics to match the expected format
  const transformedMetrics = healthMetrics.map(metric => ({
    id: metric.id,
    label: metric.type,
    value: metric.value,
    unit: metric.unit,
    icon: getMetricIcon(metric.type),
    color: getMetricColor(metric.type),
    trend: 'stable', // Default trend - you can enhance this later
    change: '0%', // Default change - you can enhance this later
    normal: 'Normal', // Default normal range - you can enhance this later
    lastReading: new Date(metric.created_at).toLocaleString(),
    readings: [70, 72, 75, 73, 71, 74, parseInt(metric.value) || 0], // Mock readings for chart
  }));

  // Transform database goals to match the expected format
  const transformedGoals = healthGoals.map(goal => ({
    id: goal.id,
    title: goal.title,
    current: goal.status === 'completed' ? 100 : 75, // Mock progress
    target: 100,
    unit: 'progress',
    progress: goal.status === 'completed' ? 100 : 75,
    icon: Target,
    color: goal.status === 'completed' ? Colors.success : Colors.accent,
    description: goal.description,
    status: goal.status,
  }));

  // NAVIGATION GUARD: Only patients who are signed in
  if (!authLoading && !user) {
    return <Redirect href="/(auth)/signin" />;
  }

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Tracking</Text>
        <FeedbackButton
          onPress={() => console.log('Add health data')}
          style={styles.addButton}
        >
          <Plus color={Colors.accent} size={20} />
        </FeedbackButton>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <FeedbackButton onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </FeedbackButton>
        </View>
      )}

      {/* Enhanced Period Selector - Segmented Control */}
      <View style={styles.periodSelectorContainer}>
        <Text style={styles.periodSelectorTitle}>Time Period</Text>
        <View style={styles.segmentedControl}>
          {periods.map((period) => (
            <FeedbackButton
              key={period.key}
              onPress={() => setSelectedPeriod(period.key)}
              style={[
                styles.segmentButton,
                selectedPeriod === period.key && styles.activeSegmentButton
              ]}
            >
              <Text style={[
                styles.segmentText,
                selectedPeriod === period.key && styles.activeSegmentText
              ]}>
                {period.label}
              </Text>
            </FeedbackButton>
          ))}
        </View>
      </View>

      {/* Enhanced Health Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        
        <View style={styles.metricsGrid}>
          {isLoadingData ? (
            <>
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
              <SkeletonLoader width={(width - 56) / 2} height={200} borderRadius={20} />
            </>
          ) : transformedMetrics.length > 0 ? (
            transformedMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                renderMiniChart={renderMiniChart}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No health metrics found</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your health by adding some metrics</Text>
            </View>
          )}
        </View>
      </View>

      {/* Health Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <FeedbackButton onPress={() => console.log('View all goals')}>
            <Text style={styles.seeAll}>View All</Text>
          </FeedbackButton>
        </View>
        
        <View style={styles.goalsGrid}>
          {isLoadingData ? (
            <>
              <SkeletonLoader width={(width - 52) / 2} height={120} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={120} borderRadius={16} />
            </>
          ) : transformedGoals.length > 0 ? (
            transformedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No health goals found</Text>
              <Text style={styles.emptyStateSubtext}>Set some health goals to track your progress</Text>
            </View>
          )}
        </View>
      </View>

      {/* Recent Readings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>
          <FeedbackButton onPress={() => console.log('View trends')}>
            <LineChart color={Colors.accent} size={20} />
          </FeedbackButton>
        </View>
        
        {isLoadingData ? (
          <>
            <SkeletonLoader width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={80} borderRadius={16} />
          </>
        ) : healthMetrics.length > 0 ? (
          healthMetrics.slice(0, 4).map((reading) => (
            <FeedbackButton
              key={reading.id}
              onPress={() => console.log('Reading pressed:', reading.type)}
              style={styles.readingCard}
            >
              <View style={styles.readingInfo}>
                <Text style={styles.readingType}>{reading.type}</Text>
                <Text style={styles.readingValue}>{reading.value} {reading.unit}</Text>
                <Text style={styles.readingTime}>{new Date(reading.created_at).toLocaleString()}</Text>
              </View>
              
              <View style={[
                styles.readingStatus,
                { backgroundColor: `${Colors.success}${Colors.opacity.light}` }
              ]}>
                <Text style={[
                  styles.readingStatusText,
                  { color: Colors.success }
                ]}>
                  NORMAL
                </Text>
              </View>
            </FeedbackButton>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent readings</Text>
            <Text style={styles.emptyStateSubtext}>Your health readings will appear here</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <FeedbackButton
            onPress={() => console.log('Log vitals')}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.heartRate}${Colors.opacity.light}` }]}>
              <Heart color={Colors.heartRate} size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Log Vitals</Text>
          </FeedbackButton>
          
          <FeedbackButton
            onPress={() => console.log('Record exercise')}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.accent}${Colors.opacity.light}` }]}>
              <Activity color={Colors.accent} size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Record Exercise</Text>
          </FeedbackButton>
          
          <FeedbackButton
            onPress={() => console.log('View trends')}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.success}${Colors.opacity.light}` }]}>
              <Award color={Colors.success} size={20} />
            </View>
            <Text style={styles.quickActionTitle}>View Trends</Text>
          </FeedbackButton>
          
          <FeedbackButton
            onPress={() => console.log('Set reminders')}
            style={styles.quickActionCard}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: `${Colors.warning}${Colors.opacity.light}` }]}>
              <Calendar color={Colors.warning} size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Set Reminders</Text>
          </FeedbackButton>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    margin: 20,
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
  },
  retryButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelectorContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  periodSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSegmentButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeSegmentText: {
    color: Colors.surface,
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
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enhancedMetricCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '700',
  },
  enhancedMetricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  enhancedMetricUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricNormal: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  enhancedChartContainer: {
    marginBottom: 12,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 48,
    gap: 2,
    justifyContent: 'space-between',
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 8,
  },
  metricLastReading: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
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
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalCurrent: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  goalTarget: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 3,
    marginTop: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  readingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  readingInfo: {
    flex: 1,
  },
  readingType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  readingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readingStatusText: {
    fontSize: 10,
    fontWeight: '700',
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