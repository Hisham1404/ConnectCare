import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedOnboarding, loading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Wait for both auth and onboarding to finish loading
    if (authLoading || onboardingLoading) {
      return;
    }

    // Determine the appropriate starting route
    if (!hasCompletedOnboarding) {
      router.replace('/welcome');
    } else if (!user) {
      router.replace('/auth');
    } else {
      router.replace('/dashboard');
    }
  }, [user, hasCompletedOnboarding, authLoading, onboardingLoading]);

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