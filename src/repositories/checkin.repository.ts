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
	date: Date;
};

export type UpdateCheckinInput = Partial<
	Omit<CreateCheckinInput, "userId" | "date">
>;

export async function findCheckinByUserIdAndDate(userId: string, date: Date) {
	return prisma.checkin.findUnique({
		where: {
			userId_date: { userId, date },
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
			date: input.date,
		},
	});
}

export async function updateCheckinById(id: string, data: UpdateCheckinInput) {
	return prisma.checkin.update({
		where: { id },
		data,
	});
}

export async function findUserByTelegramId(telegramId: bigint) {
	return prisma.user.findUnique({
		where: { telegramId },
	});
}
