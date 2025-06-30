import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Pressable, StyleSheet } from 'react-native';
import { Stethoscope } from 'lucide-react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { TranscriptProvider } from '@/context/TranscriptContext';
import { AppGuideProvider, useAppGuide } from '@/context/AppGuideContext';
import { AppGuideAgent } from '@/components/AppGuideAgent';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const { toggleGuide } = useAppGuide();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Floating Button for AI Guide */}
      <Pressable
        style={[
          styles.floatingButton,
          {
            bottom: Math.max(insets.bottom, 16) + 72, // nav height 56 + margin
            right: 20,
          },
        ]}
        onPress={toggleGuide}
      >
        <Stethoscope size={24} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
      
      {/* AI Guide Agent - Always rendered, visibility controlled internally */}
      <AppGuideAgent />
      
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <TranscriptProvider>
        <AuthProvider>
          <AppGuideProvider>
            <RootLayoutNav />
          </AppGuideProvider>
        </AuthProvider>
      </TranscriptProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});