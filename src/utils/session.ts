const sessions: Record<
	string,
	{
		level?: string;
		lastActive: number;
		admin?: boolean;
		lastWelcomeMessage?: number;
		inMenuState?: boolean;
		menuStateStart?: number;
		lastUserMessage?: number; // Added to track the last message from user
		lastAdminNotification?: number; // Added to track when admin was last notified about this user
		lastAdminMessage?: number; // Added to track when an admin last messaged this user
		adminInteracted?: boolean; // Flag to indicate if an admin has interacted with this user
	}
> = {};

export function setSession(sender: string) {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].lastActive = Date.now();
	sessions[sender].lastUserMessage = Date.now(); // Track when user last sent a message
}

export function getSession(sender: string) {
	if (!sessions[sender]) setSession(sender);
	return sessions[sender];
}

export function clearSession(sender: string) {
	// Preserve important timestamps when clearing a session
	const lastWelcomeMessage = sessions[sender]?.lastWelcomeMessage;
	const lastUserMessage = sessions[sender]?.lastUserMessage;
	const lastAdminNotification = sessions[sender]?.lastAdminNotification;
	const lastAdminMessage = sessions[sender]?.lastAdminMessage;
	const adminInteracted = sessions[sender]?.adminInteracted;
	delete sessions[sender];

	// Reinstantiate the session with just the preserved timestamps if they existed
	if (
		lastWelcomeMessage ||
		lastUserMessage ||
		lastAdminNotification ||
		lastAdminMessage
	) {
		sessions[sender] = {
			lastActive: Date.now(),
			lastWelcomeMessage,
			lastUserMessage,
			lastAdminNotification,
			lastAdminMessage,
			adminInteracted,
		};
	}
}

export function isSessionExpired(sender: string): boolean {
	const session = sessions[sender];
	return !!(
		session &&
		session.inMenuState &&
		Date.now() - session.lastActive > 3 * 60 * 60 * 1000
	); // 3 hours for menu state
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

// New functions for handling welcome messages and menu state
export function shouldSendWelcomeMessage(sender: string): boolean {
	const session = sessions[sender];
	if (!session) return true;

	if (!session.lastWelcomeMessage) return true;

	// Get last user message time (or default to 0 if not set)
	const lastUserMessageTime = session.lastUserMessage || 0;

	// If an admin has interacted with the user
	if (session.adminInteracted && session.lastAdminMessage) {
		// If user's last message is AFTER admin's last message,
		// this means the user has replied to admin, don't send welcome message
		if (lastUserMessageTime > session.lastAdminMessage) {
			return false;
		}

		// If admin messaged user but user didn't reply within 5 days,
		// resume sending welcome messages
		const timeSinceAdminMessage = Date.now() - session.lastAdminMessage;
		if (
			session.lastAdminMessage > lastUserMessageTime &&
			timeSinceAdminMessage > 5 * 24 * 60 * 60 * 1000
		) {
			console.log("Admin messaged user but user didn't reply within 5 days");
			// Make sure we return true if admin messaged user but user didn't reply within 5 days
			return true;
		}
	}

	// Default behavior: Only send welcome message if 7 days have passed
	// since the user's last message
	return Date.now() - lastUserMessageTime > 7 * 24 * 60 * 60 * 1000;
}

// Function to check if we should notify admin about a user (once per 24 hours)
export function shouldNotifyAdmin(sender: string): boolean {
	const session = sessions[sender];
	if (!session) return true;

	if (!session.lastAdminNotification) return true;

	// Only notify once per 24 hours
	return Date.now() - session.lastAdminNotification > 24 * 60 * 60 * 1000;
}

// Function to record when admin was notified about this user
export function recordAdminNotification(sender: string): void {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].lastAdminNotification = Date.now();
}

export function recordAdminMessage(sender: string): void {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].lastAdminMessage = Date.now();
	sessions[sender].adminInteracted = true;
}

export function recordWelcomeMessage(sender: string): void {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].lastWelcomeMessage = Date.now();
	sessions[sender].lastUserMessage = Date.now(); // Update the last user message time as well
}

export function setMenuState(sender: string, inMenu: boolean): void {
	if (!sessions[sender]) sessions[sender] = { lastActive: Date.now() };
	sessions[sender].inMenuState = inMenu;
	if (inMenu) {
		sessions[sender].menuStateStart = Date.now();
	} else {
		delete sessions[sender].menuStateStart;
		delete sessions[sender].level;
	}
}

export function isInMenuState(sender: string): boolean {
	return !!sessions[sender]?.inMenuState;
}
