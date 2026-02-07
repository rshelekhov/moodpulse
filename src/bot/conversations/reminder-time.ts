import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { parseReminderTime } from "../../lib/reminder-time";
import {
	getUserReminderSettings,
	setReminderTime,
} from "../../services/reminder.service";
import type { BotConversation, ConversationContext } from "../context";

const logger = createChildLogger("bot:conversation:reminder-time");

export async function reminderTimeConversation(
	conversation: BotConversation,
	ctx: ConversationContext,
): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	await ctx.reply(t("reminder_enter_custom_time", locale, {}));

	while (true) {
		const response = await conversation.waitFor("message:text");
		const text = response.message.text.trim();

		if (text.startsWith("/")) return;

		const parsed = parseReminderTime(text);
		if (!parsed) {
			await response.reply(t("reminder_invalid_time", locale, {}));
			continue;
		}

		const time = `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`;

		const user = await conversation.external(() =>
			getUserReminderSettings(telegramId),
		);
		if (!user) return;

		await conversation.external(() =>
			setReminderTime(user.id, time, user.timezone),
		);

		await response.reply(t("reminder_time_updated", locale, { time }));
		logger.info({ telegramId, time }, "Custom reminder time set");
		return;
	}
}
