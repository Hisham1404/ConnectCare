import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('📱 Initial session:', session ? 'Found' : 'None');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
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
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);

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
      console.log('👤 Fetching user profile for:', userId);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setError(`Failed to load profile: ${error.message}`);
        return;
      }

      console.log('✅ Profile fetched:', data?.full_name);
      setProfile(data);
    } catch (error) {
      console.error('❌ Error in fetchUserProfile:', error);
      setError('Failed to load user profile');
    }
  };

  const signUpWithEmailAndRole = async (
    email: string, 
    password: string, 
    userData: {
      full_name: string;
      role: 'doctor' | 'patient';
      phone?: string;
      address?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      // Doctor-specific fields
      specialization?: string;
      license_number?: string;
      years_of_experience?: number;
      hospital_affiliation?: string;
      // Patient-specific fields
      date_of_birth?: string;
      assigned_doctor_id?: string;
      blood_type?: string;
      allergies?: string[];
      chronic_conditions?: string[];
    }
  ) => {
    try {
      console.log('🔐 Starting signup process for:', email, 'as', userData.role);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful:', data.user?.email);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error in signUpWithEmailAndRole:', error);
      const errorMessage = error.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Signup Failed', errorMessage);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        setError(`Sign out failed: ${error.message}`);
      } else {
        console.log('✅ Signed out successfully');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const switchToPatientMode = () => {
    // This would typically update the user's role in the database
    // For now, we'll just log the action
    console.log('🔄 Switch to patient mode requested');
  };

  const switchToDoctorMode = () => {
    // This would typically update the user's role in the database
    // For now, we'll just log the action
    console.log('🔄 Switch to doctor mode requested');
  };

  return {
    user,
    profile,
    session,
    loading,
    error,
    signUpWithEmailAndRole,
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