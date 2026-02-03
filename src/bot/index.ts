import type { BotError } from "grammy";
import { Bot, GrammyError, HttpError } from "grammy";
import { getConfig } from "../config/config";
import { normalizeLocale, t } from "../lib/i18n";
import { createChildLogger } from "../lib/logger";
import { handleStartCommand } from "./commands/start";

const logger = createChildLogger("bot");

export function createBot(): Bot {
	const config = getConfig();

	logger.debug("Creating bot instance");

	const bot = new Bot(config.BOT_TOKEN);

	bot.command("start", handleStartCommand);

	// Error-handling middleware (covers all updates passing through middlewares)
	bot.use(async (ctx, next) => {
		try {
			await next();
		} catch (error) {
			const base = {
				updateId: ctx.update?.update_id,
				userId: ctx.from?.id,
				username: ctx.from?.username,
				chatId: ctx.chat?.id,
				text: ctx.message?.text,
				error,
			};

			if (error instanceof GrammyError) {
				logger.error(
					{ ...base, description: error.description },
					"Telegram API error",
				);
			} else if (error instanceof HttpError) {
				logger.error(base, "Network error contacting Telegram");
			} else {
				logger.error(base, "Unknown error while handling update");
			}

			if (ctx.chat) {
				try {
					const locale = normalizeLocale(ctx.from?.language_code);
					await ctx.reply(t("error_generic", locale, {}));
				} catch {
					// Ignore reply failures to avoid error loops
				}
			}
		}
	});

	// Last-resort error handler for anything not caught by middleware
	bot.catch((err: BotError) => {
		const ctx = err.ctx;
		const updateId = ctx.update?.update_id;
		const e = err.error;
		logger.error({ updateId, error: e }, "Unhandled bot error");
	});

	return bot;
}

export type BotInstance = Bot;
