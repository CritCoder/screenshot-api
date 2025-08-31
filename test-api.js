import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('🚀 Starting API Tests...\n');

    // 1. Register a test user
    console.log('1. Registering user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    });

    console.log('✅ User registered successfully');
    console.log('📧 Email:', registerResponse.data.user.email);
    console.log('🔑 API Key:', registerResponse.data.apiKey);
    console.log('💳 Credits:', registerResponse.data.user.credits, '\n');

    const { apiKey } = registerResponse.data;

    // 2. Take a screenshot
    console.log('2. Taking screenshot of example.com...');
    const screenshotResponse = await axios.post(`${BASE_URL}/screenshots`, {
      url: 'https://example.com',
      format: 'png',
      fullPage: true,
      waitFor: 1000
    }, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    console.log('✅ Screenshot taken successfully');
    console.log('📸 File:', screenshotResponse.data.screenshot.filePath);
    console.log('📏 Size:', screenshotResponse.data.screenshot.size, 'bytes');
    console.log('⏱️  Processing Time:', screenshotResponse.data.processingTime, 'ms');
    console.log('💳 Credits Remaining:', screenshotResponse.data.creditsRemaining, '\n');

    // 3. Generate a PDF
    console.log('3. Generating PDF of example.com...');
    const pdfResponse = await axios.post(`${BASE_URL}/screenshots/pdf`, {
      url: 'https://example.com',
      format: 'A4',
      landscape: false,
      printBackground: true
    }, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    console.log('✅ PDF generated successfully');
    console.log('📄 File:', pdfResponse.data.pdf.filePath);
    console.log('📏 Size:', pdfResponse.data.pdf.size, 'bytes');
    console.log('⏱️  Processing Time:', pdfResponse.data.processingTime, 'ms');
    console.log('💳 Credits Remaining:', pdfResponse.data.creditsRemaining, '\n');

    // 4. Check request history
    console.log('4. Checking request history...');
    const historyResponse = await axios.get(`${BASE_URL}/screenshots/history`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    console.log('✅ History retrieved successfully');
    console.log('📊 Total Requests:', historyResponse.data.requests.length);
    historyResponse.data.requests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.type.toUpperCase()} - ${req.url} - ${req.status}`);
    });

    // 5. Check usage statistics
    console.log('\n5. Checking usage statistics...');
    const usageResponse = await axios.get(`${BASE_URL}/screenshots/usage`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    console.log('✅ Usage statistics retrieved');
    console.log('📈 Month:', usageResponse.data.month);
    console.log('📊 Requests:', usageResponse.data.requests);
    console.log('💳 Credits Remaining:', usageResponse.data.creditsRemaining);

    console.log('\n🎉 All tests passed successfully! Your Screenshot API is ready to use.');
    console.log('\n📚 Check the README.md for complete API documentation and examples.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

console.log('📝 Note: Make sure the server is running with "npm run dev" before running this test.\n');
testAPI();