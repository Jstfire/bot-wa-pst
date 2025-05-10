/**
 * Example Client for WhatsApp API
 * 
 * This is a simple example showing how to use the WhatsApp API
 * to send messages to WhatsApp users.
 */

// Replace with your API token
const API_TOKEN = "YOUR_API_TOKEN_HERE";
// Replace with the API server URL
const API_URL = "http://localhost:3002";

// Example: Send a text message
async function sendTextMessage(number, message) {
    try {
        const response = await fetch(`${API_URL}/api/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                number: number,
                message: message
            })
        });

        const data = await response.json();
        console.log('Message sending result:', data);
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Example: Send an image with caption
async function sendImageMessage(number, imageUrl, caption) {
    try {
        const response = await fetch(`${API_URL}/api/send-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                number: number,
                imageUrl: imageUrl,
                caption: caption
            })
        });

        const data = await response.json();
        console.log('Image message sending result:', data);
        return data;
    } catch (error) {
        console.error('Error sending image message:', error);
        throw error;
    }
}

// Example: Generate an API Token (admin only)
async function generateApiToken(adminKey, tokenName) {
    try {
        const response = await fetch(`${API_URL}/api/tokens/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminKey: adminKey,
                name: tokenName
            })
        });

        const data = await response.json();
        console.log('Token generation result:', data);
        return data;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

// Example: Check if a number exists on WhatsApp
async function checkWhatsAppNumber(number) {
    try {
        const response = await fetch(`${API_URL}/api/check-number`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                number: number
            })
        });

        const data = await response.json();
        console.log('Number check result:', data);
        return data;
    } catch (error) {
        console.error('Error checking number:', error);
        throw error;
    }
}

// Example usage:
// sendTextMessage('085123456789', 'Hello from the API client!');
// sendImageMessage('085123456789', 'https://example.com/image.jpg', 'Check out this image!');
// checkWhatsAppNumber('085123456789');
// generateApiToken('buselkab-bps-admin', 'My Application');
