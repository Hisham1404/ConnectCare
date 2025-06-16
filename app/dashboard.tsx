import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, Redirect } from 'expo-router';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { dashboardStats as mockDashboardStats } from '@/mock/data';
import { supabase } from '@/lib/supabase';

// Import components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import FooterNavigation from '../components/dashboard/FooterNavigation';
import OverviewTab from '../components/dashboard/tabs/OverviewTab';
import PatientsTab from '../components/dashboard/tabs/PatientsTab';
import MonitoringTab from '../components/dashboard/tabs/MonitoringTab';
import ReportsTab from '../components/dashboard/tabs/ReportsTab';
import SettingsTab from '../components/dashboard/tabs/SettingsTab';

// Define types for patient data
interface Patient {
  id: string;
  full_name: string;
  email: string;
  role: string;
  doctor_id: string;
  created_at: string;
  updated_at: string;
}

interface TransformedPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  priority: string;
  lastCheckin: string;
  avatar: string;
  vitals: {
    heartRate: string;
    bloodPressure: string;
    temperature: string;
    oxygen: string;
  };
  recoveryStage: string;
  riskScore: number;
  hasNewCheckin: boolean;
}

export default function DoctorDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPatientForMonitoring, setSelectedPatientForMonitoring] = useState('patient-1');
  const [patients, setPatients] = useState<TransformedPatient[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Replace inline mock data with shared fixtures
  const [dashboardStats, setDashboardStats] = useState(mockDashboardStats);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);

  const { user, loading: authLoading } = useAuth();

  // Fetch patients assigned to the logged-in doctor
  const fetchDoctorPatients = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('role', 'patient')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedPatients: TransformedPatient[] = (data || []).map((patient: Patient, index: number) => ({
        id: patient.id,
        name: patient.full_name || 'Unknown Patient',
        age: 35 + (index * 5), // Mock age data - you can enhance this later
        condition: getRandomCondition(index),
        priority: getRandomPriority(index),
        lastCheckin: getRandomLastCheckin(index),
        avatar: `https://images.pexels.com/photos/${2379004 + index}/pexels-photo-${2379004 + index}.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`,
        vitals: getRandomVitals(index),
        recoveryStage: `Week ${index + 1}`,
        riskScore: Math.floor(Math.random() * 100),
        hasNewCheckin: Math.random() > 0.7,
      }));

      return transformedPatients;
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
      setError('Failed to load patients');
      return [];
    }
  };

  // Helper functions to generate mock data (you can enhance these with real data later)
  const getRandomCondition = (index: number) => {
    const conditions = ['Post-Cardiac Surgery', 'Hip Replacement', 'Gallbladder Surgery', 'Knee Surgery', 'Diabetes Management'];
    return conditions[index % conditions.length];
  };

  const getRandomPriority = (index: number) => {
    const priorities = ['stable', 'moderate', 'critical'];
    return priorities[index % priorities.length];
  };

  const getRandomLastCheckin = (index: number) => {
    const checkins = ['2 hours ago', '30 minutes ago', '1 hour ago', '4 hours ago', '1 day ago'];
    return checkins[index % checkins.length];
  };

  const getRandomVitals = (index: number) => {
    const vitalsOptions = [
      { heartRate: '72', bloodPressure: '120/80', temperature: '98.6', oxygen: '98' },
      { heartRate: '88', bloodPressure: '140/90', temperature: '99.2', oxygen: '96' },
      { heartRate: '76', bloodPressure: '130/85', temperature: '98.8', oxygen: '97' },
      { heartRate: '80', bloodPressure: '125/82', temperature: '98.4', oxygen: '99' },
      { heartRate: '75', bloodPressure: '118/78', temperature: '98.7', oxygen: '98' },
    ];
    return vitalsOptions[index % vitalsOptions.length];
  };

  // Generate appointments with real patient names (times and types are hardcoded)
  const generateTodaysAppointments = (patients: TransformedPatient[]) => {
    const appointmentTimes = ['10:30 AM', '2:00 PM', '4:30 PM', '11:00 AM', '3:15 PM'];
    const appointmentTypes = ['Follow-up', 'Consultation', 'Check-up', 'Post-op Review', 'Routine Visit'];
    const appointmentStatuses = ['confirmed', 'pending', 'confirmed', 'confirmed', 'pending'];

    return patients.slice(0, Math.min(patients.length, 5)).map((patient, index) => ({
      id: `appointment-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      time: appointmentTimes[index],
      type: appointmentTypes[index],
      status: appointmentStatuses[index],
      avatar: patient.avatar,
    }));
  };

  // Load data when user is available
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const patientsData = await fetchDoctorPatients(user.id);
        setPatients(patientsData);
        
        // Generate appointments with real patient names
        const appointments = generateTodaysAppointments(patientsData);
        setTodaysAppointments(appointments);
        
        // Update dashboard stats with real patient count
        setDashboardStats(prev => ({
          ...prev,
          totalPatients: patientsData.length,
          criticalCases: patientsData.filter(p => p.priority === 'critical').length,
          stablePatients: patientsData.filter(p => p.priority === 'stable').length,
        }));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  const onRefresh = async () => {
    if (!user?.id) return;

    setRefreshing(true);
    setError(null);

    try {
      const patientsData = await fetchDoctorPatients(user.id);
      setPatients(patientsData);
      
      // Generate appointments with real patient names
      const appointments = generateTodaysAppointments(patientsData);
      setTodaysAppointments(appointments);
      
      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        totalPatients: patientsData.length,
        criticalCases: patientsData.filter(p => p.priority === 'critical').length,
        stablePatients: patientsData.filter(p => p.priority === 'stable').length,
      }));
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const switchToPatientMode = () => {
    console.log('Switching to patient mode');
    // Navigate to patient interface
  };

  // NAVIGATION GUARD: redirect unauthenticated users
  if (!authLoading && !user) {
    return <Redirect href="/(auth)/signin" />;
  }

  // Show loading state while data is being fetched
  if (loading || authLoading) {
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
            error={error}
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