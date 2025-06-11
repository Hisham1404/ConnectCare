import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  avatar_url?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// Mock profiles for demo mode
const mockDoctorProfile: Profile = {
  id: 'demo-doctor-id',
  email: 'doctor@connectcare.ai',
  full_name: 'Dr. Rajesh Kumar',
  phone: '+91 98765 43210',
  role: 'doctor',
  avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  date_of_birth: '1980-05-15',
  address: 'Mumbai, Maharashtra, India',
  emergency_contact_name: 'Dr. Priya Sharma',
  emergency_contact_phone: '+91 98765 43211',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPatientProfile: Profile = {
  id: 'demo-patient-id',
  email: 'patient@connectcare.ai',
  full_name: 'John Smith',
  phone: '+91 98765 43212',
  role: 'patient',
  avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  date_of_birth: '1975-08-20',
  address: 'Delhi, India',
  emergency_contact_name: 'Sarah Smith',
  emergency_contact_phone: '+91 98765 43213',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // Start with false for demo mode
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check for real authentication first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setDemoMode(false); // Exit demo mode when real auth happens

          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signOut = async () => {
    try {
      if (demoMode) {
        // Exit demo mode
        setDemoMode(false);
        setUser(null);
        setProfile(null);
        setSession(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const switchToPatientMode = () => {
    setDemoMode(true);
    setProfile(mockPatientProfile);
    setUser({
      id: mockPatientProfile.id,
      email: mockPatientProfile.email,
      created_at: mockPatientProfile.created_at,
      updated_at: mockPatientProfile.updated_at,
    } as User);
    console.log('Switched to patient demo mode');
  };

  const switchToDoctorMode = () => {
    setDemoMode(true);
    setProfile(mockDoctorProfile);
    setUser({
      id: mockDoctorProfile.id,
      email: mockDoctorProfile.email,
      created_at: mockDoctorProfile.created_at,
      updated_at: mockDoctorProfile.updated_at,
    } as User);
    console.log('Switched to doctor demo mode');
  };

  return {
    user,
    profile,
    session,
    loading,
    demoMode,
    signOut,
    switchToPatientMode,
    switchToDoctorMode,
    isAuthenticated: !!user || demoMode,
    isDoctor: profile?.role === 'doctor',
    isPatient: profile?.role === 'patient',
    isAdmin: profile?.role === 'admin',
    isNurse: profile?.role === 'nurse',
  };
}