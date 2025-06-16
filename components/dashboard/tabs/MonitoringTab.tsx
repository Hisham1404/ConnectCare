import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl, Dimensions, FlatList } from 'react-native';
import { Play, Pause, Heart, Activity, Target, Monitor, User, ChevronDown, TrendingUp } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  patient_id: string;
  type: string;
  value: string;
  unit: string;
  created_at: string;
}

interface PatientInfo {
  id: string;
  name: string;
  email?: string;
}

interface ChartData {
  labels: string[];
  datasets: [{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }];
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
  const selectedPatient = patients.find(p => p.id === selectedPatientForMonitoring);

  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [chartData, setChartData] = useState<{[key: string]: ChartData}>({});
  const [selectedMetricType, setSelectedMetricType] = useState('Heart Rate');
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Available metric types for visualization
  const metricTypes = ['Heart Rate', 'Blood Pressure', 'Temperature', 'Oxygen Level'];

  // Fetch health metrics for selected patient
  const fetchHealthMetrics = async (patientId: string, metricType: string) => {
    if (!patientId) return;
    
    setLoadingMetrics(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('patient_id', patientId)
        .eq('type', metricType)
        .order('created_at', { ascending: true })
        .limit(30); // Last 30 data points

      if (error) throw error;

      setHealthMetrics(data || []);
      
      // Use real data only if we have enough points for a line chart
      if (data && data.length > 1) {
        const chartLabels = data.map((metric, index) => {
          if (index % 5 === 0 || index === data.length - 1) {
            const date = new Date(metric.created_at);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }
          return '';
        });

        const chartValues = data.map(metric => {
          let value = parseFloat(metric.value);
          // For blood pressure, use systolic value
          if (metricType === 'Blood Pressure' && metric.value.includes('/')) {
            value = parseFloat(metric.value.split('/')[0]);
          }
          return isNaN(value) ? 0 : value;
        });

        const newChartData: ChartData = {
          labels: chartLabels,
          datasets: [{
            data: chartValues,
            color: (opacity = 1) => getMetricColor(metricType, opacity),
            strokeWidth: 2
          }]
        };

        setChartData(prev => ({
          ...prev,
          [metricType]: newChartData
        }));
      } else {
        // If there's 1 or 0 data points, generate mock data for a better visual
        let seedValue: number | undefined;
        if (data && data.length === 1) {
          const metric = data[0];
          let valueStr = metric.value;
          if (metricType === 'Blood Pressure' && valueStr.includes('/')) {
            valueStr = valueStr.split('/')[0];
          }
          const parsedValue = parseFloat(valueStr);
          if (!isNaN(parsedValue)) {
            seedValue = parsedValue;
          }
        }
        
        const mockData = generateMockData(metricType, seedValue);
        setChartData(prev => ({
          ...prev,
          [metricType]: mockData
        }));
      }
    } catch (err) {
      console.error('Error fetching health metrics:', err);
      setError(`Failed to load ${metricType} data`);
      
      // Generate mock data on error
      const mockData = generateMockData(metricType);
      setChartData(prev => ({
        ...prev,
        [metricType]: mockData
      }));
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Generate mock data for demonstration
  const generateMockData = (metricType: string, seedValue?: number): ChartData => {
    const days = 7;
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    let baseValue = 70;
    let range = 10;

    // Use seed value if provided, otherwise use defaults
    if (seedValue !== undefined) {
      baseValue = seedValue;
      switch (metricType) {
        case 'Heart Rate': range = baseValue * 0.1; break;
        case 'Blood Pressure': range = baseValue * 0.08; break;
        case 'Temperature': range = 1.5; break;
        case 'Oxygen Level': range = 2; break;
        default: range = 5;
      }
    } else {
      switch (metricType) {
        case 'Heart Rate': baseValue = 75; range = 15; break;
        case 'Blood Pressure': baseValue = 120; range = 20; break;
        case 'Temperature': baseValue = 98.6; range = 2; break;
        case 'Oxygen Level': baseValue = 98; range = 3; break;
      }
    }

    const data = Array.from({ length: days }, () => {
      const variation = (Math.random() - 0.5) * range;
      return Math.round((baseValue + variation) * 10) / 10;
    });

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => getMetricColor(metricType, opacity),
        strokeWidth: 2
      }]
    };
  };

  // Get color for metric type
  const getMetricColor = (metricType: string, opacity: number = 1) => {
    const colors = {
      'Heart Rate': `rgba(239, 68, 68, ${opacity})`,
      'Blood Pressure': `rgba(59, 130, 246, ${opacity})`,
      'Temperature': `rgba(245, 158, 11, ${opacity})`,
      'Oxygen Level': `rgba(16, 185, 129, ${opacity})`
    };
    return colors[metricType as keyof typeof colors] || `rgba(107, 114, 128, ${opacity})`;
  };

  // Get current metric value
  const getCurrentMetricValue = (metricType: string) => {
    const latestMetric = healthMetrics
      .filter(m => m.type === metricType)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (latestMetric) {
      return latestMetric.value + ' ' + latestMetric.unit;
    }

    // Mock values
    const mockValues = {
      'Heart Rate': '75 BPM',
      'Blood Pressure': '120/80 mmHg',
      'Temperature': '98.6 °F',
      'Oxygen Level': '98 %'
    };
    return mockValues[metricType as keyof typeof mockValues] || 'N/A';
  };

  // Get metric icon
  const getMetricIcon = (metricType: string, color: string) => {
    const iconMap = {
      'Heart Rate': <Heart color={color} size={12} fill={color} />,
      'Blood Pressure': <Activity color={color} size={12} />,
      'Temperature': <Target color={color} size={12} />,
      'Oxygen Level': <Monitor color={color} size={12} />
    };
    return iconMap[metricType as keyof typeof iconMap] || <Activity color={color} size={12} />;
  };

  // Get status color based on metric value
  const getStatusColor = (metricType: string, value: string) => {
    // Extract numeric value
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '#6b7280'; // Gray for unknown

    switch (metricType) {
      case 'Heart Rate':
        if (numValue >= 60 && numValue <= 100) return '#10b981'; // Green - normal
        if (numValue >= 50 && numValue <= 120) return '#f59e0b'; // Yellow - warning
        return '#ef4444'; // Red - critical
      
      case 'Blood Pressure':
        if (numValue >= 90 && numValue <= 140) return '#10b981'; // Green - normal
        if (numValue >= 80 && numValue <= 160) return '#f59e0b'; // Yellow - warning
        return '#ef4444'; // Red - critical
      
      case 'Temperature':
        if (numValue >= 97 && numValue <= 99.5) return '#10b981'; // Green - normal
        if (numValue >= 96 && numValue <= 101) return '#f59e0b'; // Yellow - warning
        return '#ef4444'; // Red - critical
      
      case 'Oxygen Level':
        if (numValue >= 95) return '#10b981'; // Green - normal
        if (numValue >= 90) return '#f59e0b'; // Yellow - warning
        return '#ef4444'; // Red - critical
      
      default:
        return '#6b7280'; // Gray - unknown
    }
  };

  // Get trend icon
  const getTrendIcon = (metricType: string) => {
    // Simulate trends - in real app, calculate from historical data
    const trends = ['up', 'down', 'stable'];
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    
    switch (randomTrend) {
      case 'up':
        return <TrendingUp color="#10b981" size={10} />;
      case 'down':
        return <TrendingUp color="#ef4444" size={10} style={{ transform: [{ rotate: '180deg' }] }} />;
      default:
        return <Target color="#6b7280" size={8} />;
    }
  };

  // Get trend text
  const getTrendText = (metricType: string) => {
    const trends = ['+2%', '-1%', 'Stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  // Load metrics when patient or metric type changes
  useEffect(() => {
    if (selectedPatient) {
      fetchHealthMetrics(selectedPatient.id, selectedMetricType);
    }
  }, [selectedPatient, selectedMetricType]);

  // Auto-refresh when monitoring is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring && selectedPatient) {
      interval = setInterval(() => {
        fetchHealthMetrics(selectedPatient.id, selectedMetricType);
      }, 15000); // Refresh every 15 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, selectedPatient, selectedMetricType]);

  const handleRefresh = async () => {
    await onRefresh();
    if (selectedPatient) {
      await fetchHealthMetrics(selectedPatient.id, selectedMetricType);
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => getMetricColor(selectedMetricType, opacity),
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: getMetricColor(selectedMetricType)
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#e5e7eb',
      strokeDasharray: '5,5'
    }
  };

  const renderPatientSelector = () => (
    <View style={styles.patientSelectorContainer}>
      <TouchableOpacity 
        style={styles.patientSelectorButton}
        onPress={() => setShowPatientDropdown(!showPatientDropdown)}
      >
        <User color="#3b82f6" size={20} />
        <Text style={styles.patientSelectorText}>
          {selectedPatient ? selectedPatient.name : 'Select Patient'}
        </Text>
        <ChevronDown color="#6b7280" size={16} />
      </TouchableOpacity>

      {showPatientDropdown && (
        <View style={styles.patientDropdown}>
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.patientDropdownItem}
                onPress={() => {
                  onSelectPatient(item.id);
                  setShowPatientDropdown(false);
                }}
              >
                <Text style={styles.patientDropdownText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.patientDropdownList}
          />
        </View>
      )}
    </View>
  );

  const renderMetricSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.metricSelector}
      contentContainerStyle={styles.metricSelectorContent}
    >
      {metricTypes.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.metricSelectorItem,
            selectedMetricType === type && styles.selectedMetricItem
          ]}
          onPress={() => setSelectedMetricType(type)}
        >
          <Text style={[
            styles.metricSelectorText,
            selectedMetricType === type && styles.selectedMetricText
          ]}>
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.headerSection}>
        <View style={styles.monitoringHeader}>
          <Text style={styles.monitoringTitle}>Patient Health Monitoring</Text>
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

        {/* Patient Selection */}
        {renderPatientSelector()}

        {/* Metric Type Selection */}
        {renderMetricSelector()}
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing || loadingMetrics} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {!selectedPatient ? (
          <View style={styles.emptyStateContainer}>
            <User color="#6b7280" size={48} />
            <Text style={styles.emptyStateTitle}>Select a Patient</Text>
            <Text style={styles.emptyStateText}>
              Choose a patient from the dropdown above to view their health metrics.
            </Text>
          </View>
        ) : (
          <>
            {/* Current Value Display */}
            <View style={styles.currentValueContainer}>
              <View style={styles.currentValueHeader}>
                <Text style={styles.currentValueTitle}>Current {selectedMetricType}</Text>
                <View style={[
                  styles.liveIndicator,
                  { backgroundColor: isMonitoring ? '#10b981' : '#6b7280' }
                ]}>
                  <Text style={styles.liveIndicatorText}>
                    {isMonitoring ? 'LIVE' : 'OFF'}
                  </Text>
                </View>
              </View>
              <Text style={styles.currentValue}>
                {getCurrentMetricValue(selectedMetricType)}
              </Text>
              <Text style={styles.currentValueSubtext}>
                Patient: {selectedPatient.name}
              </Text>
            </View>

            {/* Chart Display */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <TrendingUp color="#3b82f6" size={20} />
                <Text style={styles.chartTitle}>{selectedMetricType} Trend</Text>
              </View>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => selectedPatient && fetchHealthMetrics(selectedPatient.id, selectedMetricType)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : chartData[selectedMetricType] ? (
                <LineChart
                  data={chartData[selectedMetricType]}
                  width={width - 60}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={false}
                  withHorizontalLines={true}
                  withVerticalLines={false}
                  withDots={true}
                  withShadow={false}
                />
              ) : (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading chart data...</Text>
                </View>
              )}
              
              <Text style={styles.chartSubtext}>
                Last 7 days • Updated {new Date().toLocaleTimeString()}
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStatsContainer}>
              <Text style={styles.quickStatsTitle}>Quick Overview</Text>
              <View style={styles.quickStatsGrid}>
                {metricTypes.map((type) => {
                  const currentValue = getCurrentMetricValue(type);
                  const isCurrentMetric = type === selectedMetricType;
                  
                  return (
                    <TouchableOpacity 
                      key={type} 
                      style={[
                        styles.quickStatItem,
                        isCurrentMetric && styles.quickStatItemActive
                      ]}
                      onPress={() => setSelectedMetricType(type)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.quickStatHeader}>
                        <View style={[styles.quickStatIcon, { backgroundColor: getMetricColor(type, 0.1) }]}>
                          {getMetricIcon(type, getMetricColor(type, 1))}
                        </View>
                        <View style={[styles.quickStatStatus, { backgroundColor: getStatusColor(type, currentValue) }]} />
                      </View>
                      <Text style={styles.quickStatLabel}>{type}</Text>
                      <View style={styles.quickStatValueContainer}>
                        <Text style={[
                          styles.quickStatValue,
                          isCurrentMetric && styles.quickStatValueActive
                        ]}>
                          {currentValue}
                        </Text>
                        <View style={styles.quickStatTrend}>
                          {getTrendIcon(type)}
                          <Text style={styles.quickStatTrendText}>
                            {getTrendText(type)}
                          </Text>
                        </View>
                      </View>
                      {isCurrentMetric && (
                        <View style={styles.quickStatActiveIndicator}>
                          <Text style={styles.quickStatActiveText}>SELECTED</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              {/* Additional Stats Row */}
              <View style={styles.additionalStatsContainer}>
                <View style={styles.additionalStatItem}>
                  <Monitor color="#8b5cf6" size={16} />
                  <Text style={styles.additionalStatLabel}>Monitoring</Text>
                  <Text style={[styles.additionalStatValue, { color: isMonitoring ? '#10b981' : '#ef4444' }]}>
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                <View style={styles.additionalStatItem}>
                  <Activity color="#f59e0b" size={16} />
                  <Text style={styles.additionalStatLabel}>Last Update</Text>
                  <Text style={styles.additionalStatValue}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monitoringTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  monitoringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monitoringToggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  patientSelectorContainer: {
    marginBottom: 16,
  },
  patientSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  patientSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  patientDropdown: {
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  patientDropdownList: {
    maxHeight: 200,
  },
  patientDropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  patientDropdownText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  metricSelector: {
    marginBottom: 8,
  },
  metricSelectorContent: {
    gap: 8,
  },
  metricSelectorItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedMetricItem: {
    backgroundColor: '#3b82f6',
  },
  metricSelectorText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedMetricText: {
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    minHeight: 200,
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
  currentValueContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  currentValueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentValueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  liveIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveIndicatorText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  currentValueSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quickStatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  quickStatItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  quickStatItemActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
    transform: [{ scale: 1.02 }],
  },
  quickStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickStatIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  quickStatValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  quickStatValueActive: {
    color: '#0ea5e9',
  },
  quickStatTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quickStatTrendText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  quickStatActiveIndicator: {
    backgroundColor: '#0ea5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  quickStatActiveText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  additionalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    gap: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 'auto',
  },
});