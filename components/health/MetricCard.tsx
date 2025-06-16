import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { HealthMetric } from '@/types/models';
import { shadow } from '@/utils/shadowStyle';

const { width } = Dimensions.get('window');

interface Props {
  metric: HealthMetric;
  renderMiniChart?: (readings: number[], color: string) => React.ReactNode;
}

const MetricCard: React.FC<Props> = ({ metric, renderMiniChart }) => {
  const getTrendIcon = (trend: HealthMetric['trend']) => {
    console.log('Trend for metric:', metric.label, 'is:', trend); // Debug log
    switch (trend) {
      case 'improving':
        return TrendingUp;
      case 'declining':
        return TrendingDown;
      case 'stable':
        return TrendingUp; // Use TrendingUp for stable as well
      default:
        return TrendingUp;
    }
  };

  const getTrendColor = (trend: HealthMetric['trend']) => {
    switch (trend) {
      case 'improving':
        return Colors.success;
      case 'declining':
        return Colors.error;
      case 'stable':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const trendColor = getTrendColor(metric.trend);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${metric.color}${Colors.opacity.light}` }]}> 
          <metric.icon color={metric.color} size={24} />
        </View>
        <View style={styles.trendWrapper}>
          {metric.trend === 'improving' && <TrendingUp color={trendColor} size={14} />}
          {metric.trend === 'declining' && <TrendingDown color={trendColor} size={14} />}
          {metric.trend === 'stable' && <TrendingUp color={trendColor} size={14} />}
          <Text style={[styles.trendText, { color: trendColor }]}>{metric.change}</Text>
        </View>
      </View>

      <Text style={styles.value}>
        {metric.value}
        <Text style={styles.unit}> {metric.unit}</Text>
      </Text>
      <Text style={styles.label}>{metric.label}</Text>
      <Text style={styles.normal}>Normal: {metric.normal}</Text>

      {renderMiniChart && (
        <View style={styles.chartContainer}>{renderMiniChart(metric.readings, metric.color)}</View>
      )}

      <Text style={styles.lastReading}>{metric.lastReading}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 52) / 2,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...shadow(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.background}`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    color: Colors.textPrimary,
    lineHeight: 30,
  },
  unit: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  normal: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 12,
  },
  chartContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  lastReading: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});

export default MetricCard;