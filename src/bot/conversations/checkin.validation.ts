import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { z } from "zod";

export const SLEEP_DURATION_MAP = {
	lt4: 3.5,
	"4_5": 4.5,
	"5_6": 5.5,
	"6_7": 6.5,
	"7_8": 7.5,
	"8_9": 8.5,
	gt9: 9.5,
} as const;

const moodSchema = z.coerce.number().int().min(-3).max(3);
const energySchema = z.coerce.number().int().min(1).max(5);
const anxietySchema = z.coerce.number().int().min(0).max(3);
const irritabilitySchema = z.coerce.number().int().min(0).max(3);
const sleepDurationKeySchema = z.enum([
	"lt4",
	"4_5",
	"5_6",
	"6_7",
	"7_8",
	"8_9",
	"gt9",
]);
const sleepQualitySchema = z.enum(["POOR", "FAIR", "GOOD"]);
const medicationSchema = z.enum(["TAKEN", "SKIPPED", "NOT_APPLICABLE"]);

export function parseMoodValue(raw: string): number | null {
	const parsed = moodSchema.safeParse(raw);
	return parsed.success ? parsed.data : null;
}

export function parseEnergyValue(raw: string): number | null {
	const parsed = energySchema.safeParse(raw);
	return parsed.success ? parsed.data : null;
}

export function parseAnxietyValue(raw: string): number | null {
	const parsed = anxietySchema.safeParse(raw);
	return parsed.success ? parsed.data : null;
}

export function parseIrritabilityValue(raw: string): number | null {
	const parsed = irritabilitySchema.safeParse(raw);
	return parsed.success ? parsed.data : null;
}

export function parseSleepDurationValue(raw: string): number | null {
	const parsed = sleepDurationKeySchema.safeParse(raw);
	if (!parsed.success) {
		return null;
	}
	return SLEEP_DURATION_MAP[parsed.data];
}

export function parseSleepQualityValue(raw: string): SleepQuality | null {
	const parsed = sleepQualitySchema.safeParse(raw);
	return parsed.success ? (parsed.data as SleepQuality) : null;
}

export function parseMedicationValue(raw: string): MedicationStatus | null {
	const parsed = medicationSchema.safeParse(raw);
	return parsed.success ? (parsed.data as MedicationStatus) : null;
}
