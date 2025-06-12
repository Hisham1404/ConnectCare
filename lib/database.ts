import { supabase } from './supabase';

export interface Profile {
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

export interface Doctor {
  id: string;
  profile_id: string;
  license_number: string;
  specialization: string;
  years_of_experience: number;
  hospital_affiliation?: string;
  consultation_fee?: number;
  available_hours?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Patient {
  id: string;
  profile_id: string;
  patient_id: string;
  assigned_doctor_id?: string;
  medical_record_number?: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  current_medications?: any;
  insurance_info?: any;
  status: 'active' | 'critical' | 'discharged' | 'inactive';
  admission_date?: string;
  discharge_date?: string;
  surgery_date?: string;
  surgery_type?: string;
  recovery_notes?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  assigned_doctor?: Doctor;
}

export interface DailyCheckin {
  id: string;
  patient_id: string;
  checkin_date: string;
  status: 'completed' | 'missed' | 'overdue' | 'pending';
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  pain_level?: number;
  symptoms?: string[];
  mood_rating?: number;
  medications_taken: boolean;
  missed_medications?: string[];
  activity_level?: string;
  mobility_issues?: string;
  exercise_completed: boolean;
  patient_notes?: string;
  ai_analysis?: any;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface DoctorNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  note_type: 'consultation' | 'emergency' | 'follow_up' | 'observation' | 'prescription';
  title: string;
  content: string;
  is_critical: boolean;
  attachments?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

// Mock data for demo purposes
const mockDoctor: Doctor = {
  id: 'demo-doctor-db-id',
  profile_id: 'demo-doctor-id',
  license_number: 'MH-DOC-2024-001',
  specialization: 'Cardiothoracic Surgery',
  years_of_experience: 15,
  hospital_affiliation: 'Apollo Hospital, Mumbai',
  consultation_fee: 2500,
  available_hours: {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '13:00' },
  },
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPatients: Patient[] = [
  {
    id: 'patient-1',
    profile_id: 'patient-profile-1',
    patient_id: 'PAT-2024-001',
    assigned_doctor_id: 'demo-doctor-db-id',
    medical_record_number: 'MRN-001-2024',
    blood_type: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    chronic_conditions: ['Hypertension', 'Diabetes Type 2'],
    status: 'active',
    admission_date: '2024-12-01',
    surgery_date: '2024-12-05',
    surgery_type: 'Coronary Artery Bypass',
    recovery_notes: 'Patient recovering well, following prescribed medication regimen.',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-10T00:00:00Z',
    profile: {
      id: 'patient-profile-1',
      email: 'rajesh.kumar@email.com',
      full_name: 'Rajesh Kumar',
      phone: '+91 98765 43220',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      date_of_birth: '1965-03-15',
      address: 'Andheri West, Mumbai, Maharashtra',
      emergency_contact_name: 'Sunita Kumar',
      emergency_contact_phone: '+91 98765 43221',
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-01T00:00:00Z',
    },
  },
  {
    id: 'patient-2',
    profile_id: 'patient-profile-2',
    patient_id: 'PAT-2024-002',
    assigned_doctor_id: 'demo-doctor-db-id',
    medical_record_number: 'MRN-002-2024',
    blood_type: 'A+',
    allergies: ['Aspirin'],
    chronic_conditions: ['Arthritis'],
    status: 'critical',
    admission_date: '2024-12-08',
    surgery_date: '2024-12-10',
    surgery_type: 'Hip Replacement',
    recovery_notes: 'Patient experiencing some complications, monitoring closely.',
    created_at: '2024-12-08T00:00:00Z',
    updated_at: '2024-12-10T00:00:00Z',
    profile: {
      id: 'patient-profile-2',
      email: 'priya.sharma@email.com',
      full_name: 'Priya Sharma',
      phone: '+91 98765 43222',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      date_of_birth: '1970-07-22',
      address: 'Bandra East, Mumbai, Maharashtra',
      emergency_contact_name: 'Vikram Sharma',
      emergency_contact_phone: '+91 98765 43223',
      created_at: '2024-12-08T00:00:00Z',
      updated_at: '2024-12-08T00:00:00Z',
    },
  },
  {
    id: 'patient-3',
    profile_id: 'patient-profile-3',
    patient_id: 'PAT-2024-003',
    assigned_doctor_id: 'demo-doctor-db-id',
    medical_record_number: 'MRN-003-2024',
    blood_type: 'B+',
    allergies: [],
    chronic_conditions: ['High Cholesterol'],
    status: 'active',
    admission_date: '2024-12-05',
    surgery_date: '2024-12-07',
    surgery_type: 'Gallbladder Removal',
    recovery_notes: 'Excellent recovery progress, patient very compliant.',
    created_at: '2024-12-05T00:00:00Z',
    updated_at: '2024-12-10T00:00:00Z',
    profile: {
      id: 'patient-profile-3',
      email: 'amit.patel@email.com',
      full_name: 'Amit Patel',
      phone: '+91 98765 43224',
      role: 'patient',
      avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      date_of_birth: '1975-11-10',
      address: 'Powai, Mumbai, Maharashtra',
      emergency_contact_name: 'Neha Patel',
      emergency_contact_phone: '+91 98765 43225',
      created_at: '2024-12-05T00:00:00Z',
      updated_at: '2024-12-05T00:00:00Z',
    },
  },
];

const mockRecentAlerts = [
  {
    id: 'alert-1',
    patient_id: 'patient-2',
    checkin_date: '2024-12-10',
    status: 'completed',
    temperature: 101.2,
    pain_level: 8,
    created_at: '2024-12-10T14:30:00Z',
    patient: mockPatients[1],
  },
  {
    id: 'alert-2',
    patient_id: 'patient-1',
    checkin_date: '2024-12-10',
    status: 'overdue',
    created_at: '2024-12-10T12:00:00Z',
    patient: mockPatients[0],
  },
];

// Database service functions with mock data for demo
export const DatabaseService = {
  // Profile functions
  async getCurrentUserProfile(): Promise<Profile | null> {
    try {
      // Return mock profile for demo
      return {
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
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error);
      return null;
    }
  },

  async updateProfile(profileData: Partial<Profile>): Promise<boolean> {
    try {
      console.log('Mock: Profile updated', profileData);
      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  },

  // Doctor functions
  async getDoctorByProfileId(profileId: string): Promise<Doctor | null> {
    try {
      console.log('Mock: Getting doctor by profile ID', profileId);
      return mockDoctor;
    } catch (error) {
      console.error('Error in getDoctorByProfileId:', error);
      return null;
    }
  },

  // Patient functions
  async getPatientsByDoctorId(doctorId: string): Promise<Patient[]> {
    try {
      if (!doctorId || typeof doctorId !== 'string' || doctorId.trim() === '') {
        console.error('Invalid doctor ID provided to getPatientsByDoctorId');
        return [];
      }

      console.log('🔍 Getting patients for doctor:', doctorId);
      
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles(*),
          assigned_doctor:doctors(
            *,
            profile:profiles(*)
          )
        `)
        .eq('assigned_doctor_id', doctorId);

      if (error) {
        console.error('❌ Error fetching patients by doctor ID:', error);
        return [];
      }

      console.log('✅ Patients fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getPatientsByDoctorId:', error);
      return [];
    }
  },

  async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
        console.error('Invalid patient ID provided to getPatientById');
        return null;
      }

      console.log('🔍 Getting patient by ID:', patientId);
      
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          profile:profiles(*),
          assigned_doctor:doctors(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('❌ Error fetching patient by ID:', error);
        return null;
      }

      console.log('✅ Patient fetched:', data?.profile?.full_name);
      return data;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      return null;
    }
  },

  // Daily checkin functions
  async getRecentCheckins(patientId: string, limit: number = 10): Promise<DailyCheckin[]> {
    try {
      if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
        console.error('Invalid patient ID provided to getRecentCheckins');
        return [];
      }

      console.log('🔍 Getting recent checkins for patient:', patientId);
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `)
        .eq('patient_id', patientId)
        .order('checkin_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent checkins:', error);
        return [];
      }

      console.log('✅ Recent checkins fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getRecentCheckins:', error);
      return [];
    }
  },

