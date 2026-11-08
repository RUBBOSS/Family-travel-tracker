import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/utils/apiAuth';

// GET /api/bucket-list - the caller's wishlist entries
export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const familyMemberId = searchParams.get('family_member_id');

    let query = supabase
      .from('bucket_list')
      .select('id, country_id, family_member_id, notes, created_at, countries (country_name, country_code, flag_url, region)')
      .order('created_at', { ascending: false });

    if (familyMemberId && familyMemberId !== 'all') {
      query = query.eq('family_member_id', parseInt(familyMemberId));
    } else if (!familyMemberId) {
      query = query.is('family_member_id', null);
    }
    // 'all' -> no filter

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bucket list:', error);
      return NextResponse.json({ error: 'Failed to fetch bucket list' }, { status: 500 });
    }

    const result = (data || []).map((row: any) => ({
      id: row.id,
      countryId: row.country_id,
      familyMemberId: row.family_member_id,
      notes: row.notes || '',
      createdAt: row.created_at,
      countryName: row.countries?.country_name || `Country ${row.country_id}`,
      countryCode: row.countries?.country_code || 'XX',
      flagUrl: row.countries?.flag_url,
      region: row.countries?.region || null,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in bucket list GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bucket-list - add a country to the wishlist
export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { user, supabase } = auth;

  try {
    const { countryId, notes, familyMemberId } = await request.json();
    if (!countryId) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
    }

    const insertData: any = { user_id: user.id, country_id: countryId };
    if (familyMemberId && familyMemberId !== 'all') insertData.family_member_id = familyMemberId;
    if (notes !== undefined) insertData.notes = notes;

    const { data, error } = await supabase
      .from('bucket_list')
      .insert([insertData])
      .select('id, country_id, family_member_id, notes, countries (country_name, country_code, flag_url, region)')
      .single();

    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate')) {
        return NextResponse.json({ error: 'Already on the bucket list' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({
      message: 'Added to bucket list',
      data: {
        id: data.id,
        countryId: data.country_id,
        familyMemberId: data.family_member_id,
        notes: data.notes || '',
        countryName: (data.countries as any)?.country_name,
        countryCode: (data.countries as any)?.country_code,
        flagUrl: (data.countries as any)?.flag_url,
        region: (data.countries as any)?.region ?? null,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding to bucket list:', error);
    return NextResponse.json(
      { error: 'Failed to add to bucket list', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bucket-list?id=123 - remove a wishlist entry
export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Bucket list ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Removed from bucket list' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting bucket list entry:', error);
    return NextResponse.json(
      { error: 'Failed to remove from bucket list', details: error.message },
      { status: 500 }
    );
  }
}
