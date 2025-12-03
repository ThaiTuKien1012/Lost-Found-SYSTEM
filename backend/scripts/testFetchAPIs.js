const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials - using seed data
const testUser = {
  email: 'student1@fptu.edu.vn',
  password: 'password123'
};

async function testAPIs() {
  try {
    console.log('🔐 Step 1: Logging in to get token...\n');
    
    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!\n');
    console.log('Token:', token.substring(0, 50) + '...\n');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    // Test 1: GET /api/lost-items/my-reports
    console.log('📋 Step 2: Fetching My Reports (Báo Mất Đồ)...\n');
    try {
      const myReportsResponse = await axios.get(
        `${API_URL}/lost-items/my-reports?page=1&limit=10`,
        { headers }
      );
      
      console.log('✅ My Reports API Response:');
      console.log('Status:', myReportsResponse.status);
      console.log('Success:', myReportsResponse.data.success);
      console.log('Total Items:', myReportsResponse.data.data?.length || 0);
      console.log('Pagination:', myReportsResponse.data.pagination || 'N/A');
      
      if (myReportsResponse.data.data && myReportsResponse.data.data.length > 0) {
        console.log('\n📦 Sample Report:');
        const sample = myReportsResponse.data.data[0];
        console.log('  - ID:', sample._id);
        console.log('  - Item Name:', sample.itemName);
        console.log('  - Category:', sample.category);
        console.log('  - Status:', sample.status);
        console.log('  - Created:', sample.createdAt);
      }
    } catch (error) {
      console.error('❌ My Reports API Error:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.error || error.message);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: GET /api/matching/suggestions
    console.log('🔗 Step 3: Fetching Matching Suggestions (Khớp Đồ)...\n');
    try {
      const suggestionsResponse = await axios.get(
        `${API_URL}/matching/suggestions`,
        { headers }
      );
      
      console.log('✅ Matching Suggestions API Response:');
      console.log('Status:', suggestionsResponse.status);
      console.log('Success:', suggestionsResponse.data.success);
      console.log('Total Suggestions:', suggestionsResponse.data.data?.length || 0);
      
      if (suggestionsResponse.data.data && suggestionsResponse.data.data.length > 0) {
        console.log('\n🎯 Sample Suggestion:');
        const sample = suggestionsResponse.data.data[0];
        console.log('  - Match ID:', sample.matchId);
        console.log('  - Item Name:', sample.itemName);
        console.log('  - Match Confidence:', sample.matchConfidence + '%');
        console.log('  - Match Reason:', sample.matchReason);
        console.log('  - Lost Item ID:', sample.lostItemId);
        console.log('  - Found Item ID:', sample.foundItemId);
      } else {
        console.log('\n⚠️  No matching suggestions found.');
      }
    } catch (error) {
      console.error('❌ Matching Suggestions API Error:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.error || error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ API Testing Complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testAPIs();

