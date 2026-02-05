import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context, SessionFlavor } from "grammy";

// biome-ignore lint/complexity/noBannedTypes: Empty session for now, will be extended
export type SessionData = {};

export type ConversationContext = Context & SessionFlavor<SessionData>;

export type BotContext = Context &
	SessionFlavor<SessionData> &
	ConversationFlavor<ConversationContext>;

export type BotConversation = Conversation<BotContext, ConversationContext>;
