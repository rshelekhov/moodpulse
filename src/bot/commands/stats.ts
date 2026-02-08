import { InlineKeyboard, InputFile } from "grammy";
import {
	addDays,
	getDayOfWeek,
	getDaysInMonth,
	getLocalYearMonth,
	getMonthName,
	getWeekdayShorts,
	getWeekStartDate,
} from "../../lib/date";
import { formatCheckinDisplay } from "../../lib/format";
import type { Locale } from "../../lib/i18n";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { findUserByTelegramId } from "../../repositories/checkin.repository";
import { isEmailConfigured } from "../../services/email.service";
import {
	getCheckinForDate,
	getCheckinHistory,
	getLast7CheckinsWithStats,
	getMonthStats,
	getWeekStats,
} from "../../services/stats.service";
import {
	generateCsvBuffer,
	generateXlsxBuffer,
} from "../../services/stats-export.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:stats");

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

async function getUserTimezone(telegramId: number): Promise<string> {
	const user = await findUserByTelegramId(BigInt(telegramId));
	return user?.timezone ?? "UTC";
}

function buildMainMenuKeyboard(locale: Locale): InlineKeyboard {
	const kb = new InlineKeyboard();
	kb.text(t("stats_btn_week", locale, {}), "stats:week");
	kb.text(t("stats_btn_month", locale, {}), "stats:month");
	kb.row();
	kb.text(t("stats_btn_last7", locale, {}), "stats:last7");
	kb.text(t("stats_btn_calendar", locale, {}), "stats:calendar");
	kb.row();
	kb.text(t("stats_btn_export", locale, {}), "stats:export");
	if (isEmailConfigured()) {
		kb.text(t("stats_btn_email", locale, {}), "stats:email");
	}
	return kb;
}

// ===== Main /stats command =====

export async function handleStatsCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	logger.info({ userId: telegramId }, "User opened stats menu");

	const kb = buildMainMenuKeyboard(locale);
	await ctx.reply(t("stats_title", locale, {}), { reply_markup: kb });
}

export async function handleStatsMenu(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();
	const locale = normalizeLocale(ctx.from?.language_code);
	const kb = buildMainMenuKeyboard(locale);
	await ctx.editMessageText(t("stats_title", locale, {}), { reply_markup: kb });
}

// ===== Week sub-screen =====

function buildWeekKeyboard(
	weekStart: string,
	isCurrentWeek: boolean,
	locale: Locale,
): InlineKeyboard {
	const kb = new InlineKeyboard();
	kb.text(
		t("week_btn_prev", locale, {}),
		`stats:week:nav:${addDays(weekStart, -7)}`,
	);
	if (!isCurrentWeek) {
		kb.text(
			t("week_btn_next", locale, {}),
			`stats:week:nav:${addDays(weekStart, 7)}`,
		);
	}
	kb.row();
	kb.text(t("stats_btn_csv", locale, {}), `stats:export:csv:week:${weekStart}`);
	kb.text(
		t("stats_btn_xlsx", locale, {}),
		`stats:export:xlsx:week:${weekStart}`,
	);
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:menu");
	return kb;
}

async function renderWeek(
	ctx: BotContext,
	telegramId: number,
	weekStart: string,
	locale: Locale,
	tz: string,
	edit: boolean,
): Promise<void> {
	const stats = await getWeekStats(telegramId, weekStart);
	if (!stats) return;

	const endDate = addDays(weekStart, 6);
	const currentWeekStart = getWeekStartDate(new Date(), tz);
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

export async function handleStatsWeek(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const tz = await getUserTimezone(telegramId);
	const weekStart = getWeekStartDate(new Date(), tz);
	await renderWeek(ctx, telegramId, weekStart, locale, tz, true);
}

export async function handleStatsWeekNav(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const parts = data.split(":");
	const weekStart = parts[3];
	if (!weekStart) return;

	const tz = await getUserTimezone(telegramId);
	await renderWeek(ctx, telegramId, weekStart, locale, tz, true);
}

// ===== Month sub-screen =====

function buildCalendarKeyboard(
	year: number,
	month: number,
	checkinDates: Set<string>,
	locale: Locale,
	tz: string,
): InlineKeyboard {
	const kb = new InlineKeyboard();

	const intlLocale = locale === "ru" ? "ru-RU" : "en-US";
	const weekdays = getWeekdayShorts(intlLocale);
	for (const name of weekdays) {
		kb.text(name, "stats:noop");
	}
	kb.row();

	const firstDow = getDayOfWeek(`${year}-${pad(month)}-01`);
	for (let i = 0; i < firstDow; i++) {
		kb.text(" ", "stats:noop");
	}

	let col = firstDow;
	const daysInMonth = getDaysInMonth(year, month);
	for (let day = 1; day <= daysInMonth; day++) {
		const dateKey = `${year}-${pad(month)}-${pad(day)}`;
		const hasCheckin = checkinDates.has(dateKey);
		const label = hasCheckin ? `${day}◆` : `${day}`;
		kb.text(label, `stats:month:day:${dateKey}`);
		col++;
		if (col === 7) {
			kb.row();
			col = 0;
		}
	}

	if (col > 0) {
		while (col < 7) {
			kb.text(" ", "stats:noop");
			col++;
		}
	}
	kb.row();

	const prevMonth = month === 1 ? 12 : month - 1;
	const prevYear = month === 1 ? year - 1 : year;
	const nextMonth = month === 12 ? 1 : month + 1;
	const nextYear = month === 12 ? year + 1 : year;

	const now = getLocalYearMonth(new Date(), tz);
	const isCurrentMonth = year === now.year && month === now.month;

	kb.text(
		t("month_btn_prev", locale, {}),
		`stats:month:nav:${prevYear}-${pad(prevMonth)}`,
	);
	if (!isCurrentMonth) {
		kb.text(
			t("month_btn_next", locale, {}),
			`stats:month:nav:${nextYear}-${pad(nextMonth)}`,
		);
	}
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:menu");

	return kb;
}

async function renderMonth(
	ctx: BotContext,
	telegramId: number,
	year: number,
	month: number,
	locale: Locale,
	tz: string,
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
		tz,
	);

	if (edit) {
		await ctx.editMessageText(text, { reply_markup: keyboard });
	} else {
		await ctx.reply(text, { reply_markup: keyboard });
	}
}

