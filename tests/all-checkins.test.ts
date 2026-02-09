import { describe, expect, mock, test } from "bun:test";
import type { MedicationStatus, SleepQuality } from "@prisma/client";

const mockFindUserByTelegramId = mock(() => Promise.resolve(null));
const mockFindAllCheckinsByUserId = mock(() => Promise.resolve([]));

mock.module("../src/repositories/checkin.repository", () => ({
	findUserByTelegramId: mockFindUserByTelegramId,
	findAllCheckinsByUserId: mockFindAllCheckinsByUserId,
	findCheckinsByUserIdAndDateRange: mock(() => Promise.resolve([])),
	findCheckinsByUserIdPaginated: mock(() => Promise.resolve([])),
	findCheckinByUserIdAndLocalDate: mock(() => Promise.resolve(null)),
}));

const { getAllCheckins } = await import("../src/services/stats.service");

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

const fakeUser = {
	id: "user-1",
	telegramId: BigInt(12345),
	timezone: "UTC",
	reminderEnabled: false,
	reminderTime: null,
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("getAllCheckins", () => {
	test("returns null when user not found", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(null);
		const result = await getAllCheckins(12345);
		expect(result).toBeNull();
	});

	test("returns empty array when user has no checkins", async () => {
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindAllCheckinsByUserId.mockResolvedValueOnce([]);
		const result = await getAllCheckins(12345);
		expect(result).toEqual([]);
	});

	test("returns all checkins in order", async () => {
		const checkins = [
			makeCheckin("2026-01-01", { mood: -2 }),
			makeCheckin("2026-01-15", { mood: 0 }),
			makeCheckin("2026-02-01", { mood: 1 }),
		];
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindAllCheckinsByUserId.mockResolvedValueOnce(checkins);

		const result = await getAllCheckins(12345);
		expect(result).toHaveLength(3);
		expect(result?.at(0)?.localDate).toBe("2026-01-01");
		expect(result?.at(1)?.localDate).toBe("2026-01-15");
		expect(result?.at(2)?.localDate).toBe("2026-02-01");
	});

	test("returns large dataset from paginated fetch", async () => {
		const checkins = Array.from({ length: 600 }, (_, i) => {
			const day = String((i % 28) + 1).padStart(2, "0");
			const month = String(Math.floor(i / 28) + 1).padStart(2, "0");
			return makeCheckin(`2025-${month}-${day}`, { mood: (i % 7) - 3 });
		});
		mockFindUserByTelegramId.mockResolvedValueOnce(fakeUser);
		mockFindAllCheckinsByUserId.mockResolvedValueOnce(checkins);

		const result = await getAllCheckins(12345);
		expect(result).toHaveLength(600);
	});
});
