import { getLocalDateKey } from "../lib/date";
import { createChildLogger } from "../lib/logger";
import { computeNextReminderAt } from "../lib/reminder-time";
import { findCheckinByUserIdAndLocalDate } from "../repositories/checkin.repository";
import {
	findUserByTelegramIdFull,
	findUsersDueForReminder,
	findUsersWithNullReminderNextAt,
	updateUserReminderSettings,
	updateUserReminderState,
	updateUserTimezone,
} from "../repositories/user.repository";

const logger = createChildLogger("service:reminder");

export type DueUser = {
	id: string;
	telegramId: bigint;
	timezone: string;
	reminderTime: string;
	reminderLastSentLocalDate: string | null;
	reminderSnoozeUntil: Date | null;
	reminderSkipLocalDate: string | null;
	languageCode: string | null;
};

export async function seedMissingReminderNextAt(
	now: Date = new Date(),
): Promise<void> {
	const users = await findUsersWithNullReminderNextAt();
	for (const user of users) {
		const nextAt = computeNextReminderAt(user.reminderTime, user.timezone, now);
		await updateUserReminderState(user.id, { reminderNextAt: nextAt });
		logger.debug(
			{ userId: user.id, nextAt: nextAt.toISOString() },
			"Seeded reminderNextAt",
		);
	}
}

export async function getUsersToRemind(
	now: Date = new Date(),
): Promise<DueUser[]> {
	await seedMissingReminderNextAt(now);

	const candidates = await findUsersDueForReminder(now);
	const result: DueUser[] = [];

	for (const user of candidates) {
		const localDate = getLocalDateKey(now, user.timezone);

		if (user.reminderLastSentLocalDate === localDate) {
			logger.debug(
				{ userId: user.id, localDate },
				"Skipped: already sent today",
			);
			continue;
		}

		if (user.reminderSkipLocalDate === localDate) {
			const nextAt = computeNextReminderAt(
				user.reminderTime,
				user.timezone,
				now,
			);
			await updateUserReminderState(user.id, {
				reminderNextAt: nextAt,
				reminderSnoozeUntil: null,
			});
			logger.debug(
				{ userId: user.id, localDate },
				"Skipped: user skipped today",
			);
			continue;
		}

		if (
			user.reminderSnoozeUntil &&
			user.reminderSnoozeUntil.getTime() > now.getTime()
		) {
			logger.debug(
				{
					userId: user.id,
					snoozeUntil: user.reminderSnoozeUntil.toISOString(),
				},
				"Skipped: snoozed",
			);
			continue;
		}

		const existingCheckin = await findCheckinByUserIdAndLocalDate(
			user.id,
			localDate,
		);
		if (existingCheckin) {
			const nextAt = computeNextReminderAt(
				user.reminderTime,
				user.timezone,
				now,
			);
			await updateUserReminderState(user.id, {
				reminderNextAt: nextAt,
				reminderSnoozeUntil: null,
				reminderSkipLocalDate: null,
			});
			logger.debug(
				{ userId: user.id, localDate, nextAt: nextAt.toISOString() },
				"Skipped: checkin exists, advanced to next day",
			);
			continue;
		}

		result.push(user);
	}

	return result;
}

export async function markReminderSent(
	userId: string,
	reminderTime: string,
	timezone: string,
	now: Date = new Date(),
): Promise<void> {
	const localDate = getLocalDateKey(now, timezone);
	const nextAt = computeNextReminderAt(reminderTime, timezone, now);

	await updateUserReminderState(userId, {
		reminderLastSentLocalDate: localDate,
		reminderNextAt: nextAt,
		reminderSnoozeUntil: null,
	});
}

export async function snoozeReminder(
	userId: string,
	minutes: number,
	now: Date = new Date(),
): Promise<void> {
	const snoozeUntil = new Date(now.getTime() + minutes * 60 * 1000);

	await updateUserReminderState(userId, {
		reminderNextAt: snoozeUntil,
		reminderSnoozeUntil: snoozeUntil,
		reminderLastSentLocalDate: null,
	});
}

export async function skipReminderToday(
	userId: string,
	reminderTime: string,
	timezone: string,
	now: Date = new Date(),
): Promise<void> {
	const localDate = getLocalDateKey(now, timezone);
	const nextAt = computeNextReminderAt(reminderTime, timezone, now);

	await updateUserReminderState(userId, {
		reminderSkipLocalDate: localDate,
		reminderNextAt: nextAt,
		reminderSnoozeUntil: null,
	});
}

export async function getUserReminderSettings(telegramId: number) {
	return findUserByTelegramIdFull(BigInt(telegramId));
}

export async function setReminderEnabled(
	userId: string,
	enabled: boolean,
	reminderTime: string,
	timezone: string,
	now: Date = new Date(),
): Promise<void> {
	if (enabled) {
		const nextAt = computeNextReminderAt(reminderTime, timezone, now);
		await updateUserReminderSettings(userId, {
			reminderEnabled: true,
			reminderNextAt: nextAt,
			reminderSnoozeUntil: null,
			reminderSkipLocalDate: null,
		});
	} else {
		await updateUserReminderSettings(userId, {
			reminderEnabled: false,
			reminderNextAt: null,
			reminderSnoozeUntil: null,
			reminderSkipLocalDate: null,
		});
	}
}

export async function setReminderTime(
	userId: string,
	time: string,
	timezone: string,
	now: Date = new Date(),
): Promise<void> {
	const nextAt = computeNextReminderAt(time, timezone, now);
	await updateUserReminderSettings(userId, {
		reminderEnabled: true,
		reminderTime: time,
		reminderNextAt: nextAt,
		reminderSnoozeUntil: null,
		reminderSkipLocalDate: null,
	});
}

export async function setUserTimezone(
	telegramId: number,
	timezone: string,
	now: Date = new Date(),
): Promise<void> {
	const user = await findUserByTelegramIdFull(BigInt(telegramId));
	if (!user) throw new Error("User not found");

	await updateUserTimezone(user.id, timezone);

	if (user.reminderEnabled) {
		const nextAt = computeNextReminderAt(user.reminderTime, timezone, now);
		await updateUserReminderState(user.id, { reminderNextAt: nextAt });
	}
}
