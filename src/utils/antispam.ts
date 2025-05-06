import fs from "fs";
import path from "path";

const messageCountMap = new Map<string, number[]>();
const blockedUsers = new Map<string, number>();
const warnedUsers = new Map<string, number>(); // pengguna yang sudah dikirimi pesan peringatan

const BLOCK_FILE = path.resolve(__dirname, "blocked-users.json");

// Load blokir dari file saat pertama kali
if (fs.existsSync(BLOCK_FILE)) {
	const data = JSON.parse(fs.readFileSync(BLOCK_FILE, "utf-8"));
	for (const [sender, unblockTime] of Object.entries(data)) {
		blockedUsers.set(sender, unblockTime as number);
	}
}

// Simpan daftar blokir ke file
function saveBlockedUsers() {
	const obj: Record<string, number> = {};
	for (const [sender, time] of blockedUsers.entries()) {
		obj[sender] = time;
	}
	fs.writeFileSync(BLOCK_FILE, JSON.stringify(obj, null, 2));
}

// Bersihkan pengguna yang blokirnya sudah kedaluwarsa
function cleanExpiredBlockedUsers() {
	const now = Date.now();
	let changed = false;

	for (const [sender, time] of blockedUsers.entries()) {
		if (now > time) {
			blockedUsers.delete(sender);
			changed = true;
		}
	}

	if (changed) saveBlockedUsers();
}

// Jadwalkan pembersihan setiap 5 menit
setInterval(cleanExpiredBlockedUsers, 5 * 60 * 1000);

export function isUserBlocked(sender: string): boolean {
	const unblockTime = blockedUsers.get(sender);
	if (!unblockTime) return false;

	if (Date.now() > unblockTime) {
		blockedUsers.delete(sender);
		saveBlockedUsers();
		return false;
	}
	return true;
}

export function recordMessage(sender: string) {
	const now = Date.now();
	const oneMinuteAgo = now - 60_000;

	const timestamps = messageCountMap.get(sender) || [];
	const recent = timestamps.filter((t) => t > oneMinuteAgo);
	recent.push(now);
	messageCountMap.set(sender, recent);

	if (recent.length > 7) { // lebih dari 7 pesan dalam 1 menit
		if (!blockedUsers.has(sender)) {
			const unblockAt = now + 30 * 60_000; // blokir 30 menit
			blockedUsers.set(sender, unblockAt);
			saveBlockedUsers();
			console.log(
				`${sender} diblokir hingga ${new Date(unblockAt).toLocaleTimeString()}`
			);
		}
	}
}

export function shouldSendWarning(sender: string): boolean {
	const count = warnedUsers.get(sender) || 0;
	if (count >= 5) return false;
	warnedUsers.set(sender, count + 1);
	return true;
}
