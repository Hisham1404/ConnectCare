import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPatientForMonitoring, setSelectedPatientForMonitoring] = useState('patient-1');

  // Mock data
  const [dashboardStats] = useState({
    totalPatients: 12,
    criticalCases: 2,
    stablePatients: 8,
    pendingReviews: 3,
  });

  const [patients] = useState([
    {
      id: 'patient-1',
      name: 'Rajesh Kumar',
      age: 58,
      condition: 'Post-Cardiac Surgery',
      priority: 'critical',
      lastCheckin: '2 hours ago',
      riskScore: 85,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: { heartRate: 95, bloodPressure: '140/90', temperature: 101.2, oxygen: 94 },
      hasNewCheckin: true,
      surgeryDate: '2024-12-05',
      recoveryStage: 'Week 1',
    },
    {
      id: 'patient-2',
      name: 'Priya Sharma',
      age: 45,
      condition: 'Hip Replacement Recovery',
      priority: 'moderate',
      lastCheckin: '4 hours ago',
      riskScore: 45,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: { heartRate: 78, bloodPressure: '125/80', temperature: 98.6, oxygen: 98 },
      hasNewCheckin: false,
      surgeryDate: '2024-12-08',
      recoveryStage: 'Week 2',
    },
    {
      id: 'patient-3',
      name: 'Amit Patel',
      age: 62,
      condition: 'Gallbladder Surgery',
      priority: 'stable',
      lastCheckin: '1 hour ago',
      riskScore: 25,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      vitals: { heartRate: 72, bloodPressure: '120/80', temperature: 98.4, oxygen: 99 },
      hasNewCheckin: true,
      surgeryDate: '2024-12-03',
      recoveryStage: 'Week 2',
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

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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
});