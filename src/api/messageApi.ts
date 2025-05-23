import { Request, Response } from "express";
import { WASocket } from "@whiskeysockets/baileys";

/**
 * Formats a phone number to the correct WhatsApp format
 * @param number The phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(number: string): string {
	// Remove any non-numeric characters
	let formattedNumber = number.toString().replace(/[^0-9]/g, "");

	// Add country code if not present
	if (!formattedNumber.startsWith("62")) {
		// If number starts with 0, replace it with 62
		if (formattedNumber.startsWith("0")) {
			formattedNumber = "62" + formattedNumber.substring(1);
		} else {
			formattedNumber = "62" + formattedNumber;
		}
	}

	// Add suffix for WhatsApp ID
	if (!formattedNumber.includes("@")) {
		formattedNumber = `${formattedNumber}@s.whatsapp.net`;
	}

	return formattedNumber;
}

/**
 * Check if a phone number exists on WhatsApp
 * @param waSocket WhatsApp socket instance
 * @param number Phone number to check
 * @returns Promise<boolean> True if number exists on WhatsApp
 */
export async function checkNumberExists(
	waSocket: WASocket,
	number: string
): Promise<boolean> {
	try {
		// Format the phone number to just the numeric part without the suffix
		let formattedNumber = number.toString().replace(/[^0-9]/g, "");

		// Add country code if not present
		if (!formattedNumber.startsWith("62")) {
			// If number starts with 0, replace it with 62
			if (formattedNumber.startsWith("0")) {
				formattedNumber = "62" + formattedNumber.substring(1);
			} else {
				formattedNumber = "62" + formattedNumber;
			}
		}

		// Use the onWhatsApp function to check if the number exists
		const result = await waSocket.onWhatsApp(formattedNumber);

		// If result is not empty and the first item exists flag is true, the number exists
		return !!result && result.length > 0 && !!result[0].exists;
	} catch (error) {
		console.error("Error checking number existence:", error);
		return false;
	}
}

/**
 * API endpoint to check if a number exists on WhatsApp
 * @param waSocket WhatsApp socket instance
 * @param req HTTP request
 * @param res HTTP response
 */
export async function checkNumber(
	waSocket: WASocket | null,
	req: Request,
	res: Response
): Promise<void> {
	if (!waSocket) {
		res
			.status(503)
			.json({ success: false, message: "WhatsApp service not available" });
		return;
	}

	const { number } = req.body;

	if (!number) {
		res.status(400).json({
			success: false,
			message: "Number parameter is required",
		});
		return;
	}

	try {
		// Check if the number exists on WhatsApp
		const exists = await checkNumberExists(waSocket, number);

		res.json({
			success: true,
			exists,
			number: formatPhoneNumber(number).replace("@s.whatsapp.net", ""),
		});
	} catch (error) {
		console.error("Error checking number:", error);
		res.status(500).json({
			success: false,
			message: "Failed to check number",
			error: (error as Error).message,
		});
	}
}

/**
 * Send a text message to a WhatsApp number
 * @param waSocket WhatsApp socket instance
 * @param req HTTP request
 * @param res HTTP response
 */
export async function sendMessage(
	waSocket: WASocket | null,
	req: Request,
	res: Response
): Promise<void> {
	if (!waSocket) {
		res
			.status(503)
			.json({ success: false, message: "WhatsApp service not available" });
		return;
	}

	const { number, message } = req.body;

	if (!number || !message) {
		res.status(400).json({
			success: false,
			message: "Both number and message are required",
		});
		return;
	}

	try {
		// Format the phone number
		const formattedNumber = formatPhoneNumber(number);

		// Check if the number exists on WhatsApp
		const exists = await checkNumberExists(waSocket, number);
		if (!exists) {
			res.status(404).json({
				success: false,
				message: "The provided phone number does not exist on WhatsApp",
				number: formattedNumber.replace("@s.whatsapp.net", ""),
			});
			return;
		}
		// Send the message
		await waSocket.sendMessage(formattedNumber, {
			text: message,
		});

		// Record admin message sent via API if this message is from an admin
		// We need to import recordAdminMessage function to handle this
		try {
			const { recordAdminMessage } = require("../utils/session");
			recordAdminMessage(formattedNumber);
			console.log(
				`API message recorded as admin message to: ${formattedNumber}`
			);
		} catch (err) {
			console.error("Failed to record admin message via API:", err);
		}

		// Return success response
		res.json({
			success: true,
			message: "Message sent successfully",
			to: formattedNumber.replace("@s.whatsapp.net", ""),
		});
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({
			success: false,
			message: "Failed to send message",
			error: (error as Error).message,
		});
	}
}

/**
 * Send an image message to a WhatsApp number
 * @param waSocket WhatsApp socket instance
 * @param req HTTP request
 * @param res HTTP response
 */
export async function sendImageMessage(
	waSocket: WASocket | null,
	req: Request,
	res: Response
): Promise<void> {
	if (!waSocket) {
		res
			.status(503)
			.json({ success: false, message: "WhatsApp service not available" });
		return;
	}

	const { number, imageUrl, caption } = req.body;

	if (!number || !imageUrl) {
		res.status(400).json({
			success: false,
			message: "Both number and imageUrl are required",
		});
		return;
	}

	try {
		// Format the phone number
		const formattedNumber = formatPhoneNumber(number);

		// Check if the number exists on WhatsApp
		const exists = await checkNumberExists(waSocket, number);
		if (!exists) {
			res.status(404).json({
				success: false,
				message: "The provided phone number does not exist on WhatsApp",
				number: formattedNumber.replace("@s.whatsapp.net", ""),
			});
			return;
		}
		// Send the image message
		await waSocket.sendMessage(formattedNumber, {
			image: { url: imageUrl },
			caption: caption || undefined,
		});

		// Record admin message sent via API if this image is from an admin
		try {
			const { recordAdminMessage } = require("../utils/session");
			recordAdminMessage(formattedNumber);
			console.log(
				`API image message recorded as admin message to: ${formattedNumber}`
			);
		} catch (err) {
			console.error("Failed to record admin image message via API:", err);
		}

		// Return success response
		res.json({
			success: true,
			message: "Image message sent successfully",
			to: formattedNumber.replace("@s.whatsapp.net", ""),
		});
	} catch (error) {
		console.error("Error sending image message:", error);
		console.error("Image URL:", imageUrl);
		console.error(
			"Error details:",
			error instanceof Error ? error.stack : String(error)
		);
		res.status(500).json({
			success: false,
			message: "Failed to send image message",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
