import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, Redirect } from 'expo-router';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { dashboardStats as mockDashboardStats, patients as mockPatients, todaysAppointments as mockTodaysAppointments } from '@/mock/data';

// Import components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import FooterNavigation from '../components/dashboard/FooterNavigation';
import OverviewTab from '../components/dashboard/tabs/OverviewTab';
import PatientsTab from '../components/dashboard/tabs/PatientsTab';
import MonitoringTab from '../components/dashboard/tabs/MonitoringTab';
import ReportsTab from '../components/dashboard/tabs/ReportsTab';
import SettingsTab from '../components/dashboard/tabs/SettingsTab';

export default function DoctorDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPatientForMonitoring, setSelectedPatientForMonitoring] = useState('patient-1');

  // Mock profile data
  const mockProfile = {
    id: 'demo-doctor-id',
    email: 'doctor@connectcare.ai',
    full_name: 'Dr. Rajesh Kumar',
    phone: '+91 98765 43210',
    role: 'doctor',
    avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  };

  // Replace inline mock data with shared fixtures
  const [dashboardStats] = useState(mockDashboardStats);
  const [patients] = useState(mockPatients);
  const [todaysAppointments] = useState(mockTodaysAppointments);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const switchToPatientMode = () => {
    console.log('Switching to patient mode');
    // Navigate to patient interface
  };

  // NAVIGATION GUARD: redirect unauthenticated users
  const { user, loading: authLoading } = useAuth();
  if (!authLoading && !user) {
    return <Redirect href="/(auth)/signin" />;
  }

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            dashboardStats={dashboardStats}
            todaysAppointments={todaysAppointments}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        );
      case 'patients':
        return (
          <PatientsTab
            patients={patients}
            searchQuery={searchQuery}
            selectedFilter={selectedFilter}
            refreshing={refreshing}
            onSearchChange={setSearchQuery}
            onFilterChange={setSelectedFilter}
            onRefresh={onRefresh}
          />
        );
      case 'monitoring':
        return (
          <MonitoringTab
            patients={patients}
            isMonitoring={isMonitoring}
            selectedPatientForMonitoring={selectedPatientForMonitoring}
            refreshing={refreshing}
            onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
            onSelectPatient={setSelectedPatientForMonitoring}
            onRefresh={onRefresh}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        );
      default:
        return (
          <OverviewTab
            dashboardStats={dashboardStats}
            todaysAppointments={todaysAppointments}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <DashboardHeader
        profile={mockProfile}
        onSwitchMode={switchToPatientMode}
        notificationCount={dashboardStats.pendingReviews}
        showBackButton={true}
        onBackPress={() => router.replace('/')}
      />

      <View style={styles.mainContent}>
        {renderTabContent()}
      </View>

      <FooterNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});