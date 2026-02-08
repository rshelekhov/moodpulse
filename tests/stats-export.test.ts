import { describe, expect, test } from "bun:test";
import * as XLSX from "xlsx";
import type { PeriodStats } from "../src/services/stats.service";
import {
	generateCsvBuffer,
	generateXlsxBuffer,
} from "../src/services/stats-export.service";

function makeCheckin(
	overrides: Partial<{
		localDate: string;
		mood: number;
		energy: number;
		sleepDuration: number;
		sleepQuality: string;
		anxiety: number;
		irritability: number;
		medicationTaken: string;
		note: string | null;
	}> = {},
) {
	return {
		localDate: "2026-02-01",
		mood: 1,
		energy: 3,
		sleepDuration: 7.5,
		sleepQuality: "GOOD",
		anxiety: 1,
		irritability: 0,
		medicationTaken: "TAKEN",
		note: null,
		...overrides,
	};
}

const sampleStats: PeriodStats = {
	records: 3,
	totalDays: 7,
	avgMood: 0.7,
	avgEnergy: 3.3,
	avgSleep: 7.2,
	avgAnxiety: 1.0,
	avgIrritability: 0.3,
	trend: "stable",
	checkinDates: new Set(["2026-02-01", "2026-02-02", "2026-02-03"]),
};

describe("generateCsvBuffer", () => {
	test("produces valid CSV with correct headers", () => {
		const checkins = [
			makeCheckin({ localDate: "2026-02-01", mood: -2 }),
			makeCheckin({ localDate: "2026-02-02", mood: 1 }),
		];

		const buf = generateCsvBuffer(checkins, sampleStats, "ru");
		const csv = buf.toString("utf-8");
		const lines = csv.split("\n");

		const header = lines[0];
		expect(header).toContain("date");
		expect(header).toContain("mood_raw");
		expect(header).toContain("mood_label");
		expect(header).toContain("energy_raw");
		expect(header).toContain("energy_label");
		expect(header).toContain("sleep_duration");
		expect(header).toContain("sleep_quality_raw");
		expect(header).toContain("sleep_quality_label");
		expect(header).toContain("anxiety_raw");
		expect(header).toContain("anxiety_label");
		expect(header).toContain("irritability_raw");
		expect(header).toContain("irritability_label");
		expect(header).toContain("medication_raw");
		expect(header).toContain("medication_label");
		expect(header).toContain("note");

		// header + 2 data rows
		expect(lines.length).toBeGreaterThanOrEqual(3);
	});

	test("uses localized labels for ru", () => {
		const checkins = [makeCheckin({ mood: -3, medicationTaken: "TAKEN" })];
		const buf = generateCsvBuffer(checkins, null, "ru");
		const csv = buf.toString("utf-8");

		expect(csv).toContain("депрессия");
		expect(csv).toContain("принял");
	});

	test("uses localized labels for en", () => {
		const checkins = [makeCheckin({ mood: -3, medicationTaken: "TAKEN" })];
		const buf = generateCsvBuffer(checkins, null, "en");
		const csv = buf.toString("utf-8");

		expect(csv).toContain("depression");
		expect(csv).toContain("taken");
	});
});

describe("generateXlsxBuffer", () => {
	test("produces workbook with Summary and Checkins sheets", () => {
		const checkins = [
			makeCheckin({ localDate: "2026-02-01" }),
			makeCheckin({ localDate: "2026-02-02" }),
		];

		const buf = generateXlsxBuffer(checkins, sampleStats, "ru");
		const wb = XLSX.read(buf, { type: "buffer" });

		expect(wb.SheetNames).toContain("Summary");
		expect(wb.SheetNames).toContain("Checkins");
	});

	test("Summary sheet has correct stats", () => {
		const checkins = [makeCheckin()];
		const buf = generateXlsxBuffer(checkins, sampleStats, "ru");
		const wb = XLSX.read(buf, { type: "buffer" });

		const summarySheet = wb.Sheets.Summary;
		expect(summarySheet).toBeDefined();
		const summary = XLSX.utils.sheet_to_json<{
			key: string;
			value: string | number;
		}>(summarySheet as XLSX.WorkSheet);

		const recordsRow = summary.find((r) => r.key === "records");
		expect(recordsRow?.value).toBe(3);

		const avgMoodRow = summary.find((r) => r.key === "avgMood");
		expect(avgMoodRow?.value).toBe(0.7);
	});

	test("Checkins sheet has correct row count", () => {
		const checkins = [
			makeCheckin({ localDate: "2026-02-01" }),
			makeCheckin({ localDate: "2026-02-02" }),
			makeCheckin({ localDate: "2026-02-03" }),
		];

		const buf = generateXlsxBuffer(checkins, sampleStats, "en");
		const wb = XLSX.read(buf, { type: "buffer" });

		const checkinsSheet = wb.Sheets.Checkins;
		expect(checkinsSheet).toBeDefined();
		const rows = XLSX.utils.sheet_to_json(checkinsSheet as XLSX.WorkSheet);
		expect(rows.length).toBe(3);
	});

	test("produces workbook without Summary when stats is null", () => {
		const checkins = [makeCheckin()];
		const buf = generateXlsxBuffer(checkins, null, "ru");
		const wb = XLSX.read(buf, { type: "buffer" });

		expect(wb.SheetNames).not.toContain("Summary");
		expect(wb.SheetNames).toContain("Checkins");
	});
});
