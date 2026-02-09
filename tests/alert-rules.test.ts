import { describe, expect, test } from "bun:test";
import type { Checkin } from "@prisma/client";
import { evaluateIrritabilityEnergy } from "../src/services/alerts/rules/irritability-energy";
import { evaluateMissedMeds } from "../src/services/alerts/rules/missed-meds";
import { evaluateMoodDowntrend } from "../src/services/alerts/rules/mood-downtrend";
import { evaluateMoodSwing } from "../src/services/alerts/rules/mood-swing";
import { evaluateSleepEnergy } from "../src/services/alerts/rules/sleep-energy";
import type { RuleInput } from "../src/services/alerts/rules/types";

function makeCheckin(
	localDate: string,
	overrides: Partial<{
		mood: number;
		energy: number;
		sleepDuration: number;
		anxiety: number;
		irritability: number;
		medicationTaken: "TAKEN" | "SKIPPED" | "NOT_APPLICABLE";
	}> = {},
): Checkin {
	return {
		id: `test-${localDate}`,
		userId: "user-1",
		mood: overrides.mood ?? 0,
		energy: overrides.energy ?? 3,
		sleepDuration: overrides.sleepDuration ?? 7,
		sleepQuality: "GOOD",
		anxiety: overrides.anxiety ?? 0,
		irritability: overrides.irritability ?? 0,
		medicationTaken: overrides.medicationTaken ?? "TAKEN",
		note: null,
		createdAt: new Date(),
		localDate,
	};
}

function makeInput(
	checkins: Checkin[],
	sensitivity: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM",
	takingMedications = true,
): RuleInput {
	return { checkins, sensitivity, takingMedications };
}

