import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { Heart } from 'lucide-react-native';

export default function RootLayout() {
  useFrameworkReady();
  
  const { user, profile, loading: authLoading, error: authError } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);

  // Handle navigation based on authentication status
  useEffect(() => {
    if (!authLoading && initialLoad) {
      console.log('🔍 Navigation check:', { user: !!user, profile: !!profile, role: profile?.role });
      
      setInitialLoad(false);
      
      // Add a small delay to ensure smooth navigation
      setTimeout(() => {
        if (user && profile) {
          // User is authenticated with profile, redirect based on role
          switch (profile.role) {
            case 'doctor':
            case 'admin':
            case 'nurse':
              console.log(`👨‍⚕️ Redirecting ${profile.role} to dashboard`);
              try {
                router.replace('/dashboard');
                setNavigationReady(true);
              } catch (error) {
                console.error('❌ Dashboard navigation failed:', error);
                // Fallback to welcome page if dashboard fails
                router.replace('/');
                setNavigationReady(true);
              }
              break;
              
            case 'patient':
              console.log('🏥 Redirecting patient to tabs');
              try {
                router.replace('/(tabs)');
                setNavigationReady(true);
              } catch (error) {
                console.error('❌ Tabs navigation failed:', error);
                router.replace('/');
                setNavigationReady(true);
              }
              break;
              
            default:
              console.log('🔓 Unknown role, redirecting to welcome');
              router.replace('/');
              setNavigationReady(true);
              break;
          }
        } else {
          // User is not authenticated or no profile, show welcome screen
          console.log('🔓 No user/profile found, redirecting to welcome');
          router.replace('/');
          setNavigationReady(true);
        }
      }, 200); // Slightly longer delay for stability
    }
  }, [user, profile, authLoading, initialLoad]);

  // Add timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!navigationReady && !authLoading) {
        console.warn('⚠️ Navigation timeout - forcing fallback');
        router.replace('/');
        setNavigationReady(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [navigationReady, authLoading]);

  // Show loading screen while checking authentication or during initial navigation
  if (authLoading || initialLoad || !navigationReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Heart color={Colors.primary} size={40} fill={Colors.primary} />
          </View>
          <Text style={styles.appName}>ConnectCare AI</Text>
          <Text style={styles.tagline}>Remote Patient Monitoring</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContent}>
          <LoadingSpinner size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {authLoading ? 'Checking authentication...' : 'Setting up your dashboard...'}
          </Text>
          
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: authLoading ? '30%' : '90%' }
              ]} />
            </View>
          </View>
        </View>

        {/* Error Display */}
        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Authentication error. Please try again.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure • HIPAA Compliant • AI-Powered
          </Text>
        </View>
      </View>
    );
  }

  // Main navigation stack
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome/Landing page */}
        <Stack.Screen name="index" />
        
        {/* Authentication flow */}
        <Stack.Screen name="auth" />
        
        {/* Doctor dashboard */}
        <Stack.Screen name="dashboard" />
        
        {/* Patient tabs interface */}
        <Stack.Screen name="(tabs)" />
        
        {/* 404 page */}
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.surface}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.surface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: `${Colors.surface}80`,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.surface,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  progressContainer: {
    width: 200,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: `${Colors.surface}30`,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}20`,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
  },
  errorText: {
    color: Colors.surface,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: `${Colors.surface}60`,
    textAlign: 'center',
    fontWeight: '500',
  },
});