import { createBot } from "./bot";
import { loadConfig } from "./config/config";
import { connectDatabase, disconnectDatabase } from "./infrastructure/database";
import { logger } from "./lib/logger";
import {
	createReminderScheduler,
	type ReminderScheduler,
} from "./scheduler/reminder-scheduler";

async function main(): Promise<void> {
	loadConfig();
	logger.info("Configuration loaded");

	await connectDatabase();

	const bot = createBot();
	logger.info("Bot instance created");

	scheduler = createReminderScheduler(bot.api);
	scheduler.start();

	logger.info("Starting bot polling...");
	await bot.start({
		onStart: (botInfo) => {
			logger.info({ username: botInfo.username }, "Bot is running");
		},
	});
}

let scheduler: ReminderScheduler | null = null;

async function shutdown(): Promise<void> {
	logger.info("Shutting down...");
	if (scheduler) scheduler.stop();
	await disconnectDatabase();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Catch unhandled errors to debug silent exits
process.on("uncaughtException", (error) => {
	logger.fatal(
		{ error: error.message, stack: error.stack },
		"Uncaught exception",
	);
	process.exit(1);
});

process.on("unhandledRejection", (reason) => {
	logger.fatal({ reason: String(reason) }, "Unhandled rejection");
	process.exit(1);
});

main().catch((error) => {
	logger.fatal({ error }, "Fatal error, shutting down");
	process.exit(1);
});
