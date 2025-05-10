"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiToken = exports.listApiTokens = exports.generateApiToken = void 0;
const tokenAuth_1 = require("./tokenAuth");
/**
 * Generate a new API token (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
async function generateApiToken(req, res) {
    // In a real application, this should have admin authentication
    const { adminKey, name } = req.body;
    if (adminKey !== process.env.ADMIN_KEY) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }
    if (!name) {
        res.status(400).json({ success: false, message: "Token name is required" });
        return;
    }
    // Generate a new token
    const token = (0, tokenAuth_1.generateToken)(name);
    res.json({ success: true, token });
}
exports.generateApiToken = generateApiToken;
/**
 * List all API tokens (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
async function listApiTokens(req, res) {
    // In a real application, this should have admin authentication
    const { adminKey } = req.query;
    if (adminKey !== process.env.ADMIN_KEY) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }
    // Return tokens (excluding the actual token value for security)
    const safeTokenList = (0, tokenAuth_1.getAllTokens)();
    res.json({ success: true, tokens: safeTokenList });
}
exports.listApiTokens = listApiTokens;
/**
 * Revoke an API token (admin only)
 * @param req HTTP request
 * @param res HTTP response
 */
async function revokeApiToken(req, res) {
    // In a real application, this should have admin authentication
    const { adminKey } = req.query;
    const { tokenId } = req.params;
    if (adminKey !== process.env.ADMIN_KEY) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }
    // Find and remove the token
    const success = (0, tokenAuth_1.deleteToken)(tokenId);
    if (!success) {
        res.status(404).json({ success: false, message: "Token not found" });
        return;
    }
    res.json({ success: true, message: "Token revoked successfully" });
}
exports.revokeApiToken = revokeApiToken;
