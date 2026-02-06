import { InlineKeyboard } from "grammy";
import { formatCheckinDisplay } from "../../lib/format";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { getCheckinHistory } from "../../services/stats.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:history");
const PAGE_SIZE = 7;

function buildHistoryText(
	checkins: {
		localDate: string;
		mood: number;
		energy: number;
		sleepDuration: number;
		sleepQuality: string;
		anxiety: number;
		irritability: number;
		medicationTaken: string;
		note: string | null;
	}[],
	locale: "ru" | "en",
): string {
	const lines = [t("history_title", locale, {})];

	for (const c of checkins) {
		const display = formatCheckinDisplay(c, locale);
		lines.push("");
		lines.push(
			t("history_entry", locale, {
				date: c.localDate,
				...display,
			}),
		);
	}

	return lines.join("\n");
}

function buildHistoryKeyboard(
	hasPrev: boolean,
	hasNext: boolean,
	offset: number,
	locale: "ru" | "en",
): InlineKeyboard {
	const kb = new InlineKeyboard();
	if (hasPrev) {
		kb.text(
			t("history_btn_prev", locale, {}),
			`history:page:${offset - PAGE_SIZE}`,
		);
	}
	if (hasNext) {
		kb.text(
			t("history_btn_next", locale, {}),
			`history:page:${offset + PAGE_SIZE}`,
		);
	}
	return kb;
}

export async function handleHistoryCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	logger.info({ userId: telegramId }, "User requested history");

	const result = await getCheckinHistory(telegramId, 0, PAGE_SIZE);

	if (result.checkins.length === 0) {
		await ctx.reply(t("history_empty", locale, {}));
		return;
	}

	const text = buildHistoryText(result.checkins, locale);
	const keyboard = buildHistoryKeyboard(
		result.hasPrev,
		result.hasNext,
		result.offset,
		locale,
	);

	await ctx.reply(text, { reply_markup: keyboard });
}

export async function handleHistoryPagination(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const offsetStr = data.split(":")[2];
	if (!offsetStr) return;
	const offset = Number.parseInt(offsetStr, 10);
	if (Number.isNaN(offset) || offset < 0) return;

	const result = await getCheckinHistory(telegramId, offset, PAGE_SIZE);

	if (result.checkins.length === 0) {
		return;
	}

	const text = buildHistoryText(result.checkins, locale);
	const keyboard = buildHistoryKeyboard(
		result.hasPrev,
		result.hasNext,
		result.offset,
		locale,
	);

	await ctx.editMessageText(text, { reply_markup: keyboard });
}
