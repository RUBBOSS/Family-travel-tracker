# Database Schema Setup

This document provides instructions for setting up the database schema for the Family Travel Tracker application.

## Quick Setup Steps

1. **Access Supabase SQL Editor**:
   - Log in to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to the SQL Editor

2. **Run the Schema SQL**:
   - Open the file `schema.sql` from this project
   - Copy the entire SQL content
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute the SQL

3. **Verify Setup**:
   - Check that the tables have been created in the Table Editor:
     - `countries`
     - `user_profiles`
     - `visited_countries`
   - Verify that the functions exist:
     - `exec_sql`
     - `create_user_profiles_table`
     - `handle_new_user`

## Automatic Setup

The application includes a feature to automatically set up the database schema. To use it:

1. Start the application
2. If the schema is not properly set up, you'll see a "Schema Setup Required" message
3. Click the "Setup Database Schema" button

## Schema Components

### Tables

1. **Countries**:
   - Stores information about all countries in the world
   - Includes country codes, names, flags, population, and geographical data

2. **User Profiles**:
   - Stores user profile information
   - Links to Supabase authentication system
   - Includes username, full name, and avatar color

3. **Visited Countries**:
   - Links users to countries they've visited
   - Includes visit date and notes

### Functions

1. **exec_sql**:
   - Allows executing SQL from client code (service role only)
   - Used by the automatic schema setup feature

2. **create_user_profiles_table**:
   - Creates the user_profiles table if it doesn't exist
   - Sets up necessary indexes and security policies

3. **handle_new_user**:
   - Automatically creates a user profile when a new user signs up
   - Generates a unique username based on email address

## Security

The schema includes Row Level Security (RLS) policies:

- Countries: Anyone can view all countries
- User Profiles: Users can manage their own profiles, but anyone can view basic profile information
- Visited Countries: Users can only access their own visited countries data

## Environment Configuration

Make sure your `.env.local` file includes:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in the Supabase dashboard under Project Settings > API.

## Troubleshooting

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase URL and API keys are correct
3. Make sure the schema was properly set up by checking the tables in the Supabase Table Editor
4. Try running the schema setup SQL manually
