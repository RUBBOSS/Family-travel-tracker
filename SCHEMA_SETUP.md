# Family Travel Tracker Schema Setup

This document provides instructions on how to set up the database schema for the Family Travel Tracker application.

## Quick Setup

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to the SQL Editor
4. First, run the SQL function setup (required for automatic schema setup):
   ```sql
   -- Create an RPC function that can execute SQL (service role only)
   CREATE OR REPLACE FUNCTION exec_sql(sql text)
   RETURNS jsonb
   LANGUAGE plpgsql
   SECURITY DEFINER -- This runs with the privileges of the function creator
   AS $$
   BEGIN
     EXECUTE sql;
     RETURN jsonb_build_object('success', true);
   EXCEPTION WHEN OTHERS THEN
     RETURN jsonb_build_object(
       'success', false,
       'error', SQLERRM,
       'detail', SQLSTATE
     );
   END;
   $$;

   -- Set RLS policy for the function (service role only)
   REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
   GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
   ```
5. Then copy and paste the main schema SQL code below
6. Click "Run" to execute the SQL

## SQL Setup Code

```sql
-- Family Travel Tracker - SQL Schema Setup
-- Copy and paste this into your Supabase SQL Editor

-- Create function to set up the schema
CREATE OR REPLACE FUNCTION create_user_profiles_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    RETURN TRUE;
  END IF;

  -- Create the user_profiles table
  CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create index on username for faster lookups
  CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

  -- Enable RLS
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  CREATE POLICY "Users can manage their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

  CREATE POLICY "Anyone can view user profiles" ON public.user_profiles
    FOR SELECT USING (true);

  -- Create trigger for new users
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  DECLARE
    base_username text;
    final_username text;
    user_full_name text;
    user_avatar_color text;
    counter integer := 1;
  BEGIN
    -- Extract metadata from the new user
    base_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    );
    
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    user_avatar_color := COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#3B82F6');
    
    -- Generate a unique username
    final_username := base_username;
    WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
      final_username := base_username || counter::text;
      counter := counter + 1;
      
      -- Prevent infinite loops (safety check)
      IF counter > 100 THEN
        final_username := base_username || '_' || extract(epoch from now())::text;
        EXIT;
      END IF;
    END LOOP;
    
    -- Insert the user profile
    INSERT INTO public.user_profiles (id, username, full_name, avatar_color)
    VALUES (NEW.id, final_username, user_full_name, user_avatar_color);
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error and still return NEW to not block authentication
      RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create trigger to automatically create user profile on signup
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

  RETURN TRUE;
END;
$$;

-- Run the function to create the user_profiles table
SELECT create_user_profiles_table();

-- Check if countries table exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'countries') THEN
    CREATE TABLE public.countries (
      id SERIAL PRIMARY KEY,
      country_code CHAR(2) UNIQUE NOT NULL,
      country_name VARCHAR(255) NOT NULL,
      flag_url VARCHAR(500),
      population BIGINT,
      capital VARCHAR(100),
      region VARCHAR(100),
      subregion VARCHAR(100)
    );
    
    -- Enable RLS
    ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Anyone can view countries" ON public.countries
      FOR SELECT USING (true);
  END IF;
END
$$;

-- Check if visited_countries table exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'visited_countries') THEN
    CREATE TABLE public.visited_countries (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      country_id INTEGER NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
      visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, country_id)
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_visited_countries_user_id ON public.visited_countries(user_id);
    CREATE INDEX idx_visited_countries_country_id ON public.visited_countries(country_id);
    
    -- Enable RLS
    ALTER TABLE public.visited_countries ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can manage their own visited countries" ON public.visited_countries
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;
```

## Schema Details

The schema sets up three main tables:

1. **countries** - Stores information about all countries
2. **user_profiles** - Stores user profile information
3. **visited_countries** - Stores which countries a user has visited

The schema also includes:

- Row Level Security (RLS) policies
- Indexes for better performance
- A trigger to automatically create a user profile when a new user signs up
- Functions to handle username generation and table creation

## Environment Variables

Make sure your `.env.local` file has the correct Supabase configuration:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under Project Settings > API.

## Need Help?

If you encounter any issues:

1. Open the browser console to see detailed error messages
2. Check that your Supabase URL and API keys are correct
3. Verify that the tables were created properly in the Supabase Table Editor
