import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TrendingUp, Users, Monitor, FileText, Settings } from 'lucide-react-native';

interface FooterNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function FooterNavigation({ activeTab, onTabChange }: FooterNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'monitoring', label: 'Monitor', icon: Monitor },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <tab.icon 
            color={activeTab === tab.id ? '#3b82f6' : '#6b7280'} 
            size={20} 
          />
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});