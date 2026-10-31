import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createRequestClient } from './supabaseRequestClient';

/**
 * Validates the Bearer token on an API request and returns the user plus a
 * Supabase client scoped to that user's JWT (so RLS enforces ownership).
 * Returns nulls when the request is unauthenticated.
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ user: User; supabase: ReturnType<typeof createRequestClient> } | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;

  const supabase = createRequestClient(token);

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return null;
    }

    return { user: data.user, supabase };
  } catch {
    return null;
  }
}

/** Uniform 401 response for API routes. */
export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
