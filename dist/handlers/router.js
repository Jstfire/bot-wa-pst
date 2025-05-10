"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = void 0;
const messages_1 = require("../utils/messages");
const admin_1 = require("./admin");
const session_1 = require("../utils/session");
const sendPdf_1 = require("./sendPdf");
const antispam_1 = require("../utils/antispam");
const urlpreview_1 = require("../utils/urlpreview");
async function handleMessage(sock, msg, sender, text) {
    const session = (0, session_1.getSession)(sender);
    const level = session?.level;
    if ((0, antispam_1.isUserBlocked)(sender)) {
        if ((0, antispam_1.shouldSendWarning)(sender)) {
            await sock.sendMessage(sender, {
                text: "*🚫 Anda diblokir sementara karena mengirim terlalu banyak pesan. Silakan coba lagi beberapa saat.*",
            });
        }
        return;
    }
    (0, antispam_1.recordMessage)(sender, sock, text, level);
    if ((0, admin_1.isInAdminMode)(sender)) {
        if (text === "00") {
            (0, admin_1.exitAdminMode)(sender);
            await sock.sendMessage(sender, {
                text: "💬 Terima kasih telah menggunakan layanan admin PST BPS.",
            });
            await sock.sendMessage(sender, { text: messages_1.MAIN_MENU_NEXT });
            return;
        }
        return;
    }
    if (!(0, session_1.getSession)(sender) && !text.startsWith("00")) {
        await sock.sendMessage(sender, { text: messages_1.MAIN_MENU });
    }
    if ((0, session_1.isSessionExpired)(sender)) {
        (0, session_1.clearSession)(sender);
        await sock.sendMessage(sender, {
            text: `⌛ Sesi Anda telah berakhir karena tidak ada aktivitas selama 24 jam.\n\n${messages_1.MAIN_MENU}`,
        });
        return;
    }
    (0, session_1.setSession)(sender);
    const updatedSession = (0, session_1.getSession)(sender);
    if (!updatedSession.level) {
        switch (text) {
            case "1":
            case "2":
            case "3":
            case "6":
                updatedSession.level = text;
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, { text: messages_1.SUB_MENUS[text] });
                return;
            case "4":
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, { text: messages_1.STATISTIK_UMUM });
                await sock.sendMessage(sender, { text: messages_1.WEB_BUSEL });
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, { text: messages_1.MAIN_MENU_NEXT });
                return;
            case "5":
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, { text: messages_1.PUBLIKASI });
                await (0, sendPdf_1.sendPDF)(sock, sender, "Kabupaten Buton Selatan Dalam Angka 2025.pdf");
                await sock.sendMessage(sender, { text: messages_1.WEB_BUSEL });
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, { text: messages_1.MAIN_MENU_NEXT });
                return;
            case "7":
                await (0, admin_1.enterAdminMode)(sock, sender, "null");
                return;
            default:
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, { text: messages_1.MAIN_MENU });
        }
    }
    else {
        if (text === "99") {
            (0, session_1.clearSession)(sender);
            await sock.sendMessage(sender, { text: messages_1.MAIN_MENU });
            return;
        }
        const level = updatedSession.level;
        if (level === "1") {
            if (text === "1") {
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await (0, urlpreview_1.sendLinkPreview)(sock, sender, "*📚 Kunjungi PST Online:* ", "https://perpustakaan.bps.go.id/opac/");
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
            else if (text === "2") {
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, {
                    location: {
                        degreesLatitude: -5.608591411817911,
                        degreesLongitude: 122.60022162024016,
                        name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
                        address: "9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
                    },
                });
                await (0, urlpreview_1.sendLinkPreview)(sock, sender, messages_1.LOKASI, "https://maps.app.goo.gl/e66zfh8eGxsqj2ET7");
                await sock.sendMessage(sender, { text: messages_1.JADWAL_BUKA });
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
            else {
                await sock.sendMessage(sender, {
                    text: messages_1.INVALID,
                });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
        }
        else if (level === "2") {
            if (text === "1") {
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await (0, urlpreview_1.sendLinkPreview)(sock, sender, "*🔗 Akses Romantik:* ", "https://romantik.web.bps.go.id/");
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, { text: messages_1.SUB_MENUS[level] });
            }
            else if (text === "2") {
                await (0, admin_1.enterAdminMode)(sock, sender, level);
            }
            else {
                await sock.sendMessage(sender, {
                    text: messages_1.INVALID,
                });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
        }
        else if (level === "3") {
            if (text === "1")
                await (0, admin_1.enterAdminMode)(sock, sender, level);
            else if (text === "2") {
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, {
                    location: {
                        degreesLatitude: -5.608591411817911,
                        degreesLongitude: 122.60022162024016,
                        name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
                        address: "9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
                    },
                });
                await (0, urlpreview_1.sendLinkPreview)(sock, sender, messages_1.LOKASI, "https://maps.app.goo.gl/e66zfh8eGxsqj2ET7");
                await sock.sendMessage(sender, { text: messages_1.JADWAL_BUKA });
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, { text: messages_1.SUB_MENUS[level] });
            }
            else {
                await sock.sendMessage(sender, {
                    text: messages_1.INVALID,
                });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
        }
        else if (level === "6") {
            const pdfMap = {
                "1": "Kecamatan Batu Atas Dalam Angka 2025.pdf",
                "2": "Kecamatan Lapandewa Dalam Angka 2025.pdf",
                "3": "Kecamatan Sampolawa Dalam Angka 2025.pdf",
                "4": "Kecamatan Batauga Dalam Angka 2025.pdf",
                "5": "Kecamatan Siompu Barat Dalam Angka 2025.pdf",
                "6": "Kecamatan Siompu Dalam Angka 2025.pdf",
                "7": "Kecamatan Kadatua Dalam Angka 2025.pdf",
            };
            if (text in pdfMap) {
                await sock.sendMessage(sender, {
                    text: messages_1.WAITING,
                });
                await sock.sendMessage(sender, { text: messages_1.PUBLIKASI });
                await (0, sendPdf_1.sendPDF)(sock, sender, pdfMap[text]);
                await sock.sendMessage(sender, { text: messages_1.WEB_BUSEL });
                await sock.sendMessage(sender, { text: messages_1.THANKS });
                await sock.sendMessage(sender, { text: messages_1.SUB_MENUS[level] });
            }
            else if (text === "99") {
                (0, session_1.clearSession)(sender);
                await sock.sendMessage(sender, { text: messages_1.MAIN_MENU });
            }
            else {
                await sock.sendMessage(sender, {
                    text: messages_1.INVALID,
                });
                await sock.sendMessage(sender, {
                    text: messages_1.SUB_MENUS[level],
                });
            }
        }
    }
}
exports.handleMessage = handleMessage;
