import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Dimensions,
} from 'react-native';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, CreditCard as Edit3, Award, Activity, Users, Calendar, ChevronRight, Star, TrendingUp, Heart, Pill, FileText, Phone, MapPin, Clock, Target, Zap, Download, Share, Camera, CircleCheck as CheckCircle, Stethoscope, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  // Mock profile data
  const mockProfile = {
    id: 'demo-patient-id',
    email: 'patient@connectcare.ai',
    full_name: 'Rajesh Kumar',
    phone: '+91 98765 43220',
    role: 'patient',
    avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  };

  // Patient-specific data
  const healthStats = [
    { label: 'Recovery Progress', value: '85%', icon: TrendingUp, color: '#10b981' },
    { label: 'Medication Adherence', value: '94%', icon: Pill, color: '#3b82f6' },
    { label: 'Check-ins Completed', value: '28/30', icon: CheckCircle, color: '#f59e0b' },
    { label: 'Days Since Surgery', value: '12', icon: Calendar, color: '#8b5cf6' },
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Daily Check-in Completed',
      description: 'Pain level: 3/10, Vitals stable',
      time: '2 hours ago',
      icon: Heart,
      color: '#10b981',
    },
    {
      id: '2',
      title: 'Medication Taken',
      description: 'Metoprolol 50mg - Morning dose',
      time: '4 hours ago',
      icon: Pill,
      color: '#3b82f6',
    },
    {
      id: '3',
      title: 'Doctor Message',
      description: 'Recovery progress looks excellent',
      time: '1 day ago',
      icon: FileText,
      color: '#f59e0b',
    },
    {
      id: '4',
      title: 'Exercise Completed',
      description: '20-minute walk, HR avg: 78 BPM',
      time: '2 days ago',
      icon: Activity,
      color: '#8b5cf6',
    },
  ];

  const healthGoals = [
    {
      id: '1',
      title: 'Daily Walking',
      progress: 85,
      target: '20 minutes',
      current: '17 minutes',
      color: '#10b981',
    },
    {
      id: '2',
      title: 'Medication Compliance',
      progress: 94,
      target: '100%',
      current: '94%',
      color: '#3b82f6',
    },
    {
      id: '3',
      title: 'Weight Management',
      progress: 70,
      target: '75 kg',
      current: '78 kg',
      color: '#f59e0b',
    },
  ];

  const quickActions = [
    { icon: Camera, label: 'Update Photo', color: '#3b82f6' },
    { icon: Download, label: 'Export Data', color: '#10b981' },
    { icon: Share, label: 'Share Progress', color: '#f59e0b' },
    { icon: Phone, label: 'Emergency Call', color: '#ef4444' },
  ];

  const handleSwitchToDoctorDashboard = () => {
    router.push('/dashboard');
  };

  const menuItems = [
    { icon: Stethoscope, label: 'Switch to Doctor Dashboard', color: '#3b82f6', hasArrow: true, onPress: handleSwitchToDoctorDashboard },
    { icon: Edit3, label: 'Edit Profile', color: '#3b82f6', hasArrow: true },
    { icon: FileText, label: 'Medical Records', color: '#10b981', hasArrow: true },
    { icon: Pill, label: 'Medications', color: '#f59e0b', hasArrow: true },
    { icon: Activity, label: 'Health Data', color: '#8b5cf6', hasArrow: true },
    { icon: Bell, label: 'Notifications', color: '#ef4444', hasArrow: true },
    { icon: Shield, label: 'Privacy & Security', color: '#6b7280', hasArrow: true },
    { icon: Settings, label: 'App Settings', color: '#374151', hasArrow: true },
    { icon: HelpCircle, label: 'Help & Support', color: '#06b6d4', hasArrow: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={handleSwitchToDoctorDashboard}
          >
            <Stethoscope color="#3b82f6" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 color="#3b82f6" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: mockProfile?.avatar_url }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{mockProfile?.full_name}</Text>
          <Text style={styles.profileRole}>
            {mockProfile?.role?.charAt(0).toUpperCase() + mockProfile?.role?.slice(1)}
          </Text>
          
          <View style={styles.profileDetails}>
            <View style={styles.profileDetailItem}>
              <MapPin color="#6b7280" size={14} />
              <Text style={styles.profileDetailText}>Mumbai, Maharashtra</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <Calendar color="#6b7280" size={14} />
              <Text style={styles.profileDetailText}>Age 49</Text>
            </View>
            <View style={styles.profileDetailItem}>
              <Clock color="#6b7280" size={14} />
              <Text style={styles.profileDetailText}>12 days post-surgery</Text>
            </View>
          </View>
          
          <View style={styles.healthStatusBadge}>
            <Heart color="#10b981" size={16} />
            <Text style={styles.healthStatusText}>Recovery on track</Text>
          </View>
        </View>
      </View>

      {/* Health Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Overview</Text>
        <View style={styles.statsGrid}>
          {healthStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                <stat.icon color={stat.color} size={20} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Health Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        {healthGoals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalProgress}>{goal.progress}%</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View 
                style={[
                  styles.goalProgressFill,
                  { width: `${goal.progress}%`, backgroundColor: goal.color }
                ]} 
              />
            </View>
            <View style={styles.goalDetails}>
              <Text style={styles.goalCurrent}>{goal.current}</Text>
              <Text style={styles.goalTarget}>Target: {goal.target}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: `${activity.color}15` }]}>
              <activity.icon color={activity.color} size={20} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                <action.icon color={action.color} size={20} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#10b98115' }]}>
              <Bell color="#10b981" size={20} />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#3b82f615' }]}>
              <Pill color="#3b82f6" size={20} />
            </View>
            <Text style={styles.settingLabel}>Medication Reminders</Text>
          </View>
          <Switch
            value={medicationReminders}
            onValueChange={setMedicationReminders}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#ef444415' }]}>
              <Zap color="#ef4444" size={20} />
            </View>
            <Text style={styles.settingLabel}>Emergency Alerts</Text>
          </View>
          <Switch
            value={emergencyAlerts}
            onValueChange={setEmergencyAlerts}
            trackColor={{ false: '#e5e7eb', true: '#ef4444' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings & Support</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <item.icon color={item.color} size={20} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            {item.hasArrow && <ChevronRight color="#d1d5db" size={20} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>ConnectCare AI v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dashboardButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 16,
  },
  profileDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileDetailText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  healthStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  healthStatusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalCurrent: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
  },
  goalTarget: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 40,
  },
});