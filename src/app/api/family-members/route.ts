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
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: familyMembers, error } = await supabaseServer
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching family members:', error);
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
    }

    return NextResponse.json({ familyMembers });
  } catch (error) {
    console.error('Error in family members GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, avatarColor } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: familyMember, error } = await supabaseServer
      .from('family_members')
      .insert({
        user_id: user.id,
        name: name.trim(),
        avatar_color: avatarColor || '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating family member:', error);
      return NextResponse.json({ error: 'Failed to create family member' }, { status: 500 });
    }

    return NextResponse.json({ familyMember });
  } catch (error) {
    console.error('Error in family members POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const familyMemberId = searchParams.get('id');

    if (!familyMemberId) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 });
    }

    // First verify the family member belongs to the current user
    const { data: familyMember, error: fetchError } = await supabaseServer
      .from('family_members')
      .select('*')
      .eq('id', familyMemberId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !familyMember) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    // Delete the family member
    const { error } = await supabaseServer
      .from('family_members')
      .delete()
      .eq('id', familyMemberId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting family member:', error);
      return NextResponse.json({ error: 'Failed to delete family member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in family members DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
