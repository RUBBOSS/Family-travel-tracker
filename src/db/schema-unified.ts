/**
 * @fileoverview Unified Schema Definition for Family Travel Tracker
 * 
 * This file contains:
 * 1. TypeScript schema definitions using Drizzle ORM
 * 2. SQL schema setup functions (To be executed in Supabase)
 * 3. Utility functions to check and ensure schema consistency
 */

import { pgTable, serial, varchar, timestamp, integer, uuid, text, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { supabase } from '@/utils/supabaseClient';

// ========================================
// TypeScript Schema Definitions (Drizzle ORM)
// ========================================

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  countryName: varchar('country_name', { length: 255 }).notNull(),
  countryCode: varchar('country_code', { length: 2 }).notNull().unique(),
  flagUrl: varchar('flag_url', { length: 500 }),
  population: bigint('population', { mode: 'number' }),
  capital: varchar('capital', { length: 100 }),
  region: varchar('region', { length: 100 }),
  subregion: varchar('subregion', { length: 100 })
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }),
  avatarColor: varchar('avatar_color', { length: 7 }).default('#3B82F6'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const familyMembers = pgTable('family_members', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  avatarColor: varchar('avatar_color', { length: 7 }).default('#3B82F6'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const visitedCountries = pgTable('visited_countries', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  familyMemberId: integer('family_member_id'),
  countryId: integer('country_id').notNull(),
  visitDate: timestamp('visit_date', { withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Types
export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;

export type VisitedCountry = typeof visitedCountries.$inferSelect;
export type NewVisitedCountry = typeof visitedCountries.$inferInsert;

// Relations
export const countriesRelations = relations(countries, ({ many }) => ({
  visitedCountries: many(visitedCountries),
}));

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  visitedCountries: many(visitedCountries),
  familyMembers: many(familyMembers),
}));

export const familyMembersRelations = relations(familyMembers, ({ one, many }) => ({
  user: one(userProfiles, {
    fields: [familyMembers.userId],
    references: [userProfiles.id],
  }),
  visitedCountries: many(visitedCountries),
}));

export const visitedCountriesRelations = relations(visitedCountries, ({ one }) => ({
  country: one(countries, {
    fields: [visitedCountries.countryId],
    references: [countries.id],
  }),
  userProfile: one(userProfiles, {
    fields: [visitedCountries.userId],
    references: [userProfiles.id],
  }),
  familyMember: one(familyMembers, {
    fields: [visitedCountries.familyMemberId],
    references: [familyMembers.id],
  }),
}));

// ========================================
// Schema Validation & Setup Functions
// ========================================

/**
 * Checks if the required tables exist in the database
 * @returns An object with information about existing tables
 */
export async function checkExistingTables() {
  console.log('Checking existing database structure...');
  
  const results: any = {
    tables: {},
    existingUsers: 0,
    recommendations: []
  };
  
  try {
    // Check for existing tables by trying to query them
    const tablesToCheck = ['countries', 'user_profiles', 'visited_countries'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          results.tables[tableName] = {
            exists: true,
            count: count || 0,
            error: null
          };
          console.log(`✅ Table "${tableName}" exists with ${count || 0} records`);
        } else {
          results.tables[tableName] = {
            exists: false,
            count: 0,
            error: error.message
          };
          console.log(`❌ Table "${tableName}" does not exist or is inaccessible:`, error.message);
          
          if (tableName === 'user_profiles') {
            results.recommendations.push(
              'The user_profiles table is missing. Run the SQL setup script in the Supabase SQL Editor.'
            );
          }
        }
      } catch (err) {
        results.tables[tableName] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    }
    
    // Check for existing auth users
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authData?.user) {
        console.log('🔑 Current auth user detected');
        results.existingUsers = 1;
      }
    } catch (err) {
      console.error('Error checking auth user:', err);
    }
    
    return results;
  } catch (err) {
    console.error('Error checking database structure:', err);
    return {
      error: err instanceof Error ? err.message : String(err),
      tables: {},
      existingUsers: 0,
      recommendations: ['Failed to check database structure. Please check your Supabase credentials.']
    };
  }
}

/**
 * Ensures that the user_profiles table exists
 * @returns Object indicating success or failure
 */
export async function ensureUserProfilesTable() {
  console.log('Checking if user_profiles table exists...');
  
  try {
    // First check if the function exists, if not, try to execute the create function
    const { data: functions, error: fnError } = await supabase
      .rpc('create_user_profiles_table');
    
    if (fnError) {
      console.warn('Schema function not found - checking if user_profiles table exists directly');
      
      // Try to query the user_profiles table directly
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error checking user_profiles table:', error);
        console.error('Please run the SQL setup script in the Supabase SQL Editor');
        return { success: false, error };
      }
    } else {
      console.log('Schema function executed successfully');
    }
    
    // One more check to confirm the table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying user_profiles:', error);
      return { success: false, error };
    }
    
    console.log('user_profiles table exists and is accessible');
    return { success: true };
  } catch (err) {
    console.error('Unexpected error checking/creating user_profiles table:', err);
    return { success: false, error: err };
  }
}

/**
 * Ensures that the minimum required schema is in place
 * @returns Object indicating success or failure
 */
export async function ensureMinimalSchema() {
  return ensureUserProfilesTable();
}

// ========================================
// SQL Schema Setup (To be run in Supabase SQL Editor)
// ========================================

/**
 * SQL Schema Setup
 * 
 * Copy and run the following SQL in your Supabase SQL Editor:
 * 
 * ```sql
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

-- Check if family_members table exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'family_members') THEN
    CREATE TABLE public.family_members (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      avatar_color VARCHAR(7) DEFAULT '#3B82F6',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
    
    -- Enable RLS
    ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can manage their own family members" ON public.family_members
      FOR ALL USING (auth.uid() = user_id);
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
      family_member_id INTEGER REFERENCES public.family_members(id) ON DELETE CASCADE,
      country_id INTEGER NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
      visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, family_member_id, country_id)
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_visited_countries_user_id ON public.visited_countries(user_id);
    CREATE INDEX idx_visited_countries_family_member_id ON public.visited_countries(family_member_id);
    CREATE INDEX idx_visited_countries_country_id ON public.visited_countries(country_id);
    
    -- Enable RLS
    ALTER TABLE public.visited_countries ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can manage their own visited countries" ON public.visited_countries
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Check if family_members table exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'family_members') THEN
    CREATE TABLE public.family_members (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      avatar_color VARCHAR(7) DEFAULT '#3B82F6',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can manage their own family members" ON public.family_members
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;
 * ```
 */
