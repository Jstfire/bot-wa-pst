"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const router_1 = require("./handlers/router");
const session_1 = require("./utils/session");
const server_1 = require("./api/server");
async function startBot() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)("auth");
    const sock = (0, baileys_1.default)({
        auth: state,
        printQRInTerminal: true,
    });
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify")
            return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe)
            return;
        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (text) {
            await (0, router_1.handleMessage)(sock, msg, sender, text);
        }
    });
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !==
                baileys_1.DisconnectReason.loggedOut;
            if (shouldReconnect)
                startBot();
        }
        else if (connection === "open") {
            console.log("Bot connected");
            // Initialize API with the connected socket
            (0, server_1.initApi)(sock);
        }
    });
    // Session timeout cleaner
    (0, session_1.initSessionCleaner)();
}
startBot();
