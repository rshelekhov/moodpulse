import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { findUserByTelegramId } from "../../repositories/checkin.repository";
import {
	skipReminderToday,
	snoozeReminder,
} from "../../services/reminder.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:reminder-callbacks");

export async function handleReminderCheckin(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	if (ctx.conversation.active("checkin") > 0) {
		const locale = normalizeLocale(ctx.from?.language_code);
		await ctx.reply(t("checkin_already_active", locale, {}));
		return;
	}

	await ctx.conversation.enter("checkin");
}

export async function handleReminderSnooze(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const minutesStr = data.split(":").at(2);
	if (!minutesStr) return;
	const minutes = Number(minutesStr);
	if (![30, 60, 120].includes(minutes)) return;

	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return;

	await snoozeReminder(user.id, minutes);

	const locale = normalizeLocale(ctx.from?.language_code);
	await ctx.editMessageText(t("reminder_snoozed", locale, { minutes }));

	logger.info({ telegramId, minutes }, "Reminder snoozed");
}

export async function handleReminderSkip(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const user = await findUserByTelegramId(BigInt(telegramId));
	if (!user) return;

	await skipReminderToday(user.id, user.reminderTime, user.timezone);

	const locale = normalizeLocale(ctx.from?.language_code);
	await ctx.editMessageText(t("reminder_skipped", locale, {}));

	logger.info({ telegramId }, "Reminder skipped for today");
}
