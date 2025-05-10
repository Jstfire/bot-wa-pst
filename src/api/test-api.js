/**
 * WhatsApp API Test Script
 * 
 * This script tests all the API endpoints to ensure they're working correctly.
 * Run this script with Node.js to test the API.
 */

// Configuration
const API_URL = 'http://localhost:3002';
const ADMIN_KEY = 'buselkab-bps-admin';
const TEST_PHONE = '6289616370100'; // Add a test phone number here
let API_TOKEN = ''; // Will be filled after generating a token

// Helper function to log test results
function logTest(name, success, message) {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${name}`);
    if (message) {
        console.log(`${message}`);
    }
}

async function runTests() {
    console.log('\n🧪 TESTING WHATSAPP API\n');

    try {
        // Test 1: Generate an API token
        console.log('\n🔑 Testing Token Management:');
        const tokenResponse = await fetch(`${API_URL}/api/tokens/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminKey: ADMIN_KEY,
                name: 'API Test Token'
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.success && tokenData.token) {
            API_TOKEN = tokenData.token;
            logTest('Generate Token', true, `Token: ${API_TOKEN.substring(0, 8)}...`);
        } else {
            logTest('Generate Token', false, `Error: ${tokenData.message || 'Unknown error'}`);
            console.log('⛔ Cannot continue tests without a valid token');
            return;
        }

        // Test 2: List tokens
        const listResponse = await fetch(`${API_URL}/api/tokens?adminKey=${ADMIN_KEY}`);
        const listData = await listResponse.json();

        logTest('List Tokens', listData.success,
            listData.success ? `Found ${listData.tokens.length} tokens` : `Error: ${listData.message}`);

        // Test 3: Send a message (only if a test phone is provided)
        if (TEST_PHONE) {
            console.log('\n📱 Testing Message Sending:');

            const messageResponse = await fetch(`${API_URL}/api/send-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    number: TEST_PHONE,
                    message: '🧪 This is a test message from the WhatsApp API'
                })
            });

            const messageData = await messageResponse.json();
            logTest('Send Message', messageData.success,
                messageData.success ? `Message sent to ${messageData.to}` : `Error: ${messageData.message}`);

            // Test 4: Check number (only if a test phone is provided)
            const checkResponse = await fetch(`${API_URL}/api/check-number`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    number: TEST_PHONE
                })
            });

            const checkData = await checkResponse.json();
            logTest('Check Number', checkData.success,
                checkData.success ? `Number ${checkData.number} exists: ${checkData.exists}` : `Error: ${checkData.message}`);            // Test 5: Send an image message
            const imageResponse = await fetch(`${API_URL}/api/send-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                }, body: JSON.stringify({
                    number: TEST_PHONE,
                    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/694px-Star_Wars_Logo.svg.png',
                    caption: '🧪 This is a test image from the WhatsApp API'
                })
            });

            const imageData = await imageResponse.json();
            logTest('Send Image', imageData.success,
                imageData.success ? `Image sent to ${imageData.to}` : `Error: ${imageData.message}`);
        } else {
            console.log('\n⚠️ Skipping message tests - no test phone number provided');
        }

        // Test 6: Authorization test
        console.log('\n🔒 Testing Authorization:');

        const authResponse = await fetch(`${API_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token'
            },
            body: JSON.stringify({
                number: '123456789',
                message: 'This should not be sent'
            })
        });

        const authData = await authResponse.json();
        // We expect this to fail with an auth error
        logTest('Auth Validation', !authData.success && authResponse.status === 401,
            'Should reject invalid tokens');

        // Test 7: Revoke the token we created
        const revokeResponse = await fetch(
            `${API_URL}/api/tokens/${API_TOKEN.substring(0, 8)}?adminKey=${ADMIN_KEY}`,
            { method: 'DELETE' }
        );

        const revokeData = await revokeResponse.json();
        logTest('Revoke Token', revokeData.success,
            revokeData.success ? 'Token successfully revoked' : `Error: ${revokeData.message}`);

        console.log('\n🏁 Tests completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the tests
runTests();
