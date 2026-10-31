import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, unauthorized } from '@/utils/apiAuth';

// DELETE handler for /api/visited/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getUserFromRequest(request);
  if (!auth) return unauthorized();
  const { supabase } = auth;

  try {
    const { id } = await params;

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
