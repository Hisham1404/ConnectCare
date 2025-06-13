import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Platform, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface FeedbackButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  hapticFeedback?: boolean;
  scaleEffect?: boolean;
}

export default function FeedbackButton({
  children,
  onPress,
  style,
  disabled = false,
  hapticFeedback = true,
  scaleEffect = true,
}: FeedbackButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (scaleEffect) {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (scaleEffect) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (disabled) return;

    console.log('FeedbackButton pressed', onPress);

    // Haptic feedback for mobile platforms
    if (hapticFeedback && Platform.OS !== 'web') {
      // Would use Haptics.impactAsync() on mobile
      console.log('Haptic feedback triggered');
    }

    // Visual feedback for web
    if (Platform.OS === 'web') {
      // Add a subtle visual pulse effect
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.98,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[style, disabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});