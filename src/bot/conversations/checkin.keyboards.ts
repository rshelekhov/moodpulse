import { InlineKeyboard } from "grammy";
import { type Locale, t } from "../../lib/i18n";

export const CB = {
	CANCEL: "checkin:cancel",
	RECORD_NEW: "checkin:record_new",
	KEEP_CURRENT: "checkin:keep",
	SAVE: "checkin:save",
	ADD_NOTE: "checkin:add_note",
	SKIP_NOTE: "checkin:skip_note",
} as const;

export type CheckinAction = (typeof CB)[keyof typeof CB];

export function createVerticalKeyboard(
	items: Array<{ label: string; data: string }>,
	locale: Locale,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const [i, item] of items.entries()) {
		if (i > 0) keyboard.row();
		keyboard.text(item.label, item.data);
	}

	return addCancelButton(keyboard, locale);
}

export function createHorizontalKeyboard(
	items: Array<{ label: string; data: string }>,
	locale: Locale,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const item of items) {
		keyboard.text(item.label, item.data);
	}

	return addCancelButton(keyboard, locale);
}

export function createGridKeyboard(
	rows: Array<Array<{ label: string; data: string }>>,
	locale: Locale,
): InlineKeyboard {
	const keyboard = new InlineKeyboard();

	for (const [rowIndex, row] of rows.entries()) {
		if (rowIndex > 0) keyboard.row();
		for (const item of row) {
			keyboard.text(item.label, item.data);
		}
	}

	return addCancelButton(keyboard, locale);
}

export function addCancelButton(
	keyboard: InlineKeyboard,
	locale: Locale,
): InlineKeyboard {
	return keyboard.row().text(t("checkin_btn_cancel", locale, {}), CB.CANCEL);
}

export function parseCallbackValue(data: string): string {
	const parts = data.split(":");
	return parts.at(-1) ?? "";
}
