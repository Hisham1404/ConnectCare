import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { HealthMetric } from '@/types/models';
import { shadow } from '@/utils/shadowStyle';

interface Props {
  metric: HealthMetric;
  renderMiniChart?: (readings: number[], color: string) => React.ReactNode;
}

const MetricCard: React.FC<Props> = ({ metric, renderMiniChart }) => {
  const getTrendIcon = (trend: HealthMetric['trend']) => {
    switch (trend) {
      case 'improving':
        return TrendingDown;
      case 'declining':
        return TrendingUp;
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
      default:
        return Colors.textSecondary;
    }
  };

  const TrendIcon = getTrendIcon(metric.trend);
  const trendColor = getTrendColor(metric.trend);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${metric.color}${Colors.opacity.light}` }]}> 
          <metric.icon color={metric.color} size={24} />
        </View>
        <View style={styles.trendWrapper}>
          <TrendIcon color={trendColor} size={16} />
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
    padding: 16,
    marginBottom: 16,
    ...shadow(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  normal: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  lastReading: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
});

export default MetricCard; 