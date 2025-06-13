import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Bell, Users, Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

interface SettingsTabProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function SettingsTab({ refreshing, onRefresh }: SettingsTabProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      router.replace('/');
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Settings & Configuration</Text>
      
      <View style={styles.settingCard}>
        <Bell color="#3b82f6" size={24} />
        <Text style={styles.settingTitle}>Alert Thresholds</Text>
        <Text style={styles.settingDescription}>Configure patient monitoring alerts</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Configure</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingCard}>
        <Users color="#10b981" size={24} />
        <Text style={styles.settingTitle}>Team Management</Text>
        <Text style={styles.settingDescription}>Manage healthcare team access</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingCard}>
        <Settings color="#6b7280" size={24} />
        <Text style={styles.settingTitle}>System Preferences</Text>
        <Text style={styles.settingDescription}>General application settings</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Configure</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.settingCard, { borderColor: '#ef4444' }]}> 
        <LogOut color="#ef4444" size={24} />
        <Text style={styles.settingTitle}>Sign Out</Text>
        <Text style={styles.settingDescription}>Log out of your account</Text>
        <TouchableOpacity style={[styles.settingButton, { backgroundColor: '#ef4444' }]} onPress={handleSignOut}>
          <Text style={styles.settingButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 16,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  settingButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});