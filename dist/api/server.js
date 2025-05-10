"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApi = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const serve_admin_1 = require("./serve-admin");
const tokenAuth_1 = require("./tokenAuth");
const tokenApi_1 = require("./tokenApi");
const messageApi_1 = require("./messageApi");
const app = (0, express_1.default)();
const PORT = process.env.API_PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Global variable to store the WhatsApp socket
let waSocket = null;
// Initialize the API with the WA socket
function initApi(sock) {
    waSocket = sock;
    // Serve API documentation
    app.get("/api/docs", (_req, res) => {
        const docPath = path_1.default.join(__dirname, "documentation.html");
        if (fs_1.default.existsSync(docPath)) {
            res.sendFile(docPath);
        }
        else {
            res.redirect("/api");
        }
    });
    // API home with basic documentation
    app.get("/api", (_req, res) => {
        res.send(`
            <html>
                <head>
                    <title>WhatsApp API - BPS Buton Selatan</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
                        h1 { color: #2c3e50; }
                        code { background-color: #f4f6f8; padding: 2px 5px; border-radius: 3px; }
                        pre { background-color: #f4f6f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
                        .endpoint { margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
                        .method { display: inline-block; padding: 5px 10px; border-radius: 3px; color: white; font-weight: bold; }
                        .post { background-color: #2ecc71; }
                        .get { background-color: #3498db; }
                        .delete { background-color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1>WhatsApp API - BPS Buton Selatan</h1>
                    <p>This API allows you to send WhatsApp messages programmatically.</p>
                    
                    <h2>Authentication</h2>
                    <p>All API requests require a token in the Authorization header:</p>
                    <pre>Authorization: Bearer YOUR_API_TOKEN</pre>
                    
                    <h2>Endpoints</h2>
                    
                    <div class="endpoint">
                        <h3><span class="method post">POST</span> /api/send-message</h3>
                        <p>Send a text message to a WhatsApp number</p>
                        <h4>Request body:</h4>
                        <pre>{
  "number": "6285123456789", // The WhatsApp number to send to (with or without country code)
  "message": "Hello from the API!" // The message to send
}</pre>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "message": "Message sent successfully",
  "to": "6285123456789"
}</pre>
                    </div>
                    
                    <div class="endpoint">
                        <h3><span class="method post">POST</span> /api/send-image</h3>
                        <p>Send an image with optional caption to a WhatsApp number</p>
                        <h4>Request body:</h4>
                        <pre>{
  "number": "6285123456789", // The WhatsApp number to send to
  "imageUrl": "https://example.com/image.jpg", // URL to the image
  "caption": "Check out this image!" // Optional caption
}</pre>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "message": "Image message sent successfully",
  "to": "6285123456789"
}</pre>
                    </div>
                    
                    <div class="endpoint">
                        <h3><span class="method post">POST</span> /api/check-number</h3>
                        <p>Check if a phone number exists on WhatsApp</p>
                        <h4>Request body:</h4>
                        <pre>{
  "number": "6285123456789" // The WhatsApp number to check
}</pre>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "exists": true,
  "number": "6285123456789"
}</pre>
                    </div>
                    
                    <h2>Token Management (Admin Only)</h2>
                    
                    <div class="endpoint">
                        <h3><span class="method post">POST</span> /api/tokens/generate</h3>
                        <p>Generate a new API token</p>
                        <h4>Request body:</h4>
                        <pre>{
  "adminKey": "buselkab-bps-admin", // Admin authentication key
  "name": "My App" // Name to identify this token
}</pre>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "token": "f47ac10b-58cc-4372-a567-0e02b2c3d479" // Your new API token
}</pre>
                    </div>
                    
                    <div class="endpoint">
                        <h3><span class="method get">GET</span> /api/tokens?adminKey=buselkab-bps-admin</h3>
                        <p>List all API tokens</p>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "tokens": [
    {
      "name": "My App",
      "createdAt": 1651234567890,
      "lastUsed": 1651234567890,
      "tokenId": "f47ac10b..." // Partial token for identification
    }
  ]
}</pre>
                    </div>
                    
                    <div class="endpoint">
                        <h3><span class="method delete">DELETE</span> /api/tokens/:tokenId?adminKey=buselkab-bps-admin</h3>
                        <p>Revoke an API token</p>
                        <h4>Response:</h4>
                        <pre>{
  "success": true,
  "message": "Token revoked successfully"
}</pre>
                    </div>
                </body>
            </html>
        `);
    }); // Token management routes
    app.post("/api/tokens/generate", async (req, res) => {
        try {
            await (0, tokenApi_1.generateApiToken)(req, res);
        }
        catch (error) {
            console.error("Error generating token:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    app.get("/api/tokens", async (req, res) => {
        try {
            await (0, tokenApi_1.listApiTokens)(req, res);
        }
        catch (error) {
            console.error("Error listing tokens:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    app.delete("/api/tokens/:tokenId", async (req, res) => {
        try {
            await (0, tokenApi_1.revokeApiToken)(req, res);
        }
        catch (error) {
            console.error("Error revoking token:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    // Message sending routes
    app.post("/api/send-message", tokenAuth_1.validateToken, async (req, res) => {
        try {
            await (0, messageApi_1.sendMessage)(waSocket, req, res);
        }
        catch (error) {
            console.error("Error sending message:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    app.post("/api/send-image", tokenAuth_1.validateToken, async (req, res) => {
        try {
            await (0, messageApi_1.sendImageMessage)(waSocket, req, res);
        }
        catch (error) {
            console.error("Error sending image:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    // Number validation route
    app.post("/api/check-number", tokenAuth_1.validateToken, async (req, res) => {
        try {
            await (0, messageApi_1.checkNumber)(waSocket, req, res);
        }
        catch (error) {
            console.error("Error checking number:", error);
            res
                .status(500)
                .json({ success: false, message: "Internal server error" });
        }
    });
    // Setup admin page
    (0, serve_admin_1.setupAdminPage)(app);
    // Start the server only after we have the socket
    app.listen(PORT, () => {
        console.log(`WhatsApp API Server running on port ${PORT}`);
    });
}
exports.initApi = initApi;
exports.default = app;
