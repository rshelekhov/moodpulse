import { describe, expect, mock, test } from "bun:test";
import type {
	Checkin,
	MedicationStatus,
	SleepQuality,
	User,
} from "@prisma/client";

const mockFindUserByTelegramId = mock(() =>
	Promise.resolve(null as User | null),
);
const mockFindCheckinsByUserIdAndDateRange = mock(() =>
	Promise.resolve([] as Checkin[]),
);
const mockFindCheckinsByUserIdPaginated = mock(() =>
	Promise.resolve([] as Checkin[]),
);

mock.module("../src/repositories/checkin.repository", () => ({
	findUserByTelegramId: mockFindUserByTelegramId,
	findCheckinsByUserIdAndDateRange: mockFindCheckinsByUserIdAndDateRange,
	findCheckinsByUserIdPaginated: mockFindCheckinsByUserIdPaginated,
}));

const { buildWeekSeries, buildMonthSeries, buildLast7CheckinsSeries } =
	await import("../src/services/chart-data.service");

function makeCheckin(
	localDate: string,
	overrides: Partial<{
		mood: number;
		energy: number;
		sleepDuration: number;
		sleepQuality: SleepQuality;
		anxiety: number;
		irritability: number;
		medicationTaken: MedicationStatus;
	}> = {},
) {
	return {
		id: `id-${localDate}`,
		userId: "user-1",
		localDate,
		mood: overrides.mood ?? 0,
		energy: overrides.energy ?? 3,
		sleepDuration: overrides.sleepDuration ?? 7,
		sleepQuality: overrides.sleepQuality ?? ("GOOD" as SleepQuality),
		anxiety: overrides.anxiety ?? 1,
		irritability: overrides.irritability ?? 0,
		medicationTaken: overrides.medicationTaken ?? ("TAKEN" as MedicationStatus),
		note: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

const fakeUser: User = {
	id: "user-1",
	telegramId: BigInt(12345),
	username: null,
	firstName: null,
	lastName: null,
	languageCode: null,
	timezone: "UTC",
	timezoneSetByUser: false,
	reminderEnabled: false,
	reminderTime: "21:00",
	reminderNextAt: null,
	reminderLastSentLocalDate: null,
	reminderSnoozeUntil: null,
	reminderSkipLocalDate: null,
	alertsEnabled: true,
	alertsSensitivity: "MEDIUM",
	alertsSnoozeUntil: null,
	takingMedications: false,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("buildWeekSeries", () => {
	test("returns null when user not found", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(null);
		const result = await buildWeekSeries(12345, "UTC");
		expect(result).toBeNull();
	});

	test("returns 7 labels with nulls for missing days", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValueOnce([
			makeCheckin("2026-02-09", { mood: 2, energy: 4 }),
		]);

		const result = await buildWeekSeries(12345, "UTC");
		expect(result).not.toBeNull();
		expect(result?.labels).toHaveLength(7);

		const nonNullMoods = result?.mood.filter((v) => v !== null);
		expect(nonNullMoods).toHaveLength(1);
		expect(nonNullMoods?.at(0)).toBe(2);
	});
});

describe("buildMonthSeries", () => {
	test("returns null when user not found", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(null);
		const result = await buildMonthSeries(12345, "UTC");
		expect(result).toBeNull();
	});

	test("returns correct label count for the month", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValueOnce([]);

		const result = await buildMonthSeries(12345, "UTC");
		expect(result).not.toBeNull();
		expect(result?.labels.length).toBeGreaterThanOrEqual(28);
		expect(result?.labels.length).toBeLessThanOrEqual(31);
	});
});

describe("buildLast7CheckinsSeries", () => {
	test("returns null when user not found", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(null);
		const result = await buildLast7CheckinsSeries(12345);
		expect(result).toBeNull();
	});

	test("returns null when no checkins", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindCheckinsByUserIdPaginated.mockResolvedValueOnce([]);

		const result = await buildLast7CheckinsSeries(12345);
		expect(result).toBeNull();
	});

	test("returns sorted series without null gaps", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		const checkins = [
			makeCheckin("2026-02-08", { mood: -1 }),
			makeCheckin("2026-02-07", { mood: 1 }),
			makeCheckin("2026-02-06", { mood: 2 }),
		];
		mockFindCheckinsByUserIdPaginated.mockResolvedValueOnce(checkins);

		const result = await buildLast7CheckinsSeries(12345);
		expect(result).not.toBeNull();
		expect(result?.labels).toEqual(["2026-02-06", "2026-02-07", "2026-02-08"]);
		expect(result?.mood).toEqual([2, 1, -1]);
		expect(result?.mood.every((v) => v !== null)).toBe(true);
	});
});