describe("evaluateSleepEnergy", () => {
	test("matches at HIGH sensitivity (2 days)", () => {
		const checkins = [
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		];
		const result = evaluateSleepEnergy(makeInput(checkins, "HIGH"));
		expect(result).not.toBeNull();
		expect(result?.ruleId).toBe("sleep_energy");
		expect(result?.details.days).toBe(2);
	});

	test("matches at MEDIUM sensitivity (3 days)", () => {
		const checkins = [
			makeCheckin("2026-02-06", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-07", { sleepDuration: 5, energy: 4 }),
			makeCheckin("2026-02-08", { sleepDuration: 3, energy: 5 }),
		];
		const result = evaluateSleepEnergy(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
		expect(result?.details.days).toBe(3);
	});

	test("matches at LOW sensitivity (4 days)", () => {
		const checkins = [
			makeCheckin("2026-02-05", { sleepDuration: 5, energy: 4 }),
			makeCheckin("2026-02-06", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-07", { sleepDuration: 5, energy: 4 }),
			makeCheckin("2026-02-08", { sleepDuration: 3, energy: 5 }),
		];
		const result = evaluateSleepEnergy(makeInput(checkins, "LOW"));
		expect(result).not.toBeNull();
		expect(result?.details.days).toBe(4);
	});

	test("no match when sleep >= 6", () => {
		const checkins = [
			makeCheckin("2026-02-07", { sleepDuration: 6, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		];
		expect(evaluateSleepEnergy(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("no match when energy < 4", () => {
		const checkins = [
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 3 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		];
		expect(evaluateSleepEnergy(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("no match with insufficient data", () => {
		const checkins = [
			makeCheckin("2026-02-08", { sleepDuration: 4, energy: 5 }),
		];
		expect(evaluateSleepEnergy(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("HIGH triggers but LOW does not for 2 days", () => {
		const checkins = [
			makeCheckin("2026-02-07", { sleepDuration: 4, energy: 5 }),
			makeCheckin("2026-02-08", { sleepDuration: 5, energy: 4 }),
		];
		expect(evaluateSleepEnergy(makeInput(checkins, "HIGH"))).not.toBeNull();
		expect(evaluateSleepEnergy(makeInput(checkins, "LOW"))).toBeNull();
	});
});

describe("evaluateMissedMeds", () => {
	test("matches at HIGH sensitivity (2 skips)", () => {
		const checkins = [
			makeCheckin("2026-02-05", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-06", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-07", { medicationTaken: "TAKEN" }),
		];
		const result = evaluateMissedMeds(makeInput(checkins, "HIGH"));
		expect(result).not.toBeNull();
		expect(result?.details.count).toBe(2);
	});

	test("matches at MEDIUM sensitivity (3 skips)", () => {
		const checkins = [
			makeCheckin("2026-02-05", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-06", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-07", { medicationTaken: "SKIPPED" }),
		];
		const result = evaluateMissedMeds(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
	});

	test("no match when takingMedications is false", () => {
		const checkins = [
			makeCheckin("2026-02-05", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-06", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-07", { medicationTaken: "SKIPPED" }),
		];
		expect(evaluateMissedMeds(makeInput(checkins, "HIGH", false))).toBeNull();
	});

	test("no match when skips below threshold", () => {
		const checkins = [
			makeCheckin("2026-02-07", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-08", { medicationTaken: "TAKEN" }),
		];
		expect(evaluateMissedMeds(makeInput(checkins, "MEDIUM"))).toBeNull();
	});

	test("HIGH triggers but LOW does not for 2 skips", () => {
		const checkins = [
			makeCheckin("2026-02-07", { medicationTaken: "SKIPPED" }),
			makeCheckin("2026-02-08", { medicationTaken: "SKIPPED" }),
		];
		expect(evaluateMissedMeds(makeInput(checkins, "HIGH"))).not.toBeNull();
		expect(evaluateMissedMeds(makeInput(checkins, "LOW"))).toBeNull();
	});
});

describe("evaluateMoodSwing", () => {
	test("matches at HIGH sensitivity (2-point diff)", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: -1 }),
			makeCheckin("2026-02-08", { mood: 1 }),
		];
		const result = evaluateMoodSwing(makeInput(checkins, "HIGH"));
		expect(result).not.toBeNull();
		expect(result?.details.diff).toBe(2);
		expect(result?.details.fromMood).toBe(-1);
		expect(result?.details.toMood).toBe(1);
	});

	test("matches at MEDIUM sensitivity (3-point diff)", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: -2 }),
			makeCheckin("2026-02-08", { mood: 1 }),
		];
		const result = evaluateMoodSwing(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
		expect(result?.details.diff).toBe(3);
	});

	test("no match when diff below threshold", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: 0 }),
			makeCheckin("2026-02-08", { mood: 1 }),
		];
		expect(evaluateMoodSwing(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("no match with only 1 checkin", () => {
		const checkins = [makeCheckin("2026-02-08", { mood: 3 })];
		expect(evaluateMoodSwing(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("detects downward swing too", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: 2 }),
			makeCheckin("2026-02-08", { mood: -1 }),
		];
		const result = evaluateMoodSwing(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
		expect(result?.details.diff).toBe(3);
	});
});

describe("evaluateMoodDowntrend", () => {
	test("matches at HIGH sensitivity (2 consecutive declining)", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: 1 }),
			makeCheckin("2026-02-08", { mood: -1 }),
		];
		const result = evaluateMoodDowntrend(makeInput(checkins, "HIGH"));
		expect(result).not.toBeNull();
		expect(result?.details.days).toBe(2);
		expect(result?.details.fromMood).toBe(1);
		expect(result?.details.toMood).toBe(-1);
	});

	test("matches at MEDIUM sensitivity (3 consecutive declining)", () => {
		const checkins = [
			makeCheckin("2026-02-06", { mood: 2 }),
			makeCheckin("2026-02-07", { mood: 1 }),
			makeCheckin("2026-02-08", { mood: -1 }),
		];
		const result = evaluateMoodDowntrend(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
		expect(result?.details.days).toBe(3);
	});

	test("no match when mood increases at any point", () => {
		const checkins = [
			makeCheckin("2026-02-06", { mood: 2 }),
			makeCheckin("2026-02-07", { mood: 3 }),
			makeCheckin("2026-02-08", { mood: 1 }),
		];
		expect(evaluateMoodDowntrend(makeInput(checkins, "MEDIUM"))).toBeNull();
	});

	test("no match when mood stays the same", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: 1 }),
			makeCheckin("2026-02-08", { mood: 1 }),
		];
		expect(evaluateMoodDowntrend(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("no match with insufficient data", () => {
		const checkins = [makeCheckin("2026-02-08", { mood: -2 })];
		expect(evaluateMoodDowntrend(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("HIGH triggers but LOW does not for 2 days", () => {
		const checkins = [
			makeCheckin("2026-02-07", { mood: 1 }),
			makeCheckin("2026-02-08", { mood: -1 }),
		];
		expect(evaluateMoodDowntrend(makeInput(checkins, "HIGH"))).not.toBeNull();
		expect(evaluateMoodDowntrend(makeInput(checkins, "LOW"))).toBeNull();
	});
});

describe("evaluateIrritabilityEnergy", () => {
	test("matches at HIGH sensitivity (2 days)", () => {
		const checkins = [
			makeCheckin("2026-02-07", { irritability: 2, energy: 4 }),
			makeCheckin("2026-02-08", { irritability: 3, energy: 5 }),
		];
		const result = evaluateIrritabilityEnergy(makeInput(checkins, "HIGH"));
		expect(result).not.toBeNull();
		expect(result?.ruleId).toBe("irritability_energy");
		expect(result?.details.days).toBe(2);
	});

	test("matches at MEDIUM sensitivity (3 days)", () => {
		const checkins = [
			makeCheckin("2026-02-06", { irritability: 2, energy: 4 }),
			makeCheckin("2026-02-07", { irritability: 3, energy: 5 }),
			makeCheckin("2026-02-08", { irritability: 2, energy: 4 }),
		];
		const result = evaluateIrritabilityEnergy(makeInput(checkins, "MEDIUM"));
		expect(result).not.toBeNull();
	});

	test("no match when irritability < 2", () => {
		const checkins = [
			makeCheckin("2026-02-07", { irritability: 1, energy: 5 }),
			makeCheckin("2026-02-08", { irritability: 2, energy: 4 }),
		];
		expect(evaluateIrritabilityEnergy(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("no match when energy < 4", () => {
		const checkins = [
			makeCheckin("2026-02-07", { irritability: 3, energy: 3 }),
			makeCheckin("2026-02-08", { irritability: 2, energy: 4 }),
		];
		expect(evaluateIrritabilityEnergy(makeInput(checkins, "HIGH"))).toBeNull();
	});

	test("HIGH triggers but LOW does not for 2 days", () => {
		const checkins = [
			makeCheckin("2026-02-07", { irritability: 2, energy: 4 }),
			makeCheckin("2026-02-08", { irritability: 3, energy: 5 }),
		];
		expect(
			evaluateIrritabilityEnergy(makeInput(checkins, "HIGH")),
		).not.toBeNull();
		expect(evaluateIrritabilityEnergy(makeInput(checkins, "LOW"))).toBeNull();
	});
});