  async getTodaysCheckin(patientId: string): Promise<DailyCheckin | null> {
    try {
      if (!patientId || typeof patientId !== 'string' || patientId.trim() === '') {
        console.error('Invalid patient ID provided to getTodaysCheckin');
        return null;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('🔍 Getting today\'s checkin for patient:', patientId, 'date:', today);
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `)
        .eq('patient_id', patientId)
        .eq('checkin_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error fetching today\'s checkin:', error);
        return null;
      }

      console.log('✅ Today\'s checkin:', data ? 'found' : 'not found');
      return data || null;
    } catch (error) {
      console.error('Error in getTodaysCheckin:', error);
      return null;
    }
  },

  async createCheckin(checkinData: Partial<DailyCheckin>): Promise<DailyCheckin | null> {
    try {
      console.log('📝 Creating checkin:', checkinData);
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert(checkinData)
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error creating checkin:', error);
        return null;
      }

      console.log('✅ Checkin created:', data.id);
      return data;
    } catch (error) {
      console.error('Error in createCheckin:', error);
      return null;
    }
  },

  async updateCheckin(checkinId: string, checkinData: Partial<DailyCheckin>): Promise<boolean> {
    try {
      if (!checkinId || typeof checkinId !== 'string' || checkinId.trim() === '') {
        console.error('Invalid checkin ID provided to updateCheckin');
        return false;
      }

      console.log('📝 Updating checkin:', checkinId);
      
      const { error } = await supabase
        .from('daily_checkins')
        .update(checkinData)
        .eq('id', checkinId);

      if (error) {
        console.error('❌ Error updating checkin:', error);
        return false;
      }

      console.log('✅ Checkin updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateCheckin:', error);
      return false;
    }
  },

  // Doctor notes functions
  async getNotesByPatientId(patientId: string): Promise<DoctorNote[]> {
    try {
      console.log('Mock: Getting notes for patient', patientId);
      return [];
    } catch (error) {
      console.error('Error in getNotesByPatientId:', error);
      return [];
    }
  },

  async createNote(noteData: Partial<DoctorNote>): Promise<DoctorNote | null> {
    try {
      console.log('Mock: Creating note', noteData);
      return null;
    } catch (error) {
      console.error('Error in createNote:', error);
      return null;
    }
  },

  // Dashboard statistics
  async getDashboardStats(doctorId?: string): Promise<{
    totalPatients: number;
    criticalCases: number;
    dailyCheckins: number;
    activeMonitoring: number;
  }> {
    try {
      console.log('📊 Getting dashboard stats for doctor:', doctorId);
      
      let patientsQuery = supabase.from('patients').select('id, status');
      
      if (doctorId) {
        patientsQuery = patientsQuery.eq('assigned_doctor_id', doctorId);
      }
      
      const { data: patients, error: patientsError } = await patientsQuery;
      
      if (patientsError) {
        console.error('❌ Error fetching patients for stats:', patientsError);
        return { totalPatients: 0, criticalCases: 0, dailyCheckins: 0, activeMonitoring: 0 };
      }
      
      // Get today's checkins count
      const today = new Date().toISOString().split('T')[0];
      let checkinsQuery = supabase
        .from('daily_checkins')
        .select('id', { count: 'exact' })
        .eq('checkin_date', today);
      
      if (doctorId) {
        // Filter checkins for doctor's patients
        const patientIds = patients?.map(p => p.id) || [];
        if (patientIds.length > 0) {
          checkinsQuery = checkinsQuery.in('patient_id', patientIds);
        }
      }
      
      const { count: dailyCheckins } = await checkinsQuery;
      
      const stats = {
        totalPatients: patients?.length || 0,
        criticalCases: patients?.filter(p => p.status === 'critical').length || 0,
        dailyCheckins: dailyCheckins || 0,
        activeMonitoring: patients?.filter(p => p.status === 'active').length || 0,
      };
      
      console.log('✅ Dashboard stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        totalPatients: 0,
        criticalCases: 0,
        dailyCheckins: 0,
        activeMonitoring: 0,
      };
    }
  },

  // Get recent alerts/critical events
  async getRecentAlerts(doctorId?: string, limit: number = 5): Promise<any[]> {
    try {
      console.log('🚨 Getting recent alerts for doctor:', doctorId);
      
      let alertsQuery = supabase
        .from('daily_checkins')
        .select(`
          *,
          patient:patients(
            *,
            profile:profiles(*)
          )
        `)
        .or('status.eq.overdue,pain_level.gte.7,temperature.gte.101')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (doctorId) {
        // Get doctor's patients first
        const { data: patients } = await supabase
          .from('patients')
          .select('id')
          .eq('assigned_doctor_id', doctorId);
        
        const patientIds = patients?.map(p => p.id) || [];
        if (patientIds.length > 0) {
          alertsQuery = alertsQuery.in('patient_id', patientIds);
        } else {
          return []; // No patients assigned to this doctor
        }
      }
      
      const { data, error } = await alertsQuery;
      
      if (error) {
        console.error('❌ Error fetching recent alerts:', error);
        return [];
      }
      
      console.log('✅ Recent alerts fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      return [];
    }
  },

  // Real-time subscriptions
  subscribeToCheckins(
    doctorId: string,
    callback: (payload: any) => void
  ): RealtimeChannel | null {
    try {
      console.log('🔔 Setting up real-time subscription for doctor:', doctorId);
      
      const channel = supabase
        .channel('daily_checkins_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'daily_checkins'
          },
          async (payload) => {
            console.log('🔔 New checkin received:', payload);
            
            // Verify this checkin is for one of the doctor's patients
            const { data: patient } = await supabase
              .from('patients')
              .select('assigned_doctor_id, profile:profiles(*)')
              .eq('id', payload.new.patient_id)
              .single();
            
            if (patient?.assigned_doctor_id === doctorId) {
              console.log('✅ Checkin is for assigned patient, triggering callback');
              callback({
                ...payload,
                patient: patient
              });
            }
          }
        )
        .subscribe();
      
      return channel;
    } catch (error) {
      console.error('Error setting up checkins subscription:', error);
      return null;
    }
  },

  unsubscribeFromCheckins(channel: RealtimeChannel | null) {
    if (channel) {
      console.log('🔕 Unsubscribing from checkins channel');
      supabase.removeChannel(channel);
    }
  },
};