export interface Vitals {
  heartRate: string;
  bloodPressure: string;
  temperature: string;
  oxygen: string;
}

export type PatientPriority = 'critical' | 'moderate' | 'stable';

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  priority: PatientPriority;
  lastCheckin: string;
  avatar: string;
  vitals: Vitals;
  recoveryStage: string;
  riskScore: number;
  hasNewCheckin: boolean;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled';

export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  avatar: string;
}

export interface DashboardStats {
  totalPatients: number;
  criticalCases: number;
  stablePatients: number;
  pendingReviews: number;
  dailyCheckins: number;
  activeMonitoring: number;
}

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: any; // lucide-react-native icon component
  color: string;
  trend: 'stable' | 'improving' | 'declining';
  change: string;
  normal: string;
  lastReading: string;
  readings: number[];
}

export interface HealthGoal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  icon: any; // lucide-react-native icon component
  color: string;
}

export interface HealthReading {
  id: string;
  type: string;
  value: string;
  time: string;
  status: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'patient' | 'doctor';
  created_at?: string;
  updated_at?: string;
} 