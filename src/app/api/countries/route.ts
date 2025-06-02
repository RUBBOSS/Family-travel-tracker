import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { countries } from '@/db/schema';
import { like } from 'drizzle-orm';

// GET /api/countries - Get all countries or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    if (query) {
      const searchedCountries = await db
        .select()
        .from(countries)
        .where(like(countries.countryName, `%${query}%`))
        .orderBy(countries.countryName)
        .limit(10);
        
      return NextResponse.json(searchedCountries);
    }
    
    const allCountries = await db
      .select()
      .from(countries)
      .orderBy(countries.countryName);
      
    return NextResponse.json(allCountries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
