import { describe, expect, test } from "bun:test";
import {
	computeNextReminderAt,
	parseReminderTime,
} from "../src/lib/reminder-time";

describe("parseReminderTime", () => {
	test("parses valid times", () => {
		expect(parseReminderTime("00:00")).toEqual({ hours: 0, minutes: 0 });
		expect(parseReminderTime("09:30")).toEqual({ hours: 9, minutes: 30 });
		expect(parseReminderTime("21:00")).toEqual({ hours: 21, minutes: 0 });
		expect(parseReminderTime("23:59")).toEqual({ hours: 23, minutes: 59 });
	});

	test("trims whitespace", () => {
		expect(parseReminderTime("  09:00  ")).toEqual({ hours: 9, minutes: 0 });
	});

	test("rejects invalid format", () => {
		expect(parseReminderTime("9:00")).toBeNull();
		expect(parseReminderTime("abc")).toBeNull();
		expect(parseReminderTime("")).toBeNull();
		expect(parseReminderTime("12")).toBeNull();
		expect(parseReminderTime("12:0")).toBeNull();
		expect(parseReminderTime("1200")).toBeNull();
	});

	test("rejects hours > 23", () => {
		expect(parseReminderTime("24:00")).toBeNull();
		expect(parseReminderTime("25:00")).toBeNull();
	});

	test("rejects minutes > 59", () => {
		expect(parseReminderTime("12:60")).toBeNull();
		expect(parseReminderTime("12:99")).toBeNull();
	});
});

describe("computeNextReminderAt", () => {
	test("returns today if reminder time not yet passed", () => {
		// 10:00 UTC = 13:00 Moscow. Reminder at 21:00 Moscow hasn't passed.
		const now = new Date("2026-02-06T10:00:00Z");
		const result = computeNextReminderAt("21:00", "Europe/Moscow", now);

		// 21:00 Moscow = 18:00 UTC
		expect(result.toISOString()).toBe("2026-02-06T18:00:00.000Z");
	});

	test("returns tomorrow if reminder time already passed", () => {
		// 20:00 UTC = 23:00 Moscow. Reminder at 21:00 Moscow already passed.
		const now = new Date("2026-02-06T20:00:00Z");
		const result = computeNextReminderAt("21:00", "Europe/Moscow", now);

		// Next 21:00 Moscow = 18:00 UTC tomorrow
		expect(result.toISOString()).toBe("2026-02-07T18:00:00.000Z");
	});

	test("works with negative UTC offset", () => {
		// 15:00 UTC = 10:00 New York (EST, UTC-5). Reminder at 20:00 NY.
		const now = new Date("2026-02-06T15:00:00Z");
		const result = computeNextReminderAt("20:00", "America/New_York", now);

		// 20:00 New York EST = 01:00 UTC next day
		expect(result.toISOString()).toBe("2026-02-07T01:00:00.000Z");
	});

	test("handles midnight reminder", () => {
		// 20:00 UTC = 23:00 Moscow. Reminder at 00:00 Moscow.
		const now = new Date("2026-02-06T20:00:00Z");
		const result = computeNextReminderAt("00:00", "Europe/Moscow", now);

		// 00:00 Moscow Feb 7 = 21:00 UTC Feb 6
		expect(result.toISOString()).toBe("2026-02-06T21:00:00.000Z");
	});

	test("handles early morning reminder with positive offset", () => {
		// 01:00 UTC = 04:00 Moscow. Reminder at 08:00 Moscow.
		const now = new Date("2026-02-06T01:00:00Z");
		const result = computeNextReminderAt("08:00", "Europe/Moscow", now);

		// 08:00 Moscow = 05:00 UTC
		expect(result.toISOString()).toBe("2026-02-06T05:00:00.000Z");
	});

	test("handles UTC timezone", () => {
		const now = new Date("2026-02-06T10:00:00Z");
		const result = computeNextReminderAt("15:00", "UTC", now);

		expect(result.toISOString()).toBe("2026-02-06T15:00:00.000Z");
	});

	test("handles large positive offset (Asia/Tokyo UTC+9)", () => {
		// 08:00 UTC = 17:00 Tokyo. Reminder at 21:00 Tokyo.
		const now = new Date("2026-02-06T08:00:00Z");
		const result = computeNextReminderAt("21:00", "Asia/Tokyo", now);

		// 21:00 Tokyo = 12:00 UTC
		expect(result.toISOString()).toBe("2026-02-06T12:00:00.000Z");
	});

	test("throws on invalid time format", () => {
		expect(() => computeNextReminderAt("invalid", "UTC")).toThrow(
			"Invalid reminder time",
		);
	});
});
