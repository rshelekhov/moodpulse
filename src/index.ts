import { createBot } from "./bot";
import { loadConfig } from "./config/config";
import {
	connectDatabase,
	disconnectDatabase,
} from "./infrastructure/database";
import { logger } from "./lib/logger";

async function main(): Promise<void> {
	loadConfig();
	logger.info("Configuration loaded");

	await connectDatabase();

	const bot = createBot();
	logger.info("Bot instance created");

	logger.info("Starting bot polling...");
	await bot.start({
		onStart: (botInfo) => {
			logger.info({ username: botInfo.username }, "Bot is running");
		},
	});
}

async function shutdown(): Promise<void> {
	logger.info("Shutting down...");
	await disconnectDatabase();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((error) => {
	logger.fatal({ error }, "Fatal error, shutting down");
	process.exit(1);
});
