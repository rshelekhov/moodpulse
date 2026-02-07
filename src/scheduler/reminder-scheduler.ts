import { Cron } from "croner";
import type { Api } from "grammy";
import { InlineKeyboard } from "grammy";
import { normalizeLocale, t } from "../lib/i18n";
import { createChildLogger } from "../lib/logger";
import {
	getUsersToRemind,
	markReminderSent,
} from "../services/reminder.service";

const logger = createChildLogger("scheduler:reminder");

export type ReminderScheduler = {
	start(): void;
	stop(): void;
};

export function createReminderScheduler(api: Api): ReminderScheduler {
	let job: Cron | null = null;

	async function tick(): Promise<void> {
		const now = new Date();
		logger.debug({ now: now.toISOString() }, "Reminder tick");

		let users: Awaited<ReturnType<typeof getUsersToRemind>>;
		try {
			users = await getUsersToRemind(now);
		} catch (error) {
			logger.error({ error }, "Failed to query due reminders");
			return;
		}

		if (users.length === 0) return;

		logger.info({ count: users.length }, "Sending reminders");

		for (const user of users) {
			try {
				const locale = normalizeLocale(user.languageCode ?? undefined);

				const keyboard = new InlineKeyboard()
					.text(t("reminder_btn_start_checkin", locale, {}), "reminder:checkin")
					.row()
					.text(t("reminder_btn_snooze_30", locale, {}), "reminder:snooze:30")
					.text(t("reminder_btn_snooze_60", locale, {}), "reminder:snooze:60")
					.text(t("reminder_btn_snooze_120", locale, {}), "reminder:snooze:120")
					.row()
					.text(t("reminder_btn_skip_today", locale, {}), "reminder:skip");

				await api.sendMessage(
					Number(user.telegramId),
					t("reminder_message", locale, {}),
					{ reply_markup: keyboard },
				);

				await markReminderSent(user.id, user.reminderTime, user.timezone, now);

				logger.info({ telegramId: Number(user.telegramId) }, "Reminder sent");
			} catch (error) {
				logger.error(
					{ telegramId: Number(user.telegramId), error },
					"Failed to send reminder",
				);
			}
		}
	}

	return {
		start() {
			if (job) return;
			logger.info("Reminder scheduler started");
			job = new Cron("* * * * *", { timezone: "UTC", protect: true }, () => {
				tick().catch((e) => logger.error({ error: e }, "Tick error"));
			});
		},
		stop() {
			if (job) {
				job.stop();
				job = null;
				logger.info("Reminder scheduler stopped");
			}
		},
	};
}
