# WhatsApp API Documentation

This API allows external applications to send WhatsApp messages through the BPS Buton Selatan bot.

## Authentication

All API requests require a token for authentication. Tokens can be managed through the admin panel.

### Token Header Format

``` Authorization: Bearer YOUR_API_TOKEN ```

## Endpoints

### Send Message

**URL:** `/api/send-message`

**Method:** `POST`

**Headers:**
- `Authorization: Bearer YOUR_API_TOKEN`
- `Content-Type: application/json`

**Request Body:**
```json 
{
  "number": "628123456789",
  "message": "Your message text here"
}
```

**Notes about the number parameter:**
- Can be provided with or without country code (62 will be added if missing)
- Can be provided with or without leading zero
- Will automatically format to proper WhatsApp format

**Success Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "to": "628123456789"
}
```

**Error Responses:**

1. Missing token:
```json
{
  "success": false,
  "message": "Authentication token is required"
}
```

2. Invalid token:
```json
{
  "success": false,
  "message": "Invalid authentication token"
}
```

3. Missing parameters:
```json
{
  "success": false,
  "message": "Both number and message are required"
}
```

4. WhatsApp service unavailable:
```json
{
  "success": false,
  "message": "WhatsApp service not available"
}
```

5. Error sending message:
```json
{
  "success": false,
  "message": "Failed to send message",
  "error": "Error details here"
}
```

## Token Management

Tokens can be managed through the admin panel at `/api/admin`.

### Admin Key

The default admin key is `buselkab-bps-admin`. This should be changed for production use.

### Generate Token

1. Visit `/api/admin`
2. Enter the admin key
3. Provide a name for the token (e.g., "Web Portal")
4. Click "Generate New Token"
5. Save the token securely - it cannot be retrieved later

### View Tokens

1. Visit `/api/admin`
2. Enter the admin key
3. Click "Load Tokens"

### Revoke Token

1. Visit `/api/admin`
2. Enter the admin key
3. Click "Load Tokens"
4. Click "Revoke" next to the token you want to revoke

## Example Usage

### JavaScript

```javascript
async function sendWhatsAppMessage(phoneNumber, message) {
  const apiUrl = 'http://your-api-url/api/send-message';
  const apiToken = 'YOUR_API_TOKEN';
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({
        number: phoneNumber,
        message: message
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    console.log('Message sent successfully!');
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Example usage:
sendWhatsAppMessage('6281234567890', 'Hello from the API!');
```

### PHP

```php
function sendWhatsAppMessage($phoneNumber, $message) {
  $apiUrl = 'http://your-api-url/api/send-message';
  $apiToken = 'YOUR_API_TOKEN';
  
  $data = array(
    'number' => $phoneNumber,
    'message' => $message
  );
  
  $options = array(
    'http' => array(
      'header'  => "Content-type: application/json\r\nAuthorization: Bearer " . $apiToken,
      'method'  => 'POST',
      'content' => json_encode($data)
    )
  );
  
  $context = stream_context_create($options);
  $result = file_get_contents($apiUrl, false, $context);
  
  if ($result === FALSE) {
    throw new Exception("Error sending message");
  }
  
  return json_decode($result, true);
}

// Example usage:
try {
  $result = sendWhatsAppMessage('6281234567890', 'Hello from PHP!');
  echo "Message sent successfully!";
} catch (Exception $e) {
  echo "Error: " . $e->getMessage();
}
```
