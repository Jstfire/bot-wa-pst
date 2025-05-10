"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSessionCleaner = exports.isSessionExpired = exports.clearSession = exports.getSession = exports.setSession = void 0;
const sessions = {};
function setSession(sender) {
    if (!sessions[sender])
        sessions[sender] = { lastActive: Date.now() };
    sessions[sender].lastActive = Date.now();
}
exports.setSession = setSession;
function getSession(sender) {
    if (!sessions[sender])
        setSession(sender);
    return sessions[sender];
}
exports.getSession = getSession;
function clearSession(sender) {
    delete sessions[sender];
}
exports.clearSession = clearSession;
function isSessionExpired(sender) {
    const session = sessions[sender];
    return session && Date.now() - session.lastActive > 24 * 60 * 60 * 1000;
}
exports.isSessionExpired = isSessionExpired;
function initSessionCleaner() {
    setInterval(() => {
        const now = Date.now();
        for (const sender in sessions) {
            if (now - sessions[sender].lastActive > 24 * 60 * 60 * 1000)
                delete sessions[sender];
        }
    }, 60 * 60 * 1000); // setiap jam
}
exports.initSessionCleaner = initSessionCleaner;
