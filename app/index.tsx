import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';

export default function IndexScreen() {
  useEffect(() => {
    // Immediately redirect to welcome screen
    router.replace('/welcome');
  }, []);

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