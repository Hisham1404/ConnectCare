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
} from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Stethoscope } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DoctorSearchInput from '../../components/ui/DoctorSearchInput';

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    doctorId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');

  const { signUp, profile } = useAuth();

  // Clear errors when user starts typing
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
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return null;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) return 'Password must contain both uppercase and lowercase letters';
        return null;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return null;
      default:
        return null;
    }
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // Validate all required fields
    const fullNameError = validateField('fullName', formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;
    
    const emailError = validateField('email', formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', formData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    // Clear previous errors
    setError('');
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    const { fullName, email, password, doctorId } = formData;

    setLoading(true);

    console.log('📝 Form data before signup:', formData);
    console.log('👤 User role:', userRole);
    console.log('🆔 Doctor ID from form:', doctorId);

    const profileData: any = {
      full_name: fullName,
      role: userRole,
    };

    // Only add doctor_id for patients and only if provided
    if (userRole === 'patient' && doctorId.trim()) {
      profileData.doctor_id = doctorId.trim();
      console.log('✅ Added doctor_id to profile data:', doctorId.trim());
    } else {
      console.log('❌ Doctor ID not added. Role:', userRole, 'Doctor ID:', doctorId);
    }

    console.log('📊 Final profile data:', profileData);

    try {
      const { error } = await signUp(email, password, profileData);

      if (error) {
        // Provide more specific error messages
        let errorMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('doctor_id')) {
          errorMessage = 'Doctor with that Reference ID was not found. Please check the ID or leave it blank to assign later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
        
        setError(errorMessage);
      } else {
        // Show success message and navigate
        router.replace('/(auth)/signin?checkEmail=true');
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      if (profile.role === 'doctor') {
        router.replace('/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [profile]);

  const updateFormData = (field: string, value: string) => {
    // Clear field error when user starts typing
    clearFieldError(field);
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    try {
      // @ts-ignore expo-router exposes canGoBack in v5
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  };

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
            <Text style={styles.tagline}>Join our healthcare community</Text>
          </View>
        </View>

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Fill in your information to get started
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>I am a</Text>
            <View style={styles.roleContainer}>
              <FeedbackButton
                onPress={() => setUserRole('patient')}
                style={[
                  styles.roleButton,
                  userRole === 'patient' && styles.activeRoleButton
                ]}
              >
                <Text style={[
                  styles.roleButtonText,
                  userRole === 'patient' && styles.activeRoleButtonText
                ]}>
                  Patient
                </Text>
              </FeedbackButton>
              <FeedbackButton
                onPress={() => setUserRole('doctor')}
                style={[
                  styles.roleButton,
                  userRole === 'doctor' && styles.activeRoleButton
                ]}
              >
                <Text style={[
                  styles.roleButtonText,
                  userRole === 'doctor' && styles.activeRoleButtonText
                ]}>
                  Healthcare Provider
                </Text>
              </FeedbackButton>
            </View>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <User color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textTertiary}
                value={formData.fullName}
                onChangeText={(value) => updateFormData('fullName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {fieldErrors.fullName && (
              <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
            )}
          </View>

          {/* Doctor Search Input - Only for Patients */}
          {userRole === 'patient' && (
            <View style={[styles.inputContainer, styles.doctorSearchContainer]}>
              <Text style={styles.inputLabel}>Find Your Doctor (Optional)</Text>
              <DoctorSearchInput
                value={formData.doctorId}
                onValueChange={(value) => updateFormData('doctorId', value)}
                onDoctorSelect={(doctor) => {
                      console.log('Selected doctor:', doctor);
    console.log('Setting doctorId to:', doctor.id);
    updateFormData('doctorId', doctor.id);
                }}
                placeholder="Search by doctor name, email, or ID..."
              />
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Mail color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textTertiary}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
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
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputWrapper}>
              <Lock color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={Colors.textTertiary}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.inputWrapper}>
              <Lock color={Colors.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={Colors.textTertiary}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff color={Colors.textSecondary} size={20} />
                ) : (
                  <Eye color={Colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {fieldErrors.confirmPassword && (
              <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <FeedbackButton
            onPress={handleSignUp}
            style={[styles.signUpButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={Colors.surface} />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </FeedbackButton>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/(auth)/signin" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign In</Text>
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
  doctorSearchContainer: {
    marginBottom: 40, // Extra space for dropdown
    zIndex: 1000,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  activeRoleButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeRoleButtonText: {
    color: Colors.surface,
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
  termsContainer: {
    marginBottom: 32,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
  signUpButton: {
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
  signUpButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  signInText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
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