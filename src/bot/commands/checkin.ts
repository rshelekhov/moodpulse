import { createChildLogger } from "../../lib/logger";
import type { BotContext } from "../context";

const logger = createChildLogger("bot.checkin");

export async function handleCheckinCommand(ctx: BotContext): Promise<void> {
	logger.info({ userId: ctx.from?.id }, "User initiated checkin");

	// Start the conversation - control transfers to checkinConversation()
	await ctx.conversation.enter("checkin");
}
