import { createClient } from '@supabase/supabase-js';

// Default values for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yipvctqgluwqwaashbat.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHZjdHFnbHV3cXdhYXNoYmF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjE1NjksImV4cCI6MjA2NDQzNzU2OX0.l3-_KNjgqlj0RkPuTcutxYtx837RLwDS0T0tbVOIIwM';

// For development, warn about missing env vars
if (process.env.NODE_ENV !== 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
