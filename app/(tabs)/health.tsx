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

const { width } = Dimensions.get('window');

export default function HealthScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsLoadingData(false);
    };
    
    loadData();
  }, []);

  const periods = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: '3months', label: '3 Months' },
  ];

  const healthMetrics = [
    {
      id: '1',
      label: 'Heart Rate',
      value: '72',
      unit: 'BPM',
      icon: Heart,
      color: Colors.heartRate,
      trend: 'stable',
      change: '+2%',
      normal: '60-100',
      lastReading: '2 min ago',
      readings: [68, 70, 72, 75, 73, 71, 72],
    },
    {
      id: '2',
      label: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      icon: Activity,
      color: Colors.bloodPressure,
      trend: 'improving',
      change: '-5%',
      normal: '120/80',
      lastReading: '1 hour ago',
      readings: [130, 128, 125, 122, 120, 118, 120],
    },
    {
      id: '3',
      label: 'Temperature',
      value: '98.6',
      unit: '°F',
      icon: Thermometer,
      color: Colors.temperature,
      trend: 'stable',
      change: '0%',
      normal: '98.6',
      lastReading: '3 hours ago',
      readings: [98.4, 98.6, 98.8, 98.7, 98.6, 98.5, 98.6],
    },
    {
      id: '4',
      label: 'Oxygen Level',
      value: '98',
      unit: '%',
      icon: Droplets,
      color: Colors.oxygen,
      trend: 'stable',
      change: '+1%',
      normal: '95-100',
      lastReading: '1 hour ago',
      readings: [97, 98, 97, 98, 99, 98, 98],
    },
    {
      id: '5',
      label: 'Weight',
      value: '78.5',
      unit: 'kg',
      icon: Weight,
      color: Colors.accent,
      trend: 'declining',
      change: '-2%',
      normal: '75-80',
      lastReading: '1 day ago',
      readings: [80, 79.5, 79, 78.8, 78.5, 78.3, 78.5],
    },
    {
      id: '6',
      label: 'Pain Level',
      value: '3',
      unit: '/10',
      icon: Zap,
      color: Colors.warning,
      trend: 'improving',
      change: '-40%',
      normal: '0-2',
      lastReading: '4 hours ago',
      readings: [8, 7, 6, 5, 4, 3, 3],
    },
  ];

  const healthGoals = [
    {
      id: '1',
      title: 'Daily Steps',
      current: 8500,
      target: 10000,
      unit: 'steps',
      progress: 85,
      icon: Target,
      color: Colors.accent,
    },
    {
      id: '2',
      title: 'Water Intake',
      current: 6,
      target: 8,
      unit: 'glasses',
      progress: 75,
      icon: Droplets,
      color: Colors.oxygen,
    },
    {
      id: '3',
      title: 'Sleep Duration',
      current: 7.5,
      target: 8,
      unit: 'hours',
      progress: 94,
      icon: Clock,
      color: Colors.accent,
    },
    {
      id: '4',
      title: 'Exercise Time',
      current: 25,
      target: 30,
      unit: 'minutes',
      progress: 83,
      icon: Activity,
      color: Colors.success,
    },
  ];

  const recentReadings = [
    {
      id: '1',
      type: 'Blood Pressure',
      value: '120/80 mmHg',
      time: '1 hour ago',
      status: 'normal',
    },
    {
      id: '2',
      type: 'Heart Rate',
      value: '72 BPM',
      time: '2 min ago',
      status: 'normal',
    },
    {
      id: '3',
      type: 'Temperature',
      value: '98.6°F',
      time: '3 hours ago',
      status: 'normal',
    },
    {
      id: '4',
      type: 'Weight',
      value: '78.5 kg',
      time: '1 day ago',
      status: 'normal',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
          ) : (
            healthMetrics.map((metric) => {
              const TrendIcon = getTrendIcon(metric.trend);
              const trendColor = getTrendColor(metric.trend);
              
              return (
                <FeedbackButton 
                  key={metric.id} 
                  onPress={() => console.log('Metric pressed:', metric.label)}
                  style={styles.enhancedMetricCard}
                >
                  <View style={styles.metricCardHeader}>
                    <View style={[styles.metricIcon, { backgroundColor: `${metric.color}${Colors.opacity.light}` }]}>
                      <metric.icon color={metric.color} size={24} />
                    </View>
                    <View style={styles.metricTrend}>
                      <TrendIcon color={trendColor} size={16} />
                      <Text style={[styles.metricChange, { color: trendColor }]}>
                        {metric.change}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.enhancedMetricValue}>
                    {metric.value}
                    <Text style={styles.enhancedMetricUnit}> {metric.unit}</Text>
                  </Text>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricNormal}>Normal: {metric.normal}</Text>
                  
                  {/* Enhanced Mini Chart */}
                  <View style={styles.enhancedChartContainer}>
                    {renderMiniChart(metric.readings, metric.color)}
                  </View>
                  
                  <Text style={styles.metricLastReading}>{metric.lastReading}</Text>
                </FeedbackButton>
              );
            })
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
              <SkeletonLoader width={(width - 52) / 2} height={120} borderRadius={16} />
              <SkeletonLoader width={(width - 52) / 2} height={120} borderRadius={16} />
            </>
          ) : (
            healthGoals.map((goal) => (
              <FeedbackButton
                key={goal.id}
                onPress={() => console.log('Goal pressed:', goal.title)}
                style={styles.goalCard}
              >
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: `${goal.color}${Colors.opacity.light}` }]}>
                    <goal.icon color={goal.color} size={18} />
                  </View>
                  <Text style={styles.goalProgress}>{goal.progress}%</Text>
                </View>
                
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalValue}>
                  {goal.current} / {goal.target} {goal.unit}
                </Text>
                
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
              </FeedbackButton>
            ))
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
        ) : (
          recentReadings.map((reading) => (
            <FeedbackButton
              key={reading.id}
              onPress={() => console.log('Reading pressed:', reading.type)}
              style={styles.readingCard}
            >
              <View style={styles.readingInfo}>
                <Text style={styles.readingType}>{reading.type}</Text>
                <Text style={styles.readingValue}>{reading.value}</Text>
                <Text style={styles.readingTime}>{reading.time}</Text>
              </View>
              
              <View style={[
                styles.readingStatus,
                { backgroundColor: `${getStatusColor(reading.status)}${Colors.opacity.light}` }
              ]}>
                <Text style={[
                  styles.readingStatusText,
                  { color: getStatusColor(reading.status) }
                ]}>
                  {reading.status.toUpperCase()}
                </Text>
              </View>
            </FeedbackButton>
          ))
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
    gap: 16,
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
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 2,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  readingCard: {
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
  readingInfo: {
    flex: 1,
  },
  readingType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  readingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});