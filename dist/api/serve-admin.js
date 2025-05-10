"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAdminPage = void 0;
const path_1 = __importDefault(require("path"));
function setupAdminPage(app) {
    // Serve the admin HTML page
    app.get("/api/admin", (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, "admin.html"));
    });
}
exports.setupAdminPage = setupAdminPage;
