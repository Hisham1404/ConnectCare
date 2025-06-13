import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

  // Mock dashboard data
  const [dashboardStats] = useState({
    totalPatients: 12,
    criticalCases: 2,
    stablePatients: 8,
    pendingReviews: 3,
    dailyCheckins: 8,
    activeMonitoring: 5,
  });

  const [patients] = useState([
    {
      id: 'patient-1',
      name: 'Rajesh Kumar',
      age: 58,
      condition: 'Post-Cardiac Surgery',
      priority: 'stable',
      lastCheckin: '2 hours ago',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: {
        heartRate: '72',
        bloodPressure: '120/80',
        temperature: '98.6',
        oxygen: '98',
      },
      recoveryStage: 'Week 2',
      riskScore: 25,
      hasNewCheckin: false,
    },
    {
      id: 'patient-2',
      name: 'Priya Sharma',
      age: 45,
      condition: 'Hip Replacement',
      priority: 'critical',
      lastCheckin: '30 minutes ago',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: {
        heartRate: '88',
        bloodPressure: '140/90',
        temperature: '99.2',
        oxygen: '96',
      },
      recoveryStage: 'Week 1',
      riskScore: 75,
      hasNewCheckin: true,
    },
    {
      id: 'patient-3',
      name: 'Amit Patel',
      age: 62,
      condition: 'Gallbladder Surgery',
      priority: 'moderate',
      lastCheckin: '1 hour ago',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: {
        heartRate: '76',
        bloodPressure: '130/85',
        temperature: '98.8',
        oxygen: '97',
      },
      recoveryStage: 'Week 3',
      riskScore: 45,
      hasNewCheckin: false,
    },
  ]);

  const [todaysAppointments] = useState([
    {
      id: '1',
      patientName: 'Rajesh Kumar',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      id: '2',
      patientName: 'Priya Sharma',
      time: '2:00 PM',
      type: 'Consultation',
      status: 'pending',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      id: '3',
      patientName: 'Amit Patel',
      time: '4:30 PM',
      type: 'Check-up',
      status: 'confirmed',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ]);

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