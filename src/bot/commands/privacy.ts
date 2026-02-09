import { getConfig } from "../../config/config";
import { normalizeLocale, t } from "../../lib/i18n";
import type { BotContext } from "../context";

const MAX_MESSAGE_LENGTH = 3800;

function chunkText(text: string): string[] {
	const paragraphs = text.split("\n\n");
	const chunks: string[] = [];
	let current = "";

	for (const paragraph of paragraphs) {
		const next = current ? `${current}\n\n${paragraph}` : paragraph;
		if (next.length > MAX_MESSAGE_LENGTH && current) {
			chunks.push(current);
			current = paragraph;
		} else {
			current = next;
		}
	}

	if (current) {
		chunks.push(current);
	}

	return chunks;
}

export async function handlePrivacyCommand(ctx: BotContext) {
	const locale = normalizeLocale(ctx.from?.language_code);
	const config = getConfig();

	const text = t("privacy", locale, {
		url: config.PRIVACY_URL,
		contact: config.PRIVACY_CONTACT,
	});

	const chunks = chunkText(text);
	for (const chunk of chunks) {
		await ctx.reply(chunk);
	}
}
