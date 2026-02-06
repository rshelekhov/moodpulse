import { InlineKeyboard } from "grammy";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { getTodayCheckin } from "../../services/checkin.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:today");

export async function handleTodayCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	logger.info({ userId: telegramId }, "User requested today's checkin");

	const locale = normalizeLocale(ctx.from?.language_code);

	if (!telegramId) {
		return;
	}

	const checkin = await getTodayCheckin(telegramId);

	if (!checkin) {
		const keyboard = new InlineKeyboard().text(
			t("today_btn_checkin", locale, {}),
			"today:start_checkin",
		);
		await ctx.reply(t("today_no_checkin", locale, {}), {
			reply_markup: keyboard,
		});
		return;
	}

	const text = t("today_checkin", locale, {
		mood: t("checkin_display_mood", locale, { value: checkin.mood }),
		energy: t("checkin_display_energy", locale, { value: checkin.energy }),
		sleepHours: String(checkin.sleepDuration),
		sleepQuality: t("checkin_display_sleep_quality", locale, {
			value: checkin.sleepQuality,
		}),
		anxiety: t("checkin_display_anxiety", locale, { value: checkin.anxiety }),
		irritability: t("checkin_display_irritability", locale, {
			value: checkin.irritability,
		}),
		medication: t("checkin_display_medication", locale, {
			value: checkin.medicationTaken,
		}),
		note: checkin.note,
	});

	await ctx.reply(text);
}

export async function handleTodayStartCheckin(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();
	await ctx.conversation.enter("checkin");
}
