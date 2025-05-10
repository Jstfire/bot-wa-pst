"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidMenuInput = exports.shouldSendWarning = exports.recordMessage = exports.isUserBlocked = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const messageCountMap = new Map();
const blockedUsers = new Map();
const warnedUsers = new Map();
const notifiedAdmins = new Set();
const lastInputValidity = new Map();
const BLOCK_FILE = path_1.default.resolve(__dirname, "blocked-users.json");
if (fs_1.default.existsSync(BLOCK_FILE)) {
    const data = JSON.parse(fs_1.default.readFileSync(BLOCK_FILE, "utf-8"));
    for (const [sender, unblockTime] of Object.entries(data)) {
        blockedUsers.set(sender, unblockTime);
    }
}
function saveBlockedUsers() {
    const obj = {};
    for (const [sender, time] of blockedUsers.entries()) {
        obj[sender] = time;
    }
    fs_1.default.writeFileSync(BLOCK_FILE, JSON.stringify(obj, null, 2));
}
function cleanExpiredBlockedUsers() {
    const now = Date.now();
    let changed = false;
    for (const [sender, time] of blockedUsers.entries()) {
        if (now > time) {
            blockedUsers.delete(sender);
            notifiedAdmins.delete(sender);
            warnedUsers.delete(sender); // 🔁 Reset warning saat blokir selesai
            changed = true;
        }
    }
    if (changed)
        saveBlockedUsers();
}
setInterval(cleanExpiredBlockedUsers, 5 * 60 * 1000);
function isUserBlocked(sender) {
    const unblockTime = blockedUsers.get(sender);
    if (!unblockTime)
        return false;
    if (Date.now() > unblockTime) {
        blockedUsers.delete(sender);
        notifiedAdmins.delete(sender);
        warnedUsers.delete(sender); // 🔁 Reset warning saat blokir selesai
        saveBlockedUsers();
        return false;
    }
    return true;
}
exports.isUserBlocked = isUserBlocked;
function recordMessage(sender, sock, text, level) {
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;
    let timestamps = messageCountMap.get(sender) || [];
    timestamps = timestamps.filter((t) => t > thirtySecondsAgo);
    const isValid = isValidMenuInput(text, level);
    const lastValid = lastInputValidity.get(sender);
    // Reset jika tipe input berubah
    if (lastValid !== undefined && lastValid !== isValid) {
        timestamps = [];
    }
    timestamps.push(now);
    messageCountMap.set(sender, timestamps);
    lastInputValidity.set(sender, isValid);
    const validLimit = 15;
    const invalidLimit = 5;
    const totalLimit = 30;
    console.log(`Pesan dari ${sender}: ${timestamps.length}/${totalLimit} pesan dalam 30 detik.`);
    if (isValid) {
        console.log(`Pesan dari ${sender}: ${timestamps.length}/${validLimit} pesan dalam 30 detik, valid=${isValid}`);
    }
    else {
        console.log(`Pesan dari ${sender}: ${timestamps.length}/${invalidLimit} pesan dalam 30 detik, valid=${isValid}`);
    }
    if (timestamps.length > totalLimit ||
        (isValid && timestamps.length > validLimit) ||
        (!isValid && timestamps.length > invalidLimit)) {
        if (!blockedUsers.has(sender)) {
            const unblockAt = now + 60 * 60000;
            blockedUsers.set(sender, unblockAt);
            saveBlockedUsers();
            console.log(`${sender} diblokir hingga ${new Date(unblockAt).toLocaleTimeString()}`);
            if (!notifiedAdmins.has(sender)) {
                sock.sendMessage("6289616370100@s.whatsapp.net", {
                    text: `🚨 *SPAM TERDETEKSI* 🚨\n\n*Nomor:* ${sender.replace("@s.whatsapp.net", "")}\n*Pesan dikirim:* ${timestamps.length} dalam 30 detik\n*Diblokir hingga:* ${new Date(unblockAt).toLocaleTimeString()} WITA\n\n_Silakan pantau atau tindak lanjuti._`,
                });
                notifiedAdmins.add(sender);
            }
        }
    }
}
exports.recordMessage = recordMessage;
function shouldSendWarning(sender) {
    const timestamps = warnedUsers.get(sender) || [];
    // Maks 3 peringatan per periode blokir
    if (timestamps.length >= 3)
        return false;
    timestamps.push(Date.now());
    warnedUsers.set(sender, timestamps);
    console.log(`Peringatan untuk ${sender}: ${timestamps.length}/3`);
    return true;
}
exports.shouldSendWarning = shouldSendWarning;
function isValidMenuInput(text, level) {
    if (!/^\d+$/.test(text))
        return false;
    const validMain = ["1", "2", "3", "4", "5", "6", "7"];
    const validSub = {
        "1": ["1", "2"],
        "2": ["1", "2"],
        "3": ["1", "2"],
        "6": ["1", "2", "3", "4", "5", "6", "7"],
    };
    if (!level) {
        return validMain.includes(text);
    }
    return validSub[level]?.includes(text) ?? false;
}
exports.isValidMenuInput = isValidMenuInput;
