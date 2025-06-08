const fetch = require('node-fetch');

// Test the add family member endpoint
async function testAddFamilyMember() {
  try {
    console.log('Testing add family member endpoint...');
    
    // We need to get a valid session token. Let's simulate the request that would come from the frontend
    const response = await fetch('http://localhost:3000/api/family-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail but we can see the logs
      },
      body: JSON.stringify({ 
        name: 'Test Family Member',
        avatarColor: '#ff6b6b'
      }),
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAddFamilyMember();
