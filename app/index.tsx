import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, ArrowRight, Shield, Users, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const badgeAnim = useRef(new Animated.Value(0.1)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Badge intro animation with delay
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(badgeAnim, {
          toValue: 1.1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(badgeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start pulse animation after intro
        startPulseAnimation();
      });
    }, 1000);
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgePulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleGetStarted = () => {
    router.push('/(auth)/signin');
  };

  const handleBoltBadgePress = () => {
    if (Platform.OS === 'web') {
      window.open('https://bolt.new/', '_blank');
    } else {
      Linking.openURL('https://bolt.new/');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Bolt.new Badge */}
      <Animated.View 
        style={[
          styles.boltBadgeContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(badgeAnim, badgePulseAnim) }
            ]
          }
        ]}
      >
        <TouchableOpacity
          onPress={handleBoltBadgePress}
          style={styles.boltBadgeButton}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: 'https://storage.bolt.army/black_circle_360x360.png' }}
            style={styles.boltBadgeImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Heart color="#FF6B6B" size={32} fill="#FF6B6B" />
            </View>
            <Text style={styles.logoText}>ConnectCare AI</Text>
          </View>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <Text style={styles.heroHeadline}>
              Healthcare that{'\n'}
              <Text style={styles.heroAccent}>understands you</Text>
            </Text>
            
            <Text style={styles.heroSubheading}>
              Experience personalized healthcare with AI-powered insights, 
              seamless patient monitoring, and compassionate care that adapts to your needs.
            </Text>

            {/* CTA Button */}
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8E8E']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Trust Indicators */}
            <View style={styles.trustIndicators}>
              <Text style={styles.trustText}>Trusted by 10,000+ patients</Text>
              <View style={styles.trustDots}>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={styles.trustDot} />
                ))}
              </View>
            </View>
          </View>

          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View 
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.featuresTitle}>Why choose ConnectCare AI?</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Zap color="#4ECDC4" size={24} />
              </View>
              <Text style={styles.featureTitle}>AI-Powered Insights</Text>
              <Text style={styles.featureDescription}>
                Advanced algorithms provide personalized health recommendations and early warning systems.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Shield color="#4ECDC4" size={24} />
              </View>
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureDescription}>
                Bank-level encryption ensures your health data remains completely private and secure.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Users color="#4ECDC4" size={24} />
              </View>
              <Text style={styles.featureTitle}>Expert Care Team</Text>
              <Text style={styles.featureDescription}>
                Connect with certified healthcare professionals available 24/7 for your needs.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Social Proof */}
        <Animated.View 
          style={[
            styles.socialProofSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.socialProofQuote}>
            "ConnectCare AI transformed how I manage my health. The personalized insights are incredible."
          </Text>
          <View style={styles.socialProofAuthor}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
              }}
              style={styles.authorAvatar}
            />
            <View>
              <Text style={styles.authorName}>Sarah Chen</Text>
              <Text style={styles.authorTitle}>Patient since 2023</Text>
            </View>
          </View>
        </Animated.View>

        {/* Final CTA */}
        <Animated.View 
          style={[
            styles.finalCtaSection,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.finalCtaTitle}>Ready to transform your healthcare?</Text>
          <TouchableOpacity 
            style={styles.finalCtaButton}
            onPress={handleGetStarted}
            activeOpacity={0.9}
          >
            <Text style={styles.finalCtaText}>Start Your Journey</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  boltBadgeContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 60,
    right: 16,
    zIndex: 50,
  },
  boltBadgeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: Platform.OS === 'web' ? 56 : 40,
  },
  boltBadgeImage: {
    width: Platform.OS === 'web' ? 112 : 80,
    height: Platform.OS === 'web' ? 112 : 80,
    borderRadius: Platform.OS === 'web' ? 56 : 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 60 : 80,
    paddingBottom: 80,
    minHeight: height * 0.9,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: -0.5,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 60,
  },
  heroHeadline: {
    fontSize: width > 768 ? 56 : 42,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: width > 768 ? 64 : 48,
    marginBottom: 24,
    letterSpacing: -1,
  },
  heroAccent: {
    color: '#FF6B6B',
  },
  heroSubheading: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 480,
    fontWeight: '400',
  },
  ctaButton: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  trustIndicators: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 8,
    fontWeight: '500',
  },
  trustDots: {
    flexDirection: 'row',
    gap: 6,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
  },
  heroImageContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  heroImage: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(77, 205, 196, 0.1)',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
  },
  featuresTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: -0.5,
  },
  featuresGrid: {
    gap: 32,
  },
  featureCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  socialProofSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
  },
  socialProofQuote: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 32,
    maxWidth: 480,
    fontStyle: 'italic',
  },
  socialProofAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  authorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  authorTitle: {
    fontSize: 14,
    color: '#718096',
  },
  finalCtaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  finalCtaButton: {
    backgroundColor: '#2D3748',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2D3748',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  finalCtaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});