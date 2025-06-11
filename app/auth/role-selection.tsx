import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Stethoscope, User, ArrowLeft, ArrowRight, Heart, Activity, Users, Shield } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import FeedbackButton from '../../components/ui/FeedbackButton';

const { width } = Dimensions.get('window');

type UserRole = 'doctor' | 'patient' | null;

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const roles = [
    {
      id: 'doctor' as const,
      title: 'Healthcare Provider',
      subtitle: 'Doctor, Nurse, or Medical Professional',
      description: 'Monitor patients remotely, receive AI-powered insights, and manage patient care efficiently.',
      icon: Stethoscope,
      color: Colors.accent,
      features: [
        'Patient monitoring dashboard',
        'AI-powered health insights',
        'Real-time alerts and notifications',
        'Secure communication tools',
      ],
    },
    {
      id: 'patient' as const,
      title: 'Patient',
      subtitle: 'Individual seeking healthcare monitoring',
      description: 'Stay connected with your healthcare team and track your health progress with AI assistance.',
      icon: User,
      color: Colors.success,
      features: [
        'Daily health check-ins',
        'Voice-powered health reporting',
        'Progress tracking and insights',
        'Direct communication with doctors',
      ],
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      router.push({
        pathname: '/auth/sign-up',
        params: { role: selectedRole },
      });
    }
  };

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
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Role</Text>
          <Text style={styles.headerSubtitle}>
            Select how you'll be using ConnectCare AI
          </Text>
        </View>
      </View>

      {/* Role Cards */}
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <FeedbackButton
            key={role.id}
            onPress={() => setSelectedRole(role.id)}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.selectedRoleCard,
            ]}
            scaleEffect={true}
          >
            <View style={styles.roleCardHeader}>
              <View style={[
                styles.roleIcon,
                { backgroundColor: `${role.color}${Colors.opacity.light}` },
                selectedRole === role.id && { backgroundColor: role.color },
              ]}>
                <role.icon 
                  color={selectedRole === role.id ? Colors.surface : role.color} 
                  size={32} 
                />
              </View>
              
              {selectedRole === role.id && (
                <View style={styles.selectedIndicator}>
                  <Heart color={Colors.surface} size={16} fill={Colors.surface} />
                </View>
              )}
            </View>

            <View style={styles.roleCardContent}>
              <Text style={[
                styles.roleTitle,
                selectedRole === role.id && styles.selectedRoleTitle,
              ]}>
                {role.title}
              </Text>
              <Text style={[
                styles.roleSubtitle,
                selectedRole === role.id && styles.selectedRoleSubtitle,
              ]}>
                {role.subtitle}
              </Text>
              <Text style={[
                styles.roleDescription,
                selectedRole === role.id && styles.selectedRoleDescription,
              ]}>
                {role.description}
              </Text>

              <View style={styles.featuresContainer}>
                {role.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={[
                      styles.featureDot,
                      { backgroundColor: selectedRole === role.id ? Colors.surface : role.color },
                    ]} />
                    <Text style={[
                      styles.featureText,
                      selectedRole === role.id && styles.selectedFeatureText,
                    ]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </FeedbackButton>
        ))}
      </View>

      {/* Continue Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedRole && styles.continueButtonActive,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={[
            styles.continueButtonText,
            selectedRole && styles.continueButtonTextActive,
          ]}>
            Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'User'}
          </Text>
          {selectedRole && <ArrowRight color={Colors.surface} size={20} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={styles.signInButtonText}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 20,
  },
  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedRoleCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCardContent: {
    gap: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  selectedRoleTitle: {
    color: Colors.surface,
  },
  roleSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectedRoleSubtitle: {
    color: `${Colors.surface}${Colors.opacity.heavy}`,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  selectedRoleDescription: {
    color: `${Colors.surface}${Colors.opacity.heavy}`,
  },
  featuresContainer: {
    marginTop: 8,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedFeatureText: {
    color: `${Colors.surface}${Colors.opacity.heavy}`,
  },
  actionSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  continueButton: {
    backgroundColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    color: Colors.textTertiary,
    fontSize: 16,
    fontWeight: '700',
  },
  continueButtonTextActive: {
    color: Colors.surface,
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
});