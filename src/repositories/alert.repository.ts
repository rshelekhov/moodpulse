import type { AlertSensitivity } from "@prisma/client";
import { prisma } from "../infrastructure/database";

export async function findAlertState(userId: string, ruleId: string) {
	return prisma.alertState.findUnique({
		where: { userId_ruleId: { userId, ruleId } },
	});
}

export async function upsertAlertCooldown(
	userId: string,
	ruleId: string,
	cooldownUntil: Date,
) {
	return prisma.alertState.upsert({
		where: { userId_ruleId: { userId, ruleId } },
		create: {
			userId,
			ruleId,
			lastSentAt: new Date(),
			cooldownUntil,
		},
		update: {
			lastSentAt: new Date(),
			cooldownUntil,
		},
	});
}

export async function findUserAlertSettings(telegramId: bigint) {
	return prisma.user.findUnique({
		where: { telegramId },
		select: {
			id: true,
			alertsEnabled: true,
			alertsSensitivity: true,
			alertsSnoozeUntil: true,
			timezone: true,
			takingMedications: true,
		},
	});
}

export async function updateUserAlertSettings(
	userId: string,
	data: {
		alertsEnabled?: boolean;
		alertsSensitivity?: AlertSensitivity;
	},
) {
	return prisma.user.update({
		where: { id: userId },
		data,
	});
}
