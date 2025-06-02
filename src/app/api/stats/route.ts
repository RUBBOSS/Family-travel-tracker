import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabaseServerClient';

// Helper to get user from Supabase JWT
async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing auth header');
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) return null;
    
    // Use a try-catch specifically for getUser to handle AuthSessionMissingError
    try {
      const { data, error } = await supabaseServer.auth.getUser(token);
      
      if (error) {
        // Handle AuthSessionMissingError gracefully
        if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
          console.log('No active session found');
          return null;
        }
        console.error('Auth error:', error);
        return null;
      }
      
      return data.user;
    } catch (authError: any) {
      // Handle AuthSessionMissingError specifically
      if (authError.name === 'AuthSessionMissingError' || authError.message?.includes('Auth session missing')) {
        console.log('No active session found in token validation');
        return null;
      }
      console.error('Token validation error:', authError);
      return null;
    }
  } catch (err) {
    console.error('Error in getUserFromRequest:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  console.log('Stats API called');
  
  try {
    // First validate user is authenticated
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Fetching stats for user:', user.id);
    
    // Query Supabase for real data
    const [
      countryCountResult,
      userCountResult,
      visitCountResult,
      topTravelerResult,
      mostVisitedCountryResult,
      userStatsResult,
      topCountriesResult
    ] = await Promise.all([
      // Total countries in the system
      supabaseServer.from('countries').select('id', { count: 'exact', head: true }),
        // Total users in the system
      supabaseServer.from('user_profiles').select('id', { count: 'exact', head: true }),
      
      // Total visits in the system
      supabaseServer.from('visited_countries').select('id', { count: 'exact', head: true }),
      
      // Top traveler
      supabaseServer.from('user_profiles')
        .select(`
          id,
          username,
          avatar_color,
          visited_count:visited_countries(count)
        `)
        .order('visited_count', { ascending: false })
        .limit(1)
        .single(),
      
      // Most visited country
      supabaseServer.from('countries')
        .select(`
          id,
          country_name,
          country_code,
          visitor_count:visited_countries(count)
        `)
        .order('visitor_count', { ascending: false })
        .limit(1)
        .single(),
        // User stats
      supabaseServer.from('user_profiles')
        .select(`
          id,
          username,
          avatar_color,
          visited_count:visited_countries(count)
        `)
        .order('visited_count', { ascending: false }),
        
      // Top countries
      supabaseServer.from('countries')
        .select(`
          id,
          country_name,
          country_code,
          visitor_count:visited_countries(count)
        `)
        .order('visitor_count', { ascending: false })
        .limit(10)
    ]);
    
    // Process results
    const totalCountries = countryCountResult.count || 0;
    const totalUsers = userCountResult.count || 0;
    const totalVisits = visitCountResult.count || 0;
      // Format the top traveler
    const topTraveler = topTravelerResult.data 
      ? {
          userId: topTravelerResult.data.id,
          name: topTravelerResult.data.username,
          color: topTravelerResult.data.avatar_color,
          visits: topTravelerResult.data.visited_count
        }
      : {
          name: 'No travelers yet',
          visits: 0
        };
    
    // Format the most visited country
    const mostVisitedCountry = mostVisitedCountryResult.data
      ? {
          countryId: mostVisitedCountryResult.data.id,
          countryName: mostVisitedCountryResult.data.country_name,
          countryCode: mostVisitedCountryResult.data.country_code,
          visitors: mostVisitedCountryResult.data.visitor_count
        }
      : {
          countryName: 'No countries visited yet',
          visitors: 0
        };
      // Format user stats
    const users = userStatsResult.data
      ? userStatsResult.data.map(user => ({
          id: user.id,
          name: user.username,
          color: user.avatar_color,
          countriesVisited: user.visited_count
        }))
      : [];
    
    // Format top countries
    const topCountries = topCountriesResult.data
      ? topCountriesResult.data.map(country => ({
          id: country.id,
          countryName: country.country_name,
          countryCode: country.country_code,
          visitors: Array.isArray(country.visitor_count) ? country.visitor_count.length : country.visitor_count
        }))
        .filter(country => country.visitors > 0)
      : [];
    
    // Return formatted stats
    return NextResponse.json({
      general: {
        totalCountries,
        totalUsers,
        totalVisits,
        topTraveler,
        mostVisitedCountry,
      },
      users,
      topCountries,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    // Provide mock data in case of error
    return NextResponse.json({
      general: {
        totalCountries: 0,
        totalUsers: 0,
        totalVisits: 0,
        topTraveler: {
          name: 'Error occurred',
          visits: 0
        },
        mostVisitedCountry: {
          countryName: 'Error occurred',
          visitors: 0
        },
      },
      users: [],
      topCountries: [],
    });
  }
}
