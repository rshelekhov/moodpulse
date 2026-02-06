import type { Locale } from "./i18n";
import { t } from "./i18n";

type CheckinLike = {
	mood: number;
	energy: number;
	sleepDuration: number;
	sleepQuality: string;
	anxiety: number;
	irritability: number;
	medicationTaken: string;
	note: string | null;
};

export function formatCheckinDisplay(checkin: CheckinLike, locale: Locale) {
	return {
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
	};
}