export async function handleStatsMonth(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const tz = await getUserTimezone(telegramId);
	const { year, month } = getLocalYearMonth(new Date(), tz);
	await renderMonth(ctx, telegramId, year, month, locale, tz, true);
}

export async function handleStatsCalendar(ctx: BotContext): Promise<void> {
	return handleStatsMonth(ctx);
}

export async function handleStatsMonthNav(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const ym = data.split(":")[3];
	if (!ym) return;

	const parts = ym.split("-");
	const yearStr = parts[0];
	const monthStr = parts[1];
	if (!yearStr || !monthStr) return;
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
	if (Number.isNaN(year) || Number.isNaN(month)) return;

	const tz = await getUserTimezone(telegramId);
	await renderMonth(ctx, telegramId, year, month, locale, tz, true);
}

export async function handleStatsMonthDay(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const dateKey = data.split(":")[3];
	if (!dateKey) return;

	const checkin = await getCheckinForDate(telegramId, dateKey);
	const ym = dateKey.substring(0, 7);

	const kb = new InlineKeyboard();

	if (checkin) {
		const display = formatCheckinDisplay(checkin, locale);
		const text = t("month_day_checkin", locale, {
			date: dateKey,
			...display,
		});
		kb.text(
			t("month_day_btn_overwrite", locale, {}),
			`stats:month:checkin:${dateKey}`,
		);
		kb.row();
		kb.text(t("month_btn_back", locale, {}), `stats:month:back:${ym}`);
		await ctx.editMessageText(text, { reply_markup: kb });
	} else {
		const text = t("month_day_no_checkin", locale, { date: dateKey });
		kb.text(
			t("month_day_btn_record", locale, {}),
			`stats:month:checkin:${dateKey}`,
		);
		kb.row();
		kb.text(t("month_btn_back", locale, {}), `stats:month:back:${ym}`);
		await ctx.editMessageText(text, { reply_markup: kb });
	}
}

export async function handleStatsMonthBack(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const ym = data.split(":")[3];
	if (!ym) return;

	const parts = ym.split("-");
	const yearStr = parts[0];
	const monthStr = parts[1];
	if (!yearStr || !monthStr) return;
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
	if (Number.isNaN(year) || Number.isNaN(month)) return;

	const tz = await getUserTimezone(telegramId);
	await renderMonth(ctx, telegramId, year, month, locale, tz, true);
}

export async function handleStatsMonthCheckin(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const dateKey = data.split(":")[3];
	if (!dateKey) return;

	await ctx.conversation.enter("checkin", dateKey);
}

// ===== Last 7 sub-screen =====

export async function handleStatsLast7(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const result = await getLast7CheckinsWithStats(telegramId);

	if (!result || result.checkins.length === 0) {
		const kb = new InlineKeyboard();
		kb.text(t("stats_btn_back", locale, {}), "stats:menu");
		await ctx.editMessageText(t("stats_last7_empty", locale, {}), {
			reply_markup: kb,
		});
		return;
	}

	const lines = [t("stats_last7_title", locale, {})];

	for (const c of result.checkins) {
		const display = formatCheckinDisplay(c, locale);
		lines.push("");
		lines.push(
			t("history_entry", locale, {
				date: c.localDate,
				...display,
			}),
		);
	}

	if (result.stats) {
		lines.push("");
		lines.push(
			t("week_stats", locale, {
				records: result.stats.records,
				totalDays: result.stats.totalDays,
				avgMood: String(result.stats.avgMood),
				avgEnergy: String(result.stats.avgEnergy),
				avgSleep: String(result.stats.avgSleep),
				avgAnxiety: String(result.stats.avgAnxiety),
				avgIrritability: String(result.stats.avgIrritability),
				trend: formatTrend(result.stats.trend, locale),
			}),
		);
	}

	const kb = new InlineKeyboard();
	kb.text(t("stats_btn_csv", locale, {}), "stats:export:csv:last7");
	kb.text(t("stats_btn_xlsx", locale, {}), "stats:export:xlsx:last7");
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:menu");

	await ctx.editMessageText(lines.join("\n"), { reply_markup: kb });
}

