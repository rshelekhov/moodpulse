import { TZDate } from "@date-fns/tz";

const TIME_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function parseReminderTime(
	input: string,
): { hours: number; minutes: number } | null {
	const trimmed = input.trim();
	if (!TIME_REGEX.test(trimmed)) return null;

	const [hStr, mStr] = trimmed.split(":");
	if (!hStr || !mStr) return null;

	return { hours: Number(hStr), minutes: Number(mStr) };
}

export function computeNextReminderAt(
	reminderTime: string,
	timezone: string,
	now: Date = new Date(),
): Date {
	const parsed = parseReminderTime(reminderTime);
	if (!parsed) {
		throw new Error(`Invalid reminder time: ${reminderTime}`);
	}

	const nowTz = new TZDate(now, timezone);
	const y = nowTz.getFullYear();
	const m = nowTz.getMonth();
	const d = nowTz.getDate();

	const today = new TZDate(
		y,
		m,
		d,
		parsed.hours,
		parsed.minutes,
		0,
		0,
		timezone,
	);
	if (today.getTime() > now.getTime()) {
		return new Date(today.getTime());
	}

	const tomorrow = new TZDate(
		y,
		m,
		d + 1,
		parsed.hours,
		parsed.minutes,
		0,
		0,
		timezone,
	);
	return new Date(tomorrow.getTime());
}
