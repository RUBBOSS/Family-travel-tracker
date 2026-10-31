import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/utils/apiAuth';

export async function GET(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const { data: familyMembers, error } = await supabase
      .from('family_members')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching family members:', error);
      return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 });
    }

    // Transform snake_case to camelCase to match our TypeScript types
    const transformedFamilyMembers = familyMembers?.map(member => ({
      id: member.id,
      userId: member.user_id,
      name: member.name,
      avatarColor: member.avatar_color,
      createdAt: member.created_at,
      updatedAt: member.updated_at
    })) || [];

    return NextResponse.json({ familyMembers: transformedFamilyMembers });
  } catch (error) {
    console.error('Error in family members GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { user, supabase } = auth;

  try {
    const { name, avatarColor } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: familyMember, error } = await supabase
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

    const transformedFamilyMember = {
      id: familyMember.id,
      userId: familyMember.user_id,
      name: familyMember.name,
      avatarColor: familyMember.avatar_color,
      createdAt: familyMember.created_at,
      updatedAt: familyMember.updated_at
    };

    return NextResponse.json({ familyMember: transformedFamilyMember });
  } catch (error) {
    console.error('Error in family members POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const familyMemberId = searchParams.get('id');

    if (!familyMemberId) {
      return NextResponse.json({ error: 'Family member ID is required' }, { status: 400 });
    }

    // RLS scopes this to the caller's rows; the explicit eq() keeps semantics clear
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', familyMemberId);

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
