import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { getLocalDateKey } from "../lib/date";
import {
	createCheckin,
	findCheckinByUserIdAndLocalDate,
	findUserByTelegramId,
	updateCheckinByIdForUser,
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

export async function getTodayCheckin(telegramId: number, now = new Date()) {
	const user = await findUserByTelegramId(BigInt(telegramId));

	if (!user) {
		return null;
	}

	const localDate = getLocalDateKey(now, user.timezone);
	return findCheckinByUserIdAndLocalDate(user.id, localDate);
}

export async function saveCheckin(
	telegramId: number,
	data: CheckinData,
	existingCheckinId?: string,
	now = new Date(),
) {
	const user = await findUserByTelegramId(BigInt(telegramId));

	if (!user) {
		throw new Error("User not found");
	}

	const localDate = getLocalDateKey(now, user.timezone);

	if (existingCheckinId) {
		const result = await updateCheckinByIdForUser(existingCheckinId, user.id, {
			mood: data.mood,
			energy: data.energy,
			sleepDuration: data.sleepDuration,
			sleepQuality: data.sleepQuality,
			anxiety: data.anxiety,
			irritability: data.irritability,
			medicationTaken: data.medicationTaken,
			note: data.note,
		});

		if (result.count === 0) {
			throw new Error("Checkin not found for user");
		}

		return result;
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
		localDate,
	});
}
