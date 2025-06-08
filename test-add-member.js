// Test script to simulate adding a family member
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAddFamilyMember() {
  try {
    console.log('Getting session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
    
    console.log('Making POST request to add family member...');
    const response = await fetch('http://localhost:3000/api/family-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        name: 'Test Family Member',
        avatarColor: '#ff6b6b'
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Success response:', data);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAddFamilyMember();
