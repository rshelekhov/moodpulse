import type { Context } from "grammy";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { createOrUpdateUserFromTelegram } from "../../services/user.service";

const logger = createChildLogger("bot.start");

export async function handleStartCommand(ctx: Context) {
	logger.info({ userId: ctx.from?.id }, "User started the bot");

	if (ctx.from) {
		await createOrUpdateUserFromTelegram({
			telegramId: ctx.from.id,
			username: ctx.from.username,
			firstName: ctx.from.first_name,
			lastName: ctx.from.last_name,
			languageCode: ctx.from.language_code,
		});
	}

	const name = ctx.from?.first_name ?? "friend";
	const locale = normalizeLocale(ctx.from?.language_code);
	const text = t("start", locale, { name });

	return ctx.reply(text);
}
