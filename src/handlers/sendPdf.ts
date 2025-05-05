import { WASocket } from "@whiskeysockets/baileys";
import * as fs from "fs";
import * as path from "path";

export async function sendPDF(sock: WASocket, jid: string, filename: string) {
	const filePath = path.resolve(__dirname, "../data/pdf", filename);
	if (!fs.existsSync(filePath)) {
		await sock.sendMessage(jid, { text: `⚠️ File tidak ditemukan.` });
		return;
	}

	const buffer = fs.readFileSync(filePath);
	await sock.sendMessage(jid, {
		document: buffer,
		mimetype: "application/pdf",
		fileName: filename,
	});
}
