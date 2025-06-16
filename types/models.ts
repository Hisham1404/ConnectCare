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
  doctor_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ElevenLabs Conversation Types
export interface ElevenLabsTranscriptSegment {
  role: string;
  content: string;
  start_time: number;
  end_time: number;
}

export interface ElevenLabsConversationData {
  conversation_id: string;
  transcript: ElevenLabsTranscriptSegment[];
  summary?: string;
  analysis?: {
    sentiment?: string;
    key_topics?: string[];
    action_items?: string[];
    [key: string]: any;
  };
  metadata?: {
    patient_id?: string;
    call_duration?: number;
    call_start_time?: string;
    call_end_time?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow for additional fields from ElevenLabs
}

export interface ElevenLabsWebhookPayload {
  event_type: string;
  data: ElevenLabsConversationData;
  metadata?: {
    patient_id?: string;
    [key: string]: any;
  };
}

export interface Conversation {
  id: string;
  patient_id: string;
  conversation_data: ElevenLabsConversationData;
  created_at: string;
  updated_at: string;
} 