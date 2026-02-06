import { describe, expect, test } from "bun:test";
import {
	parseAnxietyValue,
	parseEnergyValue,
	parseIrritabilityValue,
	parseMedicationValue,
	parseMoodValue,
	parseSleepDurationValue,
	parseSleepQualityValue,
} from "../src/bot/conversations/checkin.validation";

describe("checkin validation", () => {
	test("parses mood values", () => {
		expect(parseMoodValue("-3")).toBe(-3);
		expect(parseMoodValue("0")).toBe(0);
		expect(parseMoodValue("3")).toBe(3);
	});

	test("rejects invalid mood values", () => {
		expect(parseMoodValue("4")).toBeNull();
		expect(parseMoodValue("-4")).toBeNull();
		expect(parseMoodValue("nope")).toBeNull();
	});

	test("parses energy values", () => {
		expect(parseEnergyValue("1")).toBe(1);
		expect(parseEnergyValue("5")).toBe(5);
	});

	test("parses anxiety and irritability values", () => {
		expect(parseAnxietyValue("0")).toBe(0);
		expect(parseAnxietyValue("3")).toBe(3);
		expect(parseIrritabilityValue("1")).toBe(1);
		expect(parseIrritabilityValue("3")).toBe(3);
	});

	test("parses sleep duration keys", () => {
		expect(parseSleepDurationValue("lt4")).toBe(3.5);
		expect(parseSleepDurationValue("7_8")).toBe(7.5);
		expect(parseSleepDurationValue("gt9")).toBe(9.5);
	});

	test("rejects invalid sleep duration keys", () => {
		expect(parseSleepDurationValue("9_10")).toBeNull();
		expect(parseSleepDurationValue("")).toBeNull();
	});

	test("parses sleep quality and medication enums", () => {
		expect(parseSleepQualityValue("POOR")).toBe("POOR");
		expect(parseSleepQualityValue("GOOD")).toBe("GOOD");
		expect(parseMedicationValue("TAKEN")).toBe("TAKEN");
		expect(parseMedicationValue("NOT_APPLICABLE")).toBe("NOT_APPLICABLE");
	});

	test("rejects invalid enums", () => {
		expect(parseSleepQualityValue("BAD")).toBeNull();
		expect(parseMedicationValue("YES")).toBeNull();
	});
});
