import { WASocket } from "@whiskeysockets/baileys";
import {
	ADMIN_END,
	ADMIN_JAM,
	MAIN_MENU_NEXT,
	SUB_MENUS,
} from "../utils/messages";
import { recordAdminMessage } from "../utils/session";

// List of admin WhatsApp numbers
const ADMIN_NUMBERS = [
	"6289616370100@s.whatsapp.net",
	"6283856685530@s.whatsapp.net",
];
const adminSessions = new Set<string>();

export function isInAdminMode(sender: string) {
	return adminSessions.has(sender);
}

export function exitAdminMode(sender: string) {
	adminSessions.delete(sender);
}

export async function enterAdminMode(
	sock: WASocket,
	sender: string,
	level: string
) {
	const hour = getHours(new Date(), { timeZone: "Asia/Makassar" }); // WITA = GMT+8

	if (hour < 8 || hour >= 20) {
		await sock.sendMessage(sender, {
			text: `*❗Maaf, layanan admin tidak tersedia saat ini.🙏*\n\n${ADMIN_JAM}`,
		});
		const menuText = level === "null" ? MAIN_MENU_NEXT : SUB_MENUS[level];
		await sock.sendMessage(sender, { text: menuText });
		return;
	}
	adminSessions.add(sender);
	await sock.sendMessage(sender, {
		text: `📨 Permintaan Anda telah diteruskan ke admin.\n⏳ Mohon ditunggu sebentar...`,
	});
	await sock.sendMessage(sender, {
		text: ADMIN_END,
	});

	// Notification text for all admins
	const notificationText = `📬 Pengguna ${sender.replace(
		"@s.whatsapp.net",
		""
	)} meminta bantuan admin. Silakan respon dari akun WA Business PST BPS.`;

	// Send to all admin numbers
	for (const adminNumber of ADMIN_NUMBERS) {
		await sock.sendMessage(adminNumber, {
			text: notificationText,
		});
	}
}
function getHours(date: Date, options: { timeZone: string }): number {
	return new Date(date.toLocaleString("en-US", options)).getHours();
}

// Function to check if a number is an admin
export function isAdmin(sender: string): boolean {
	return ADMIN_NUMBERS.includes(sender);
}

// Function to track when an admin sends a message to a user
export function recordAdminInteraction(targetUser: string): void {
	recordAdminMessage(targetUser);
	console.log(`Admin interaction recorded for user: ${targetUser}`);
}