// ===== Export sub-screen =====

export async function handleStatsExport(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const locale = normalizeLocale(ctx.from?.language_code);

	const kb = new InlineKeyboard();
	kb.text(t("stats_btn_week", locale, {}), "stats:export:pick:week");
	kb.text(t("stats_btn_month", locale, {}), "stats:export:pick:month");
	kb.text(t("stats_btn_last7", locale, {}), "stats:export:pick:last7");
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:menu");

	await ctx.editMessageText(t("stats_export_select", locale, {}), {
		reply_markup: kb,
	});
}

export async function handleStatsExportPick(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const period = data.split(":")[3];
	if (!period) return;

	const kb = new InlineKeyboard();
	kb.text(t("stats_btn_csv", locale, {}), `stats:export:csv:${period}`);
	kb.text(t("stats_btn_xlsx", locale, {}), `stats:export:xlsx:${period}`);
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:export");

	await ctx.editMessageText(t("stats_export_format", locale, {}), {
		reply_markup: kb,
	});
}

async function fetchExportData(telegramId: number, period: string, tz: string) {
	if (period === "last7") {
		const result = await getLast7CheckinsWithStats(telegramId);
		if (!result) return null;
		return { checkins: result.checkins, stats: result.stats };
	}
	if (period === "week" || period.match(/^\d{4}-\d{2}-\d{2}$/)) {
		const weekStart =
			period === "week" ? getWeekStartDate(new Date(), tz) : period;
		const stats = await getWeekStats(telegramId, weekStart);
		if (!stats) return null;
		const history = await getCheckinHistory(telegramId, 0, 100);
		const weekCheckins = history.checkins.filter(
			(c) => c.localDate >= weekStart && c.localDate <= addDays(weekStart, 6),
		);
		return { checkins: weekCheckins, stats };
	}
	if (period === "month") {
		const { year, month } = getLocalYearMonth(new Date(), tz);
		const stats = await getMonthStats(telegramId, year, month);
		if (!stats) return null;
		const history = await getCheckinHistory(telegramId, 0, 100);
		const monthPrefix = `${year}-${pad(month)}`;
		const monthCheckins = history.checkins.filter((c) =>
			c.localDate.startsWith(monthPrefix),
		);
		return { checkins: monthCheckins, stats };
	}
	return null;
}

export async function handleStatsExportFile(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const parts = data.split(":");
	const format = parts[2];
	const period = parts[3];
	if (!format || !period) return;

	const tz = await getUserTimezone(telegramId);
	const exportData = await fetchExportData(telegramId, period, tz);

	if (!exportData || exportData.checkins.length === 0) {
		await ctx.reply(t("stats_export_no_data", locale, {}));
		return;
	}

	const dateStr = new Date().toISOString().slice(0, 10);

	if (format === "csv") {
		const buffer = generateCsvBuffer(
			exportData.checkins,
			exportData.stats,
			locale,
		);
		await ctx.replyWithDocument(
			new InputFile(buffer, `moodpulse-${period}-${dateStr}.csv`),
		);
	} else if (format === "xlsx") {
		const buffer = generateXlsxBuffer(
			exportData.checkins,
			exportData.stats,
			locale,
		);
		await ctx.replyWithDocument(
			new InputFile(buffer, `moodpulse-${period}-${dateStr}.xlsx`),
		);
	}
}

// ===== Email sub-screen =====

export async function handleStatsEmail(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const locale = normalizeLocale(ctx.from?.language_code);

	if (!isEmailConfigured()) {
		await ctx.editMessageText(t("stats_email_not_configured", locale, {}));
		return;
	}

	const kb = new InlineKeyboard();
	kb.text(t("stats_btn_week", locale, {}), "stats:email:week");
	kb.text(t("stats_btn_month", locale, {}), "stats:email:month");
	kb.text(t("stats_btn_last7", locale, {}), "stats:email:last7");
	kb.row();
	kb.text(t("stats_btn_back", locale, {}), "stats:menu");

	await ctx.editMessageText(t("stats_export_select", locale, {}), {
		reply_markup: kb,
	});
}

export async function handleStatsEmailPeriod(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const period = data.split(":")[2];
	if (!period) return;

	await ctx.conversation.enter("statsEmail", period);
}
