import type { Prisma } from "@prisma/client";
import { prisma } from "../infrastructure/database";

export type UpsertUserInput = {
	telegramId: bigint;
	username?: string | null | undefined;
	firstName?: string | null | undefined;
	lastName?: string | null | undefined;
	languageCode?: string | null | undefined;
};

export async function upsertUserByTelegramId(input: UpsertUserInput) {
	const updateData: {
		username?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		languageCode?: string | null;
	} = {};

	if (input.username !== undefined) updateData.username = input.username;
	if (input.firstName !== undefined) updateData.firstName = input.firstName;
	if (input.lastName !== undefined) updateData.lastName = input.lastName;
	if (input.languageCode !== undefined)
		updateData.languageCode = input.languageCode;

	return prisma.user.upsert({
		where: { telegramId: input.telegramId },
		create: {
			telegramId: input.telegramId,
			username: input.username ?? null,
			firstName: input.firstName ?? null,
			lastName: input.lastName ?? null,
			languageCode: input.languageCode ?? null,
		},
		update: updateData,
	});
}

export async function findUsersDueForReminder(now: Date) {
	return prisma.user.findMany({
		where: {
			reminderEnabled: true,
			reminderNextAt: { lte: now },
		},
		select: {
			id: true,
			telegramId: true,
			timezone: true,
			reminderTime: true,
			reminderLastSentLocalDate: true,
			reminderSnoozeUntil: true,
			reminderSkipLocalDate: true,
			languageCode: true,
		},
	});
}

export async function findUsersWithNullReminderNextAt() {
	return prisma.user.findMany({
		where: {
			reminderEnabled: true,
			reminderNextAt: null,
		},
		select: { id: true, reminderTime: true, timezone: true },
	});
}

export async function updateUserReminderState(
	userId: string,
	data: {
		reminderNextAt?: Date | null;
		reminderLastSentLocalDate?: string | null;
		reminderSnoozeUntil?: Date | null;
		reminderSkipLocalDate?: string | null;
	},
) {
	return prisma.user.update({
		where: { id: userId },
		data,
	});
}

export async function updateUserTimezone(userId: string, timezone: string) {
	return prisma.user.update({
		where: { id: userId },
		data: { timezone, timezoneSetByUser: true },
	});
}

export async function updateUserReminderSettings(
	userId: string,
	data: Prisma.UserUpdateInput,
) {
	return prisma.user.update({
		where: { id: userId },
		data,
	});
}

export async function findUserByTelegramIdFull(telegramId: bigint) {
	return prisma.user.findUnique({
		where: { telegramId },
		select: {
			id: true,
			telegramId: true,
			timezone: true,
			timezoneSetByUser: true,
			reminderEnabled: true,
			reminderTime: true,
			languageCode: true,
		},
	});
}

export async function deleteUserByTelegramId(telegramId: bigint) {
	return prisma.user.deleteMany({
		where: { telegramId },
	});
}
