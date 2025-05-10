"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLinkPreview = void 0;
const link_preview_js_1 = require("link-preview-js");
const sendLinkPreview = async (sock, sender, custext, url) => {
    try {
        // Validate URL format
        let formattedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedUrl = 'https://' + url;
        }
        const preview = await (0, link_preview_js_1.getLinkPreview)(formattedUrl, {
            timeout: 10000,
            followRedirects: 'manual',
            handleRedirects: (baseURL, forwardedURL) => {
                // Handle redirects manually, up to 5 levels
                return true; // Return true to allow following redirects
            }
        });
        const waPreview = {
            'canonical-url': url,
            'matched-text': url,
            title: 'title' in preview ? preview.title : "Pratinjau Tautan",
            description: 'description' in preview ? preview.description : "Deskripsi tidak tersedia",
            'thumbnail-url': 'images' in preview ? preview.images?.[0] : undefined, // ambil gambar pertama kalau ada
        };
        await sock.sendMessage(sender, {
            text: custext + url,
            linkPreview: waPreview,
        });
    }
    catch (error) {
        console.error("❌ Gagal membuat link preview:", error);
        await sock.sendMessage(sender, {
            text: `🔗 ${url}`, // fallback teks biasa
        });
    }
};
exports.sendLinkPreview = sendLinkPreview;
