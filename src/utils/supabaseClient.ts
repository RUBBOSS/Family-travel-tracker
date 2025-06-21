import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yipvctqgluwqwaashbat.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHZjdHFnbHV3cXdhYXNoYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjE1NjksImV4cCI6MjA2NDQzNzU2OX0.l3-_KNjgqlj0RkPuTcutxYtx837RLwDS0T0tbVOIIwM';

const createBrowserSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'family-travel-auth-token',
      debug: process.env.NODE_ENV === 'development'
    },
    db: {
      schema: 'public'
    }
  });
};

const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  });
};

export const supabase = typeof window === 'undefined' 
  ? createServerSupabaseClient()
  : createBrowserSupabaseClient();
