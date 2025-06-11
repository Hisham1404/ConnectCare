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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const switchToPatientMode = () => {
    // This would typically update the user's role in the database
    // For now, we'll just log the action
    console.log('Switch to patient mode requested');
  };

  const switchToDoctorMode = () => {
    // This would typically update the user's role in the database
    // For now, we'll just log the action
    console.log('Switch to doctor mode requested');
  };

  return {
    user,
    profile,
    session,
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