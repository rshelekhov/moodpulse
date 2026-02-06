import { InlineKeyboard } from "grammy";
import {
	getDayOfWeek,
	getDaysInMonth,
	getLocalYearMonth,
	getMonthName,
	getWeekdayShorts,
} from "../../lib/date";
import { formatCheckinDisplay } from "../../lib/format";
import type { Locale } from "../../lib/i18n";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { getCheckinForDate, getMonthStats } from "../../services/stats.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:month");

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

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

function buildCalendarKeyboard(
	year: number,
	month: number,
	checkinDates: Set<string>,
	locale: Locale,
): InlineKeyboard {
	const kb = new InlineKeyboard();

	// Weekday header row
	const intlLocale = locale === "ru" ? "ru-RU" : "en-US";
	const weekdays = getWeekdayShorts(intlLocale);
	for (const name of weekdays) {
		kb.text(name, "month:noop");
	}
	kb.row();

	// Leading blank cells
	const firstDow = getDayOfWeek(`${year}-${pad(month)}-01`);
	for (let i = 0; i < firstDow; i++) {
		kb.text(" ", "month:noop");
	}

	// Day cells
	let col = firstDow;
	const daysInMonth = getDaysInMonth(year, month);
	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = `${year}-${pad(month)}-${pad(day)}`;
		const hasCheckin = checkinDates.has(dateKey);
		const label = hasCheckin ? `${day}◆` : `${day}`;
		kb.text(label, `month:day:${dateKey}`);
		col++;
		if (col === 7) {
			kb.row();
			col = 0;
		}
	}

	// Trailing blanks to fill last row
	if (col > 0) {
		while (col < 7) {
			kb.text(" ", "month:noop");
			col++;
		}
	}
	kb.row();

	// Navigation row
	const prevMonth = month === 1 ? 12 : month - 1;
	const prevYear = month === 1 ? year - 1 : year;
	const nextMonth = month === 12 ? 1 : month + 1;
	const nextYear = month === 12 ? year + 1 : year;

	const now = getLocalYearMonth(new Date(), "UTC");
	const isCurrentMonth = year === now.year && month === now.month;

	kb.text(
		t("month_btn_prev", locale, {}),
		`month:nav:${prevYear}-${pad(prevMonth)}`,
	);
	if (!isCurrentMonth) {
		kb.text(
			t("month_btn_next", locale, {}),
			`month:nav:${nextYear}-${pad(nextMonth)}`,
		);
	}

	return kb;
}

async function renderMonth(
	ctx: BotContext,
	telegramId: number,
	year: number,
	month: number,
	locale: Locale,
	edit: boolean,
): Promise<void> {
	const stats = await getMonthStats(telegramId, year, month);
	if (!stats) return;

	const intlLocale = locale === "ru" ? "ru-RU" : "en-US";
	const monthName = getMonthName(year, month, intlLocale);
	const capitalizedName =
		monthName.charAt(0).toUpperCase() + monthName.slice(1);

	let text: string;
	if (stats.records === 0) {
		text =
			t("month_title", locale, { monthName: capitalizedName, year }) +
			"\n\n" +
			t("month_no_data", locale, {});
	} else {
		text =
			t("month_title", locale, { monthName: capitalizedName, year }) +
			"\n\n" +
			t("month_stats", locale, {
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

	const keyboard = buildCalendarKeyboard(
		year,
		month,
		stats.checkinDates,
		locale,
	);

	if (edit) {
		await ctx.editMessageText(text, { reply_markup: keyboard });
	} else {
		await ctx.reply(text, { reply_markup: keyboard });
	}
}

export async function handleMonthCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	logger.info({ userId: telegramId }, "User requested month stats");

	const { year, month } = getLocalYearMonth(new Date(), "UTC");
	await renderMonth(ctx, telegramId, year, month, locale, false);
}

export async function handleMonthNavigation(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const ym = data.split(":")[2];
	if (!ym) return;

	const parts = ym.split("-");
	const yearStr = parts[0];
	const monthStr = parts[1];
	if (!yearStr || !monthStr) return;
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
	if (Number.isNaN(year) || Number.isNaN(month)) return;

	await renderMonth(ctx, telegramId, year, month, locale, true);
}

export async function handleMonthDayClick(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const dateKey = data.split(":")[2];
	if (!dateKey) return;

	const checkin = await getCheckinForDate(telegramId, dateKey);
	const ym = dateKey.substring(0, 7); // "YYYY-MM"

	const kb = new InlineKeyboard();

	if (checkin) {
		const display = formatCheckinDisplay(checkin, locale);
		const text = t("month_day_checkin", locale, {
			date: dateKey,
			...display,
		});
		kb.text(
			t("month_day_btn_overwrite", locale, {}),
			`month:checkin:${dateKey}`,
		);
		kb.row();
		kb.text(t("month_btn_back", locale, {}), `month:back:${ym}`);
		await ctx.editMessageText(text, { reply_markup: kb });
	} else {
		const text = t("month_day_no_checkin", locale, { date: dateKey });
		kb.text(t("month_day_btn_record", locale, {}), `month:checkin:${dateKey}`);
		kb.row();
		kb.text(t("month_btn_back", locale, {}), `month:back:${ym}`);
		await ctx.editMessageText(text, { reply_markup: kb });
	}
}

export async function handleMonthBack(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const ym = data.split(":")[2];
	if (!ym) return;

	const parts = ym.split("-");
	const yearStr = parts[0];
	const monthStr = parts[1];
	if (!yearStr || !monthStr) return;
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
	if (Number.isNaN(year) || Number.isNaN(month)) return;

	await renderMonth(ctx, telegramId, year, month, locale, true);
}

export async function handleMonthStartCheckin(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const dateKey = data.split(":")[2];
	if (!dateKey) return;

	await ctx.conversation.enter("checkin", dateKey);
}
