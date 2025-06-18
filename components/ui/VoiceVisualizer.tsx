import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface VoiceVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
}

export default function VoiceVisualizer({ 
  isActive, 
  color = '#00D4AA', 
  barCount = 5 
}: VoiceVisualizerProps) {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      const animations = animatedValues.map((animatedValue, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        )
      );

      // Stagger the animations
      animations.forEach((animation, index) => {
        setTimeout(() => animation.start(), index * 100);
      });

      return () => {
        animations.forEach(animation => animation.stop());
      };
    } else {
      // Reset to default state
      animatedValues.forEach(animatedValue => {
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive, animatedValues]);

  return (
    <View style={styles.container}>
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 24],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 30,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 4,
  },
});