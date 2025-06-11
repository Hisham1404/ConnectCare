import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, Shield, Users, Activity, Brain, Stethoscope, ArrowRight, Star, CircleCheck as CheckCircle, User, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Monitoring',
      description: 'Advanced AI analyzes patient data to provide real-time health insights and early warning systems.',
      color: '#3b82f6',
    },
    {
      icon: Stethoscope,
      title: 'Expert Medical Care',
      description: 'Connect with qualified doctors and healthcare professionals for comprehensive patient care.',
      color: '#10b981',
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with enterprise-grade security and privacy measures.',
      color: '#f59e0b',
    },
    {
      icon: Activity,
      title: '24/7 Monitoring',
      description: 'Continuous health monitoring ensures immediate response to critical health changes.',
      color: '#ef4444',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Cardiologist',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'ConnectCare AI has revolutionized how I monitor my post-surgery patients. The real-time insights are invaluable.',
      rating: 5,
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'General Surgeon',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'The AI analysis helps me identify potential complications early, improving patient outcomes significantly.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Patients Monitored' },
    { number: '500+', label: 'Healthcare Providers' },
    { number: '99.9%', label: 'Uptime Reliability' },
    { number: '24/7', label: 'Support Available' },
  ];

  const demoAccounts = [
    {
      type: 'Doctor Dashboard',
      description: 'View the complete doctor interface with patient monitoring, AI insights, and real-time alerts.',
      icon: Stethoscope,
      color: '#3b82f6',
      route: '/dashboard',
    },
    {
      type: 'Patient Interface',
      description: 'Experience the patient-focused tabs with health monitoring, AI chat, and profile management.',
      icon: User,
      color: '#10b981',
      route: '/(tabs)',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Heart color="#3b82f6" size={40} fill="#3b82f6" />
            </View>
            <Text style={styles.appName}>ConnectCare AI</Text>
            <Text style={styles.tagline}>Remote Patient Monitoring</Text>
          </View>

          <Text style={styles.heroTitle}>
            Revolutionizing Healthcare with{' '}
            <Text style={styles.highlightText}>AI-Powered</Text>{' '}
            Patient Monitoring
          </Text>

          <Text style={styles.heroDescription}>
            Empowering healthcare providers in India with advanced remote monitoring solutions for post-surgery and elderly patient care.
          </Text>

          {/* Demo Access Section */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>🚀 Demo Access Available</Text>
            <Text style={styles.demoSubtitle}>
              Explore the full ConnectCare AI experience with our interactive demos
            </Text>
            
            <View style={styles.demoAccountsContainer}>
              {demoAccounts.map((account, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.demoAccountCard}
                  onPress={() => {
                    console.log(`Navigating to ${account.route}`);
                    router.push(account.route);
                  }}
                >
                  <View style={[styles.demoIcon, { backgroundColor: `${account.color}15` }]}>
                    <account.icon color={account.color} size={24} />
                  </View>
                  <View style={styles.demoAccountInfo}>
                    <Text style={styles.demoAccountType}>{account.type}</Text>
                    <Text style={styles.demoAccountDescription}>{account.description}</Text>
                  </View>
                  <ArrowRight color="#6b7280" size={20} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.credentialsBox}>
              <Text style={styles.credentialsTitle}>📧 Test Credentials</Text>
              <View style={styles.credentialItem}>
                <Text style={styles.credentialLabel}>Email:</Text>
                <Text style={styles.credentialValue}>doctor@connectcare.ai</Text>
              </View>
              <View style={styles.credentialItem}>
                <Text style={styles.credentialLabel}>Password:</Text>
                <Text style={styles.credentialValue}>demo123456</Text>
              </View>
              <Text style={styles.credentialsNote}>
                * Use these credentials when authentication is re-enabled
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Trusted by Healthcare Professionals</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose ConnectCare AI?</Text>
          <Text style={styles.sectionSubtitle}>
            Advanced technology meets compassionate care to deliver exceptional patient monitoring solutions.
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                  <feature.icon color={feature.color} size={28} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>What Healthcare Providers Say</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsContainer}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Image source={{ uri: testimonial.image }} style={styles.testimonialImage} />
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    <View style={styles.ratingContainer}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} color="#f59e0b" size={14} fill="#f59e0b" />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.testimonialQuote}>"{testimonial.quote}"</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Key Benefits</Text>
          <View style={styles.benefitsList}>
            {[
              'Real-time patient health monitoring',
              'AI-powered risk assessment and alerts',
              'Seamless doctor-patient communication',
              'Comprehensive health data analytics',
              'HIPAA-compliant security measures',
              'Mobile-first design for accessibility',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <CheckCircle color="#10b981" size={20} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Final CTA Section */}
        <View style={styles.finalCtaSection}>
          <Text style={styles.finalCtaTitle}>Ready to Explore ConnectCare AI?</Text>
          <Text style={styles.finalCtaDescription}>
            Try our interactive demos to see how ConnectCare AI can transform patient care.
          </Text>
          
          <View style={styles.finalCtaButtons}>
            <TouchableOpacity 
              style={styles.finalCtaButton}
              onPress={() => {
                console.log('Navigating to doctor dashboard');
                router.push('/dashboard');
              }}
            >
              <Stethoscope color="#ffffff" size={20} />
              <Text style={styles.finalCtaButtonText}>Doctor Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.finalCtaButton, styles.secondaryCtaButton]}
              onPress={() => {
                console.log('Navigating to patient interface');
                router.push('/(tabs)');
              }}
            >
              <User color="#3b82f6" size={20} />
              <Text style={[styles.finalCtaButtonText, styles.secondaryCtaButtonText]}>Patient Interface</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.finalCtaNote}>
            No registration required • Full feature access • Interactive demos
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 ConnectCare AI. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Empowering healthcare through technology
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  highlightText: {
    color: '#3b82f6',
  },
  heroDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  demoSection: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  demoAccountsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  demoAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  demoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoAccountInfo: {
    flex: 1,
  },
  demoAccountType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  demoAccountDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  credentialsBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
    textAlign: 'center',
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
    fontFamily: 'monospace',
  },
  credentialsNote: {
    fontSize: 11,
    color: '#16a34a',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    width: (width - 64) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#f8fafc',
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialsSection: {
    paddingVertical: 60,
    backgroundColor: '#ffffff',
  },
  testimonialsContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  testimonialCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    width: width - 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialQuote: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  benefitsSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#f8fafc',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  finalCtaSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  finalCtaDescription: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  finalCtaButtons: {
    width: '100%',
    gap: 16,
    marginBottom: 16,
  },
  finalCtaButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryCtaButton: {
    backgroundColor: '#ffffff',
  },
  finalCtaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryCtaButtonText: {
    color: '#3b82f6',
  },
  finalCtaNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});