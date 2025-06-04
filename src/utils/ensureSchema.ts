'use client';

import { supabase } from './supabaseClient';

export async function ensureUserProfilesTable() {
  try {
    // First check if the function exists, if not, the user needs to run the setup SQL
    const { data: functions, error: fnError } = await supabase
      .rpc('create_user_profiles_table');
      if (fnError) {
      // Schema function not found - try to query the table directly
      
      // Try to query the user_profiles table directly
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error checking user_profiles table:', error);
        console.error('Please run the setup/create_user_profiles_function.sql script in Supabase SQL editor');
        // Create a direct query to check if the table exists (this is a more robust check)
        const { data: tableCheck } = await supabase
          .from('information_schema.tables')
          .select('*')
          .eq('table_schema', 'public')
          .eq('table_name', 'user_profiles');
        
        if (!tableCheck || tableCheck.length === 0) {
          console.error('Table user_profiles does not exist!');
          return { success: false, error };
        }
      }
    } else {
      console.log('Schema function exists and was executed successfully');
    }
    
    // One more check to confirm the table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying user_profiles:', error);    return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error checking/creating user_profiles table:', err);
    return { success: false, error: err };
  }
}

// Function to check and apply minimal schema if needed
export async function ensureMinimalSchema() {
  // Check if the table exists and if not, create it
  return ensureUserProfilesTable();
}
