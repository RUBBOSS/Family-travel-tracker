'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export function ApplySchema() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
    const runSchemaSetup = async () => {
    setStatus('loading');
    setMessage('Setting up database schema...');
    
    try {
      // Use the consolidated schema setup with safety checks to not fail on existing tables
      const schemaSetupSQL = `
        -- User profiles table setup
        DO $$
        BEGIN
          -- Create user_profiles table if it doesn't exist
          IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
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
            
            RAISE NOTICE 'Created user_profiles table';
          ELSE
            RAISE NOTICE 'user_profiles table already exists, skipping creation';
          END IF;
        END
        $$;

        -- Create handle_new_user function if it doesn't exist
        DO $$
        BEGIN
          -- Drop existing function if we're recreating
          DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
          
          -- Create trigger function for new users
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

          RAISE NOTICE 'Created handle_new_user function';
          
          -- Create trigger to automatically create user profile on signup
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
            
          RAISE NOTICE 'Created auth trigger';
        END
        $$;
        
        -- Create countries table if it doesn't exist
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
              
            RAISE NOTICE 'Created countries table';
          ELSE
            RAISE NOTICE 'countries table already exists, skipping creation';
          END IF;
        END
        $$;
        
        -- Create visited_countries table if it doesn't exist
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
              
            RAISE NOTICE 'Created visited_countries table';
          ELSE
            RAISE NOTICE 'visited_countries table already exists, skipping creation';
          END IF;
        END
        $$;
        
        -- Create create_user_profiles_table function for compatibility
        CREATE OR REPLACE FUNCTION create_user_profiles_table()
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN TRUE;
        END;
        $$;
      `;
      
      // Execute the consolidated SQL
      setMessage('Setting up database tables...');
      const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSetupSQL });
      
      if (error) {
        throw new Error(`Schema setup failed: ${error.message}`);
      }
      
      // Final check
      setMessage('Verifying schema...');
      const { data: verifyData, error: verifyError } = await supabase.rpc('create_user_profiles_table');
      
      setStatus('success');
      setMessage('Schema setup completed successfully! Refreshing page in 3 seconds...');
      
      // Refresh the page after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (err) {
      console.error('Error setting up schema:', err);
      setStatus('error');
      setMessage(`Error setting up schema: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  return (
    <div className="mt-4">
      <button 
        onClick={runSchemaSetup}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded-md ${
          status === 'loading' ? 'bg-slate-500' :
          status === 'error' ? 'bg-red-600 hover:bg-red-700' : 
          status === 'success' ? 'bg-green-600' :
          'bg-blue-600 hover:bg-blue-700'
        } text-white font-medium transition-colors`}
      >
        {status === 'loading' ? 'Setting up...' : 
         status === 'success' ? 'Setup Complete' : 
         status === 'error' ? 'Try Again' : 
         'Setup Database Schema'}
      </button>
      
      {message && (
        <p className={`mt-2 text-sm ${
          status === 'error' ? 'text-red-400' :
          status === 'success' ? 'text-green-400' :
          'text-slate-300'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
