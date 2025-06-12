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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
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

    // Parse the webhook payload
    const payload: WebhookPayload = await req.json()
    
    // Only process INSERT events on auth.users table
    if (payload.type !== 'INSERT' || payload.table !== 'users') {
      return new Response('Event not processed', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const newUser = payload.record
    console.log('Processing new user:', newUser.id)

    // Extract user metadata with safe fallbacks
    const rawUserMetaData = newUser.raw_user_meta_data || {}
    const fullName = rawUserMetaData.full_name || 
                     rawUserMetaData.fullName || 
                     newUser.email?.split('@')[0] || 
                     'User'
    
    const role = rawUserMetaData.role || 'patient'
    const avatarUrl = rawUserMetaData.avatar_url || null

    // Validate role
    if (!['doctor', 'patient'].includes(role)) {
      console.error('Invalid role provided:', role)
      throw new Error(`Invalid role: ${role}. Must be 'doctor' or 'patient'`)
    }

    console.log('Creating profile with data:', {
      id: newUser.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      role: role
    })

    // Create profile record
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        role: role
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      throw profileError
    }

    console.log('Profile created successfully:', profileData.id)

    // Create role-specific record based on user role
    if (role === 'doctor') {
      // Extract doctor-specific metadata
      const specialization = rawUserMetaData.specialization || 'General Practice'
      
      const { data: doctorData, error: doctorError } = await supabaseClient
        .from('doctors')
        .insert({
          id: newUser.id,
          specialization: specialization
        })
        .select()
        .single()

      if (doctorError) {
        console.error('Error creating doctor record:', doctorError)
        throw doctorError
      }

      console.log('Doctor record created successfully:', doctorData.id)

    } else if (role === 'patient') {
      // Extract patient-specific metadata
      const dateOfBirth = rawUserMetaData.date_of_birth || 
                          rawUserMetaData.dateOfBirth || 
                          null
      const assignedDoctorId = rawUserMetaData.assigned_doctor_id || 
                               rawUserMetaData.assignedDoctorId || 
                               null

      const { data: patientData, error: patientError } = await supabaseClient
        .from('patients')
        .insert({
          id: newUser.id,
          date_of_birth: dateOfBirth,
          assigned_doctor_id: assignedDoctorId
        })
        .select()
        .single()

      if (patientError) {
        console.error('Error creating patient record:', patientError)
        throw patientError
      }

      console.log('Patient record created successfully:', patientData.id)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile and role-specific records created successfully',
        user_id: newUser.id,
        role: role
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-profile-on-signup function:', error)
    
    // Log detailed error information for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    // Return error response but don't fail the auth process
    // This ensures user creation doesn't fail even if profile creation has issues
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Profile creation failed',
        message: error.message,
        details: 'User account created but profile setup incomplete. Please contact support.'
      }),
      {
        status: 200, // Return 200 to avoid failing the auth trigger
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})