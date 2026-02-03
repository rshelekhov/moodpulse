import pino, { type Logger } from "pino";
import { isProd } from "../../config/config";

function getLogLevel(): pino.LevelWithSilent {
	return isProd() ? "info" : "debug";
}

function isPinoPrettyAvailable(): boolean {
	try {
		require.resolve("pino-pretty");
		return true;
	} catch {
		return false;
	}
}

function createLogger(): Logger {
	const logLevel = getLogLevel();

	if (isProd()) {
		return pino({
			level: logLevel,
			formatters: {
				level: (label) => ({ level: label }),
			},
			timestamp: pino.stdTimeFunctions.isoTime,
		});
	}

	if (isPinoPrettyAvailable()) {
		return pino({
			level: logLevel,
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "HH:MM:ss Z",
					ignore: "pid,hostname",
					singleLine: false,
				},
			},
		});
	}

	return pino({
		level: logLevel,
		formatters: {
			level: (label) => ({ level: label }),
		},
		timestamp: pino.stdTimeFunctions.isoTime,
	});
}

export const logger = createLogger();

export function createChildLogger(
	name: string,
	bindings?: Record<string, unknown>,
): Logger {
	return logger.child({ component: name, ...bindings });
}

export type { Logger } from "pino";
