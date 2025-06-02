// Test database connection and schema
import { supabase } from '@/utils/supabaseClient';

export async function testDatabaseSchema() {
  console.log('Testing database schema...');
  
  try {
    // Test 1: Check if countries table exists and has data
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, country_name')
      .limit(5);
    
    if (countriesError) {
      console.error('Countries table error:', countriesError);
      return { success: false, error: 'Countries table not found or accessible' };
    }
    
    console.log('✅ Countries table exists with', countries?.length, 'entries (showing first 5)');
    
    // Test 2: Check if user_profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.error('User profiles table error:', profilesError);
      return { success: false, error: 'User_profiles table not found or accessible' };
    }
    
    console.log('✅ User_profiles table exists');
    
    // Test 3: Check if visited_countries table exists
    const { data: visited, error: visitedError } = await supabase
      .from('visited_countries')
      .select('id')
      .limit(1);
    
    if (visitedError) {
      console.error('Visited countries table error:', visitedError);
      return { success: false, error: 'Visited_countries table not found or accessible' };
    }
    
    console.log('✅ Visited_countries table exists');
    
    return { 
      success: true, 
      message: 'All database tables are properly set up!',
      countriesCount: countries?.length || 0
    };
    
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testDatabase = testDatabaseSchema;
}
