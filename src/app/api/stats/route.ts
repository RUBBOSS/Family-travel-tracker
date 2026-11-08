import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/utils/apiAuth';

// GET /api/stats - Aggregated stats for the authenticated user.
// Response shape is consumed by src/hooks/useStats.ts — keep it stable.
export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { user, supabase } = auth;

  try {
    const [
      countryCountResult,
      familyMembersResult,
      visitsResult,
      topCountriesResult,
      regionsResult
    ] = await Promise.all([
      // Total countries in the system
      supabase.from('countries').select('id', { count: 'exact', head: true }),

      // Family members for current user (RLS-scoped)
      supabase.from('family_members').select('id, name, avatar_color'),

      // All visit rows for the user — one query, counted in memory
      supabase.from('visited_countries').select('id, family_member_id, country_id, countries (country_name, country_code)'),

      // Top countries by visitor count across all users (public aggregate)
      supabase.from('countries')
        .select(`
          id,
          country_name,
          country_code,
          visitor_count:visited_countries(count)
        `)
        .order('visitor_count', { ascending: false })
        .limit(10),

    // Continent/region breakdown for the caller (SECURITY DEFINER RPC, pre-existing)
    supabase.rpc('get_user_countries_by_region', { user_uuid: user.id })
      .then(({ data, error }: { data: any; error: any }) => {
        if (error) {
          console.error('Region RPC failed:', error.message);
          return [];
        }
        return (data || []).map((r: any) => ({
          region: r.region,
          totalInRegion: Number(r.total_in_region || 0),
          visitedInRegion: Number(r.visited_in_region || 0),
        }));
      })
    ]);

    const totalCountries = countryCountResult.count || 0;
    const familyMembers = familyMembersResult.data || [];
    const visits = visitsResult.data || [];

    // Count visits per family member + personal visits in memory
    const personalVisits = visits.filter(v => v.family_member_id === null).length;
    const visitsByMember = new Map<number, number>();
    for (const visit of visits) {
      if (visit.family_member_id !== null) {
        visitsByMember.set(visit.family_member_id, (visitsByMember.get(visit.family_member_id) || 0) + 1);
      }
    }

    // Build the travelers list (personal + each member with visits)
    const allTravelers: { id: string | number; name: string; avatar_color?: string; visitCount: number }[] = [];
    if (personalVisits > 0) {
      allTravelers.push({ id: user.id, name: 'You', avatar_color: '#6366f1', visitCount: personalVisits });
    }
    for (const member of familyMembers) {
      const count = visitsByMember.get(member.id) || 0;
      if (count > 0) {
        allTravelers.push({ id: member.id, name: member.name, avatar_color: member.avatar_color, visitCount: count });
      }
    }

    let topTraveler: { name: string; visits: number; userId?: string | number; color?: string } = {
      name: 'No travelers yet',
      visits: 0
    };
    if (allTravelers.length > 0) {
      const top = allTravelers.reduce((max, current) =>
        current.visitCount > max.visitCount ? current : max
      );
      topTraveler = { name: top.name, visits: top.visitCount, userId: top.id, color: top.avatar_color };
    }

    // Most visited country among the user's own visits
    const countryCounts = new Map<number, { name: string; code: string; count: number }>();
    for (const visit of visits) {
      const country = visit.countries as any;
      if (!country) continue;
      const existing = countryCounts.get(visit.country_id);
      if (existing) {
        existing.count += 1;
      } else {
        countryCounts.set(visit.country_id, { name: country.country_name, code: country.country_code, count: 1 });
      }
    }
    let mostVisitedCountry: { countryId?: number; countryName: string; countryCode?: string; visitors: number } = {
      countryName: 'No countries visited yet',
      visitors: 0
    };
    if (countryCounts.size > 0) {
      const [topId, top] = Array.from(countryCounts.entries()).reduce((a, b) => (b[1].count > a[1].count ? b : a));
      mostVisitedCountry = { countryId: topId, countryName: top.name, countryCode: top.code, visitors: top.count };
    }

    // Family member stats for the users array
    const users = familyMembers.map(member => ({
      id: member.id,
      name: member.name,
      color: member.avatar_color,
      countriesVisited: visitsByMember.get(member.id) || 0
    }));

    // Format top countries
    const topCountries = (topCountriesResult.data || [])
      .map(country => ({
        id: country.id,
        countryName: country.country_name,
        countryCode: country.country_code,
        visitors: Array.isArray(country.visitor_count) ? country.visitor_count.length : country.visitor_count
      }))
      .filter(country => country.visitors > 0);

    return NextResponse.json({
      general: {
        totalCountries,
        totalUsers: familyMembers.length,
        totalVisits: visits.length,
        topTraveler,
        mostVisitedCountry,
      },
      users,
      topCountries,
      regions: regionsResult,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
  }
}
