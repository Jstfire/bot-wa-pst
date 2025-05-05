const sessions: Record<
	string,
	{ level?: string; lastActive: number; admin?: boolean }
> = {};

export function setSession(sender: string) {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].lastActive = Date.now();
}

export function getSession(sender: string) {
	if (!sessions[sender]) setSession(sender);
	return sessions[sender];
}

export function clearSession(sender: string) {
	delete sessions[sender];
}

export function isSessionExpired(sender: string): boolean {
	const session = sessions[sender];
	return session && Date.now() - session.lastActive > 24 * 60 * 60 * 1000;
}

export function initSessionCleaner() {
	setInterval(() => {
		const now = Date.now();
		for (const sender in sessions) {
			if (now - sessions[sender].lastActive > 24 * 60 * 60 * 1000)
				delete sessions[sender];
		}
	}, 60 * 60 * 1000); // setiap jam
}
