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
	LOKASI,
	WAITING,
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
import { sendLinkPreview } from "../utils/urlpreview";

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
		await sock.sendMessage(sender, { text: MAIN_MENU });
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

	if (!session.level) {
		switch (text) {
			case "1":
			case "2":
			case "3":
			case "6":
				session.level = text;
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: SUB_MENUS[text] });
				return;
			case "4":
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: STATISTIK_UMUM });
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: MAIN_MENU_NEXT });
				return;
			case "5":
				await sock.sendMessage(sender, {
					text: WAITING,
				});
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
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: MAIN_MENU });
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
					text: WAITING,
				});
				await sendLinkPreview(
					sock,
					sender,
					"*📚 Kunjungi PST Online:* ",
					"https://perpustakaan.bps.go.id/opac/"
				);
				await sock.sendMessage(sender, { text: THANKS });
			} else if (text === "2") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
			} else {
				await sock.sendMessage(sender, { text: `❗Pilihan tidak valid.` });
			}
			await sock.sendMessage(sender, { text: SUB_MENUS[level] });
		} else if (level === "2") {
			if (text === "1") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sendLinkPreview(
					sock,
					sender,
					"*🔗 Akses Romantik:* ",
					"https://romantik.web.bps.go.id/"
				);
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS["2"] });
			} else if (text === "2") {
				await enterAdminMode(sock, sender);
			} else {
				await sock.sendMessage(sender, {
					text: `❗Pilihan tidak valid.\n\n${SUB_MENUS[level]}`,
				});
			}
		} else if (level === "3") {
			if (text === "1") await enterAdminMode(sock, sender);
			else if (text === "2") {
				await sock.sendMessage(sender, {
					text: WAITING,
				});
				await sock.sendMessage(sender, {
					location: {
						degreesLatitude: -5.608591411817911,
						degreesLongitude: 122.60022162024016,
						name: "Kantor Badan Pusat Statistik Kab. Buton Selatan",
						address:
							"9JR2+F4C, Jl. Lamaindo, Laompo, Batauga, Kabupaten Buton, Sulawesi Tenggara",
					},
				});
				await sendLinkPreview(
					sock,
					sender,
					LOKASI,
					"https://maps.app.goo.gl/e66zfh8eGxsqj2ET7"
				);
				await sock.sendMessage(sender, { text: JADWAL_BUKA });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS["3"] });
			} else {
				await sock.sendMessage(sender, {
					text: `❗Pilihan tidak valid.\n\n${SUB_MENUS[level]}`,
				});
			}
		} else if (level === "6") {
			const pdfMap: { [key: string]: string } = {
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
					text: WAITING,
				});
				await sock.sendMessage(sender, { text: PUBLIKASI });
				await sendPDF(sock, sender, pdfMap[text]);
				await sock.sendMessage(sender, { text: WEB_BUSEL });
				await sock.sendMessage(sender, { text: THANKS });
				await sock.sendMessage(sender, { text: SUB_MENUS["6"] });
			} else if (text === "99") {
				clearSession(sender);
				await sock.sendMessage(sender, { text: MAIN_MENU });
			}
		}
	}
}
