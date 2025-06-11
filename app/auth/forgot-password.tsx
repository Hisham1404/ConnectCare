import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Mail, Heart, CheckCircle } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import FeedbackButton from '../../components/ui/FeedbackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://your-app-url.com/auth/reset-password',
      });

      if (error) {
        setError(error.message);
        return;
      }

      setEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <View style={styles.header}>
          <FeedbackButton
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color={Colors.textSecondary} size={24} />
          </FeedbackButton>
        </View>

        {/* Success Content */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle color={Colors.success} size={64} />
          </View>
          
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successDescription}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          
          <Text style={styles.instructionsText}>
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </Text>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.resendButtonText}>Resend Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToSignInButton}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={styles.backToSignInText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <FeedbackButton
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={Colors.textSecondary} size={24} />
        </FeedbackButton>
        
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Heart color={Colors.primary} size={24} fill={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email address and we'll send you a link to reset your password
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={[styles.inputContainer, error && styles.inputError]}>
            <Mail color={Colors.textSecondary} size={20} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color={Colors.surface} />
          ) : (
            <Text style={styles.resetButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={styles.signInButtonText}>
            Remember your password? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  inputGroup: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    gap: 12,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  signInButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  // Success styles
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  resendButton: {
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resendButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  backToSignInButton: {
    paddingVertical: 12,
  },
  backToSignInText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});