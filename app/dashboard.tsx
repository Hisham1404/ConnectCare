import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { DatabaseService, Doctor, Patient } from '../lib/database';
import type { RealtimeChannel } from '@supabase/supabase-js';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { router } from 'expo-router';

// Import components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import FooterNavigation from '../components/dashboard/FooterNavigation';
import OverviewTab from '../components/dashboard/tabs/OverviewTab';
import PatientsTab from '../components/dashboard/tabs/PatientsTab';
import MonitoringTab from '../components/dashboard/tabs/MonitoringTab';
import ReportsTab from '../components/dashboard/tabs/ReportsTab';
import SettingsTab from '../components/dashboard/tabs/SettingsTab';

export default function DoctorDashboard() {
  const { profile, switchToPatientMode, error: authError } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPatientForMonitoring, setSelectedPatientForMonitoring] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Initialize state with default values
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    criticalCases: 0,
    stablePatients: 0,
    pendingReviews: 0,
    dailyCheckins: 0,
    activeMonitoring: 0
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);

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
    if (profile) {
      loadDashboardData();
    } else if (!loading && !profile) {
      // If auth loading is complete and there's no profile, redirect to login
      router.replace('/auth/sign-in');
    }
  }, [profile]);

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      setError(`Authentication error: ${authError}`);
      setLoading(false);
    }
  }, [authError]);

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
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading dashboard data for role:', profile.role);

      if (profile.role === 'doctor') {
        // Step 1: Load doctor-specific data
        const doctor = await DatabaseService.getDoctorByProfileId(profile.id);
        
        if (!doctor) {
          setError('Doctor profile not found. Please contact support.');
          setLoading(false);
          return;
        }
        
        setDoctorData(doctor);
        
        // Step 2: Load doctor's patients
        const doctorPatients = await DatabaseService.getPatientsByDoctorId(doctor.id);
        setPatients(doctorPatients);
        
        // Step 3: Set initial patient for monitoring if available
        if (doctorPatients.length > 0 && !selectedPatientForMonitoring) {
          setSelectedPatientForMonitoring(doctorPatients[0].id);
        }
        
        // Step 4: Load dashboard statistics
        const stats = await DatabaseService.getDashboardStats(doctor.id);
        setDashboardStats({
          ...dashboardStats,
          totalPatients: stats.totalPatients || 0,
          criticalCases: stats.criticalCases || 0,
          stablePatients: stats.activeMonitoring || 0,
          pendingReviews: stats.dailyCheckins || 0,
          dailyCheckins: stats.dailyCheckins || 0,
          activeMonitoring: stats.activeMonitoring || 0
        });
        
        console.log('✅ Doctor dashboard data loaded:', {
          patients: doctorPatients.length,
          stats
        });
      } else if (profile.role === 'patient') {
        // Redirect to patient interface if they somehow access doctor dashboard
        Alert.alert(
          'Access Restricted',
          'This dashboard is for healthcare providers only. Redirecting to patient interface.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(tabs)') 
            }
          ]
        );
      } else if (profile.role === 'admin' || profile.role === 'nurse') {
        // For admin/nurse roles, load all patients
        const allPatients = await DatabaseService.getPatientsByDoctorId('');
        setPatients(allPatients);
        
        // Load overall statistics
        const stats = await DatabaseService.getDashboardStats();
        setDashboardStats({
          ...dashboardStats,
          totalPatients: stats.totalPatients || 0,
          criticalCases: stats.criticalCases || 0,
          stablePatients: stats.activeMonitoring || 0,
          pendingReviews: stats.dailyCheckins || 0,
          dailyCheckins: stats.dailyCheckins || 0,
          activeMonitoring: stats.activeMonitoring || 0
        });
      } else {
        setError(`Unsupported user role: ${profile.role}`);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      // Always set loading to false, regardless of success or failure
      setLoading(false);
    }
  };

  const handleNewCheckin = (payload: any) => {
    console.log('🔔 New checkin notification:', payload);
    
    // Update dashboard stats
    setDashboardStats(prev => ({
      ...prev,
      dailyCheckins: (prev.dailyCheckins || 0) + 1
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
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // Show error state if data loading failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Redirect if not a doctor and not an admin/nurse
  if (profile && profile.role !== 'doctor' && profile.role !== 'admin' && profile.role !== 'nurse') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Access Restricted</Text>
        <Text style={styles.errorText}>This dashboard is for healthcare providers only.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.retryButtonText}>Go to Patient Dashboard</Text>
        </TouchableOpacity>
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
            selectedPatientForMonitoring={selectedPatientForMonitoring || ''}
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
        notificationCount={dashboardStats.pendingReviews}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
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