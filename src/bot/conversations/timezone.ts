import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { setUserTimezone } from "../../services/reminder.service";
import type { BotConversation, ConversationContext } from "../context";

const logger = createChildLogger("bot:conversation:timezone");

function isValidTimezone(tz: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

export async function timezoneConversation(
	conversation: BotConversation,
	ctx: ConversationContext,
): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	await ctx.reply(t("timezone_enter_custom", locale, {}));

	while (true) {
		const response = await conversation.waitFor("message:text");
		const text = response.message.text.trim();

		if (text.startsWith("/")) return;

		if (!isValidTimezone(text)) {
			await response.reply(t("timezone_invalid", locale, {}));
			continue;
		}

		await conversation.external(() => setUserTimezone(telegramId, text));
		await response.reply(t("timezone_updated", locale, { timezone: text }));

		logger.info({ telegramId, timezone: text }, "Custom timezone set");
		return;
	}
}
