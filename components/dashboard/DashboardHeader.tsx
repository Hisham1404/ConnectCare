import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, User, ArrowLeft } from 'lucide-react-native';
import FeedbackButton from '../ui/FeedbackButton';

interface DashboardHeaderProps {
  profile: any;
  onSwitchMode: () => void;
  notificationCount?: number;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function DashboardHeader({ 
  profile, 
  onSwitchMode, 
  notificationCount = 0,
  showBackButton = false,
  onBackPress
}: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <FeedbackButton
          onPress={onBackPress || (() => {})}
          style={styles.backButton}
        >
          <ArrowLeft color="#6b7280" size={24} />
        </FeedbackButton>
      )}
      
      <View style={styles.headerLeft}>
        <Image 
          source={{ uri: profile?.avatar_url }} 
          style={styles.avatar} 
        />
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.doctorName}>{profile?.full_name}</Text>
          <Text style={styles.specialization}>Cardiothoracic Surgeon</Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell color="#6b7280" size={24} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.switchModeButton}
          onPress={onSwitchMode}
        >
          <User color="#3b82f6" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  specialization: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  switchModeButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  },
});