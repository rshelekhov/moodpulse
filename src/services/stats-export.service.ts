import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Locale } from "../lib/i18n";
import { t } from "../lib/i18n";
import type { PeriodStats } from "./stats.service";

type CheckinRow = {
	localDate: string;
	mood: number;
	energy: number;
	sleepDuration: number;
	sleepQuality: string;
	anxiety: number;
	irritability: number;
	medicationTaken: string;
	note: string | null;
};

function moodLabel(value: number, locale: Locale): string {
	return t("checkin_display_mood", locale, { value });
}

function energyLabel(value: number, locale: Locale): string {
	return t("checkin_display_energy", locale, { value });
}

function sleepQualityLabel(value: string, locale: Locale): string {
	return t("checkin_display_sleep_quality", locale, { value });
}

function anxietyLabel(value: number, locale: Locale): string {
	return t("checkin_display_anxiety", locale, { value });
}

function irritabilityLabel(value: number, locale: Locale): string {
	return t("checkin_display_irritability", locale, { value });
}

function medicationLabel(value: string, locale: Locale): string {
	return t("checkin_display_medication", locale, { value });
}

function checkinToFlatRow(c: CheckinRow, locale: Locale) {
	return {
		date: c.localDate,
		mood_raw: c.mood,
		mood_label: moodLabel(c.mood, locale),
		energy_raw: c.energy,
		energy_label: energyLabel(c.energy, locale),
		sleep_duration: c.sleepDuration,
		sleep_quality_raw: c.sleepQuality,
		sleep_quality_label: sleepQualityLabel(c.sleepQuality, locale),
		anxiety_raw: c.anxiety,
		anxiety_label: anxietyLabel(c.anxiety, locale),
		irritability_raw: c.irritability,
		irritability_label: irritabilityLabel(c.irritability, locale),
		medication_raw: c.medicationTaken,
		medication_label: medicationLabel(c.medicationTaken, locale),
		note: c.note ?? "",
	};
}

function trendLabel(trend: PeriodStats["trend"], locale: Locale): string {
	const key = {
		rising: "trend_rising",
		falling: "trend_falling",
		stable: "trend_stable",
		insufficient_data: "trend_insufficient",
	} as const;
	return t(key[trend], locale, {});
}

export function generateCsvBuffer(
	checkins: CheckinRow[],
	_stats: PeriodStats | null,
	locale: Locale,
): Buffer {
	const rows = checkins.map((c) => checkinToFlatRow(c, locale));
	const csv = Papa.unparse(rows);
	return Buffer.from(csv, "utf-8");
}

export function generateXlsxBuffer(
	checkins: CheckinRow[],
	stats: PeriodStats | null,
	locale: Locale,
): Buffer {
	const wb = XLSX.utils.book_new();

	if (stats) {
		const summaryData = [
			{ key: "records", value: stats.records },
			{ key: "totalDays", value: stats.totalDays },
			{ key: "avgMood", value: stats.avgMood },
			{ key: "avgEnergy", value: stats.avgEnergy },
			{ key: "avgSleep", value: stats.avgSleep },
			{ key: "avgAnxiety", value: stats.avgAnxiety },
			{ key: "avgIrritability", value: stats.avgIrritability },
			{ key: "trend", value: trendLabel(stats.trend, locale) },
		];
		const summarySheet = XLSX.utils.json_to_sheet(summaryData);
		XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
	}

	const checkinRows = checkins.map((c) => checkinToFlatRow(c, locale));
	const checkinsSheet = XLSX.utils.json_to_sheet(checkinRows);
	XLSX.utils.book_append_sheet(wb, checkinsSheet, "Checkins");

	const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
	return Buffer.from(buf);
}
