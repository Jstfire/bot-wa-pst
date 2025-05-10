"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.deleteToken = exports.getAllTokens = exports.generateToken = exports.saveTokens = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Token storage file path
const TOKEN_FILE = path_1.default.resolve(__dirname, "../../data/api-tokens.json");
// Initialize token storage
let apiTokens = [];
// Ensure the token file and directory exist
function initTokenStorage() {
    if (!fs_1.default.existsSync(path_1.default.dirname(TOKEN_FILE))) {
        fs_1.default.mkdirSync(path_1.default.dirname(TOKEN_FILE), { recursive: true });
    }
    try {
        if (fs_1.default.existsSync(TOKEN_FILE)) {
            apiTokens = JSON.parse(fs_1.default.readFileSync(TOKEN_FILE, "utf-8"));
        }
        else {
            fs_1.default.writeFileSync(TOKEN_FILE, JSON.stringify(apiTokens, null, 2));
        }
    }
    catch (error) {
        console.error("Error loading API tokens:", error);
    }
}
// Save tokens to file
function saveTokens() {
    fs_1.default.writeFileSync(TOKEN_FILE, JSON.stringify(apiTokens, null, 2));
}
exports.saveTokens = saveTokens;
// Generate a new API token
function generateToken(name) {
    const token = crypto_1.default.randomBytes(32).toString("hex");
    apiTokens.push({
        token,
        name,
        createdAt: Date.now(),
    });
    saveTokens();
    return token;
}
exports.generateToken = generateToken;
// Get all tokens (for admin use)
function getAllTokens() {
    return apiTokens.map(({ token, ...rest }) => ({
        ...rest,
        tokenId: token.substring(0, 8) + "...", // Only show a part of the token for security
    }));
}
exports.getAllTokens = getAllTokens;
// Delete a token by ID prefix
function deleteToken(tokenIdPrefix) {
    const initialLength = apiTokens.length;
    apiTokens = apiTokens.filter((t) => !t.token.startsWith(tokenIdPrefix));
    if (apiTokens.length === initialLength) {
        return false;
    }
    saveTokens();
    return true;
}
exports.deleteToken = deleteToken;
// Validate token middleware
function validateToken(req, res, next) {
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
exports.validateToken = validateToken;
// Initialize tokens on module import
initTokenStorage();
