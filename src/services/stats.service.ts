import { addDays, getDateRange, getMonthBounds } from "../lib/date";
import {
	findCheckinByUserIdAndLocalDate,
	findCheckinsByUserIdAndDateRange,
	findCheckinsByUserIdPaginated,
	findUserByTelegramId,
} from "../repositories/checkin.repository";

export type TrendDirection =
	| "rising"
	| "falling"
	| "stable"
	| "insufficient_data";

export type PeriodStats = {
	records: number;
	totalDays: number;
	avgMood: number;
	avgEnergy: number;
	avgSleep: number;
	avgAnxiety: number;
	avgIrritability: number;
	trend: TrendDirection;
	checkinDates: Set<string>;
};

export function calculateTrend(
	checkins: { localDate: string; mood: number }[],
	allDates: string[],
	mode: "week" | "month",
): TrendDirection {
	if (checkins.length < 3) return "insufficient_data";

	const checkinMap = new Map(checkins.map((c) => [c.localDate, c.mood]));

	let windowADates: string[];
	let windowBDates: string[];

	if (mode === "week") {
		// Week: A = days 0-2, B = days 4-6
		windowADates = allDates.slice(0, 3);
		windowBDates = allDates.slice(4, 7);
	} else {
		// Month: A = 14-8 days ago, B = last 7 days
		const len = allDates.length;
		windowADates = allDates.slice(Math.max(0, len - 14), Math.max(0, len - 7));
		windowBDates = allDates.slice(Math.max(0, len - 7));
	}

	const avgWindow = (dates: string[]): { avg: number; count: number } => {
		let sum = 0;
		let count = 0;
		for (const d of dates) {
			const mood = checkinMap.get(d);
			if (mood !== undefined) {
				sum += mood;
				count++;
			}
		}
		return { avg: count > 0 ? sum / count : 0, count };
	};

	const windowA = avgWindow(windowADates);
	const windowB = avgWindow(windowBDates);

	if (windowA.count < 1 || windowB.count < 1) return "insufficient_data";

	const diff = windowB.avg - windowA.avg;
	if (Math.abs(diff) < 0.3) return "stable";
	return diff > 0 ? "rising" : "falling";
}

export function computeStats(
	checkins: {
		localDate: string;
		mood: number;
		energy: number;
		sleepDuration: number;
		anxiety: number;
		irritability: number;
	}[],
	allDates: string[],
	mode: "week" | "month",
): PeriodStats {
	const checkinDates = new Set(checkins.map((c) => c.localDate));

	if (checkins.length === 0) {
		return {
			records: 0,
			totalDays: allDates.length,
			avgMood: 0,
			avgEnergy: 0,
			avgSleep: 0,
			avgAnxiety: 0,
			avgIrritability: 0,
			trend: "insufficient_data",
			checkinDates,
		};
	}

	const n = checkins.length;
	const avgMood = checkins.reduce((s, c) => s + c.mood, 0) / n;
	const avgEnergy = checkins.reduce((s, c) => s + c.energy, 0) / n;
	const avgSleep = checkins.reduce((s, c) => s + c.sleepDuration, 0) / n;
	const avgAnxiety = checkins.reduce((s, c) => s + c.anxiety, 0) / n;
	const avgIrritability = checkins.reduce((s, c) => s + c.irritability, 0) / n;

	return {
		records: n,
		totalDays: allDates.length,
		avgMood: Math.round(avgMood * 10) / 10,
		avgEnergy: Math.round(avgEnergy * 10) / 10,
		avgSleep: Math.round(avgSleep * 10) / 10,
		avgAnxiety: Math.round(avgAnxiety * 10) / 10,
		avgIrritability: Math.round(avgIrritability * 10) / 10,
		trend: calculateTrend(checkins, allDates, mode),
		checkinDates,
	};
}

export async function getCheckinHistory(
	telegramId: number,
	offset: number,
	limit: number,
) {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return { checkins: [], hasNext: false, hasPrev: false, offset };

	const rows = await findCheckinsByUserIdPaginated(user.id, limit, offset);
	const hasNext = rows.length > limit;
	const checkins = hasNext ? rows.slice(0, limit) : rows;

	return {
		checkins,
		hasNext,
		hasPrev: offset > 0,
		offset,
	};
}

export async function getWeekStats(telegramId: number, weekStartDate: string) {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const endDate = addDays(weekStartDate, 6);
	const allDates = getDateRange(weekStartDate, endDate);
	const checkins = await findCheckinsByUserIdAndDateRange(
		user.id,
		weekStartDate,
		endDate,
	);

	return computeStats(checkins, allDates, "week");
}

export async function getMonthStats(
	telegramId: number,
	year: number,
	month: number,
) {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const { start, end } = getMonthBounds(year, month);
	const allDates = getDateRange(start, end);
	const checkins = await findCheckinsByUserIdAndDateRange(user.id, start, end);

	return computeStats(checkins, allDates, "month");
}

export async function getCheckinForDate(telegramId: number, localDate: string) {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	return findCheckinByUserIdAndLocalDate(user.id, localDate);
}

export async function getLast7CheckinsWithStats(telegramId: number) {
	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return null;

	const rows = await findCheckinsByUserIdPaginated(user.id, 7, 0);
	const checkins = rows.slice(0, 7);

	if (checkins.length === 0) {
		return { checkins: [], stats: null };
	}

	const dates = checkins.map((c) => c.localDate).sort();
	const stats = computeStats(checkins, dates, "week");
	return { checkins, stats };
}
