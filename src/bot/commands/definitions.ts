import type { Bot } from "grammy";
import type { BotCommand } from "grammy/types";
import { createChildLogger } from "../../lib/logger";

const logger = createChildLogger("bot:commands");

const commands: BotCommand[] = [
	{ command: "start", description: "Start interacting with the bot" },
];

const commandsRu: BotCommand[] = [
	{ command: "start", description: "Начать работу с ботом" },
];

export async function setBotCommands(bot: Bot): Promise<void> {
	await Promise.all([
		bot.api.setMyCommands(commands),
		bot.api.setMyCommands(commandsRu, { language_code: "ru" }),
	]);
	logger.debug("Bot commands set for all locales");
}
