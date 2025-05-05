const messageCountMap = new Map<string, number[]>(); // id pengirim -> array timestamp pesan
const blockedUsers = new Map<string, number>(); // id pengirim -> timestamp unban (ms)

export function isUserBlocked(sender: string): boolean {
	const unblockTime = blockedUsers.get(sender);
	if (!unblockTime) return false;

	if (Date.now() > unblockTime) {
		blockedUsers.delete(sender); // otomatis buka blokir
		return false;
	}
	return true;
}

export function recordMessage(sender: string) {
	const now = Date.now();
	const oneMinuteAgo = now - 60_000;

	const timestamps = messageCountMap.get(sender) || [];
	const recent = timestamps.filter(t => t > oneMinuteAgo);
	recent.push(now);

	messageCountMap.set(sender, recent);

	if (recent.length > 20) {
		const unblockAt = now + 30 * 60_000; // blokir 5 menit
		blockedUsers.set(sender, unblockAt);
		console.log(`${sender} diblokir karena spam hingga ${new Date(unblockAt).toLocaleTimeString()}`);
	}
}
