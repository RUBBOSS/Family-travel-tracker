-- ============================================================
-- Family Travel Tracker — Migration 2
-- Run once in the Supabase SQL Editor.
-- Adds: bucket_list table + RLS, get_public_map RPC (public share pages).
-- Idempotent: safe to run again.
-- ============================================================

-- 1) Bucket list ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bucket_list (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id       INTEGER NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  family_member_id INTEGER REFERENCES public.family_members(id) ON DELETE CASCADE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS bucket_list_unique_idx
  ON public.bucket_list (user_id, COALESCE(family_member_id, 0), country_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_user_id ON public.bucket_list (user_id);

ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own bucket list" ON public.bucket_list;
CREATE POLICY "Users can manage their own bucket list"
  ON public.bucket_list
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bucket_list TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE bucket_list_id_seq TO authenticated;

-- 2) Public share-page RPC ---------------------------------------------------
-- Returns everything /u/<username> needs without exposing notes or emails.
-- SECURITY DEFINER so anonymous visitors can read one user's map data.
CREATE OR REPLACE FUNCTION public.get_public_map(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_result   JSONB;
BEGIN
  SELECT id, username, full_name, avatar_color
    INTO v_profile
    FROM public.user_profiles
   WHERE lower(username) = lower(p_username)
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'username',    v_profile.username,
      'fullName',    v_profile.full_name,
      'avatarColor', v_profile.avatar_color
    ),
    'visits', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'countryCode', c.country_code,
            'countryName', c.country_name,
            'visitDate',   vc.visit_date,
            'memberName',  COALESCE(fm.name, v_profile.username),
            'memberColor', COALESCE(fm.avatar_color, v_profile.avatar_color),
            'isPersonal',  (vc.family_member_id IS NULL)
          ) ORDER BY vc.visit_date
        )
        FROM public.visited_countries vc
        JOIN public.countries c ON c.id = vc.country_id
        LEFT JOIN public.family_members fm ON fm.id = vc.family_member_id
        WHERE vc.user_id = v_profile.id
      ),
      '[]'::jsonb
    ),
    'familyMembers', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object('name', fm.name, 'color', fm.avatar_color)
        )
        FROM public.family_members fm
        WHERE fm.user_id = v_profile.id
      ),
      '[]'::jsonb
    )
  )
    INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_map(TEXT) TO anon, authenticated;

-- 3) user_profiles: make sure the username lookup stays fast -----------------
CREATE INDEX IF NOT EXISTS idx_user_profiles_username_lower
  ON public.user_profiles (lower(username));

-- 4) Close the exec_sql hole -------------------------------------------------
-- The live project had granted EXECUTE on exec_sql to anon — that allows
-- arbitrary SQL execution by anyone. Restore the intended service_role-only
-- grant (matches supabase-unified.sql).
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.exec_sql(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(TEXT) TO service_role;
