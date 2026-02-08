import FormData from "form-data";
import Mailgun from "mailgun.js";
import { getConfig } from "../config/config";
import { createChildLogger } from "../lib/logger";

const logger = createChildLogger("email");

export function isEmailConfigured(): boolean {
	const cfg = getConfig();
	return !!(cfg.MAILGUN_API_KEY && cfg.MAILGUN_DOMAIN && cfg.MAILGUN_FROM);
}

export async function sendReportEmail(
	to: string,
	csvBuffer: Buffer,
	xlsxBuffer: Buffer,
	subject: string,
): Promise<void> {
	const cfg = getConfig();
	if (!cfg.MAILGUN_API_KEY || !cfg.MAILGUN_DOMAIN || !cfg.MAILGUN_FROM) {
		throw new Error("Mailgun is not configured");
	}

	const mailgun = new Mailgun(FormData);
	const mg = mailgun.client({
		username: "api",
		key: cfg.MAILGUN_API_KEY,
		...(cfg.MAILGUN_API_BASE ? { url: cfg.MAILGUN_API_BASE } : {}),
	});

	const dateStr = new Date().toISOString().slice(0, 10);

	await mg.messages.create(cfg.MAILGUN_DOMAIN, {
		from: cfg.MAILGUN_FROM,
		to: [to],
		subject,
		text: "Your MoodPulse report is attached.\n\nSee the attached files below.\n",
		html: "<p>Your MoodPulse report is attached.</p><br><p>See the attached files below.</p>",
		attachment: [
			{
				data: csvBuffer,
				filename: `moodpulse-report-${dateStr}.csv`,
			},
			{
				data: xlsxBuffer,
				filename: `moodpulse-report-${dateStr}.xlsx`,
			},
		],
	});

	logger.info({ to }, "Report email sent");
}
