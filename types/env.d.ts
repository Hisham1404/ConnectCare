declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
      EXPO_PUBLIC_ELEVENLABS_AGENT_ID: string;
      EXPO_PUBLIC_ELEVENLABS_CAREY_AGENT_ID: string;
    }
  }
}

// Ensure this file is treated as a module
export {};