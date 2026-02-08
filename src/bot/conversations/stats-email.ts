import { addDays, getLocalYearMonth, getWeekStartDate } from "../../lib/date";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { findUserByTelegramId } from "../../repositories/checkin.repository";
import { sendReportEmail } from "../../services/email.service";
import {
	getCheckinHistory,
	getLast7CheckinsWithStats,
	getMonthStats,
	getWeekStats,
} from "../../services/stats.service";
import {
	generateCsvBuffer,
	generateXlsxBuffer,
} from "../../services/stats-export.service";
import type { BotConversation, ConversationContext } from "../context";

const logger = createChildLogger("bot:conversation:stats-email");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

export async function statsEmailConversation(
	conversation: BotConversation,
	ctx: ConversationContext,
	period?: string,
): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);

	await ctx.reply(t("stats_email_ask", locale, {}));

	let email: string | undefined;

	while (!email) {
		const response = await conversation.waitFor("message:text");
		const text = response.message.text.trim();

		if (text.startsWith("/")) return;

		if (!EMAIL_RE.test(text)) {
			await response.reply(t("stats_email_invalid", locale, {}));
			continue;
		}

		email = text;
	}

	await ctx.reply(t("stats_email_sending", locale, {}));

	try {
		const user = await conversation.external(() =>
			findUserByTelegramId(BigInt(telegramId)),
		);
		const tz = user?.timezone ?? "UTC";

		const exportData = await conversation.external(async () => {
			if (period === "last7") {
				const result = await getLast7CheckinsWithStats(telegramId);
				if (!result) return null;
				return { checkins: result.checkins, stats: result.stats };
			}
			if (period === "week") {
				const weekStart = getWeekStartDate(new Date(), tz);
				const stats = await getWeekStats(telegramId, weekStart);
				if (!stats) return null;
				const history = await getCheckinHistory(telegramId, 0, 100);
				const weekCheckins = history.checkins.filter(
					(c) =>
						c.localDate >= weekStart && c.localDate <= addDays(weekStart, 6),
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
		});

		if (!exportData || exportData.checkins.length === 0) {
			await ctx.reply(t("stats_export_no_data", locale, {}));
			return;
		}

		const csvBuffer = generateCsvBuffer(
			exportData.checkins,
			exportData.stats,
			locale,
		);
		const xlsxBuffer = generateXlsxBuffer(
			exportData.checkins,
			exportData.stats,
			locale,
		);

		await conversation.external(() =>
			sendReportEmail(email, csvBuffer, xlsxBuffer, "MoodPulse Report"),
		);

		await ctx.reply(t("stats_email_sent", locale, { email }));
		logger.info({ telegramId, email, period }, "Report email sent");
	} catch (error) {
		logger.error({ telegramId, email, error }, "Failed to send report email");
		await ctx.reply(t("stats_email_error", locale, {}));
	}
}
