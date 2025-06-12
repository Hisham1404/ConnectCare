import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  useFrameworkReady();
  
  const { user, loading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);

  // Handle navigation based on authentication status
  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false);
      setNavigationReady(true);
      
      // Add a small delay to ensure smooth navigation
      setTimeout(() => {
        if (user) {
          // User is authenticated, redirect to main app
          router.replace('/(tabs)');
        } else {
          // User is not authenticated, show welcome screen
          router.replace('/');
        }
      }, 100);
    }
  }, [user, loading, initialLoad]);

  // Show loading screen while checking authentication or during initial navigation
  if (loading || initialLoad || !navigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>💙</Text>
          </View>
          <Text style={styles.appName}>ConnectCare AI</Text>
        </View>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading your healthcare dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 24,
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
});