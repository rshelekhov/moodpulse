import { addDays, getLocalDateKey } from "../../lib/date";
import type { Locale } from "../../lib/i18n";
import { t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import {
	findAlertState,
	findUserAlertSettings,
	upsertAlertCooldown,
} from "../../repositories/alert.repository";
import { findCheckinsByUserIdAndDateRange } from "../../repositories/checkin.repository";
import type { RuleInput } from "./rules";
import { ALL_RULES } from "./rules";

const logger = createChildLogger("alerts");

const COOLDOWN_DAYS = 7;

type AlertRuleId =
	| "sleep_energy"
	| "missed_meds"
	| "mood_swing"
	| "mood_downtrend"
	| "irritability_energy";

const ALERT_KEYS: Record<
	AlertRuleId,
	keyof typeof import("../../lib/i18n/ru").ru & string
> = {
	sleep_energy: "alert_sleep_energy",
	missed_meds: "alert_missed_meds",
	mood_swing: "alert_mood_swing",
	mood_downtrend: "alert_mood_downtrend",
	irritability_energy: "alert_irritability_energy",
};

export type AlertMessage = {
	ruleId: string;
	text: string;
};

export async function analyzeAfterCheckin(
	telegramId: number,
	locale: Locale,
	now = new Date(),
): Promise<AlertMessage[]> {
	const user = await findUserAlertSettings(BigInt(telegramId));
	if (!user) return [];

	if (!user.alertsEnabled) return [];
	if (user.alertsSnoozeUntil && user.alertsSnoozeUntil > now) return [];

	const localDate = getLocalDateKey(now, user.timezone);
	const startDate = addDays(localDate, -7);
	const checkins = await findCheckinsByUserIdAndDateRange(
		user.id,
		startDate,
		localDate,
	);

	if (checkins.length === 0) return [];

	const ruleInput: RuleInput = {
		checkins,
		sensitivity: user.alertsSensitivity,
		takingMedications: user.takingMedications,
	};

	const alerts: AlertMessage[] = [];

	for (const rule of ALL_RULES) {
		const match = rule.evaluate(ruleInput);
		if (!match) continue;

		const state = await findAlertState(user.id, rule.id);
		if (state?.cooldownUntil && state.cooldownUntil > now) {
			logger.debug(
				{ ruleId: rule.id, userId: user.id },
				"Alert skipped (cooldown)",
			);
			continue;
		}

		const cooldownUntil = new Date(
			now.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
		);
		await upsertAlertCooldown(user.id, rule.id, cooldownUntil);

		const key = ALERT_KEYS[rule.id as AlertRuleId];
		if (!key) continue;

		// biome-ignore lint/suspicious/noExplicitAny: i18n params vary per rule
		const text = t(key as any, locale, match.details as any);
		const disclaimer = t("alert_disclaimer", locale, {});

		alerts.push({
			ruleId: rule.id,
			text: `${text}\n\n${disclaimer}`,
		});
	}

	if (alerts.length > 0) {
		logger.info(
			{ telegramId, ruleIds: alerts.map((a) => a.ruleId) },
			"Smart alerts triggered",
		);
	}

	return alerts;
}
