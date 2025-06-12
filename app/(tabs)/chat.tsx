import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MessageCircle, Bot, Zap } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiHeaderAvatar}>
            <Bot color={Colors.accent} size={24} />
          </View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.placeholderContainer}>
          {/* Icon */}
          <View style={styles.placeholderIcon}>
            <MessageCircle color={Colors.accent} size={48} />
          </View>
          
          {/* Title */}
          <Text style={styles.placeholderTitle}>AI Health Assistant</Text>
          
          {/* Subtitle */}
          <Text style={styles.placeholderSubtitle}>
            Coming Soon
          </Text>
          
          {/* Description */}
          <Text style={styles.placeholderDescription}>
            Your AI-powered health assistant will help you with daily check-ins, 
            symptom tracking, and personalized health insights.
          </Text>
          
          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Zap color={Colors.success} size={16} />
              <Text style={styles.featureText}>Voice-powered conversations</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap color={Colors.success} size={16} />
              <Text style={styles.featureText}>Intelligent health monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Zap color={Colors.success} size={16} />
              <Text style={styles.featureText}>Personalized recommendations</Text>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholderContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.accent}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 16,
  },
  placeholderDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    alignSelf: 'stretch',
    gap: 12,
  },
  featureItem: {
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
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
});