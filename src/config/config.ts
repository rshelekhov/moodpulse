import { z } from "zod";

const configSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	DATABASE_URL: z
		.string()
		.startsWith("postgresql://", "Must be a PostgreSQL URL"),
	BOT_TOKEN: z.string().min(1, "BOT_TOKEN is required"),
	NOTE_MAX_LENGTH: z.coerce.number().int().positive().default(500),
	MAILGUN_API_KEY: z.string().optional(),
	MAILGUN_DOMAIN: z.string().optional(),
	MAILGUN_FROM: z.string().optional(),
	MAILGUN_API_BASE: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

let config: Config | null = null;

export function loadConfig(): Config {
	if (config) {
		return config;
	}

	const result = configSchema.safeParse({
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		BOT_TOKEN: process.env.BOT_TOKEN,
		NOTE_MAX_LENGTH: process.env.NOTE_MAX_LENGTH,
		MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
		MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
		MAILGUN_FROM: process.env.MAILGUN_FROM,
		MAILGUN_API_BASE: process.env.MAILGUN_API_BASE,
	});

	if (!result.success) {
		const errors = result.error.issues
			.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
			.join("\n");
		throw new Error(`Invalid configuration:\n${errors}`);
	}

	config = result.data;
	return config;
}

export function getConfig(): Config {
	if (!config) {
		return loadConfig();
	}
	return config;
}

export function isProd(): boolean {
	return getConfig().NODE_ENV === "production";
}

export function getCheckinConfig() {
	return {
		noteMaxLength: getConfig().NOTE_MAX_LENGTH,
	};
}
