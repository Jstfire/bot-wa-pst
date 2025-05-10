# Dokumentasi WhatsApp API - BPS Buton Selatan

API ini memungkinkan aplikasi eksternal untuk mengirim pesan WhatsApp secara terprogram menggunakan infrastruktur WhatsApp Bot BPS Buton Selatan.

## Fitur Utama

- Mengirim pesan teks ke nomor WhatsApp
- Mengirim gambar dengan caption ke nomor WhatsApp
- Memverifikasi keberadaan nomor pada WhatsApp sebelum mengirim pesan
- Manajemen token API untuk keamanan

## Autentikasi

Semua permintaan API memerlukan autentikasi menggunakan token yang harus disertakan dalam header HTTP setiap permintaan.

### Header Otorisasi

```
Authorization: Bearer YOUR_API_TOKEN
```

**Penting:** Jaga keamanan token API Anda. Jangan mengekspos token di kode sisi klien atau repositori publik.

## Manajemen Token

Token dikelola oleh administrator melalui antarmuka admin atau endpoint API. Setiap token memiliki pengenal unik dan dapat dicabut jika diperlukan.

## Endpoint API

### 1. Mengirim Pesan Teks

**Endpoint:** `POST /api/send-message`

**Header:**
- Content-Type: application/json
- Authorization: Bearer YOUR_API_TOKEN

**Parameter Body:**
- `number` (wajib): Nomor WhatsApp tujuan. Bisa dengan atau tanpa kode negara.
  Contoh: "085123456789" atau "6285123456789"
- `message` (wajib): Teks pesan yang akan dikirim

**Contoh Request:**
```json
{
  "number": "085123456789", 
  "message": "Hello from the API!"
}
```

**Contoh Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "to": "6285123456789"
}
```

### 2. Mengirim Pesan Gambar

**Endpoint:** `POST /api/send-image`

**Header:**
- Content-Type: application/json
- Authorization: Bearer YOUR_API_TOKEN

**Parameter Body:**
- `number` (wajib): Nomor WhatsApp tujuan. Bisa dengan atau tanpa kode negara.
  Contoh: "085123456789" atau "6285123456789"
- `imageUrl` (wajib): URL gambar yang akan dikirim. Harus URL yang dapat diakses publik
- `caption` (opsional): Teks caption untuk gambar

**Contoh Request:**
```json
{
  "number": "085123456789",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Check out this image!"
}
```

**Contoh Response:**
```json
{
  "success": true,
  "message": "Image message sent successfully",
  "to": "6285123456789"
}
```

### 3. Memeriksa Keberadaan Nomor WhatsApp

**Endpoint:** `POST /api/check-number`

**Header:**
- Content-Type: application/json
- Authorization: Bearer YOUR_API_TOKEN

**Parameter Body:**
- `number` (wajib): Nomor WhatsApp yang akan diperiksa. Bisa dengan atau tanpa kode negara.
  Contoh: "085123456789" atau "6285123456789"

**Contoh Request:**
```json
{
  "number": "085123456789"
}
```

**Contoh Response:**
```json
{
  "success": true,
  "exists": true,
  "number": "6285123456789"
}
```

### 4. Membuat Token API (Khusus Admin)

**Endpoint:** `POST /api/tokens/generate`

**Parameter Body:**
- `adminKey` (wajib): Kunci admin untuk otorisasi
- `name` (wajib): Nama untuk mengidentifikasi token

**Contoh Request:**
```json
{
  "adminKey": "buselkab-bps-admin",
  "name": "Aplikasi Saya"
}
```

**Contoh Response:**
```json
{
  "success": true,
  "token": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### 5. Daftar Token API (Khusus Admin)

**Endpoint:** `GET /api/tokens?adminKey=buselkab-bps-admin`

**Contoh Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "name": "Aplikasi Saya",
      "createdAt": 1651234567890,
      "lastUsed": 1651234567890,
      "tokenId": "f47ac10b..."
    }
  ]
}
```

### 6. Mencabut Token API (Khusus Admin)

**Endpoint:** `DELETE /api/tokens/:tokenId?adminKey=buselkab-bps-admin`

**Contoh Response:**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

## Kode Status HTTP

API menggunakan kode status HTTP standar untuk menunjukkan keberhasilan atau kegagalan permintaan:

- 200 OK: Permintaan berhasil
- 400 Bad Request: Parameter permintaan tidak valid
- 401 Unauthorized: Token API hilang atau tidak valid
- 403 Forbidden: Tidak diizinkan mengakses resource ini
- 404 Not Found: Resource tidak ditemukan atau nomor telepon tidak ada di WhatsApp
- 500 Internal Server Error: Kesalahan server saat memproses permintaan

## Contoh Penggunaan Client

### JavaScript

```javascript
// Ganti dengan token API Anda
const API_TOKEN = "YOUR_API_TOKEN";
// Ganti dengan URL server API
const API_URL = "http://localhost:3001";

// Contoh: Mengirim pesan teks
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
        console.log('Hasil pengiriman pesan:', data);
        return data;
    } catch (error) {
        console.error('Error mengirim pesan:', error);
        throw error;
    }
}

// Contoh: Mengirim gambar dengan caption
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
        console.log('Hasil pengiriman pesan gambar:', data);
        return data;
    } catch (error) {
        console.error('Error mengirim pesan gambar:', error);
        throw error;
    }
}

// Contoh: Memeriksa keberadaan nomor WhatsApp
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
        console.log('Hasil pemeriksaan nomor:', data);
        return data;
    } catch (error) {
        console.error('Error memeriksa nomor:', error);
        throw error;
    }
}

// Contoh penggunaan:
// sendTextMessage('085123456789', 'Halo dari API client!');
// sendImageMessage('085123456789', 'https://example.com/image.jpg', 'Lihat gambar ini!');
// checkWhatsAppNumber('085123456789');
```

## Praktik Terbaik

1. **Selalu Periksa Nomor Terlebih Dahulu**: Gunakan endpoint `/api/check-number` untuk memastikan nomor terdaftar di WhatsApp sebelum mencoba mengirim pesan.

2. **Keamanan Token**: Simpan token API dengan aman dan jangan menyertakannya dalam kode klien yang dapat diakses publik.

3. **Penanganan Error**: Selalu tangani respons error dengan benar. Jika permintaan API gagal, API akan mengembalikan pesan error yang jelas.

4. **Rate Limiting**: Hindari mengirim terlalu banyak permintaan dalam waktu singkat untuk mencegah throttling atau pemblokiran oleh sistem WhatsApp.

## Dukungan dan Bantuan

Untuk bantuan lebih lanjut atau melaporkan masalah, hubungi tim dukungan BPS Buton Selatan.
