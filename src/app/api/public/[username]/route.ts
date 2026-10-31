import { NextRequest, NextResponse } from 'next/server';
import { createRequestClient } from '@/utils/supabaseRequestClient';

// GET /api/public/[username] - public map data for share pages (no auth).
// Backed by the get_public_map SECURITY DEFINER RPC — returns profile, visits
// and family members only; never notes, emails or auth data.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username || username.length > 50) {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    const supabase = createRequestClient();
    const { data, error } = await supabase.rpc('get_public_map', {
      p_username: decodeURIComponent(username),
    });

    if (error) {
      console.error('get_public_map RPC error:', error.message);
      return NextResponse.json({ error: 'Failed to load map' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Traveler not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in public map API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
