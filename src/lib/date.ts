import { createChildLogger } from "./logger";

const logger = createChildLogger("date");
const DATE_FORMAT_LOCALE = "en-CA";

function createDateFormatter(timeZone: string): Intl.DateTimeFormat {
	const resolvedTimeZone = timeZone?.trim() ? timeZone : "UTC";
	try {
		return new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, {
			timeZone: resolvedTimeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	} catch (error) {
		logger.warn({ timeZone, error }, "Invalid timezone, falling back to UTC");
		return new Intl.DateTimeFormat(DATE_FORMAT_LOCALE, {
			timeZone: "UTC",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	}
}

export function getLocalDateKey(date: Date, timeZone: string): string {
	const formatter = createDateFormatter(timeZone);
	const parts = formatter.formatToParts(date);
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;

	if (year && month && day) {
		return `${year}-${month}-${day}`;
	}

	return formatter.format(date);
}
