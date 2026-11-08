-- ============================================================
-- Family Travel Tracker — Migration 3
-- Run once in the Supabase SQL Editor.
-- Adds: agency branding columns on user_profiles + exposes them (with an
-- auth-metadata fallback) on public share pages via get_public_map.
-- Idempotent: safe to run again.
-- ============================================================

-- 1) Branding columns --------------------------------------------------------
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS agency_name      VARCHAR(60),
  ADD COLUMN IF NOT EXISTS agency_logo_url  VARCHAR(500),
  ADD COLUMN IF NOT EXISTS agency_color     VARCHAR(7);

-- 2) get_public_map v2: include agency branding -------------------------------
-- Preference order: profile columns (set in Agency Studio post-migration)
-- then auth user_metadata (set by Agency Studio before the migration ran).
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
  SELECT up.id, up.username, up.full_name, up.avatar_color,
         up.agency_name, up.agency_logo_url, up.agency_color
    INTO v_profile
    FROM public.user_profiles up
   WHERE lower(up.username) = lower(p_username)
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'profile', jsonb_build_object(
      'username',      v_profile.username,
      'fullName',      v_profile.full_name,
      'avatarColor',   v_profile.avatar_color,
      'agencyName',    COALESCE(v_profile.agency_name,    au.meta->>'agency_name'),
      'agencyLogoUrl', COALESCE(v_profile.agency_logo_url, au.meta->>'agency_logo_url'),
      'agencyColor',   COALESCE(v_profile.agency_color,   au.meta->>'agency_color')
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
    INTO v_result
    FROM LATERAL (
      SELECT au.raw_user_meta_data AS meta
        FROM auth.users au
       WHERE au.id = v_profile.id
       LIMIT 1
    ) au;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_map(TEXT) TO anon, authenticated;
