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

    // Verify we have the required environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required Supabase environment variables');
      return null;
    }
    
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
      
      return data?.user || null;
    } catch (e) {
      console.error('Error getting user:', e);
      return null;
    }
  } catch (e) {
    console.error('Error in getUserFromRequest:', e);
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
      familyMemberCountResult,
      visitCountResult,
      topTravelerResult,
      mostVisitedCountryResult,
      userStatsResult,
      topCountriesResult
    ] = await Promise.all([
      // Total countries in the system
      supabaseServer.from('countries').select('id', { count: 'exact', head: true }),      // Total family members for current user
      supabaseServer.from('family_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // Total visits for current user's family members
      supabaseServer.from('visited_countries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),      // Top traveler among current user's family members
      supabaseServer.from('family_members')
        .select(`
          id,
          name,
          avatar_color
        `)
        .eq('user_id', user.id),
      
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
        .single(),        // Family member stats
      supabaseServer.from('family_members')
        .select(`
          id,
          name,
          avatar_color,
          visited_count:visited_countries(count)
        `)
        .eq('user_id', user.id)
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
    ]);    // Process results
    const totalCountries = countryCountResult.count || 0;
    const totalFamilyMembers = familyMemberCountResult.count || 0;
    const totalVisits = visitCountResult.count || 0;    // Get family members and calculate their visit counts manually
    let topTraveler: any = {
      name: 'No travelers yet',
      visits: 0
    };

    // Always check current user's personal visits (family_member_id = null)
    const { count: userPersonalVisits } = await supabaseServer
      .from('visited_countries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('family_member_id', null);

    let allTravelers = [];

    // Add current user's personal visits
    if (userPersonalVisits && userPersonalVisits > 0) {
      allTravelers.push({
        id: user.id,
        name: 'You',
        avatar_color: '#6366f1',
        visitCount: userPersonalVisits
      });
    }

    // Add family members and their visit counts if they exist
    if (topTravelerResult.data && topTravelerResult.data.length > 0) {
      const familyMemberVisitCounts = await Promise.all(
        topTravelerResult.data.map(async (member: any) => {
          const { count } = await supabaseServer
            .from('visited_countries')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('family_member_id', member.id);
          
          return {
            ...member,
            visitCount: count || 0
          };
        })
      );

      // Add family members with visits > 0
      allTravelers.push(...familyMemberVisitCounts.filter(member => member.visitCount > 0));
    }

    // Find the traveler with the most visits
    if (allTravelers.length > 0) {
      const topTravelerData = allTravelers.reduce((max, current) => 
        current.visitCount > max.visitCount ? current : max
      );

      topTraveler = {
        name: topTravelerData.name,
        visits: topTravelerData.visitCount,
        userId: topTravelerData.id,
        color: topTravelerData.avatar_color
      };
    }
    
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
        };    // Format user stats
    const users = userStatsResult.data
      ? userStatsResult.data.map(member => ({
          id: member.id,
          name: member.name,
          color: member.avatar_color,
          countriesVisited: member.visited_count
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
        totalUsers: totalFamilyMembers,
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
