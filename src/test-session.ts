// Test session management logic
import {
	getSession,
	setSession,
	shouldSendWelcomeMessage,
	recordWelcomeMessage,
	recordAdminMessage,
	clearSession,
} from "./utils/session";

// Test user phone number
const USER_PHONE = "628123456789@s.whatsapp.net";

// Function to simulate time passing
function fastForward(days: number): () => void {
	const currentTime = Date.now();
	const timeTravel = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
	// Mock the Date.now function to return our manipulated time
	const originalNow = Date.now;
	// Simple direct function override without jest
	Date.now = function () {
		return currentTime + timeTravel;
	};
	console.log(`Time advanced by ${days} days`);
	return () => {
		Date.now = originalNow; // Restore original function
	};
}

// Test scenario 1: New user, should get welcome message
function testNewUser() {
	console.log("\n===== TEST SCENARIO 1: New User =====");
	// Clear any existing session by calling clearSession
	clearSession(USER_PHONE);

	console.log(
		"Should send welcome message:",
		shouldSendWelcomeMessage(USER_PHONE)
	);
	console.log("Expected: true (new user should receive welcome message)");
}

// Test scenario 2: User replied within 7 days, no welcome message
function testUserRepliedWithinSevenDays() {
	console.log("\n===== TEST SCENARIO 2: User Activity Within 7 Days =====");
	// Set up session with welcome message 3 days ago
	setSession(USER_PHONE);
	recordWelcomeMessage(USER_PHONE); // Fast forward 3 days
	const restoreTime = fastForward(3);

	// User sends another message (setSession updates lastUserMessage)
	setSession(USER_PHONE);

	console.log(
		"Should send welcome message:",
		shouldSendWelcomeMessage(USER_PHONE)
	);
	console.log("Expected: false (user active within 7 days)");

	// Call the restore function
	restoreTime();
}

// Test scenario 3: User inactive for more than 7 days
function testUserInactiveMoreThanSevenDays() {
	console.log("\n===== TEST SCENARIO 3: User Inactive for 8 Days =====");
	// Set up session with welcome message
	setSession(USER_PHONE);
	recordWelcomeMessage(USER_PHONE); // Fast forward 8 days
	const restoreTime = fastForward(8);

	console.log(
		"Should send welcome message:",
		shouldSendWelcomeMessage(USER_PHONE)
	);
	console.log("Expected: true (user inactive for more than 7 days)");

	// Call the restore function
	restoreTime();
}

// Test scenario 4: Admin messaged user and user replied
function testAdminUserInteraction() {
	console.log(
		"\n===== TEST SCENARIO 4: Admin Messaged User and User Replied ====="
	);
	// Set up session with welcome message
	setSession(USER_PHONE);
	recordWelcomeMessage(USER_PHONE);

	// Admin sends a message to user
	recordAdminMessage(USER_PHONE);

	// User replies after admin's message
	setSession(USER_PHONE);

	console.log(
		"Should send welcome message:",
		shouldSendWelcomeMessage(USER_PHONE)
	);
	console.log("Expected: false (user replied to admin)");
}

// Test scenario 5: Admin messaged user but user didn't reply within 5 days
function testAdminMessageNoReply() {
	console.log(
		"\n===== TEST SCENARIO 5: Admin Messaged User, No Reply Within 5 Days ====="
	);
	// Clear any existing session to start fresh
	clearSession(USER_PHONE);

	// Set up session with welcome message and user message
	setSession(USER_PHONE);
	recordWelcomeMessage(USER_PHONE);

	console.log("Initial session setup - User sent a message");

	// Fast forward 1 day
	let restoreTime = fastForward(1);
	restoreTime();

	// Admin sends a message 1 day after user's last message
	recordAdminMessage(USER_PHONE);
	console.log("Admin sent a message 1 day after user's last message");

	// Display current timestamps for debugging
	const session = getSession(USER_PHONE);
	console.log(
		"User's last message time:",
		new Date(session.lastUserMessage || 0).toISOString()
	);
	console.log(
		"Admin's last message time:",
		new Date(session.lastAdminMessage || 0).toISOString()
	);

	// Fast forward 6 days (total 7 days since user's message, 6 days since admin's message)
	restoreTime = fastForward(6);
	console.log(
		"After 6 more days (now 7 days since user's message, 6 days since admin's)"
	);

	// For debugging purposes
	console.log("Current time:", new Date(Date.now()).toISOString());

	console.log(
		"Should send welcome message:",
		shouldSendWelcomeMessage(USER_PHONE)
	);
	console.log("Expected: true (user did not reply to admin within 5 days)");

	// Call the restore function
	restoreTime();
}

// Run all tests
console.log("STARTING SESSION MANAGEMENT TESTS");
testNewUser();
testUserRepliedWithinSevenDays();
testUserInactiveMoreThanSevenDays();
testAdminUserInteraction();
testAdminMessageNoReply();
console.log("\nTESTS COMPLETED");
