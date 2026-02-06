import { describe, expect, test } from "bun:test";
import { calculateTrend } from "../src/services/stats.service";

function makeCheckin(localDate: string, mood: number) {
	return { localDate, mood };
}

describe("calculateTrend", () => {
	describe("week mode", () => {
		const weekDates = [
			"2026-02-02",
			"2026-02-03",
			"2026-02-04",
			"2026-02-05",
			"2026-02-06",
			"2026-02-07",
			"2026-02-08",
		];

		test("returns insufficient_data when fewer than 3 checkins", () => {
			const checkins = [
				makeCheckin("2026-02-02", 0),
				makeCheckin("2026-02-07", 2),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe(
				"insufficient_data",
			);
		});

		test("returns stable when mood difference < 0.3", () => {
			const checkins = [
				makeCheckin("2026-02-02", 0),
				makeCheckin("2026-02-03", 0),
				makeCheckin("2026-02-04", 0),
				makeCheckin("2026-02-06", 0),
				makeCheckin("2026-02-07", 0.2),
				makeCheckin("2026-02-08", 0),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe("stable");
		});

		test("returns rising when mood increases", () => {
			const checkins = [
				makeCheckin("2026-02-02", -1),
				makeCheckin("2026-02-03", -1),
				makeCheckin("2026-02-04", -1),
				makeCheckin("2026-02-06", 1),
				makeCheckin("2026-02-07", 1),
				makeCheckin("2026-02-08", 1),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe("rising");
		});

		test("returns falling when mood decreases", () => {
			const checkins = [
				makeCheckin("2026-02-02", 2),
				makeCheckin("2026-02-03", 2),
				makeCheckin("2026-02-04", 2),
				makeCheckin("2026-02-06", -1),
				makeCheckin("2026-02-07", -1),
				makeCheckin("2026-02-08", -1),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe("falling");
		});

		test("returns insufficient_data when one window has no data", () => {
			const checkins = [
				makeCheckin("2026-02-02", 1),
				makeCheckin("2026-02-03", 1),
				makeCheckin("2026-02-04", 1),
			];
			// Window B (days 4-6) has no data
			expect(calculateTrend(checkins, weekDates, "week")).toBe(
				"insufficient_data",
			);
		});

		test("boundary: exactly 0.3 diff is rising (threshold is strict <)", () => {
			// Window A avg = 0, Window B avg = 0.3 → |diff| = 0.3, not < 0.3
			const checkins = [
				makeCheckin("2026-02-02", 0),
				makeCheckin("2026-02-03", 0),
				makeCheckin("2026-02-04", 0),
				makeCheckin("2026-02-06", 0.3),
				makeCheckin("2026-02-07", 0.3),
				makeCheckin("2026-02-08", 0.3),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe("rising");
		});

		test("boundary: just under 0.3 diff is stable", () => {
			const checkins = [
				makeCheckin("2026-02-02", 0),
				makeCheckin("2026-02-03", 0),
				makeCheckin("2026-02-04", 0),
				makeCheckin("2026-02-06", 0.29),
				makeCheckin("2026-02-07", 0.29),
				makeCheckin("2026-02-08", 0.29),
			];
			expect(calculateTrend(checkins, weekDates, "week")).toBe("stable");
		});
	});

	describe("month mode", () => {
		test("returns insufficient_data with empty input", () => {
			expect(calculateTrend([], [], "month")).toBe("insufficient_data");
		});

		test("compares last 7 vs previous 7 days for month", () => {
			const dates: string[] = [];
			for (let d = 1; d <= 28; d++) {
				dates.push(`2026-02-${String(d).padStart(2, "0")}`);
			}

			// Previous 7 days (Feb 15-21) mood avg = -1
			// Last 7 days (Feb 22-28) mood avg = 2
			const checkins = [
				makeCheckin("2026-02-15", -1),
				makeCheckin("2026-02-16", -1),
				makeCheckin("2026-02-17", -1),
				makeCheckin("2026-02-22", 2),
				makeCheckin("2026-02-23", 2),
				makeCheckin("2026-02-24", 2),
			];

			expect(calculateTrend(checkins, dates, "month")).toBe("rising");
		});

		test("returns falling when recent mood drops", () => {
			const dates: string[] = [];
			for (let d = 1; d <= 28; d++) {
				dates.push(`2026-02-${String(d).padStart(2, "0")}`);
			}

			const checkins = [
				makeCheckin("2026-02-15", 2),
				makeCheckin("2026-02-16", 2),
				makeCheckin("2026-02-17", 2),
				makeCheckin("2026-02-22", -2),
				makeCheckin("2026-02-23", -2),
				makeCheckin("2026-02-24", -2),
			];

			expect(calculateTrend(checkins, dates, "month")).toBe("falling");
		});
	});
});
