import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import type { BotContext } from "../context";

const logger = createChildLogger("bot.checkin");

export async function handleCheckinCommand(ctx: BotContext): Promise<void> {
	logger.info({ userId: ctx.from?.id }, "User initiated checkin");

	const locale = normalizeLocale(ctx.from?.language_code);
	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	if (ctx.conversation.active("checkin") > 0) {
		await ctx.reply(t("checkin_already_active", locale, {}));
		return;
	}

	// Start the conversation - control transfers to checkinConversation()
	await ctx.conversation.enter("checkin");
}
