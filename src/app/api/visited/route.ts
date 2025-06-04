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

// GET /api/visited - Get all visited countries for the authenticated user
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    let data, error;
    
    const fullQuery = await supabaseServer
      .from('visited_countries')
      .select('id, country_id, user_id, visit_date, notes, countries (country_name, country_code, flag_url)')
      .eq('user_id', user.id);
      
    data = fullQuery.data;
    error = fullQuery.error;
    
    // If the query fails due to missing columns, try with basic columns
    if (error && error.message.includes('visit_date')) {
      console.log('visit_date column missing, trying without it...');
      
      const basicQuery = await supabaseServer
        .from('visited_countries')
        .select('id, country_id, user_id, countries (country_name, country_code, flag_url)')
        .eq('user_id', user.id);
        
      data = basicQuery.data;
      error = basicQuery.error;
    }
    
    // If join fails, try without join
    if (error && error.message.includes('countries')) {
      console.log('Countries join failed, trying simple query...');
      
      const simpleQuery = await supabaseServer
        .from('visited_countries')
        .select('id, country_id, user_id')
        .eq('user_id', user.id);
        
      data = simpleQuery.data;
      error = simpleQuery.error;
    }
      
    console.log('Supabase query result:', { data, error });
      
    if (error) {
      console.error('All query attempts failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transform data to expected format
    const result = (data || []).map((row: any) => ({
      id: row.id,
      countryId: row.country_id,
      visitDate: row.visit_date || new Date().toISOString(), // Default if column missing
      notes: row.notes || '', // Default if column missing
      countryName: row.countries?.country_name || `Country ${row.country_id}`,
      countryCode: row.countries?.country_code || 'XX',
      flagUrl: row.countries?.flag_url,
    }));
    
    console.log('Processed result:', result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching visited countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visited countries', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/visited - Add a visited country for the authenticated user
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { countryId, notes, visitDate } = await request.json();
    if (!countryId) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
    }
    
    // Check if already visited
    const { data: existing, error: existErr } = await supabaseServer
      .from('visited_countries')
      .select('id')
      .eq('user_id', user.id)
      .eq('country_id', countryId)
      .maybeSingle();
      
    if (existErr) {
      throw existErr;
    }
    
    if (existing) {
      return NextResponse.json({ error: 'Country already visited' }, { status: 400 });
    }
    
    // Try to insert with all columns, fall back if needed
    let insertData: any = {
      user_id: user.id,
      country_id: countryId
    };
    
    // Add optional columns if they exist in the table
    if (notes !== undefined) {
      insertData.notes = notes;
    }
    if (visitDate !== undefined) {
      insertData.visit_date = visitDate;
    }
    
    const { data, error } = await supabaseServer
      .from('visited_countries')
      .insert([insertData])
      .select();
      
    if (error) {
      // If error is due to missing columns, try with minimal data
      if (error.message.includes('visit_date') || error.message.includes('notes')) {
        console.log('Falling back to minimal insert due to missing columns...');
        
        const { data: minimalData, error: minimalError } = await supabaseServer
          .from('visited_countries')
          .insert([{ 
            user_id: user.id, 
            country_id: countryId
          }])
          .select();
          
        if (minimalError) {
          throw minimalError;
        }
        
        return NextResponse.json({ 
          message: 'Country added to visited list (minimal data)',
          data: minimalData ? minimalData[0] : null
        }, { status: 201 });
      }
      
      throw error;
    }
    
    return NextResponse.json({ 
      message: 'Country added to visited list',
      data: data ? data[0] : null
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding visited country:', error);
    return NextResponse.json(
      { error: 'Failed to add country', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/visited - Remove a visited country for the authenticated user
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract ID from the URL query parameter
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
      if (!id || id === 'visited') {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 });
    }
    
    // First check if this record belongs to the user
    const { data: existing, error: existErr } = await supabaseServer
      .from('visited_countries')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (existErr) {
      throw existErr;
    }
    
    if (!existing) {
      return NextResponse.json({ error: 'Record not found or not owned by user' }, { status: 404 });
    }
    
    // Delete the visit
    const { error } = await supabaseServer
      .from('visited_countries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ message: 'Country removed from visited list' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting visited country:', error);
    return NextResponse.json(
      { error: 'Failed to delete country', details: error.message },
      { status: 500 }
    );
  }
}
