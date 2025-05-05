import { WASocket, proto } from "@whiskeysockets/baileys";
import {
	SUB_MENUS,
	MAIN_MENU,
	STATISTIK_UMUM,
	JADWAL_BUKA,
	ADMIN_JAM,
	MAIN_MENU_NEXT,
	THANKS,
	PUBLIKASI,
	WEB_BUSEL,
} from "../utils/messages";
import { enterAdminMode, isInAdminMode, exitAdminMode } from "./admin";
import {
	getSession,
	setSession,
	clearSession,
	isSessionExpired,
} from "../utils/session";
import { sendPDF } from "./sendPdf";
import { isUserBlocked, recordMessage } from "../utils/antispam";

export async function handleMessage(
	sock: WASocket,
	msg: proto.IWebMessageInfo,
	sender: string,
	text: string
) {
	if (isUserBlocked(sender)) {
		await sock.sendMessage(sender, {
			text: "🚫 Anda diblokir sementara karena mengirim terlalu banyak pesan. Silakan coba lagi beberapa saat.",
		});
		return;
	}

	recordMessage(sender);

	if (isInAdminMode(sender)) {
		if (text === "00") {
			exitAdminMode(sender);
			await sock.sendMessage(sender, {
				text: "💬 Terima kasih telah menggunakan layanan admin PST BPS.",
			});
			await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
			return;
		}

		return;
	}
	if (!getSession(sender) && !text.startsWith("00")) {
		await sock.sendMessage(sender, {
			text: MAIN_MENU,
		});
	}

	if (isSessionExpired(sender)) {
		clearSession(sender);
		await sock.sendMessage(sender, {
			text: `⌛ Sesi Anda telah berakhir karena tidak ada aktivitas selama 24 jam.\n\n${MAIN_MENU}`,
		});
		return;
	}

	setSession(sender);

	const session = getSession(sender);

	// Handle main menu
	if (!session.level) {
		switch (text) {
			case "1":
			case "2":
			case "3":
			case "6":
				session.level = text;
				await sock.sendMessage(sender, { text: SUB_MENUS[text] });
				return;
			case "4":
				await sock.sendMessage(sender, { text: STATISTIK_UMUM });
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "5":
				await sock.sendMessage(sender, { text: PUBLIKASI });
				await sendPDF(
					sock,
					sender,
					"Kabupaten Buton Selatan Dalam Angka 2025.pdf"
				);
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "7":
				await enterAdminMode(sock, sender);
				return;
			default:
				await sock.sendMessage(sender, {
					text: `${MAIN_MENU}`,
				});
		}
	} else {
		if (text === "99") {
			clearSession(sender);
			await sock.sendMessage(sender, { text: MAIN_MENU });
			return;
		}

		const level = session.level;
		if (level === "1") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: "⏳ Mohon ditunggu sebentar...",
				});

				try {
					await sock.sendMessage(sender, {
						text: "📚 Kunjungi PST Online: https://perpustakaan.bps.go.id/",
						// linkPreview: true,
					});
				} catch (error) {
					console.error("Gagal kirim dengan preview:", error);
					await sock.sendMessage(sender, {
						text: "📚 Kunjungi PST Online: https://perpustakaan.bps.go.id/",
					});
				}
			} else if (text === "2") {
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
			} else
				await sock.sendMessage(sender, {
					text: `❗Pilihan tidak valid.\n\n${SUB_MENUS[level]}`,
				});
		} else if (level === "2") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: `🔗 Akses Romantik: https://romantik.web.bps.go.id/`,
				});
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS["2"] });
			} else if (text === "2") {
				await enterAdminMode(sock, sender);
			} else
				await sock.sendMessage(sender, {
					text: `❗Pilihan tidak valid.\n\n${SUB_MENUS[level]}`,
				});
		} else if (level === "3") {
			if (text === "1") await enterAdminMode(sock, sender);
			else if (text === "2") {
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS["3"] });
			} else
				await sock.sendMessage(sender, {
					text: `❗Pilihan tidak valid.\n\n${SUB_MENUS[level]}`,
				});
		} else if (level === "6") {
			switch (text) {
				case "1":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(
						sock,
						sender,
						`Kecamatan Batu Atas Dalam Angka 2025.pdf`
					);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "2":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(
						sock,
						sender,
						`Kecamatan Lapandewa Dalam Angka 2025.pdf`
					);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "3":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(
						sock,
						sender,
						`Kecamatan Sampolawa Dalam Angka 2025.pdf`
					);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "4":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(sock, sender, `Kecamatan Batauga Dalam Angka 2025.pdf`);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "5":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(
						sock,
						sender,
						`Kecamatan Siompu Barat Dalam Angka 2025.pdf`
					);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "6":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(sock, sender, `Kecamatan Siompu Dalam Angka 2025.pdf`);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "7":
					await sock.sendMessage(sender, { text: PUBLIKASI });
					await sendPDF(sock, sender, `Kecamatan Kadatua Dalam Angka 2025.pdf`);
					await sock.sendMessage(sender, { text: WEB_BUSEL });
					await sock.sendMessage(sender, { text: THANKS });
					await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
					break;
				case "99":
					clearSession(sender);
					await sock.sendMessage(sender, { text: MAIN_MENU });
					break;
			}
		}
	}
}
