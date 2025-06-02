// Check existing database structure before applying schema
import { supabase } from '@/utils/supabaseClient';

export async function checkExistingTables() {
  console.log('Checking existing database structure...');
  
  // First check if user is authenticated before making any DB calls
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      console.log('No authenticated user, skipping database checks');
      return {
        tables: {},
        existingUsers: 0,
        recommendations: ['User not authenticated - please log in to check database structure'],
        authRequired: true
      };
    }
  } catch (error) {
    console.log('Authentication check failed, skipping database checks');
    return {
      tables: {},
      existingUsers: 0,
      recommendations: ['Authentication check failed - please log in'],
      authRequired: true
    };
  }
  
  const results: any = {
    tables: {},
    existingUsers: 0,
    recommendations: []
  };
  
  try {
    // Check for existing tables by trying to query them
    const tablesToCheck = ['countries', 'user_profiles', 'visited_countries', 'profiles', 'users'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          results.tables[tableName] = {
            exists: true,
            count: count || 0,
            error: null
          };
          console.log(`✅ Table "${tableName}" exists with ${count || 0} records`);
        } else {
          results.tables[tableName] = {
            exists: false,
            count: 0,
            error: error.message
          };
          console.log(`❌ Table "${tableName}" does not exist or is inaccessible:`, error.message);
        }
      } catch (err) {
        results.tables[tableName] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
    
    // Check for existing auth users
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authData.user) {
        console.log('🔑 Current auth user detected');
      }
    } catch (err) {
      console.log('No current auth user');
    }
    
    // Generate recommendations
    if (results.tables.countries?.exists && results.tables.countries.count > 0) {
      results.recommendations.push('⚠️  Countries table exists with data - consider backing up');
    }
    
    if (results.tables.user_profiles?.exists) {
      results.recommendations.push('✅ user_profiles table already exists');
    } else {
      results.recommendations.push('📝 Need to create user_profiles table');
    }
    
    if (results.tables.profiles?.exists && results.tables.profiles.count > 0) {
      results.recommendations.push('⚠️  Old "profiles" table exists - data migration needed');
    }
    
    if (results.tables.visited_countries?.exists && results.tables.visited_countries.count > 0) {
      results.recommendations.push('⚠️  visited_countries has data - consider backing up');
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    interface TableInfo {
        exists: boolean;
        count: number;
        error: string | null;
    }

    interface CheckTableResults {
        tables: Record<string, TableInfo>;
        existingUsers: number;
        recommendations: string[];
    }

    interface ErrorResult {
        error: string;
    }

    
    return results;
    
  } catch (error) {
    console.error('Error checking database structure:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).checkTables = checkExistingTables;
}
