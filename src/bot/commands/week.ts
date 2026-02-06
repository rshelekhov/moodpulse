import { InlineKeyboard } from "grammy";
import { addDays, getWeekStartDate } from "../../lib/date";
import type { Locale } from "../../lib/i18n";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { getWeekStats } from "../../services/stats.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:week");

function formatTrend(
	trend: "rising" | "falling" | "stable" | "insufficient_data",
	locale: Locale,
): string {
	const key = {
		rising: "trend_rising",
		falling: "trend_falling",
		stable: "trend_stable",
		insufficient_data: "trend_insufficient",
	} as const;
	return t(key[trend], locale, {});
}

function buildWeekKeyboard(
	weekStart: string,
	isCurrentWeek: boolean,
	locale: Locale,
): InlineKeyboard {
	const kb = new InlineKeyboard();
	kb.text(t("week_btn_prev", locale, {}), `week:nav:${addDays(weekStart, -7)}`);
	if (!isCurrentWeek) {
		kb.text(
			t("week_btn_next", locale, {}),
			`week:nav:${addDays(weekStart, 7)}`,
		);
	}
	return kb;
}

async function renderWeek(
	ctx: BotContext,
	telegramId: number,
	weekStart: string,
	locale: Locale,
	edit: boolean,
): Promise<void> {
	const stats = await getWeekStats(telegramId, weekStart);
	if (!stats) return;

	const endDate = addDays(weekStart, 6);
	const currentWeekStart = getWeekStartDate(new Date(), "UTC");
	const isCurrentWeek = weekStart >= currentWeekStart;

	let text: string;
	if (stats.records === 0) {
		text =
			t("week_title", locale, { startDate: weekStart, endDate }) +
			"\n\n" +
			t("week_no_data", locale, {});
	} else {
		text =
			t("week_title", locale, { startDate: weekStart, endDate }) +
			"\n\n" +
			t("week_stats", locale, {
				records: stats.records,
				totalDays: stats.totalDays,
				avgMood: String(stats.avgMood),
				avgEnergy: String(stats.avgEnergy),
				avgSleep: String(stats.avgSleep),
				avgAnxiety: String(stats.avgAnxiety),
				avgIrritability: String(stats.avgIrritability),
				trend: formatTrend(stats.trend, locale),
			});
	}

	const keyboard = buildWeekKeyboard(weekStart, isCurrentWeek, locale);

	if (edit) {
		await ctx.editMessageText(text, { reply_markup: keyboard });
	} else {
		await ctx.reply(text, { reply_markup: keyboard });
	}
}

export async function handleWeekCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	logger.info({ userId: telegramId }, "User requested week stats");

	const weekStart = getWeekStartDate(new Date(), "UTC");
	await renderWeek(ctx, telegramId, weekStart, locale, false);
}

export async function handleWeekNavigation(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const weekStart = data.split(":")[2];
	if (!weekStart) return;

	await renderWeek(ctx, telegramId, weekStart, locale, true);
}
