import type { Bot } from "grammy";
import type { BotCommand } from "grammy/types";
import { createChildLogger } from "../../lib/logger";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:commands");

const commands: BotCommand[] = [
	{ command: "start", description: "Start interacting with the bot" },
	{ command: "checkin", description: "Record daily check-in" },
	{ command: "today", description: "Show today's check-in" },
	{ command: "history", description: "Last check-ins list" },
	{ command: "week", description: "Weekly averages & mood trend" },
	{ command: "month", description: "Monthly averages, mood trend & calendar" },
];

const commandsRu: BotCommand[] = [
	{ command: "start", description: "Начать работу с ботом" },
	{ command: "checkin", description: "Записать ежедневный чек-ин" },
	{ command: "today", description: "Показать чек-ин за сегодня" },
	{ command: "history", description: "Список последних чек-инов" },
	{ command: "week", description: "Средние за неделю и тренд настроения" },
	{
		command: "month",
		description: "Средние за месяц, тренд настроения и календарь",
	},
];

export async function setBotCommands(bot: Bot<BotContext>): Promise<void> {
	await Promise.all([
		bot.api.setMyCommands(commands),
		bot.api.setMyCommands(commandsRu, { language_code: "ru" }),
	]);
	logger.debug("Bot commands set for all locales");
}
