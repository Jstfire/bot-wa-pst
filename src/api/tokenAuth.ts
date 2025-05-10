import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Token storage file path
const TOKEN_FILE = path.resolve(__dirname, "../../data/api-tokens.json");

// Token interface
export interface ApiToken {
	token: string;
	name: string;
	createdAt: number;
	lastUsed?: number;
}

// Initialize token storage
let apiTokens: ApiToken[] = [];

// Ensure the token file and directory exist
function initTokenStorage() {
	if (!fs.existsSync(path.dirname(TOKEN_FILE))) {
		fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
	}

	try {
		if (fs.existsSync(TOKEN_FILE)) {
			apiTokens = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
		} else {
			fs.writeFileSync(TOKEN_FILE, JSON.stringify(apiTokens, null, 2));
		}
	} catch (error) {
		console.error("Error loading API tokens:", error);
	}
}

// Save tokens to file
export function saveTokens() {
	fs.writeFileSync(TOKEN_FILE, JSON.stringify(apiTokens, null, 2));
}

// Generate a new API token
export function generateToken(name: string): string {
	const token = crypto.randomBytes(32).toString("hex");

	apiTokens.push({
		token,
		name,
		createdAt: Date.now(),
	});

	saveTokens();
	return token;
}

// Get all tokens (for admin use)
export function getAllTokens(): Array<
	Omit<ApiToken, "token"> & { tokenId: string }
> {
	return apiTokens.map(({ token, ...rest }) => ({
		...rest,
		tokenId: token.substring(0, 8) + "...", // Only show a part of the token for security
	}));
}

// Delete a token by ID prefix
export function deleteToken(tokenIdPrefix: string): boolean {
	const initialLength = apiTokens.length;
	apiTokens = apiTokens.filter((t) => !t.token.startsWith(tokenIdPrefix));

	if (apiTokens.length === initialLength) {
		return false;
	}

	saveTokens();
	return true;
}

// Validate token middleware
export function validateToken(
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		res
			.status(401)
			.json({ success: false, message: "Authentication token is required" });
		return;
	}

	const tokenEntry = apiTokens.find((t) => t.token === token);
	if (!tokenEntry) {
		res
			.status(401)
			.json({ success: false, message: "Invalid authentication token" });
		return;
	}

	// Update last used timestamp
	tokenEntry.lastUsed = Date.now();
	saveTokens();

	next();
}

// Initialize tokens on module import
initTokenStorage();
