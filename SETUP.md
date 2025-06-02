# Family Travel Tracker - Supabase Setup

## Quick Setup Instructions

### 1. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `supabase-schema.sql`
4. Click **Run** to execute the script

### 2. Disable Email Confirmation (Development)
1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Scroll down to **User Signups**
3. Turn **OFF** "Enable email confirmations"
4. Click **Save**

### 3. Environment Variables
Make sure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Test the App
1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Register a new account
4. Start adding countries you've visited!

## What This Setup Creates

- **Countries Table**: All 195 world countries with flags and basic info
- **Visited Countries Table**: User-specific visited country records
- **Row Level Security**: Users can only see their own data
- **Supabase Auth Integration**: Uses built-in authentication

## Troubleshooting

If you get authentication errors:
1. Double-check your environment variables
2. Make sure email confirmation is disabled
3. Try registering with a new email address

If countries don't load:
1. Check that the schema script ran successfully
2. Verify the countries table has 195 records
3. Check browser console for API errors
