import { conversations, createConversation } from "@grammyjs/conversations";
import type { BotError } from "grammy";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { getConfig } from "../config/config";
import { normalizeLocale, t } from "../lib/i18n";
import { createChildLogger } from "../lib/logger";
import { handleCheckinCommand } from "./commands/checkin";
import { setBotCommands } from "./commands/definitions";
import {
	handleDeleteMeCancel,
	handleDeleteMeCommand,
	handleDeleteMeConfirm,
} from "./commands/delete-me";
import { handlePrivacyCommand } from "./commands/privacy";
import {
	handleReminderCommand,
	handleReminderSettingsTz,
	handleReminderTimePreset,
	handleReminderTimeSelect,
	handleReminderToggle,
	handleReminderTzSelect,
} from "./commands/reminder";
import {
	handleReminderCheckin,
	handleReminderSkip,
	handleReminderSnooze,
} from "./commands/reminder-callbacks";
import {
	handleSettingsAlertToggle,
	handleSettingsCommand,
	handleSettingsSensitivity,
} from "./commands/settings";
import { handleStartCommand } from "./commands/start";
import {
	handleStatsCalendar,
	handleStatsCharts,
	handleStatsChartsRender,
	handleStatsCommand,
	handleStatsEmail,
	handleStatsEmailPeriod,
	handleStatsExport,
	handleStatsExportFile,
	handleStatsExportPick,
	handleStatsLast7,
	handleStatsMenu,
	handleStatsMonth,
	handleStatsMonthBack,
	handleStatsMonthCheckin,
	handleStatsMonthDay,
	handleStatsMonthNav,
	handleStatsWeek,
	handleStatsWeekNav,
} from "./commands/stats";
import { handleTimezoneSelect } from "./commands/timezone";
import { handleTodayCommand, handleTodayStartCheckin } from "./commands/today";
import type { BotContext, SessionData } from "./context";
import { checkinConversation } from "./conversations/checkin";
import { reminderTimeConversation } from "./conversations/reminder-time";
import { statsEmailConversation } from "./conversations/stats-email";
import { timezoneConversation } from "./conversations/timezone";

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
	bot.use(createConversation(reminderTimeConversation, "reminderTime"));
	bot.use(createConversation(timezoneConversation, "timezone"));
	bot.use(createConversation(statsEmailConversation, "statsEmail"));

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
	bot.command("stats", handleStatsCommand);
	bot.command("reminder", handleReminderCommand);
	bot.command("settings", handleSettingsCommand);
	bot.command("privacy", handlePrivacyCommand);
	bot.command("delete_me", handleDeleteMeCommand);

	bot.callbackQuery("today:start_checkin", handleTodayStartCheckin);

	// Stats callbacks
	bot.callbackQuery("stats:menu", handleStatsMenu);
	bot.callbackQuery("stats:week", handleStatsWeek);
	bot.callbackQuery("stats:month", handleStatsMonth);
	bot.callbackQuery("stats:last7", handleStatsLast7);
	bot.callbackQuery("stats:calendar", handleStatsCalendar);
	bot.callbackQuery("stats:charts", handleStatsCharts);
	bot.callbackQuery(
		/^stats:charts:(week|month|last7)$/,
		handleStatsChartsRender,
	);
	bot.callbackQuery("stats:export", handleStatsExport);
	bot.callbackQuery("stats:email", handleStatsEmail);
	bot.callbackQuery(
		/^stats:export:pick:(week|month|last7|all)$/,
		handleStatsExportPick,
	);
	bot.callbackQuery(
		/^stats:export:(csv|xlsx):(week|month|last7|all)/,
		handleStatsExportFile,
	);
	bot.callbackQuery(/^stats:email:(week|month|last7)$/, handleStatsEmailPeriod);
	bot.callbackQuery(/^stats:week:nav:/, handleStatsWeekNav);
	bot.callbackQuery(/^stats:month:nav:/, handleStatsMonthNav);
	bot.callbackQuery(/^stats:month:day:/, handleStatsMonthDay);
	bot.callbackQuery(/^stats:month:back:/, handleStatsMonthBack);
	bot.callbackQuery(/^stats:month:checkin:/, handleStatsMonthCheckin);
	bot.callbackQuery("stats:noop", async (ctx) => ctx.answerCallbackQuery());

	// Account deletion
	bot.callbackQuery("delete_me:confirm", handleDeleteMeConfirm);
	bot.callbackQuery("delete_me:cancel", handleDeleteMeCancel);

	// Reminder notification buttons
	bot.callbackQuery("reminder:checkin", handleReminderCheckin);
	bot.callbackQuery(/^reminder:snooze:\d+$/, handleReminderSnooze);
	bot.callbackQuery("reminder:skip", handleReminderSkip);

	// Reminder settings callbacks
	bot.callbackQuery(
		/^reminder:settings:(enable|disable)$/,
		handleReminderToggle,
	);
	bot.callbackQuery("reminder:settings:time", handleReminderTimeSelect);
	bot.callbackQuery("reminder:settings:tz", handleReminderSettingsTz);
	bot.callbackQuery(/^reminder:time:\d{4}$/, handleReminderTimePreset);
	bot.callbackQuery("reminder:time:custom", async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.conversation.enter("reminderTime");
	});

	// Reminder inline timezone flow (TZ → time selection)
	bot.callbackQuery(/^reminder:tz:set:.+$/, handleReminderTzSelect);
	bot.callbackQuery("reminder:tz:custom", async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.conversation.enter("timezone");
	});

	// Settings callbacks
	bot.callbackQuery("settings:alerts:toggle", handleSettingsAlertToggle);
	bot.callbackQuery(
		/^settings:sensitivity:(low|medium|high)$/,
		handleSettingsSensitivity,
	);

	// Standalone timezone callbacks
	bot.callbackQuery(/^tz:set:.+$/, handleTimezoneSelect);
	bot.callbackQuery("tz:custom", async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.conversation.enter("timezone");
	});

	setBotCommands(bot);

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
