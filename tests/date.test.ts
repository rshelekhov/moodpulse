import { describe, expect, test } from "bun:test";
import {
	addDays,
	getDateRange,
	getDayOfWeek,
	getDaysInMonth,
	getLocalDateKey,
	getLocalYearMonth,
	getMonthBounds,
	getMonthName,
	getWeekdayShorts,
	getWeekStartDate,
} from "../src/lib/date";

describe("getLocalDateKey", () => {
	test("uses the provided timezone", () => {
		const date = new Date("2026-02-05T01:30:00Z");
		expect(getLocalDateKey(date, "America/Los_Angeles")).toBe("2026-02-04");
		expect(getLocalDateKey(date, "Asia/Tokyo")).toBe("2026-02-05");
	});

	test("falls back to UTC on invalid timezone", () => {
		const date = new Date("2026-02-05T01:30:00Z");
		expect(getLocalDateKey(date, "Invalid/Zone")).toBe("2026-02-05");
	});
});

describe("addDays", () => {
	test("adds positive days", () => {
		expect(addDays("2026-02-05", 3)).toBe("2026-02-08");
	});

	test("subtracts with negative days", () => {
		expect(addDays("2026-02-05", -5)).toBe("2026-01-31");
	});

	test("crosses month boundary", () => {
		expect(addDays("2026-01-30", 5)).toBe("2026-02-04");
	});

	test("crosses year boundary", () => {
		expect(addDays("2025-12-30", 5)).toBe("2026-01-04");
	});

	test("zero days returns same date", () => {
		expect(addDays("2026-02-05", 0)).toBe("2026-02-05");
	});
});

describe("getDaysInMonth", () => {
	test("returns 28 for February non-leap year", () => {
		expect(getDaysInMonth(2026, 2)).toBe(28);
	});

	test("returns 29 for February leap year", () => {
		expect(getDaysInMonth(2024, 2)).toBe(29);
	});

	test("returns 31 for January", () => {
		expect(getDaysInMonth(2026, 1)).toBe(31);
	});

	test("returns 30 for April", () => {
		expect(getDaysInMonth(2026, 4)).toBe(30);
	});
});

describe("getDayOfWeek", () => {
	test("Monday returns 0", () => {
		// 2024-01-01 was a Monday
		expect(getDayOfWeek("2024-01-01")).toBe(0);
	});

	test("Sunday returns 6", () => {
		// 2026-02-01 is a Sunday
		expect(getDayOfWeek("2026-02-01")).toBe(6);
	});

	test("Wednesday returns 2", () => {
		// 2026-02-04 is a Wednesday
		expect(getDayOfWeek("2026-02-04")).toBe(2);
	});
});

describe("getLocalYearMonth", () => {
	test("returns year and month in given timezone", () => {
		const date = new Date("2026-01-31T23:30:00Z");
		// In Tokyo (UTC+9) this is already Feb 1
		const result = getLocalYearMonth(date, "Asia/Tokyo");
		expect(result.year).toBe(2026);
		expect(result.month).toBe(2);
	});

	test("returns correct month in UTC", () => {
		const date = new Date("2026-02-15T12:00:00Z");
		const result = getLocalYearMonth(date, "UTC");
		expect(result.year).toBe(2026);
		expect(result.month).toBe(2);
	});
});

describe("getMonthBounds", () => {
	test("returns first and last day of month", () => {
		const bounds = getMonthBounds(2026, 2);
		expect(bounds.start).toBe("2026-02-01");
		expect(bounds.end).toBe("2026-02-28");
	});

	test("handles leap year February", () => {
		const bounds = getMonthBounds(2024, 2);
		expect(bounds.start).toBe("2024-02-01");
		expect(bounds.end).toBe("2024-02-29");
	});

	test("handles 31-day month", () => {
		const bounds = getMonthBounds(2026, 1);
		expect(bounds.start).toBe("2026-01-01");
		expect(bounds.end).toBe("2026-01-31");
	});
});

describe("getWeekStartDate", () => {
	test("returns Monday for a Wednesday", () => {
		// 2026-02-04 is Wednesday
		const date = new Date("2026-02-04T12:00:00Z");
		expect(getWeekStartDate(date, "UTC")).toBe("2026-02-02");
	});

	test("returns same day for Monday", () => {
		// 2026-02-02 is Monday
		const date = new Date("2026-02-02T12:00:00Z");
		expect(getWeekStartDate(date, "UTC")).toBe("2026-02-02");
	});

	test("returns Monday for a Sunday", () => {
		// 2026-02-01 is Sunday
		const date = new Date("2026-02-01T12:00:00Z");
		expect(getWeekStartDate(date, "UTC")).toBe("2026-01-26");
	});
});

describe("getDateRange", () => {
	test("returns inclusive range", () => {
		const result = getDateRange("2026-02-01", "2026-02-03");
		expect(result).toEqual(["2026-02-01", "2026-02-02", "2026-02-03"]);
	});

	test("returns single date when start equals end", () => {
		const result = getDateRange("2026-02-05", "2026-02-05");
		expect(result).toEqual(["2026-02-05"]);
	});

	test("returns empty array when start > end", () => {
		const result = getDateRange("2026-02-05", "2026-02-03");
		expect(result).toEqual([]);
	});

	test("crosses month boundary", () => {
		const result = getDateRange("2026-01-30", "2026-02-02");
		expect(result).toEqual([
			"2026-01-30",
			"2026-01-31",
			"2026-02-01",
			"2026-02-02",
		]);
	});
});

describe("getMonthName", () => {
	test("returns Russian month name", () => {
		const name = getMonthName(2026, 2, "ru-RU");
		expect(name.toLowerCase()).toContain("февр");
	});

	test("returns English month name", () => {
		const name = getMonthName(2026, 2, "en-US");
		expect(name.toLowerCase()).toBe("february");
	});
});

describe("getWeekdayShorts", () => {
	test("returns 7 weekday names", () => {
		const result = getWeekdayShorts("en-US");
		expect(result).toHaveLength(7);
	});

	test("starts with Monday", () => {
		const result = getWeekdayShorts("en-US");
		expect(result.at(0)?.toLowerCase()).toContain("mon");
	});

	test("ends with Sunday", () => {
		const result = getWeekdayShorts("en-US");
		expect(result.at(6)?.toLowerCase()).toContain("sun");
	});
});
