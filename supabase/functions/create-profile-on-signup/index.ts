import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  schema: string
  old_record: any | null
}

interface UserMetadata {
  full_name?: string
  fullName?: string
  role?: 'doctor' | 'patient' | 'admin' | 'nurse'
  avatar_url?: string
  
  // Doctor-specific metadata
  specialization?: string
  license_number?: string
  years_of_experience?: number
  hospital_affiliation?: string
  consultation_fee?: number
  
  // Patient-specific metadata
  date_of_birth?: string
  dateOfBirth?: string
  assigned_doctor_id?: string
  assignedDoctorId?: string
  blood_type?: string
  allergies?: string[]
  chronic_conditions?: string[]
  
  // Contact information
  phone?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse the webhook payload from Supabase Auth
    const payload: WebhookPayload = await req.json()
    
    // Only process INSERT events on auth.users table
    if (payload.type !== 'INSERT' || payload.table !== 'users') {
      console.log(`Ignoring event: ${payload.type} on ${payload.table}`)
      return new Response(
        JSON.stringify({ message: 'Event not processed', type: payload.type, table: payload.table }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const newUser = payload.record
    console.log('🔄 Processing new user registration:', {
      id: newUser.id,
      email: newUser.email,
      created_at: newUser.created_at
    })

    // Extract and validate user metadata
    const rawUserMetaData: UserMetadata = newUser.raw_user_meta_data || {}
    
    // Extract full name with multiple fallback options
    const fullName = rawUserMetaData.full_name || 
                     rawUserMetaData.fullName || 
                     newUser.email?.split('@')[0] || 
                     'User'
    
    // Extract and validate role
    const role = rawUserMetaData.role || 'patient'
    if (!['doctor', 'patient', 'admin', 'nurse'].includes(role)) {
      console.error('❌ Invalid role provided:', role)
      throw new Error(`Invalid role: ${role}. Must be one of: doctor, patient, admin, nurse`)
    }

    // Extract common profile data
    const profileData = {
      id: newUser.id,
      email: newUser.email,
      full_name: fullName,
      role: role,
      avatar_url: rawUserMetaData.avatar_url || null,
      phone: rawUserMetaData.phone || null,
      date_of_birth: rawUserMetaData.date_of_birth || rawUserMetaData.dateOfBirth || null,
      address: rawUserMetaData.address || null,
      emergency_contact_name: rawUserMetaData.emergency_contact_name || null,
      emergency_contact_phone: rawUserMetaData.emergency_contact_phone || null
    }

    console.log('📝 Creating profile with data:', {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      role: profileData.role
    })

    // Create profile record in profiles table
    const { data: profileRecord, error: profileError } = await supabaseClient
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    console.log('✅ Profile created successfully:', profileRecord.id)

    // Create role-specific records based on user role
    let roleSpecificRecord = null

    if (role === 'doctor') {
      // Extract doctor-specific metadata
      const doctorData = {
        profile_id: newUser.id,
        license_number: rawUserMetaData.license_number || `TEMP-${newUser.id.substring(0, 8)}`,
        specialization: rawUserMetaData.specialization || 'General Practice',
        years_of_experience: rawUserMetaData.years_of_experience || 0,
        hospital_affiliation: rawUserMetaData.hospital_affiliation || null,
        consultation_fee: rawUserMetaData.consultation_fee || null,
        is_active: true
      }

      console.log('👨‍⚕️ Creating doctor record:', {
        profile_id: doctorData.profile_id,
        specialization: doctorData.specialization,
        license_number: doctorData.license_number
      })

      const { data: doctorRecord, error: doctorError } = await supabaseClient
        .from('doctors')
        .insert(doctorData)
        .select()
        .single()

      if (doctorError) {
        console.error('❌ Error creating doctor record:', doctorError)
        throw new Error(`Doctor record creation failed: ${doctorError.message}`)
      }

      roleSpecificRecord = doctorRecord
      console.log('✅ Doctor record created successfully:', doctorRecord.id)

    } else if (role === 'patient') {
      // Generate unique patient ID
      const currentYear = new Date().getFullYear()
      const dayOfYear = Math.floor((Date.now() - new Date(currentYear, 0, 0).getTime()) / (1000 * 60 * 60 * 24))
      const patientId = `PAT-${currentYear}-${dayOfYear.toString().padStart(3, '0')}-${newUser.id.substring(0, 6).toUpperCase()}`

      // Extract patient-specific metadata
      const patientData = {
        profile_id: newUser.id,
        patient_id: patientId,
        assigned_doctor_id: rawUserMetaData.assigned_doctor_id || rawUserMetaData.assignedDoctorId || null,
        blood_type: rawUserMetaData.blood_type || null,
        allergies: rawUserMetaData.allergies || null,
        chronic_conditions: rawUserMetaData.chronic_conditions || null,
        status: 'active' as const
      }

      console.log('🏥 Creating patient record:', {
        profile_id: patientData.profile_id,
        patient_id: patientData.patient_id,
        assigned_doctor_id: patientData.assigned_doctor_id
      })

      const { data: patientRecord, error: patientError } = await supabaseClient
        .from('patients')
        .insert(patientData)
        .select()
        .single()

      if (patientError) {
        console.error('❌ Error creating patient record:', patientError)
        throw new Error(`Patient record creation failed: ${patientError.message}`)
      }

      roleSpecificRecord = patientRecord
      console.log('✅ Patient record created successfully:', patientRecord.id)

    } else if (role === 'admin' || role === 'nurse') {
      // For admin and nurse roles, only create the profile record
      console.log(`✅ ${role.charAt(0).toUpperCase() + role.slice(1)} profile created successfully`)
    }

    // Return comprehensive success response
    const response = {
      success: true,
      message: 'User profile and role-specific records created successfully',
      data: {
        user_id: newUser.id,
        email: newUser.email,
        role: role,
        profile_created: true,
        role_specific_record_created: !!roleSpecificRecord,
        profile_data: {
          id: profileRecord.id,
          full_name: profileRecord.full_name,
          role: profileRecord.role
        },
        ...(roleSpecificRecord && {
          role_specific_data: {
            id: roleSpecificRecord.id,
            ...(role === 'doctor' && {
              specialization: roleSpecificRecord.specialization,
              license_number: roleSpecificRecord.license_number
            }),
            ...(role === 'patient' && {
              patient_id: roleSpecificRecord.patient_id,
              status: roleSpecificRecord.status
            })
          }
        })
      },
      timestamp: new Date().toISOString()
    }

    console.log('🎉 User registration completed successfully:', {
      user_id: newUser.id,
      role: role,
      profile_created: true,
      role_record_created: !!roleSpecificRecord
    })

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Error in create-profile-on-signup function:', error)
    
    // Log comprehensive error information for debugging
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    })

    // Return error response but with 200 status to avoid failing the auth process
    // This ensures user creation doesn't fail even if profile creation has issues
    const errorResponse = {
      success: false,
      error: 'Profile creation failed',
      message: error.message,
      details: 'User account was created but profile setup encountered an issue. Please contact support if you experience any problems.',
      timestamp: new Date().toISOString(),
      // Include error details in development
      ...(Deno.env.get('ENVIRONMENT') === 'development' && {
        debug_info: {
          error_name: error.name,
          error_stack: error.stack
        }
      })
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Return 200 to avoid failing the auth trigger
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})