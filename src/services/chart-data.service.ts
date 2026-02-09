import type { MedicationStatus, SleepQuality } from "@prisma/client";
import {
	addDays,
	getDateRange,
	getLocalYearMonth,
	getMonthBounds,
	getWeekStartDate,
} from "../lib/date";
import {
	findCheckinsByUserIdAndDateRange,
	findCheckinsByUserIdPaginated,
	findUserByTelegramId,
} from "../repositories/checkin.repository";

export type ChartSeries = {
	labels: string[];
	mood: (number | null)[];
	energy: (number | null)[];
	sleepHours: (number | null)[];
	sleepQuality: (SleepQuality | null)[];
	anxiety: (number | null)[];
	irritability: (number | null)[];
	medication: (MedicationStatus | null)[];
};

type CheckinRow = {
	localDate: string;
	mood: number;
	energy: number;
	sleepDuration: number;
	sleepQuality: SleepQuality;
	anxiety: number;
	irritability: number;
	medicationTaken: MedicationStatus;
};

function mapCheckinsToSeries(
	dates: string[],
	checkins: CheckinRow[],
): ChartSeries {
	const byDate = new Map(checkins.map((c) => [c.localDate, c]));

	const labels: string[] = [];
	const mood: (number | null)[] = [];
	const energy: (number | null)[] = [];
	const sleepHours: (number | null)[] = [];
	const sleepQuality: (SleepQuality | null)[] = [];
	const anxiety: (number | null)[] = [];
	const irritability: (number | null)[] = [];
	const medication: (MedicationStatus | null)[] = [];

	for (const date of dates) {
		labels.push(date);
		const c = byDate.get(date);
		if (c) {
			mood.push(c.mood);
			energy.push(c.energy);
			sleepHours.push(c.sleepDuration);
			sleepQuality.push(c.sleepQuality);
			anxiety.push(c.anxiety);
			irritability.push(c.irritability);
			medication.push(c.medicationTaken);
		} else {
			mood.push(null);
			energy.push(null);
			sleepHours.push(null);
			sleepQuality.push(null);
			anxiety.push(null);
			irritability.push(null);
			medication.push(null);
		}
	}

	return {
		labels,
		mood,
		energy,
		sleepHours,
		sleepQuality,
		anxiety,
		irritability,
		medication,
	};
}

export async function buildWeekSeries(
	telegramId: number,
	tz: string,
): Promise<ChartSeries | null> {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const weekStart = getWeekStartDate(new Date(), tz);
	const weekEnd = addDays(weekStart, 6);
	const dates = getDateRange(weekStart, weekEnd);
	const checkins = await findCheckinsByUserIdAndDateRange(
		user.id,
		weekStart,
		weekEnd,
	);

	return mapCheckinsToSeries(dates, checkins);
}

export async function buildMonthSeries(
	telegramId: number,
	tz: string,
): Promise<ChartSeries | null> {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const { year, month } = getLocalYearMonth(new Date(), tz);
	const { start, end } = getMonthBounds(year, month);
	const dates = getDateRange(start, end);
	const checkins = await findCheckinsByUserIdAndDateRange(user.id, start, end);

	return mapCheckinsToSeries(dates, checkins);
}

export async function buildLast7CheckinsSeries(
	telegramId: number,
): Promise<ChartSeries | null> {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const rows = await findCheckinsByUserIdPaginated(user.id, 7, 0);
	const checkins = rows.slice(0, 7);

	if (checkins.length === 0) return null;

	const sorted = [...checkins].sort((a, b) =>
		a.localDate.localeCompare(b.localDate),
	);
	const dates = sorted.map((c) => c.localDate);

	return mapCheckinsToSeries(dates, sorted);
}
