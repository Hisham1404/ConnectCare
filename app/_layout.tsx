import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  useFrameworkReady();
  
  const [hasNavigated, setHasNavigated] = useState(false);

  // For demo purposes, automatically navigate to the welcome screen
  useEffect(() => {
    if (!hasNavigated) {
      setHasNavigated(true);
      // Navigate to the welcome screen instead of checking auth
      router.replace('/welcome');
    }
  }, [hasNavigated]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}