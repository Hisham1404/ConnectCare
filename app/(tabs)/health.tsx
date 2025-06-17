import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Heart, Activity, Thermometer, Droplets, Weight, Ruler, TrendingUp, TrendingDown, Calendar, Clock, Plus, ChartBar as BarChart3, ChartLine as LineChart, Target, Award, Zap, X } from 'lucide-react-native';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Modal and form state
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    value: '',
    unit: ''
  });
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    status: 'not_started'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loading: authLoading } = useAuth();

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

  // Fetch health goals from database
  const fetchHealthGoals = async (userId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', userId)
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to load health data. Please check your connection and try again.';
        setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh health data. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle form submission
  const handleSubmitMetric = async () => {
    if (!user?.id) return;
    
    // Validate form data
    if (!formData.type || !formData.value || !formData.unit) {
      setSubmitError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from('health_metrics')
        .insert([{
          patient_id: user.id,
          type: formData.type,
          value: formData.value,
          unit: formData.unit,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Success - close modal and refresh data
      setShowAddMetricModal(false);
      setFormData({ type: '', value: '', unit: '' });
      Alert.alert('Success', 'Health metric added successfully!');
      
      // Refresh the metrics list
      await onRefresh();

    } catch (err) {
      console.error('Error adding health metric:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add health metric. Please check your connection and try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle goal submission
  const handleSubmitGoal = async () => {
    if (!user?.id) return;
    
    // Validate form data
    if (!goalFormData.title || !goalFormData.description) {
      setSubmitError('Please fill in title and description');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from('health_goals')
        .insert([{
          patient_id: user.id,
          title: goalFormData.title,
          description: goalFormData.description,
          status: goalFormData.status,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Success - close modal and refresh data
      setShowAddGoalModal(false);
      setGoalFormData({ title: '', description: '', status: 'not_started' });
      Alert.alert('Success', 'Health goal added successfully!');
      
      // Refresh the goals list
      await onRefresh();

    } catch (err) {
      console.error('Error adding health goal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add health goal. Please check your connection and try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setShowAddMetricModal(false);
    setFormData({ type: '', value: '', unit: '' });
    setSubmitError(null);
  };

  // Reset goal form when modal closes
  const handleCloseGoalModal = () => {
    setShowAddGoalModal(false);
    setGoalFormData({ title: '', description: '', status: 'not_started' });
    setSubmitError(null);
  };

  // Predefined metric types for the dropdown
  const metricTypes = [
    { label: 'Heart Rate', value: 'Heart Rate', unit: 'BPM' },
    { label: 'Blood Pressure', value: 'Blood Pressure', unit: 'mmHg' },
    { label: 'Temperature', value: 'Temperature', unit: '°F' },
    { label: 'Oxygen Level', value: 'Oxygen Level', unit: '%' },
    { label: 'Weight', value: 'Weight', unit: 'lbs' },
    { label: 'Blood Sugar', value: 'Blood Sugar', unit: 'mg/dL' },
    { label: 'Steps', value: 'Steps', unit: 'steps' },
    { label: 'Pain Level', value: 'Pain Level', unit: '/10' }
  ];

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
                  marginRight: index === readings.length - 1 ? 0 : 2,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Transform database metrics to match the expected format
  const transformedMetrics = healthMetrics.map((metric, index) => {
    // Generate some sample trend data based on metric type and index
    const trends = ['improving', 'stable', 'declining'];
    const changes = ['+5%', '0%', '-3%', '+2%', '-1%'];
    const trendForMetric = index % 3 === 0 ? 'improving' : index % 3 === 1 ? 'stable' : 'declining';
    const changeForMetric = changes[index % changes.length];
    
    return {
      id: metric.id,
      label: metric.type,
      value: metric.value,
      unit: metric.unit,
      icon: getMetricIcon(metric.type),
      color: getMetricColor(metric.type),
      trend: trendForMetric,
      change: changeForMetric,
      normal: 'Normal',
      lastReading: new Date(metric.created_at).toLocaleString(),
      readings: [70, 72, 75, 73, 71, 74, parseInt(metric.value) || 0], // Mock readings for chart
    };
  });

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

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Target color={Colors.accent} size={64} strokeWidth={1.5} />
      <Text style={styles.emptyStateTitle}>Track Your Health</Text>
      <Text style={styles.emptyStateText}>
        No health data has been logged yet. Tap the 'Add New Metric' button to get started.
      </Text>
    </View>
  );

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
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} tintColor={Colors.accent} />}
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
              if (user?.id) {
                onRefresh();
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Tracking</Text>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleInHeader}>Health Metrics</Text>
          <FeedbackButton 
            onPress={() => setShowAddMetricModal(true)}
            style={styles.metricsAddButton}
          >
            <Text style={styles.addButtonText}>Add New</Text>
          </FeedbackButton>
        </View>
        
        <View style={styles.metricsGrid}>
          {isLoadingData ? (
            <SkeletonLoader />
          ) : healthMetrics.length === 0 && healthGoals.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {transformedMetrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  renderMiniChart={renderMiniChart}
                />
              ))}
            </>
          )}
        </View>
      </View>

      {/* Health Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleInHeader}>Health Goals</Text>
          <FeedbackButton 
            onPress={() => setShowAddGoalModal(true)}
            style={styles.metricsAddButton}
          >
            <Text style={styles.addButtonText}>Add New</Text>
          </FeedbackButton>
        </View>
        
        <View style={styles.goalsGrid}>
          {isLoadingData ? (
            <SkeletonLoader />
          ) : transformedGoals.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No health goals to display.</Text>
            </View>
          ) : (
            <>
              {transformedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)}
            </>
          )}
        </View>
      </View>

      {/* Recent Readings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleInHeader}>Recent Readings</Text>
          <FeedbackButton onPress={() => console.log('View trends')}>
            <LineChart color={Colors.accent} size={20} />
          </FeedbackButton>
        </View>
        
        {isLoadingData ? (
          <SkeletonLoader />
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
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>No recent readings available.</Text>
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

      {/* Add Metric Modal */}
      <Modal
        visible={showAddMetricModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Health Metric</Text>
            <TouchableOpacity 
              onPress={handleSubmitMetric}
              disabled={isSubmitting}
              style={[styles.modalSaveButton, isSubmitting && styles.modalSaveButtonDisabled]}
            >
              <Text style={[styles.modalSaveButtonText, isSubmitting && styles.modalSaveButtonTextDisabled]}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Error Display */}
          {submitError && (
            <View style={styles.submitErrorContainer}>
              <Text style={styles.submitErrorText}>{submitError}</Text>
            </View>
          )}

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Metric Type Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Metric Type</Text>
              <View style={styles.metricTypeGrid}>
                {metricTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.metricTypeButton,
                      formData.type === type.value && styles.metricTypeButtonSelected
                    ]}
                    onPress={() => setFormData(prev => ({ 
                      ...prev, 
                      type: type.value, 
                      unit: type.unit 
                    }))}
                  >
                    <Text style={[
                      styles.metricTypeButtonText,
                      formData.type === type.value && styles.metricTypeButtonTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Value Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Value</Text>
              <TextInput
                style={styles.textInput}
                value={formData.value}
                onChangeText={(text) => setFormData(prev => ({ ...prev, value: text }))}
                placeholder="Enter value (e.g., 72, 120/80)"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Unit Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Unit</Text>
              <TextInput
                style={styles.textInput}
                value={formData.unit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                placeholder="Unit (e.g., BPM, mmHg, °F)"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Helper Text */}
            <View style={styles.helperSection}>
              <Text style={styles.helperText}>
                Select a metric type above and enter the corresponding value. The unit will be automatically filled but can be customized.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseGoalModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseGoalModal}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Health Goal</Text>
            <TouchableOpacity 
              onPress={handleSubmitGoal}
              disabled={isSubmitting}
              style={[styles.modalSaveButton, isSubmitting && styles.modalSaveButtonDisabled]}
            >
              <Text style={[styles.modalSaveButtonText, isSubmitting && styles.modalSaveButtonTextDisabled]}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Error Display */}
          {submitError && (
            <View style={styles.submitErrorContainer}>
              <Text style={styles.submitErrorText}>{submitError}</Text>
            </View>
          )}

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Goal Title Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Goal Title</Text>
              <TextInput
                style={styles.textInput}
                value={goalFormData.title}
                onChangeText={(text) => setGoalFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter goal title (e.g., Lose 10 pounds, Walk 10k steps daily)"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Goal Description Input */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                value={goalFormData.description}
                onChangeText={(text) => setGoalFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your goal and how you plan to achieve it..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            {/* Goal Status Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.statusGrid}>
                {[
                  { label: 'Not Started', value: 'not_started' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Completed', value: 'completed' }
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      goalFormData.status === status.value && styles.statusButtonSelected
                    ]}
                    onPress={() => setGoalFormData(prev => ({ 
                      ...prev, 
                      status: status.value 
                    }))}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      goalFormData.status === status.value && styles.statusButtonTextSelected
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Helper Text */}
            <View style={styles.helperSection}>
              <Text style={styles.helperText}>
                Set a clear, achievable health goal with a specific description. You can update the status as you make progress.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  retryButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  metricsAddButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginTop: 8,
    alignSelf: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  sectionTitleInHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
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
    alignItems: 'flex-end',
    height: 48,
    justifyContent: 'space-between',
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 8,
    marginRight: 2,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCancelButton: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSaveButtonDisabled: {
    opacity: 0.6,
  },
  modalSaveButtonText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  modalSaveButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formSection: {
    marginBottom: 28,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTypeButton: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricTypeButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  metricTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  metricTypeButtonTextSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  helperSection: {
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    borderRadius: 14,
    padding: 18,
    marginTop: 24,
    borderWidth: 1,
    borderColor: `${Colors.accent}${Colors.opacity.light}`,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
  },
  textAreaInput: {
    height: 100,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusButtonTextSelected: {
    color: Colors.surface,
    fontWeight: '700',
  },
  scrollContentContainer: {
    paddingBottom: 120, // Ensure space for FAB
    flexGrow: 1,
  },
  emptySection: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: '100%',
  },
  emptySectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  submitErrorContainer: {
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitErrorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});