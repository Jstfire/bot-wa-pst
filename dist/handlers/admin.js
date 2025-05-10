"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterAdminMode = exports.exitAdminMode = exports.isInAdminMode = void 0;
const messages_1 = require("../utils/messages");
const ADMIN_NUMBER = "6289616370100@s.whatsapp.net";
const adminSessions = new Set();
function isInAdminMode(sender) {
    return adminSessions.has(sender);
}
exports.isInAdminMode = isInAdminMode;
function exitAdminMode(sender) {
    adminSessions.delete(sender);
}
exports.exitAdminMode = exitAdminMode;
async function enterAdminMode(sock, sender, level) {
    const hour = getHours(new Date(), { timeZone: "Asia/Makassar" }); // WITA = GMT+8
    if (hour < 8 || hour >= 20) {
        await sock.sendMessage(sender, {
            text: `*❗Maaf, layanan admin tidak tersedia saat ini.🙏*\n\n${messages_1.ADMIN_JAM}`,
        });
        const menuText = level === "null" ? messages_1.MAIN_MENU_NEXT : messages_1.SUB_MENUS[level];
        await sock.sendMessage(sender, { text: menuText });
        return;
    }
    adminSessions.add(sender);
    await sock.sendMessage(sender, {
        text: `📨 Permintaan Anda telah diteruskan ke admin.\n⏳ Mohon ditunggu sebentar...`,
    });
    await sock.sendMessage(sender, {
        text: messages_1.ADMIN_END,
    });
    await sock.sendMessage(ADMIN_NUMBER, {
        text: `📬 Pengguna ${sender.replace("@s.whatsapp.net", "")} meminta bantuan admin. Silakan respon dari akun WA Business PST BPS.`,
    });
}
exports.enterAdminMode = enterAdminMode;
function getHours(date, options) {
    return new Date(date.toLocaleString("en-US", options)).getHours();
}
