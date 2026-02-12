import { InlineKeyboard } from "grammy";
import { type Locale, normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { setUserTimezone } from "../../services/reminder.service";
import type { BotContext } from "../context";

const logger = createChildLogger("bot:timezone");

type TimezoneLabelKey =
	| "timezone_btn_moscow"
	| "timezone_btn_kaliningrad"
	| "timezone_btn_samara"
	| "timezone_btn_yekaterinburg"
	| "timezone_btn_novosibirsk"
	| "timezone_btn_krasnoyarsk"
	| "timezone_btn_vladivostok"
	| "timezone_btn_kyiv"
	| "timezone_btn_minsk"
	| "timezone_btn_london"
	| "timezone_btn_berlin"
	| "timezone_btn_new_york";

const TIMEZONE_OPTIONS: Array<{ tz: string; labelKey: TimezoneLabelKey }> = [
	{ tz: "Europe/Moscow", labelKey: "timezone_btn_moscow" },
	{ tz: "Europe/Kaliningrad", labelKey: "timezone_btn_kaliningrad" },
	{ tz: "Europe/Samara", labelKey: "timezone_btn_samara" },
	{ tz: "Asia/Yekaterinburg", labelKey: "timezone_btn_yekaterinburg" },
	{ tz: "Asia/Novosibirsk", labelKey: "timezone_btn_novosibirsk" },
	{ tz: "Asia/Krasnoyarsk", labelKey: "timezone_btn_krasnoyarsk" },
	{ tz: "Asia/Vladivostok", labelKey: "timezone_btn_vladivostok" },
	{ tz: "Europe/Kyiv", labelKey: "timezone_btn_kyiv" },
	{ tz: "Europe/Minsk", labelKey: "timezone_btn_minsk" },
	{ tz: "Europe/London", labelKey: "timezone_btn_london" },
	{ tz: "Europe/Berlin", labelKey: "timezone_btn_berlin" },
	{ tz: "America/New_York", labelKey: "timezone_btn_new_york" },
];

export function buildTimezoneKeyboard(
	locale: Locale,
	callbackPrefix: string,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const opt of TIMEZONE_OPTIONS) {
		keyboard
			.text(t(opt.labelKey, locale, {}), `${callbackPrefix}${opt.tz}`)
			.row();
	}

	const customPrefix = callbackPrefix.replace(":set:", ":custom");
	keyboard.text(t("timezone_btn_other", locale, {}), customPrefix);

	return keyboard;
}

export async function handleTimezoneSelect(ctx: BotContext): Promise<void> {
	await ctx.answerCallbackQuery();

	const telegramId = ctx.from?.id;
	if (!telegramId) return;

	const data = ctx.callbackQuery?.data;
	if (!data) return;

	const timezone = data.replace("tz:set:", "");
	const locale = normalizeLocale(ctx.from?.language_code);

	await setUserTimezone(telegramId, timezone);
	await ctx.editMessageText(t("timezone_updated", locale, { timezone }));

	logger.info({ telegramId, timezone }, "Timezone updated");
}
