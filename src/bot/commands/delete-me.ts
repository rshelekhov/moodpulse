import { InlineKeyboard } from "grammy";
import { normalizeLocale, t } from "../../lib/i18n";
import { deleteUserByTelegramId } from "../../services/user.service";
import type { BotContext } from "../context";

const CALLBACK_CONFIRM = "delete_me:confirm";
const CALLBACK_CANCEL = "delete_me:cancel";

function isPrivateChat(ctx: BotContext): boolean {
	return ctx.chat?.type === "private";
}

async function editOrReply(ctx: BotContext, text: string) {
	if (ctx.callbackQuery?.message) {
		try {
			await ctx.editMessageText(text);
			return;
		} catch {
			// Fall through to reply if the message can't be edited
		}
	}
	await ctx.reply(text);
}

export async function handleDeleteMeCommand(ctx: BotContext) {
	const locale = normalizeLocale(ctx.from?.language_code);

	if (!isPrivateChat(ctx)) {
		return ctx.reply(t("delete_private_only", locale, {}));
	}

	const kb = new InlineKeyboard()
		.text(t("delete_btn_confirm", locale, {}), CALLBACK_CONFIRM)
		.text(t("delete_btn_cancel", locale, {}), CALLBACK_CANCEL);

	return ctx.reply(t("delete_prompt", locale, {}), { reply_markup: kb });
}

export async function handleDeleteMeConfirm(ctx: BotContext) {
	const locale = normalizeLocale(ctx.from?.language_code);

	if (!isPrivateChat(ctx)) {
		await ctx.answerCallbackQuery();
		return;
	}

	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const deleted = await deleteUserByTelegramId(telegramId);
	const text = deleted
		? t("delete_done", locale, {})
		: t("delete_not_found", locale, {});

	await editOrReply(ctx, text);
}

export async function handleDeleteMeCancel(ctx: BotContext) {
	const locale = normalizeLocale(ctx.from?.language_code);

	await ctx.answerCallbackQuery();
	await editOrReply(ctx, t("delete_cancelled", locale, {}));
}
