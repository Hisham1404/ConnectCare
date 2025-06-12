import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { Heart } from 'lucide-react-native';

interface NavigationState {
  isInitialized: boolean;
  hasNavigated: boolean;
  lastAuthState: string | null;
}

export default function RootLayout() {
  useFrameworkReady();
  
  const { user, profile, loading: authLoading, error: authError } = useAuth();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isInitialized: false,
    hasNavigated: false,
    lastAuthState: null,
  });
  const [appError, setAppError] = useState<string | null>(null);

  // Determine current auth state for comparison
  const currentAuthState = user ? `${user.id}-${profile?.role || 'no-role'}` : 'no-user';

  // Handle navigation based on authentication state
  useEffect(() => {
    // Don't navigate if still loading or if we've already handled this auth state
    if (authLoading || navigationState.lastAuthState === currentAuthState) {
      return;
    }

    // Clear any previous app errors when auth state changes
    setAppError(null);

    const handleNavigation = async () => {
      try {
        console.log('🧭 Navigation check:', {
          user: !!user,
          profile: !!profile,
          role: profile?.role,
          authLoading,
          authError: !!authError
        });

        // Handle authentication errors
        if (authError) {
          console.error('❌ Authentication error:', authError);
          setAppError('Authentication failed. Please try signing in again.');
          router.replace('/auth/sign-in');
          return;
        }

        // User is not authenticated - redirect to welcome/auth
        if (!user) {
          console.log('🔓 No user found, redirecting to welcome');
          router.replace('/');
          return;
        }

        // User is authenticated but profile is missing
        if (!profile) {
          console.warn('⚠️ User authenticated but no profile found');
          setAppError('Profile not found. Please contact support or try signing up again.');
          
          // Give user option to sign out and try again
          Alert.alert(
            'Profile Missing',
            'Your profile could not be loaded. This might be a temporary issue.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setAppError(null);
                  // Force a profile refresh by clearing the auth state
                  setNavigationState(prev => ({ ...prev, lastAuthState: null }));
                }
              },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => {
                  // This would trigger the useAuth hook to sign out
                  router.replace('/auth/sign-in');
                }
              }
            ]
          );
          return;
        }

        // Role-based navigation
        switch (profile.role) {
          case 'doctor':
          case 'admin':
          case 'nurse':
            console.log(`👨‍⚕️ Redirecting ${profile.role} to dashboard`);
            router.replace('/dashboard');
            break;
            
          case 'patient':
            console.log('🏥 Redirecting patient to tabs');
            router.replace('/(tabs)');
            break;
            
          default:
            console.error('❌ Unknown user role:', profile.role);
            setAppError(`Unknown user role: ${profile.role}. Please contact support.`);
            Alert.alert(
              'Unknown Role',
              `Your account has an unrecognized role (${profile.role}). Please contact support for assistance.`,
              [
                {
                  text: 'Sign Out',
                  onPress: () => router.replace('/auth/sign-in')
                }
              ]
            );
            return;
        }

        // Update navigation state to prevent re-navigation
        setNavigationState({
          isInitialized: true,
          hasNavigated: true,
          lastAuthState: currentAuthState,
        });

      } catch (error) {
        console.error('❌ Navigation error:', error);
        setAppError('Navigation failed. Please try refreshing the app.');
      }
    };

    // Add a small delay to ensure smooth transitions
    const navigationTimer = setTimeout(handleNavigation, 100);
    
    return () => clearTimeout(navigationTimer);
  }, [user, profile, authLoading, authError, currentAuthState, navigationState.lastAuthState]);

  // Show loading screen while authentication is being checked
  if (authLoading || !navigationState.isInitialized) {
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
                { width: authLoading ? '30%' : '70%' }
              ]} />
            </View>
          </View>
        </View>

        {/* Error Display */}
        {(authError || appError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {appError || authError}
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

  // Show error screen if there's a persistent error
  if (appError && navigationState.isInitialized) {
    return (
      <View style={styles.errorScreenContainer}>
        <StatusBar style="dark" />
        
        <View style={styles.errorContent}>
          <View style={styles.errorIcon}>
            <Heart color={Colors.error} size={48} />
          </View>
          
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{appError}</Text>
          
          <View style={styles.errorActions}>
            <Text style={styles.errorHelpText}>
              If this problem persists, please contact support at support@connectcare.ai
            </Text>
          </View>
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
    transition: 'width 0.3s ease',
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
  errorScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorActions: {
    alignItems: 'center',
  },
  errorHelpText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});