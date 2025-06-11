import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

export default function HealthScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = ['day', 'week', 'month', '3months'];

  const healthMetrics = [
    {
      id: '1',
      label: 'Heart Rate',
      value: '72',
      unit: 'BPM',
      icon: Heart,
      color: '#ef4444',
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
      color: '#3b82f6',
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
      color: '#f59e0b',
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
      color: '#10b981',
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
      color: '#8b5cf6',
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
      color: '#f97316',
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
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Water Intake',
      current: 6,
      target: 8,
      unit: 'glasses',
      progress: 75,
      icon: Droplets,
      color: '#06b6d4',
    },
    {
      id: '3',
      title: 'Sleep Duration',
      current: 7.5,
      target: 8,
      unit: 'hours',
      progress: 94,
      icon: Clock,
      color: '#8b5cf6',
    },
    {
      id: '4',
      title: 'Exercise Time',
      current: 25,
      target: 30,
      unit: 'minutes',
      progress: 83,
      icon: Activity,
      color: '#10b981',
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
      case 'improving': return '#10b981';
      case 'declining': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderMiniChart = (readings: number[], color: string) => {
    const maxValue = Math.max(...readings);
    const minValue = Math.min(...readings);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.miniChart}>
        {readings.map((value, index) => {
          const height = ((value - minValue) / range) * 30 + 5;
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
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#3b82f6" size={20} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodContent}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.activePeriodText
              ]}>
                {period === '3months' ? '3 Months' : period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Health Metrics Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        
        <View style={styles.metricsGrid}>
          {healthMetrics.map((metric) => {
            const TrendIcon = getTrendIcon(metric.trend);
            const trendColor = getTrendColor(metric.trend);
            
            return (
              <TouchableOpacity key={metric.id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
                    <metric.icon color={metric.color} size={18} />
                  </View>
                  <View style={styles.metricTrend}>
                    <TrendIcon color={trendColor} size={14} />
                    <Text style={[styles.metricChange, { color: trendColor }]}>
                      {metric.change}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.metricValue}>
                  {metric.value}
                  <Text style={styles.metricUnit}> {metric.unit}</Text>
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricNormal}>Normal: {metric.normal}</Text>
                
                {renderMiniChart(metric.readings, metric.color)}
                
                <Text style={styles.metricLastReading}>{metric.lastReading}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Health Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.goalsGrid}>
          {healthGoals.map((goal) => (
            <View key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={[styles.goalIcon, { backgroundColor: `${goal.color}15` }]}>
                  <goal.icon color={goal.color} size={16} />
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
            </View>
          ))}
        </View>
      </View>

      {/* Recent Readings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Readings</Text>
          <TouchableOpacity>
            <LineChart color="#3b82f6" size={20} />
          </TouchableOpacity>
        </View>
        
        {recentReadings.map((reading) => (
          <View key={reading.id} style={styles.readingCard}>
            <View style={styles.readingInfo}>
              <Text style={styles.readingType}>{reading.type}</Text>
              <Text style={styles.readingValue}>{reading.value}</Text>
              <Text style={styles.readingTime}>{reading.time}</Text>
            </View>
            
            <View style={[
              styles.readingStatus,
              { backgroundColor: `${getStatusColor(reading.status)}15` }
            ]}>
              <Text style={[
                styles.readingStatusText,
                { color: getStatusColor(reading.status) }
              ]}>
                {reading.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#ef444415' }]}>
              <Heart color="#ef4444" size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Log Vitals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#3b82f615' }]}>
              <Activity color="#3b82f6" size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Record Exercise</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#10b98115' }]}>
              <Award color="#10b981" size={20} />
            </View>
            <Text style={styles.quickActionTitle}>View Trends</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionCard}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b15' }]}>
              <Calendar color="#f59e0b" size={20} />
            </View>
            <Text style={styles.quickActionTitle}>Set Reminders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  periodButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activePeriodButton: {
    backgroundColor: '#3b82f6',
  },
  periodText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#ffffff',
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
    color: '#1f2937',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricNormal: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 8,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'end',
    height: 35,
    gap: 1,
    marginBottom: 8,
  },
  chartBar: {
    flex: 1,
    borderRadius: 1,
  },
  metricLastReading: {
    fontSize: 10,
    color: '#9ca3af',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#ffffff',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalProgress: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3b82f6',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  readingCard: {
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
    marginBottom: 2,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 12,
    color: '#6b7280',
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
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
    textAlign: 'center',
  },
});