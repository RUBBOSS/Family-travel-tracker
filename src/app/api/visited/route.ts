import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/utils/apiAuth';

// GET /api/visited - Get visited countries for the authenticated user.
// RLS scopes every row to the caller; family_member_id filters within them.
// family_member_id=all returns every visit with member info (multi-color maps).
export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const familyMemberId = searchParams.get('family_member_id');
    const wantsAll = familyMemberId === 'all';

    let query = supabase
      .from('visited_countries')
      .select('id, country_id, family_member_id, visit_date, notes, countries (country_name, country_code, flag_url), family_members (name, avatar_color)')
      .order('visit_date', { ascending: false, nullsFirst: false });

    if (!wantsAll && familyMemberId) {
      query = query.eq('family_member_id', parseInt(familyMemberId));
    } else if (!wantsAll) {
      // No member specified -> personal visits only
      query = query.is('family_member_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching visited countries:', error);
      return NextResponse.json({ error: 'Failed to fetch visited countries' }, { status: 500 });
    }

    const result = (data || []).map((row: any) => ({
      id: row.id,
      countryId: row.country_id,
      familyMemberId: row.family_member_id,
      memberName: row.family_members?.name || null,
      memberColor: row.family_members?.avatar_color || null,
      visitDate: row.visit_date || new Date().toISOString(),
      notes: row.notes || '',
      countryName: row.countries?.country_name || `Country ${row.country_id}`,
      countryCode: row.countries?.country_code || 'XX',
      flagUrl: row.countries?.flag_url,
    }));

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
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { user, supabase } = auth;

  try {
    const { countryId, notes, visitDate, familyMemberId } = await request.json();
    if (!countryId) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
    }

    // Duplicate check within the same user + member scope
    let existingQuery = supabase
      .from('visited_countries')
      .select('id')
      .eq('country_id', countryId);

    if (familyMemberId) {
      existingQuery = existingQuery.eq('family_member_id', familyMemberId);
    } else {
      existingQuery = existingQuery.is('family_member_id', null);
    }

    const { data: existing, error: existErr } = await existingQuery.maybeSingle();

    if (existErr) {
      throw existErr;
    }

    if (existing) {
      return NextResponse.json({ error: 'Country already visited' }, { status: 400 });
    }

    const insertData: any = {
      user_id: user.id,
      country_id: countryId
    };

    if (familyMemberId) {
      insertData.family_member_id = familyMemberId;
    }
    if (notes !== undefined) {
      insertData.notes = notes;
    }
    if (visitDate !== undefined) {
      insertData.visit_date = visitDate;
    }

    const { data, error } = await supabase
      .from('visited_countries')
      .insert([insertData])
      .select();

    if (error) {
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

// DELETE /api/visited?id=123 - Remove a visited country for the authenticated user
export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id || id === 'visited') {
      return NextResponse.json({ error: 'Visit ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('visited_countries')
      .delete()
      .eq('id', id);

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
