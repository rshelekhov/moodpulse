import type { MedicationStatus, SleepQuality } from "@prisma/client";
import {
	createCheckin,
	findCheckinByUserIdAndDate,
	findUserByTelegramId,
	updateCheckinById,
} from "../repositories/checkin.repository";

export type CheckinData = {
	mood: number;
	energy: number;
	sleepDuration: number;
	sleepQuality: SleepQuality;
	anxiety: number;
	irritability: number;
	medicationTaken: MedicationStatus;
	note?: string | null;
};

export async function getTodayCheckin(telegramId: number) {
	const user = await findUserByTelegramId(BigInt(telegramId));

	if (!user) {
		return null;
	}

	// Create a Date object for "today" at midnight (00:00:00.000)
	// This is important because the database stores only the date part
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return findCheckinByUserIdAndDate(user.id, today);
}

export async function saveCheckin(
	telegramId: number,
	data: CheckinData,
	existingCheckinId?: string,
) {
	const user = await findUserByTelegramId(BigInt(telegramId));

	if (!user) {
		throw new Error("User not found");
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (existingCheckinId) {
		return updateCheckinById(existingCheckinId, {
			mood: data.mood,
			energy: data.energy,
			sleepDuration: data.sleepDuration,
			sleepQuality: data.sleepQuality,
			anxiety: data.anxiety,
			irritability: data.irritability,
			medicationTaken: data.medicationTaken,
			note: data.note,
		});
	}

	return createCheckin({
		userId: user.id,
		mood: data.mood,
		energy: data.energy,
		sleepDuration: data.sleepDuration,
		sleepQuality: data.sleepQuality,
		anxiety: data.anxiety,
		irritability: data.irritability,
		medicationTaken: data.medicationTaken,
		note: data.note,
		date: today,
	});
}
