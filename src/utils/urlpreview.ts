import { getLinkPreview } from "link-preview-js";
import { WASocket } from "@whiskeysockets/baileys";

export const sendLinkPreview = async (
	sock: WASocket,
	sender: string,
    custext: string,
	url: string,
) => {
	try {
		// Validate URL format
		let formattedUrl = url;
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			formattedUrl = 'https://' + url;
		}

		const preview = await getLinkPreview(formattedUrl, { 
			timeout: 10000, // timeout 10 detik
			followRedirects: 'manual', // Don't automatically follow redirects
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
			text: custext+url,
			linkPreview: waPreview,
		});
	} catch (error) {
		console.error("❌ Gagal membuat link preview:", error);
		await sock.sendMessage(sender, {
			text: `🔗 ${url}`, // fallback teks biasa
		});
	}
};
