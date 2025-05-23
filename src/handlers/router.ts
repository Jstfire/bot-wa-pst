import { WASocket, proto } from "@whiskeysockets/baileys";
import {
	SUB_MENUS,
	MAIN_MENU,
	STATISTIK_UMUM,
	JADWAL_BUKA,
	ADMIN_JAM,
	MAIN_MENU_NEXT,
	THANKS,
	PUBLIKASI,
	WEB_BUSEL,
	LOKASI,
	WAITING,
	INVALID,
	WELCOME_MESSAGE,
	MENU_EXPIRED,
	PST_LOCATION_INFO,
} from "../utils/messages";
import { enterAdminMode, isInAdminMode, exitAdminMode } from "./admin";
import {
	getSession,
	setSession,
	clearSession,
	isSessionExpired,
	shouldSendWelcomeMessage,
	recordWelcomeMessage,
	setMenuState,
	isInMenuState,
	shouldNotifyAdmin,
	recordAdminNotification,
} from "../utils/session";

// List of admin WhatsApp numbers
const ADMIN_NUMBERS = [
	"6289616370100@s.whatsapp.net",
	"6283856685530@s.whatsapp.net",
];
import { sendPDF } from "./sendPdf";
import {
	isUserBlocked,
	recordMessage,
	shouldSendWarning,
} from "../utils/antispam";
import { sendLinkPreview } from "../utils/urlpreview";

export async function handleMessage(
	sock: WASocket,
	msg: proto.IWebMessageInfo,
	sender: string,
	text: string
) {
	const session = getSession(sender);
	const level = session?.level;

	if (isUserBlocked(sender)) {
		if (shouldSendWarning(sender)) {
			await sock.sendMessage(sender, {
				text: "*🚫 Anda diblokir sementara karena mengirim terlalu banyak pesan. Silakan coba lagi beberapa saat.*",
			});
		}
		return;
	}

	recordMessage(sender, sock, text, level);

	// Handle Admin Mode
	if (isInAdminMode(sender)) {
		if (text === "00") {
			exitAdminMode(sender);
			await sock.sendMessage(sender, {
				text: "💬 Terima kasih telah menggunakan layanan admin PST BPS.",
			});
			await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
			return;
		}
		return;
	}

	// Always update user's last activity
	setSession(sender);

	// Check if session has expired (3 hours in menu state)
	if (isSessionExpired(sender)) {
		// If in menu state and expired, notify and reset
		setMenuState(sender, false);
		await sock.sendMessage(sender, {
			text: MENU_EXPIRED,
		});
		return;
	}

	// Handle welcome message (once per 7 days since last user activity)
	if (shouldSendWelcomeMessage(sender)) {
		await sock.sendMessage(sender, { text: WELCOME_MESSAGE });
		recordWelcomeMessage(sender);
		return;
	}

	// Check for "menu" command (case insensitive)
	if (text.toLowerCase() === "menu") {
		setMenuState(sender, true);
		await sock.sendMessage(sender, { text: MAIN_MENU });
		return;
	}
	// If not in menu state and not typing "menu", ignore and let admin handle
	if (!isInMenuState(sender)) {
		// Only notify admin once per 24 hours for each user
		if (shouldNotifyAdmin(sender)) {
			// Notify all admins about user message
			const notificationText = `📬 Pengguna ${sender.replace(
				"@s.whatsapp.net",
				""
			)} mengirim pesan: "${text}". Silakan respon dari akun WA Business PST BPS.`;

			// Send to all admin numbers
			for (const adminNumber of ADMIN_NUMBERS) {
				await sock.sendMessage(adminNumber, {
					text: notificationText,
				});
			}

			// Record that we've notified admin about this user
			recordAdminNotification(sender);
		}
		return;
	}
	// Continue with menu navigation logic if in menu state
	const updatedSession = getSession(sender);
	if (!updatedSession.level) {
		switch (text) {
			case "1": // Location and schedule - now the first option
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				// Send location
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				// Send location info with link preview
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				// Send schedule info
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "2":
			case "3":
			case "4":
			case "7":
				updatedSession.level = text;
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: SUB_MENUS[text] });
				return;
			case "5":
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: STATISTIK_UMUM });
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "6":
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: PUBLIKASI });
				await sendPDF(
					sock,
					sender,
					"Kabupaten Buton Selatan Dalam Angka 2025.pdf"
				);
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "8":
				await enterAdminMode(sock, sender, "null");
				return;
			default:
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: MAIN_MENU });
		}
	} else {
		if (text === "99") {
			clearSession(sender);
			await sock.sendMessage(sender, { text: MAIN_MENU });
			return;
		}

		const level = updatedSession.level;

		if (level === "1") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sendLinkPreview(
					sock,
					sender,
					"*📚 Kunjungi PST Online:* ",
					"https://perpustakaan.bps.go.id/opac/"
				);
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			} else if (text === "2") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			} else {
				await sock.sendMessage(sender, {
					text: INVALID,
				});
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			}
		} else if (level === "2") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sendLinkPreview(
					sock,
					sender,
					"*🔗 Akses Romantik:* ",
					"https://romantik.web.bps.go.id/"
				);
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS[level] });
			} else if (text === "2") {
				await enterAdminMode(sock, sender, level);
			} else {
				await sock.sendMessage(sender, {
					text: INVALID,
				});
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			}
		} else if (level === "3") {
			if (text === "1") await enterAdminMode(sock, sender, level);
			else if (text === "2") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS[level] });
			} else {
				await sock.sendMessage(sender, {
					text: INVALID,
				});
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			}
		} else if (level === "6") {
			const pdfMap: { [key: string]: string } = {
				"1": "Kecamatan Batu Atas Dalam Angka 2025.pdf",
				"2": "Kecamatan Lapandewa Dalam Angka 2025.pdf",
				"3": "Kecamatan Sampolawa Dalam Angka 2025.pdf",
				"4": "Kecamatan Batauga Dalam Angka 2025.pdf",
				"5": "Kecamatan Siompu Barat Dalam Angka 2025.pdf",
				"6": "Kecamatan Siompu Dalam Angka 2025.pdf",
				"7": "Kecamatan Kadatua Dalam Angka 2025.pdf",
			};

			if (text in pdfMap) {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: PUBLIKASI });
				await sendPDF(sock, sender, pdfMap[text]);
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS[level] });
			} else if (text === "99") {
				clearSession(sender);
				await sock.sendMessage(sender, { text: MAIN_MENU });
			} else {
				await sock.sendMessage(sender, {
					text: INVALID,
				});
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			}
		} else if (level === "8") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS[level] });
			} else if (text === "2") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS[level] });
			} else if (text === "99") {
				clearSession(sender);
				await sock.sendMessage(sender, { text: MAIN_MENU });
			} else {
				await sock.sendMessage(sender, {
					text: INVALID,
				});
				await sock.sendMessage(sender, {
					text: SUB_MENUS[level],
				});
			}
		}
	}
}
