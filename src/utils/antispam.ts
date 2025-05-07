import fs from "fs";
import path from "path";
import { WASocket } from "@whiskeysockets/baileys";

const messageCountMap = new Map<string, number[]>();
const blockedUsers = new Map<string, number>();
const warnedUsers = new Map<string, number[]>();
const notifiedAdmins = new Set<string>();
const lastInputValidity = new Map<string, boolean>();

const BLOCK_FILE = path.resolve(__dirname, "blocked-users.json");

if (fs.existsSync(BLOCK_FILE)) {
	const data = JSON.parse(fs.readFileSync(BLOCK_FILE, "utf-8"));
	for (const [sender, unblockTime] of Object.entries(data)) {
		blockedUsers.set(sender, unblockTime as number);
	}
}

function saveBlockedUsers() {
	const obj: Record<string, number> = {};
	for (const [sender, time] of blockedUsers.entries()) {
		obj[sender] = time;
	}
	fs.writeFileSync(BLOCK_FILE, JSON.stringify(obj, null, 2));
}

function cleanExpiredBlockedUsers() {
	const now = Date.now();
	let changed = false;

	for (const [sender, time] of blockedUsers.entries()) {
		if (now > time) {
			blockedUsers.delete(sender);
			notifiedAdmins.delete(sender);
			warnedUsers.delete(sender); // 🔁 Reset warning saat blokir selesai
			changed = true;
		}
	}

	if (changed) saveBlockedUsers();
}
setInterval(cleanExpiredBlockedUsers, 5 * 60 * 1000);

export function isUserBlocked(sender: string): boolean {
	const unblockTime = blockedUsers.get(sender);
	if (!unblockTime) return false;

	if (Date.now() > unblockTime) {
		blockedUsers.delete(sender);
		notifiedAdmins.delete(sender);
		warnedUsers.delete(sender); // 🔁 Reset warning saat blokir selesai
		saveBlockedUsers();
		return false;
	}
	return true;
}

export function recordMessage(
	sender: string,
	sock: WASocket,
	text: string,
	level?: string
) {
	const now = Date.now();
	const thirtySecondsAgo = now - 30_000;

	let timestamps = messageCountMap.get(sender) || [];
	timestamps = timestamps.filter((t) => t > thirtySecondsAgo);

	const isValid = isValidMenuInput(text, level);
	const lastValid = lastInputValidity.get(sender);

	// Reset jika tipe input berubah
	if (lastValid !== undefined && lastValid !== isValid) {
		timestamps = [];
	}

	timestamps.push(now);
	messageCountMap.set(sender, timestamps);
	lastInputValidity.set(sender, isValid);

	const validLimit = 15;
	const invalidLimit = 5;
	const totalLimit = 30;

	console.log(
		`Pesan dari ${sender}: ${timestamps.length}/${totalLimit} pesan dalam 30 detik.`
	);
	if (isValid) {
		console.log(
			`Pesan dari ${sender}: ${timestamps.length}/${validLimit} pesan dalam 30 detik, valid=${isValid}`
		);
	} else {
		console.log(
			`Pesan dari ${sender}: ${timestamps.length}/${invalidLimit} pesan dalam 30 detik, valid=${isValid}`
		);
	}

	if (
		timestamps.length > totalLimit ||
		(isValid && timestamps.length > validLimit) ||
		(!isValid && timestamps.length > invalidLimit)
	) {
		if (!blockedUsers.has(sender)) {
			const unblockAt = now + 60 * 60_000;
			blockedUsers.set(sender, unblockAt);
			saveBlockedUsers();

			console.log(
				`${sender} diblokir hingga ${new Date(unblockAt).toLocaleTimeString()}`
			);
			if (!notifiedAdmins.has(sender)) {
				sock.sendMessage("6289616370100@s.whatsapp.net", {
					text: `🚨 *SPAM TERDETEKSI* 🚨\n\n*Nomor:* ${sender.replace(
						"@s.whatsapp.net",
						""
					)}\n*Pesan dikirim:* ${
						timestamps.length
					} dalam 30 detik\n*Diblokir hingga:* ${new Date(
						unblockAt
					).toLocaleTimeString()} WITA\n\n_Silakan pantau atau tindak lanjuti._`,
				});
				notifiedAdmins.add(sender);
			}
		}
	}
}

export function shouldSendWarning(sender: string): boolean {
	const timestamps = warnedUsers.get(sender) || [];

	// Maks 3 peringatan per periode blokir
	if (timestamps.length >= 3) return false;

	timestamps.push(Date.now());
	warnedUsers.set(sender, timestamps);
	console.log(`Peringatan untuk ${sender}: ${timestamps.length}/3`);
	return true;
}

export function isValidMenuInput(text: string, level?: string): boolean {
	if (!/^\d+$/.test(text)) return false;

	const validMain = ["1", "2", "3", "4", "5", "6", "7"];
	const validSub: Record<string, string[]> = {
		"1": ["1", "2"],
		"2": ["1", "2"],
		"3": ["1", "2"],
		"6": ["1", "2", "3", "4", "5", "6", "7"],
	};

	if (!level) {
		return validMain.includes(text);
	}

	return validSub[level]?.includes(text) ?? false;
}
