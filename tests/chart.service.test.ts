import { describe, expect, test } from "bun:test";
import {
	renderAnxietyIrritabilityChart,
	renderMedicationChart,
	renderMoodEnergyChart,
	renderSleepChart,
} from "../src/services/chart.service";
import type { ChartSeries } from "../src/services/chart-data.service";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const mockSeries: ChartSeries = {
	labels: [
		"2026-02-03",
		"2026-02-04",
		"2026-02-05",
		"2026-02-06",
		"2026-02-07",
		"2026-02-08",
		"2026-02-09",
	],
	mood: [0, 1, -1, 2, null, 0, 1],
	energy: [3, 4, 2, 5, null, 3, 4],
	sleepHours: [7, 6.5, 8, 5, null, 7.5, 6],
	sleepQuality: ["GOOD", "FAIR", "GOOD", "POOR", null, "GOOD", "FAIR"],
	anxiety: [1, 0, 2, 1, null, 0, 1],
	irritability: [0, 1, 0, 2, null, 1, 0],
	medication: [
		"TAKEN",
		"TAKEN",
		"SKIPPED",
		"TAKEN",
		null,
		"NOT_APPLICABLE",
		"TAKEN",
	],
};

describe("chart rendering", () => {
	test("renderMoodEnergyChart returns a PNG buffer", async () => {
		const buf = await renderMoodEnergyChart(mockSeries, "ru");
		expect(buf.length).toBeGreaterThan(0);
		expect(buf.subarray(0, 4)).toEqual(PNG_SIGNATURE);
	});

	test("renderSleepChart returns a PNG buffer", async () => {
		const buf = await renderSleepChart(mockSeries, "ru");
		expect(buf.length).toBeGreaterThan(0);
		expect(buf.subarray(0, 4)).toEqual(PNG_SIGNATURE);
	});

	test("renderAnxietyIrritabilityChart returns a PNG buffer", async () => {
		const buf = await renderAnxietyIrritabilityChart(mockSeries, "ru");
		expect(buf.length).toBeGreaterThan(0);
		expect(buf.subarray(0, 4)).toEqual(PNG_SIGNATURE);
	});

	test("renderMedicationChart returns a PNG buffer", async () => {
		const buf = await renderMedicationChart(mockSeries, "en");
		expect(buf.length).toBeGreaterThan(0);
		expect(buf.subarray(0, 4)).toEqual(PNG_SIGNATURE);
	});
});
