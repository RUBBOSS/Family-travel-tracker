import { NextRequest, NextResponse } from 'next/server';
import { createRequestClient } from '@/utils/supabaseRequestClient';

// GET /api/countries - Get all countries or search.
// Public: the `countries` table has a SELECT-for-all RLS policy.
export async function GET(request: NextRequest) {
  try {
    const supabase = createRequestClient();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (query) {
      // Search countries by name
      const { data: searchedCountries, error } = await supabase
        .from('countries')
        .select('id, country_code, country_name, flag_url, population, capital, region, subregion')
        .ilike('country_name', `%${query}%`)
        .order('country_name')
        .limit(10);

      if (error) {
        console.error('Error searching countries:', error);
        return NextResponse.json(
          { error: 'Failed to search countries' },
          { status: 500 }
        );
      }

      return NextResponse.json(searchedCountries);
    }

    // Get all countries
    const { data: allCountries, error } = await supabase
      .from('countries')
      .select('id, country_code, country_name, flag_url, population, capital, region, subregion')
      .order('country_name');

    if (error) {
      console.error('Error fetching all countries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    return NextResponse.json(allCountries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
