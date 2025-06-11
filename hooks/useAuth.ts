import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Mock profile data for demo purposes
const mockDoctorProfile = {
  id: 'demo-doctor-id',
  email: 'doctor@connectcare.ai',
  full_name: 'Dr. Rajesh Kumar',
  phone: '+91 98765 43210',
  role: 'doctor' as const,
  avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  date_of_birth: '1980-05-15',
  address: 'Mumbai, Maharashtra, India',
  emergency_contact_name: 'Dr. Priya Sharma',
  emergency_contact_phone: '+91 98765 43211',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPatientProfile = {
  id: 'demo-patient-id',
  email: 'patient@connectcare.ai',
  full_name: 'John',
  phone: '+91 98765 43212',
  role: 'patient' as const,
  avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  date_of_birth: '1975-08-20',
  address: 'Delhi, India',
  emergency_contact_name: 'Sarah Johnson',
  emergency_contact_phone: '+91 98765 43213',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, automatically set up a mock doctor profile
    // This bypasses all authentication and provides immediate access
    const setupMockAuth = () => {
      console.log('Setting up mock authentication for demo...');
      
      // Create a mock user object
      const mockUser = {
        id: mockDoctorProfile.id,
        email: mockDoctorProfile.email,
        created_at: mockDoctorProfile.created_at,
        updated_at: mockDoctorProfile.updated_at,
      };

      setUser(mockUser);
      setProfile(mockDoctorProfile);
      setLoading(false);
      
      console.log('Mock doctor profile loaded:', mockDoctorProfile.full_name);
    };

    // Set up mock auth immediately
    setupMockAuth();
  }, []);

  const signOut = async () => {
    try {
      // For demo, just clear the mock data
      setUser(null);
      setProfile(null);
      console.log('Demo session ended');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const switchToPatientMode = () => {
    const mockUser = {
      id: mockPatientProfile.id,
      email: mockPatientProfile.email,
      created_at: mockPatientProfile.created_at,
      updated_at: mockPatientProfile.updated_at,
    };

    setUser(mockUser);
    setProfile(mockPatientProfile);
    console.log('Switched to patient mode:', mockPatientProfile.full_name);
  };

  const switchToDoctorMode = () => {
    const mockUser = {
      id: mockDoctorProfile.id,
      email: mockDoctorProfile.email,
      created_at: mockDoctorProfile.created_at,
      updated_at: mockDoctorProfile.updated_at,
    };

    setUser(mockUser);
    setProfile(mockDoctorProfile);
    console.log('Switched to doctor mode:', mockDoctorProfile.full_name);
  };

  return {
    user,
    profile,
    loading,
    signOut,
    switchToPatientMode,
    switchToDoctorMode,
    isAuthenticated: !!user,
    isDoctor: profile?.role === 'doctor',
    isPatient: profile?.role === 'patient',
    isAdmin: profile?.role === 'admin',
    isNurse: profile?.role === 'nurse',
  };
}