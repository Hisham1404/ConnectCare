import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { HealthGoal } from '@/types/models';
import { shadow } from '@/utils/shadowStyle';

interface Props {
  goal: HealthGoal;
}

const GoalCard: React.FC<Props> = ({ goal }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={[styles.iconWrapper, { backgroundColor: `${goal.color}${Colors.opacity.light}` }]}> 
        <goal.icon color={goal.color} size={18} />
      </View>
      <Text style={[styles.progress, { color: goal.color }]}>{goal.progress}%</Text>
    </View>

    <Text style={styles.title}>{goal.title}</Text>
    <Text style={styles.value}>
      {goal.current} / {goal.target} {goal.unit}
    </Text>

    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${goal.progress}%`, backgroundColor: goal.color }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadow(1),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  value: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});

export default GoalCard; 