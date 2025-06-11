import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Activity, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  targetArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ConnectCare AI',
    description: 'Your personal health companion that helps you stay connected with your healthcare team and monitor your recovery progress.',
    icon: Heart,
  },
  {
    id: 'dashboard',
    title: 'Your Health Dashboard',
    description: 'Track your recovery progress, medications, and upcoming appointments all in one place. The dashboard gives you a complete overview of your health status.',
    icon: Activity,
  },
  {
    id: 'checkin',
    title: 'Daily Check-ins',
    description: 'Complete daily health check-ins using voice or text. Our AI analyzes your responses and provides insights to your healthcare team.',
    icon: MessageCircle,
  },
  {
    id: 'health',
    title: 'Health Tracking',
    description: 'Monitor your vital signs, view trends, and track your health goals. All your health data is visualized in easy-to-understand charts.',
    icon: Activity,
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Manage your personal information, view your medical history, and customize your app settings for the best experience.',
    icon: User,
  },
];

export default function OnboardingOverlay({ visible, onComplete, onSkip }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnimation, slideAnimation]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  const slideTranslateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnimation }]}>
        {/* Background Blur */}
        <View style={styles.background} />
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <X color={Colors.surface} size={24} />
        </TouchableOpacity>

        {/* Content Container */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnimation,
              transform: [{ translateY: slideTranslateY }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <IconComponent color={Colors.primary} size={48} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.activeDot,
                  index < currentStep && styles.completedDot,
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, styles.secondaryButton]}
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft 
                color={currentStep === 0 ? Colors.textTertiary : Colors.textSecondary} 
                size={20} 
              />
              <Text style={[
                styles.navButtonText,
                styles.secondaryButtonText,
                currentStep === 0 && styles.disabledText
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={[styles.navButtonText, styles.primaryButtonText]}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              {currentStep < onboardingSteps.length - 1 && (
                <ChevronRight color={Colors.surface} size={20} />
              )}
            </TouchableOpacity>
          </View>

          {/* Skip Text */}
          <TouchableOpacity style={styles.skipTextButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip tour</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  contentContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    width: width - 40,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${Colors.textTertiary}${Colors.opacity.medium}`,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  completedDot: {
    backgroundColor: Colors.success,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: Colors.surface,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  skipTextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});