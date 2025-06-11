import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';

export default function IndexScreen() {
  // This component now only shows a loading spinner
  // Navigation logic has been moved to _layout.tsx
  return (
    <View style={styles.container}>
      <LoadingSpinner size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});