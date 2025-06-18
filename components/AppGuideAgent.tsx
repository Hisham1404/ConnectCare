import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Minus, MessageCircle, Mic, MicOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppGuide } from '@/context/AppGuideContext';
import ConvAI from './ConvAI';
import tools from '@/utils/tools';

const { width, height } = Dimensions.get('window');

export const AppGuideAgent: React.FC = () => {
  const { isGuideVisible, isMinimized, minimizeGuide, expandGuide, closeGuide, isListening } = useAppGuide();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the orb
  useEffect(() => {
    if (isListening) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, pulseAnim]);

  // Rotation animation
  useEffect(() => {
    if (isListening) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isListening, rotateAnim]);

  // Glow animation
  useEffect(() => {
    if (isListening) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [isListening, glowAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  if (!isGuideVisible) {
    return null;
  }

  // Always render the modal (expanded view) but hide it when minimized to preserve state
  return (
    <>
      <View style={[styles.container, isMinimized && { display: 'none' }]}>
        <BlurView intensity={80} style={styles.blurView}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Carey - AI Assistant</Text>
              <View style={styles.headerButtons}>
                <Pressable style={styles.minimizeButton} onPress={minimizeGuide}>
                  <Minus size={20} color="#9CA3AF" strokeWidth={2} />
                </Pressable>
                <Pressable style={styles.closeButton} onPress={closeGuide}>
                  <X size={20} color="#9CA3AF" strokeWidth={2} />
                </Pressable>
              </View>
            </View>
            
            {/* Content Area */}
            <View style={styles.content}>
              {/* AI Orb Container */}
              <View style={styles.orbContainer}>
                {/* Outer Glow */}
                <Animated.View 
                  style={[
                    styles.outerGlow,
                    {
                      opacity: glowOpacity,
                      transform: [{ scale: pulseAnim }],
                    }
                  ]}
                >
                  <LinearGradient
                    colors={isListening ? ['#10B981', '#3B82F6', '#8B5CF6'] : ['#6B7280', '#9CA3AF', '#D1D5DB']}
                    style={styles.glowGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </Animated.View>

                {/* Main Orb */}
                <Animated.View 
                  style={[
                    styles.orbWrapper,
                    {
                      transform: [
                        { scale: pulseAnim },
                        { rotate: spin }
                      ],
                    }
                  ]}
                >
                  <LinearGradient
                    colors={isListening 
                      ? ['#10B981', '#059669', '#047857', '#065F46'] 
                      : ['#374151', '#4B5563', '#6B7280', '#9CA3AF']
                    }
                    style={styles.orb}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Inner highlight */}
                    <View style={styles.innerHighlight}>
                      <LinearGradient
                        colors={isListening 
                          ? ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent'] 
                          : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent']
                        }
                        style={styles.highlightGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    </View>
                  </LinearGradient>
                </Animated.View>

                {/* Status Text */}
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>
                    {isListening ? 'Listening...' : 'Tap to speak'}
                  </Text>
                </View>
              </View>

              {/* ConvAI Component (Hidden but functional) */}
              <View style={styles.hiddenConvAI}>
                <ConvAI
                  platform="react-native"
                  patientId="carey-global-assistant"
                  agentId={process.env.EXPO_PUBLIC_ELEVENLABS_CAREY_AGENT_ID}
                  get_battery_level={tools.get_battery_level}
                  change_brightness={tools.change_brightness}
                  flash_screen={tools.flash_screen}
                />
              </View>

              {/* Control Buttons */}
              <View style={styles.controlsContainer}>
                <Pressable style={styles.controlButton}>
                  {isListening ? (
                    <MicOff size={24} color="#EF4444" strokeWidth={2} />
                  ) : (
                    <Mic size={24} color="#10B981" strokeWidth={2} />
                  )}
                </Pressable>
              </View>

              {/* Development Notice */}
              <View style={styles.devNotice}>
                <Text style={styles.devNoticeText}>In-development calls are 50% off.</Text>
                <Pressable>
                  <Text style={styles.learnMoreText}>Learn more.</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Minimized bubble rendered only when minimized */}
      {isMinimized && (
        <Pressable style={styles.minimizedContainer} onPress={expandGuide}>
          <BlurView intensity={80} style={styles.minimizedBlur}>
            <View style={styles.minimizedContent}>
              <View style={styles.minimizedOrb}>
                <LinearGradient
                  colors={isListening ? ['#10B981', '#3B82F6'] : ['#6B7280', '#9CA3AF']}
                  style={styles.minimizedOrbGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
              <Text style={styles.minimizedText}>Carey</Text>
            </View>
          </BlurView>
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modal: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.2)',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minimizeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  outerGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.3,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
  },
  orbWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  orb: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  highlightGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  statusContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  hiddenConvAI: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  devNotice: {
    alignItems: 'center',
    gap: 4,
  },
  devNoticeText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  // Minimized state styles
  minimizedContainer: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    zIndex: 9998,
  },
  minimizedBlur: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  minimizedOrb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  minimizedOrbGradient: {
    width: '100%',
    height: '100%',
  },
  minimizedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
});