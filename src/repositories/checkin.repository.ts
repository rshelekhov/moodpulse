import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { prisma } from "../infrastructure/database";

export type CreateCheckinInput = {
	userId: string;
	mood: number;
	energy: number;
	sleepDuration: number;
	sleepQuality: SleepQuality;
	anxiety: number;
	irritability: number;
	medicationTaken: MedicationStatus;
	note?: string | null;
	localDate: string;
};

export type UpdateCheckinInput = Partial<
	Omit<CreateCheckinInput, "userId" | "localDate">
>;

export async function findCheckinByUserIdAndLocalDate(
	userId: string,
	localDate: string,
) {
	return prisma.checkin.findUnique({
		where: {
			userId_localDate: { userId, localDate },
		},
	});
}

export async function createCheckin(input: CreateCheckinInput) {
	return prisma.checkin.create({
		data: {
			userId: input.userId,
			mood: input.mood,
			energy: input.energy,
			sleepDuration: input.sleepDuration,
			sleepQuality: input.sleepQuality,
			anxiety: input.anxiety,
			irritability: input.irritability,
			medicationTaken: input.medicationTaken,
			note: input.note ?? null,
			localDate: input.localDate,
		},
	});
}

export async function updateCheckinByIdForUser(
	id: string,
	userId: string,
	data: UpdateCheckinInput,
) {
	return prisma.checkin.updateMany({
		where: { id, userId },
		data,
	});
}

export async function findUserByTelegramId(telegramId: bigint) {
	return prisma.user.findUnique({
		where: { telegramId },
	});
}
