import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Profile } from '@/types/models';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const { signIn, profile } = useAuth();

  // Clear field errors when user starts typing
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate individual fields
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      default:
        return null;
    }
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    const emailError = validateField('email', email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', password);
    if (passwordError) errors.password = passwordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    // Clear previous errors
    setError('');
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Provide more specific error messages
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Unexpected error during signin:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    try {
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  };

  // Navigate when profile is available
  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'doctor') {
        router.replace('/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [profile]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <FeedbackButton
            onPress={handleBack}
            style={styles.backButton}
          >
            <ArrowLeft color={Colors.textSecondary} size={24} />
          </FeedbackButton>
          
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Heart color={Colors.primary} size={32} fill={Colors.primary} />
            </View>
            <Text style={styles.appName}>ConnectCare AI</Text>
            <Text style={styles.tagline}>Welcome back</Text>
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access your account
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={(value) => {
                  clearFieldError('email');
                  setEmail(value);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.email && (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={(value) => {
                  clearFieldError('password');
                  setPassword(value);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff color={Colors.textSecondary} size={20} />
                ) : (
                  <Eye color={Colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Sign In Button */}
          <FeedbackButton
            onPress={handleSignIn}
            style={[styles.signInButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={Colors.surface} />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </FeedbackButton>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    alignItems: 'center',
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: `${Colors.error}${Colors.opacity.light}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  fieldErrorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});