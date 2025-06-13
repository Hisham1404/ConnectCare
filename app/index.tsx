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
import * as WebBrowser from 'expo-web-browser';
import { Heart, Shield, Users, Activity, Brain, Stethoscope, ArrowRight, Star, CircleCheck as CheckCircle, User, Calendar } from 'lucide-react-native';
import { Colors, SemanticColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Monitoring',
      description: 'Advanced AI analyzes patient data to provide real-time health insights and early warning systems.',
      color: Colors.accent,
    },
    {
      icon: Stethoscope,
      title: 'Expert Medical Care',
      description: 'Connect with qualified doctors and healthcare professionals for comprehensive patient care.',
      color: Colors.success,
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with enterprise-grade security and privacy measures.',
      color: Colors.warning,
    },
    {
      icon: Activity,
      title: '24/7 Monitoring',
      description: 'Continuous health monitoring ensures immediate response to critical health changes.',
      color: Colors.error,
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
      color: Colors.accent,
      route: '/dashboard',
    },
    {
      type: 'Patient Interface',
      description: 'Experience the patient-focused tabs with health monitoring, AI chat, and profile management.',
      icon: User,
      color: Colors.success,
      route: '/(tabs)',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Bolt.new Badge */}
      <View style={styles.boltBadgeContainer}>
        <TouchableOpacity 
          style={styles.boltBadgeButton}
          onPress={() => {
            WebBrowser.openBrowserAsync('https://bolt.new/');
          }}
        >
          <Image 
            source={{ uri: 'https://storage.bolt.army/black_circle_360x360.png' }}
            style={styles.boltBadgeImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Heart color={Colors.primary} size={40} fill={Colors.primary} />
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
            <View style={styles.demoHeader}>
              <Text style={styles.demoTitle}>🚀 Demo Access Available</Text>
              <Text style={styles.demoBadge}>LIVE DEMO</Text>
            </View>
            <Text style={styles.demoSubtitle}>
              Explore the full ConnectCare AI experience with our interactive demos
            </Text>
            
            <View style={styles.demoAccountsContainer}>
              <TouchableOpacity 
                style={styles.demoAccountCard}
                onPress={() => {
                  console.log('Navigating to doctor dashboard');
                  router.push('/dashboard');
                }}
              >
                <View style={[styles.demoIconContainer, { backgroundColor: `${Colors.accent}${Colors.opacity.light}` }]}>
                  <Stethoscope color={Colors.accent} size={24} />
                </View>
                <View style={styles.demoContentWrapper}>
                  <View style={styles.demoTextContent}>
                    <Text style={styles.demoAccountType}>Doctor Dashboard</Text>
                    <Text style={styles.demoAccountDescription}>
                      Complete doctor interface with patient monitoring, AI insights, and real-time alerts
                    </Text>
                  </View>
                  <View style={styles.demoArrowContainer}>
                    <ArrowRight color={Colors.accent} size={20} />
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.demoAccountCard}
                onPress={() => {
                  console.log('Navigating to patient interface');
                  router.push('/(tabs)');
                }}
              >
                <View style={[styles.demoIconContainer, { backgroundColor: `${Colors.success}${Colors.opacity.light}` }]}>
                  <User color={Colors.success} size={24} />
                </View>
                <View style={styles.demoContentWrapper}>
                  <View style={styles.demoTextContent}>
                    <Text style={styles.demoAccountType}>Patient Interface</Text>
                    <Text style={styles.demoAccountDescription}>
                      Patient-focused experience with health monitoring, AI chat, and profile management
                    </Text>
                  </View>
                  <View style={styles.demoArrowContainer}>
                    <ArrowRight color={Colors.success} size={20} />
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.demoAccountCard}
                onPress={() => {
                  console.log('Navigating to authentication');
                  router.push('/(auth)/signin');
                }}
              >
                <View style={[styles.demoIconContainer, { backgroundColor: `${Colors.primary}${Colors.opacity.light}` }]}>
                  <User color={Colors.primary} size={24} />
                </View>
                <View style={styles.demoContentWrapper}>
                  <View style={styles.demoTextContent}>
                    <Text style={styles.demoAccountType}>Sign In / Sign Up</Text>
                    <Text style={styles.demoAccountDescription}>
                      Create an account or sign in to access personalized features and save your health data
                    </Text>
                  </View>
                  <View style={styles.demoArrowContainer}>
                    <ArrowRight color={Colors.primary} size={20} />
                  </View>
                </View>
              </TouchableOpacity>
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
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}${Colors.opacity.light}` }]}>
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
                        <Star key={i} color={Colors.warning} size={14} fill={Colors.warning} />
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
                <CheckCircle color={Colors.success} size={20} />
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
              <User color={Colors.accent} size={20} />
              <Text style={[styles.finalCtaButtonText, styles.secondaryCtaButtonText]}>Patient Interface</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.finalCtaButton, styles.tertiaryCtaButton]}
              onPress={() => {
                console.log('Navigating to authentication');
                router.push('/(auth)/signin');
              }}
            >
              <User color={Colors.primary} size={20} />
              <Text style={[styles.finalCtaButtonText, styles.tertiaryCtaButtonText]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.finalCtaNote}>
            Explore all features • No registration required • Full demo access
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
    backgroundColor: Colors.surface,
  },
  boltBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 50,
  },
  boltBadgeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  boltBadgeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  highlightText: {
    color: Colors.primary,
  },
  heroDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  demoSection: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: `${Colors.primary}${Colors.opacity.light}`,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  demoBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  demoSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  demoAccountsContainer: {
    gap: 16,
  },
  demoAccountCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.medium}`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  demoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  demoContentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  demoTextContent: {
    flex: 1,
  },
  demoArrowContainer: {
    marginTop: 2,
    padding: 4,
  },
  demoAccountType: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  demoAccountDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: (width - 64) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: Colors.background,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialsSection: {
    paddingVertical: 60,
    backgroundColor: Colors.surface,
  },
  testimonialsContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  testimonialCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 24,
    width: width - 80,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  testimonialRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  testimonialQuote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  benefitsSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: Colors.background,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
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
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  finalCtaSection: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalCtaDescription: {
    fontSize: 16,
    color: `${Colors.surface}${Colors.opacity.heavy}`,
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
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryCtaButton: {
    backgroundColor: Colors.surface,
  },
  finalCtaButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryCtaButtonText: {
    color: Colors.accent,
  },
  tertiaryCtaButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tertiaryCtaButtonText: {
    color: Colors.primary,
  },
  finalCtaNote: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});