import type { Bot } from "grammy";
import type { BotCommand } from "grammy/types";
import { createChildLogger } from "../../lib/logger";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:commands");

const commands: BotCommand[] = [
	{ command: "start", description: "Start interacting with the bot" },
	{ command: "checkin", description: "Record daily check-in" },
	{ command: "today", description: "Show today's check-in" },
	{ command: "stats", description: "Statistics, export & calendar" },
	{ command: "reminder", description: "Reminder settings" },
	{ command: "settings", description: "Alert settings" },
	{ command: "privacy", description: "Privacy policy" },
	{ command: "delete_me", description: "Delete my data" },
];

const commandsRu: BotCommand[] = [
	{ command: "start", description: "Начать работу с ботом" },
	{ command: "checkin", description: "Записать ежедневный чек-ин" },
	{ command: "today", description: "Показать чек-ин за сегодня" },
	{ command: "stats", description: "Статистика, экспорт и календарь" },
	{ command: "reminder", description: "Настройки напоминаний" },
	{ command: "settings", description: "Настройки алертов" },
	{ command: "privacy", description: "Политика приватности" },
	{ command: "delete_me", description: "Удалить мои данные" },
];

export async function setBotCommands(bot: Bot<BotContext>): Promise<void> {
	await Promise.all([
		bot.api.setMyCommands(commands),
		bot.api.setMyCommands(commandsRu, { language_code: "ru" }),
	]);
	logger.debug("Bot commands set for all locales");
}
