import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/utils/supabaseServerClient';

// Helper to get user from Supabase JWT - reused from the main route.ts
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

// DELETE handler specifically for /api/visited/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    console.log('Deleting visited country with ID:', id, 'for user:', user.id);
    
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
