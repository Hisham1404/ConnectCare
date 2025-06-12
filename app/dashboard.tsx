import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { DatabaseService } from '../lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
  const { profile, switchToPatientMode } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPatientForMonitoring, setSelectedPatientForMonitoring] = useState('patient-1');
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Real data state
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 12,
    criticalCases: 2,
    stablePatients: 8,
    pendingReviews: 3,
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [doctorData, setDoctorData] = useState<any>(null);

  const [todaysAppointments, setTodaysAppointments] = useState([
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

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  // Set up real-time subscriptions for doctors
  useEffect(() => {
    if (profile?.role === 'doctor' && doctorData?.id) {
      console.log('🔔 Setting up real-time subscription for doctor:', doctorData.id);
      
      const channel = DatabaseService.subscribeToCheckins(
        doctorData.id,
        handleNewCheckin
      );
      
      setRealtimeChannel(channel);
      
      // Cleanup subscription on unmount
      return () => {
        if (channel) {
          DatabaseService.unsubscribeFromCheckins(channel);
        }
      };
    }
  }, [doctorData]);

  const loadDashboardData = async () => {
    if (!profile) {
      console.log('No profile available, skipping data load');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading dashboard data for role:', profile.role);

      if (profile.role === 'doctor') {
        // Load doctor-specific data
        const doctor = await DatabaseService.getDoctorByProfileId(profile.id);
        if (doctor) {
          setDoctorData(doctor);
          
          // Load doctor's patients
          const doctorPatients = await DatabaseService.getPatientsByDoctorId(doctor.id);
          setPatients(doctorPatients);
          
          // Load dashboard statistics
          const stats = await DatabaseService.getDashboardStats(doctor.id);
          setDashboardStats(stats);
          
          console.log('✅ Doctor dashboard data loaded:', {
            patients: doctorPatients.length,
            stats
          });
        } else {
          setError('Doctor profile not found. Please contact support.');
        }
      } else if (profile.role === 'patient') {
        // Load patient-specific data
        const patient = await DatabaseService.getPatientById(profile.id);
        if (patient) {
          // For patients, we might want to show their own data
          setPatients([patient]);
          
          // Load patient's recent checkins
          const recentCheckins = await DatabaseService.getRecentCheckins(patient.id);
          console.log('✅ Patient data loaded:', {
            checkins: recentCheckins.length
          });
        } else {
          setError('Patient profile not found. Please contact support.');
        }
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCheckin = (payload: any) => {
    console.log('🔔 New checkin notification:', payload);
    
    // Update dashboard stats
    setDashboardStats(prev => ({
      ...prev,
      dailyCheckins: prev.dailyCheckins + 1
    }));
    
    // You could also show a notification to the user here
    // For example, using a toast notification or updating a notification badge
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  // Show error state if data loading failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTabContent = () => {
    // Conditionally render based on user role
    const userRole = profile?.role || 'patient';
    
    switch (activeTab) {
      case 'overview':
        if (userRole === 'patient') {
          // For patients, show their own overview
          return (
            <OverviewTab
              dashboardStats={{
                totalPatients: 1,
                criticalCases: 0,
                stablePatients: 1,
                pendingReviews: 0
              }}
              todaysAppointments={todaysAppointments}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          );
        }
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
        profile={profile}
        onSwitchMode={switchToPatientMode}
        notificationCount={3}
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});