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

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

export function addDays(dateKey: string, days: number): string {
	const d = new Date(`${dateKey}T12:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

/** Returns 0=Mon..6=Sun for a YYYY-MM-DD date key */
export function getDayOfWeek(dateKey: string): number {
	const d = new Date(`${dateKey}T12:00:00Z`);
	const jsDay = d.getUTCDay(); // 0=Sun..6=Sat
	return jsDay === 0 ? 6 : jsDay - 1;
}

export function getLocalYearMonth(
	date: Date,
	tz: string,
): { year: number; month: number } {
	const key = getLocalDateKey(date, tz);
	const [y, m] = key.split("-");
	return { year: Number(y), month: Number(m) };
}

export function getMonthBounds(
	year: number,
	month: number,
): { start: string; end: string } {
	const start = `${year}-${pad(month)}-01`;
	const end = `${year}-${pad(month)}-${pad(getDaysInMonth(year, month))}`;
	return { start, end };
}

/** Returns the Monday of the current week in the user's timezone */
export function getWeekStartDate(date: Date, tz: string): string {
	const todayKey = getLocalDateKey(date, tz);
	const dow = getDayOfWeek(todayKey); // 0=Mon..6=Sun
	return addDays(todayKey, -dow);
}

/** Returns all YYYY-MM-DD between start and end inclusive */
export function getDateRange(start: string, end: string): string[] {
	const result: string[] = [];
	let current = start;
	while (current <= end) {
		result.push(current);
		current = addDays(current, 1);
	}
	return result;
}

/** Localized month name via Intl.DateTimeFormat */
export function getMonthName(
	year: number,
	month: number,
	locale: string,
): string {
	const date = new Date(year, month - 1, 1);
	return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

/** Short weekday names starting from Monday, e.g. ["Пн","Вт",...] */
export function getWeekdayShorts(locale: string): string[] {
	const base = new Date(2024, 0, 1); // Monday 2024-01-01
	const result: string[] = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(base);
		d.setDate(base.getDate() + i);
		result.push(
			new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d),
		);
	}
	return result;
}
