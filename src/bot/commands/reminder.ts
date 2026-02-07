import { InlineKeyboard } from "grammy";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import {
	getUserReminderSettings,
	setReminderEnabled,
	setReminderTime,
	setUserTimezone,
} from "../../services/reminder.service";
import type { BotContext } from "../context";
import { buildTimezoneKeyboard } from "./timezone";

const logger = createChildLogger("bot:reminder");

function buildTimeKeyboard(locale: ReturnType<typeof normalizeLocale>) {
	return new InlineKeyboard()
		.text("08:00", "reminder:time:0800")
		.text("12:00", "reminder:time:1200")
		.text("18:00", "reminder:time:1800")
		.row()
		.text("21:00", "reminder:time:2100")
		.text("23:00", "reminder:time:2300")
		.row()
		.text(t("reminder_btn_custom_time", locale, {}), "reminder:time:custom");
}

export async function handleReminderCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await getUserReminderSettings(telegramId);
	if (!user) return;

	if (!user.timezoneSetByUser) {
		const text = t("reminder_tz_required", locale, {});
		const keyboard = buildTimezoneKeyboard(locale, "reminder:tz:set:");
		await ctx.reply(text, { reply_markup: keyboard });
		return;
	}

	const text =
		`${t("reminder_title", locale, {})}\n\n` +
		t("reminder_status", locale, {
			enabled: user.reminderEnabled,
			time: user.reminderTime,
			timezone: user.timezone,
		});

	const keyboard = new InlineKeyboard();

	if (user.reminderEnabled) {
		keyboard.text(
			t("reminder_btn_disable", locale, {}),
			"reminder:settings:disable",
		);
	} else {
		keyboard.text(
			t("reminder_btn_enable", locale, {}),
			"reminder:settings:enable",
		);
	}

	keyboard.row();
	keyboard.text(
		t("reminder_btn_change_time", locale, {}),
		"reminder:settings:time",
	);
	keyboard.row();
	keyboard.text(
		t("reminder_btn_change_tz", locale, {}),
		"reminder:settings:tz",
	);

	await ctx.reply(text, { reply_markup: keyboard });
}

export async function handleReminderToggle(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await getUserReminderSettings(telegramId);
	if (!user) return;

	const newEnabled = !user.reminderEnabled;
	await setReminderEnabled(
		user.id,
		newEnabled,
		user.reminderTime,
		user.timezone,
	);

	const message = newEnabled
		? t("reminder_enabled", locale, {})
		: t("reminder_disabled", locale, {});

	await ctx.editMessageText(message);
	logger.info({ telegramId, enabled: newEnabled }, "Reminder toggled");
}

export async function handleReminderTimeSelect(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const locale = normalizeLocale(ctx.from?.language_code);
	const keyboard = buildTimeKeyboard(locale);

	await ctx.editMessageText(t("reminder_select_time", locale, {}), {
		reply_markup: keyboard,
	});
}

export async function handleReminderTimePreset(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	// "reminder:time:0800" → "08:00"
	const raw = data.split(":").at(2);
	if (!raw || raw.length !== 4) return;
	const time = `${raw.slice(0, 2)}:${raw.slice(2)}`;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await getUserReminderSettings(telegramId);
	if (!user) return;

	await setReminderTime(user.id, time, user.timezone);
	await ctx.editMessageText(t("reminder_time_updated", locale, { time }));

	logger.info({ telegramId, reminderTime: time }, "Reminder time updated");
}

export async function handleReminderTzSelect(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const timezone = data.replace("reminder:tz:set:", "");
	const locale = normalizeLocale(ctx.from?.language_code);

	await setUserTimezone(telegramId, timezone);

	const keyboard = buildTimeKeyboard(locale);
	await ctx.editMessageText(
		`${t("timezone_updated", locale, { timezone })}\n\n${t("reminder_select_time", locale, {})}`,
		{ reply_markup: keyboard },
	);

	logger.info({ telegramId, timezone }, "Timezone set via reminder flow");
}

export async function handleReminderSettingsTz(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const locale = normalizeLocale(ctx.from?.language_code);
	const keyboard = buildTimezoneKeyboard(locale, "tz:set:");

	await ctx.editMessageText(t("timezone_title", locale, {}), {
		reply_markup: keyboard,
	});
}
