# Supabase Setup Instructions

If you're experiencing issues with the user authentication or profile data, you may need to set up your Supabase database correctly.

## Quick Setup Instructions

1. Log in to your Supabase account at [https://supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Click on "SQL Editor" in the left sidebar
4. Open the file at `setup/create_user_profiles_function.sql` from this project
5. Copy the entire SQL content and paste it into the Supabase SQL Editor
6. Click "Run" to execute the SQL which will:
   - Create the user_profiles table if it doesn't exist
   - Set up the necessary triggers for user creation
   - Configure Row Level Security policies

## Fixing Authentication Issues

If you're seeing errors like `Error fetching user profile: {}`, it likely means:

1. The `user_profiles` table doesn't exist in your Supabase database
2. Your Supabase API keys are incorrect or corrupted in your `.env.local` file

### Check Your Environment Variables

Make sure your `.env.local` file has the correct Supabase URL and API keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in the Supabase dashboard under Project Settings > API.

### Check Database Schema

To verify your database schema is set up correctly:

1. Go to your Supabase dashboard
2. Click on "Table Editor" in the left sidebar
3. Confirm that a "user_profiles" table exists
4. If not, run the SQL setup script as described above

## Support

If you continue to experience issues, check the console logs in your browser for more detailed error messages.
