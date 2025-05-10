import express from "express";
import path from "path";

export function setupAdminPage(app: express.Application) {
	// Serve the admin HTML page
	app.get("/api/admin", (req, res) => {
		res.sendFile(path.resolve(__dirname, "admin.html"));
	});
}
