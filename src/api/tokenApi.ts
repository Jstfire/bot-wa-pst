import { Request, Response } from "express";
import { generateToken, getAllTokens, deleteToken } from "./tokenAuth";

/**
 * Generate a new API token (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
export async function generateApiToken(
	req: Request,
	res: Response
): Promise<void> {
	// In a real application, this should have admin authentication
	const { adminKey, name } = req.body;
	const adminSecretKey = process.env.ADMIN_KEY;

	if (adminKey !== adminSecretKey) {
		res.status(403).json({ success: false, message: "Unauthorized" });
		return;
	}

	if (!name) {
		res.status(400).json({ success: false, message: "Token name is required" });
		return;
	}

	// Generate a new token
	const token = generateToken(name);

	res.json({ success: true, token });
}

/**
 * List all API tokens (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
export async function listApiTokens(
	req: Request,
	res: Response
): Promise<void> {
	// In a real application, this should have admin authentication
	const { adminKey } = req.query;
	const adminSecretKey = process.env.ADMIN_KEY;

	if (adminKey !== adminSecretKey) {
		res.status(403).json({ success: false, message: "Unauthorized" });
		return;
	}

	// Return tokens (excluding the actual token value for security)
	const safeTokenList = getAllTokens();

	res.json({ success: true, tokens: safeTokenList });
}

/**
 * Revoke an API token (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
export async function revokeApiToken(
	req: Request,
	res: Response
): Promise<void> {
	// In a real application, this should have admin authentication
	const { adminKey } = req.query;
	const { tokenId } = req.params;
	const adminSecretKey = process.env.ADMIN_KEY;

	if (adminKey !== adminSecretKey) {
		res.status(403).json({ success: false, message: "Unauthorized" });
		return;
	}

	// Find and remove the token
	const success = deleteToken(tokenId);

	if (!success) {
		res.status(404).json({ success: false, message: "Token not found" });
		return;
	}

	res.json({ success: true, message: "Token revoked successfully" });
}
