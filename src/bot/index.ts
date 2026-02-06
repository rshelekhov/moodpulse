import { conversations, createConversation } from "@grammyjs/conversations";
import type { BotError } from "grammy";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { getConfig } from "../config/config";
import { normalizeLocale, t } from "../lib/i18n";
import { createChildLogger } from "../lib/logger";
import { handleCheckinCommand } from "./commands/checkin";
import { setBotCommands } from "./commands/definitions";
import {
	handleHistoryCommand,
	handleHistoryPagination,
} from "./commands/history";
import {
	handleMonthBack,
	handleMonthCommand,
	handleMonthDayClick,
	handleMonthNavigation,
	handleMonthStartCheckin,
} from "./commands/month";
import { handleStartCommand } from "./commands/start";
import { handleTodayCommand, handleTodayStartCheckin } from "./commands/today";
import { handleWeekCommand, handleWeekNavigation } from "./commands/week";
import type { BotContext, SessionData } from "./context";
import { checkinConversation } from "./conversations/checkin";

const logger = createChildLogger("bot");

export function createBot(): Bot<BotContext> {
	const config = getConfig();

	logger.debug("Creating bot instance");

	const bot = new Bot<BotContext>(config.BOT_TOKEN);

	bot.use(
		session({
			initial: (): SessionData => ({}),
		}),
	);

	bot.use(conversations());

	bot.use(createConversation(checkinConversation, "checkin"));

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
				const errInfo =
					error instanceof Error
						? { errorMessage: error.message, errorStack: error.stack }
						: { errorMessage: String(error) };
				logger.error(
					{ ...base, ...errInfo },
					"Unknown error while handling update",
				);
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

	bot.command("start", handleStartCommand);
	bot.command("checkin", handleCheckinCommand);
	bot.command("today", handleTodayCommand);
	bot.command("history", handleHistoryCommand);
	bot.command("week", handleWeekCommand);
	bot.command("month", handleMonthCommand);

	bot.callbackQuery("today:start_checkin", handleTodayStartCheckin);
	bot.callbackQuery(/^history:page:\d+$/, handleHistoryPagination);
	bot.callbackQuery(/^week:nav:\d{4}-\d{2}-\d{2}$/, handleWeekNavigation);
	bot.callbackQuery(/^month:nav:\d{4}-\d{2}$/, handleMonthNavigation);
	bot.callbackQuery(/^month:day:\d{4}-\d{2}-\d{2}$/, handleMonthDayClick);
	bot.callbackQuery(/^month:back:\d{4}-\d{2}$/, handleMonthBack);
	bot.callbackQuery(
		/^month:checkin:\d{4}-\d{2}-\d{2}$/,
		handleMonthStartCheckin,
	);
	bot.callbackQuery("month:noop", async (ctx) => ctx.answerCallbackQuery());

	setBotCommands(bot);

	// Last-resort error handler for anything not caught by middleware
	bot.catch((err: BotError<BotContext>) => {
		const ctx = err.ctx;
		const updateId = ctx.update?.update_id;
		const e = err.error;

		logger.error(
			{
				updateId,
				errorMessage: e instanceof Error ? e.message : String(e),
				errorStack: e instanceof Error ? e.stack : undefined,
			},
			"Unhandled bot error",
		);
	});

	return bot;
}

export type BotInstance = Bot<BotContext>;
