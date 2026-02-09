import type { AlertSensitivity } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import type { MessageKey } from "../../lib/i18n";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import {
	findUserAlertSettings,
	updateUserAlertSettings,
} from "../../repositories/alert.repository";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:settings");

const SENSITIVITY_KEYS: Record<AlertSensitivity, MessageKey> = {
	LOW: "settings_btn_sensitivity_low",
	MEDIUM: "settings_btn_sensitivity_medium",
	HIGH: "settings_btn_sensitivity_high",
};

const SENSITIVITY_CALLBACK: Record<AlertSensitivity, string> = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
};

function buildSettingsKeyboard(
	locale: ReturnType<typeof normalizeLocale>,
	alertsEnabled: boolean,
	sensitivity: AlertSensitivity,
) {
	const keyboard = new InlineKeyboard();

	if (alertsEnabled) {
		keyboard.text(
			t("settings_btn_alerts_off", locale, {}),
			"settings:alerts:toggle",
		);
	} else {
		keyboard.text(
			t("settings_btn_alerts_on", locale, {}),
			"settings:alerts:toggle",
		);
	}
	keyboard.row();

	const levels: AlertSensitivity[] = ["LOW", "MEDIUM", "HIGH"];
	for (const level of levels) {
		const key = SENSITIVITY_KEYS[level];
		const label =
			level === sensitivity
				? t("settings_sensitivity_current", locale, {
						level: t(key, locale, {}),
					})
				: t(key, locale, {});
		keyboard.text(label, `settings:sensitivity:${SENSITIVITY_CALLBACK[level]}`);
	}

	return keyboard;
}

export async function handleSettingsCommand(ctx: BotContext): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await findUserAlertSettings(BigInt(telegramId));
	if (!user) return;

	const text =
		`${t("settings_title", locale, {})}\n\n` +
		t("settings_alerts_status", locale, {
			enabled: user.alertsEnabled,
			sensitivity: t(SENSITIVITY_KEYS[user.alertsSensitivity], locale, {}),
		});

	const keyboard = buildSettingsKeyboard(
		locale,
		user.alertsEnabled,
		user.alertsSensitivity,
	);

	await ctx.reply(text, { reply_markup: keyboard });
}

export async function handleSettingsAlertToggle(
	ctx: BotContext,
): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await findUserAlertSettings(BigInt(telegramId));
	if (!user) return;

	const newEnabled = !user.alertsEnabled;
	await updateUserAlertSettings(user.id, { alertsEnabled: newEnabled });

	const text =
		`${t("settings_title", locale, {})}\n\n` +
		t("settings_alerts_status", locale, {
			enabled: newEnabled,
			sensitivity: t(SENSITIVITY_KEYS[user.alertsSensitivity], locale, {}),
		});

	const keyboard = buildSettingsKeyboard(
		locale,
		newEnabled,
		user.alertsSensitivity,
	);

	await ctx.editMessageText(text, { reply_markup: keyboard });
	logger.info({ telegramId, alertsEnabled: newEnabled }, "Alerts toggled");
}

export async function handleSettingsSensitivity(
	ctx: BotContext,
): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const levelStr = data.split(":").at(2);
	const levelMap: Record<string, AlertSensitivity> = {
		low: "LOW",
		medium: "MEDIUM",
		high: "HIGH",
	};
	const newSensitivity = levelStr ? levelMap[levelStr] : undefined;
	if (!newSensitivity) return;

	const locale = normalizeLocale(ctx.from?.language_code);
	const user = await findUserAlertSettings(BigInt(telegramId));
	if (!user) return;

	await updateUserAlertSettings(user.id, { alertsSensitivity: newSensitivity });

	const text =
		`${t("settings_title", locale, {})}\n\n` +
		t("settings_alerts_status", locale, {
			enabled: user.alertsEnabled,
			sensitivity: t(SENSITIVITY_KEYS[newSensitivity], locale, {}),
		});

	const keyboard = buildSettingsKeyboard(
		locale,
		user.alertsEnabled,
		newSensitivity,
	);

	await ctx.editMessageText(text, { reply_markup: keyboard });
	logger.info(
		{ telegramId, sensitivity: newSensitivity },
		"Alert sensitivity changed",
	);
}
