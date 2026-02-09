import { beforeEach, describe, expect, mock, test } from "bun:test";

// biome-ignore lint/suspicious/noExplicitAny: mocks need flexible return types
const mockFindUserAlertSettings = mock(
	(): Promise<any> => Promise.resolve(null),
);
// biome-ignore lint/suspicious/noExplicitAny: mocks need flexible return types
const mockFindAlertState = mock((): Promise<any> => Promise.resolve(null));
// biome-ignore lint/suspicious/noExplicitAny: mocks need flexible return types
const mockUpsertAlertCooldown = mock((): Promise<any> => Promise.resolve(null));
// biome-ignore lint/suspicious/noExplicitAny: mocks need flexible return types
const mockFindCheckinsByUserIdAndDateRange = mock(
	(): Promise<any> => Promise.resolve([]),
);

mock.module("../src/repositories/alert.repository", () => ({
	findUserAlertSettings: mockFindUserAlertSettings,
	findAlertState: mockFindAlertState,
	upsertAlertCooldown: mockUpsertAlertCooldown,
}));

mock.module("../src/repositories/checkin.repository", () => ({
	findCheckinsByUserIdAndDateRange: mockFindCheckinsByUserIdAndDateRange,
}));

import { analyzeAfterCheckin } from "../src/services/alerts/analysis.service";

function makeUser(overrides: Record<string, unknown> = {}) {
	return {
		id: "user-1",
		alertsEnabled: true,
		alertsSensitivity: "MEDIUM" as const,
		alertsSnoozeUntil: null,
		timezone: "UTC",
		takingMedications: true,
		...overrides,
	};
}

function makeCheckin(
	localDate: string,
	overrides: Record<string, unknown> = {},
) {
	return {
		id: `checkin-${localDate}`,
		userId: "user-1",
		mood: 0,
		energy: 3,
		sleepDuration: 7,
		sleepQuality: "GOOD",
		anxiety: 0,
		irritability: 0,
		medicationTaken: "TAKEN",
		note: null,
		createdAt: new Date(),
		localDate,
		...overrides,
	};
}

beforeEach(() => {
	mockFindUserAlertSettings.mockReset();
	mockFindAlertState.mockReset();
	mockUpsertAlertCooldown.mockReset();
	mockFindCheckinsByUserIdAndDateRange.mockReset();

	mockFindUserAlertSettings.mockResolvedValue(null);
	mockFindAlertState.mockResolvedValue(null);
	mockUpsertAlertCooldown.mockResolvedValue(null);
	mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([]);
});

describe("analyzeAfterCheckin", () => {
	test("returns empty when user not found", async () => {
		const result = await analyzeAfterCheckin(12345, "ru");
		expect(result).toEqual([]);
	});

	test("returns empty when alerts disabled", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsEnabled: false }),
		);
		const result = await analyzeAfterCheckin(12345, "ru");
		expect(result).toEqual([]);
	});

	test("returns empty when snoozed", async () => {
		const futureDate = new Date(Date.now() + 86400000);
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSnoozeUntil: futureDate }),
		);
		const result = await analyzeAfterCheckin(12345, "ru");
		expect(result).toEqual([]);
	});

	test("returns empty when no checkins", async () => {
		mockFindUserAlertSettings.mockResolvedValue(makeUser());
		const result = await analyzeAfterCheckin(12345, "ru");
		expect(result).toEqual([]);
	});

	test("triggers sleep_energy alert", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSensitivity: "HIGH" }),
		);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		]);

		const result = await analyzeAfterCheckin(
			12345,
			"ru",
			new Date("2026-02-08T12:00:00Z"),
		);
		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result.some((a) => a.ruleId === "sleep_energy")).toBe(true);
	});

	test("cooldown prevents duplicate alerts", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSensitivity: "HIGH" }),
		);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		]);

		const futureDate = new Date(Date.now() + 86400000 * 7);
		mockFindAlertState.mockResolvedValue({
			id: "state-1",
			userId: "user-1",
			ruleId: "sleep_energy",
			lastSentAt: new Date(),
			cooldownUntil: futureDate,
		});

		const result = await analyzeAfterCheckin(
			12345,
			"ru",
			new Date("2026-02-08T12:00:00Z"),
		);
		expect(result.some((a) => a.ruleId === "sleep_energy")).toBe(false);
	});

	test("multiple rules can trigger at once", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSensitivity: "HIGH" }),
		);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([
			makeCheckin("2026-02-07", {
				sleepDuration: 4,
				energy: 5,
				irritability: 3,
				mood: 2,
			}),
			makeCheckin("2026-02-08", {
				sleepDuration: 5,
				energy: 4,
				irritability: 2,
				mood: -1,
			}),
		]);

		const result = await analyzeAfterCheckin(
			12345,
			"ru",
			new Date("2026-02-08T12:00:00Z"),
		);

		const ruleIds = result.map((a) => a.ruleId);
		expect(ruleIds).toContain("sleep_energy");
		expect(ruleIds).toContain("irritability_energy");
		expect(ruleIds).toContain("mood_swing");
	});

	test("uses correct locale for alert text", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSensitivity: "HIGH" }),
		);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		]);

		const resultRu = await analyzeAfterCheckin(
			12345,
			"ru",
			new Date("2026-02-08T12:00:00Z"),
		);
		const resultEn = await analyzeAfterCheckin(
			12345,
			"en",
			new Date("2026-02-08T12:00:00Z"),
		);

		const sleepAlertRu = resultRu.find((a) => a.ruleId === "sleep_energy");
		const sleepAlertEn = resultEn.find((a) => a.ruleId === "sleep_energy");
		expect(sleepAlertRu).toBeDefined();
		expect(sleepAlertEn).toBeDefined();
		expect(sleepAlertRu?.text).not.toBe(sleepAlertEn?.text);
	});

	test("alert text includes disclaimer", async () => {
		mockFindUserAlertSettings.mockResolvedValue(
			makeUser({ alertsSensitivity: "HIGH" }),
		);
		mockFindCheckinsByUserIdAndDateRange.mockResolvedValue([
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		]);

		const result = await analyzeAfterCheckin(
			12345,
			"ru",
			new Date("2026-02-08T12:00:00Z"),
		);
		const alert = result.find((a) => a.ruleId === "sleep_energy");
		expect(alert?.text).toContain("наблюдение");
	});
});
