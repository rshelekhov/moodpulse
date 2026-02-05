import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import { type Locale, normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import {
	type CheckinData,
	getTodayCheckin,
	saveCheckin,
} from "../../services/checkin.service";
import { createOrUpdateUserFromTelegram } from "../../services/user.service";
import type { BotConversation, ConversationContext } from "../context";

const logger = createChildLogger("bot.checkin");

/**
 * Callback data constants.
 * These strings are sent back when user clicks a button.
 * Format: "checkin:{action}" or "checkin:{field}:{value}"
 */
const CB = {
	CANCEL: "checkin:cancel",
	RECORD_NEW: "checkin:record_new",
	KEEP_CURRENT: "checkin:keep",
	SAVE: "checkin:save",
	ADD_NOTE: "checkin:add_note",
	SKIP_NOTE: "checkin:skip_note",
} as const;

/**
 * Maps sleep button callback values to actual hours (midpoint of range).
 */
const SLEEP_DURATION_MAP: Record<string, number> = {
	lt4: 3.5,
	"4_5": 4.5,
	"5_6": 5.5,
	"6_7": 6.5,
	"7_8": 7.5,
	"8_9": 8.5,
	gt9: 9.5,
};

type CheckinState = {
	mood?: number;
	energy?: number;
	sleepDuration?: number;
	sleepQuality?: SleepQuality;
	anxiety?: number;
	irritability?: number;
	medicationTaken?: MedicationStatus;
	note?: string | null;
	existingCheckinId?: string;
};

export async function checkinConversation(
	conversation: BotConversation,
	ctx: ConversationContext,
): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) {
		logger.warn("Checkin conversation started without user ID");
		return;
	}

	const locale = normalizeLocale(ctx.from?.language_code);

	const state: CheckinState = {};

	logger.info({ telegramId }, "Checkin conversation started");

	await conversation.external(() =>
		createOrUpdateUserFromTelegram({
			telegramId,
			username: ctx.from?.username,
			firstName: ctx.from?.first_name,
			lastName: ctx.from?.last_name,
			languageCode: ctx.from?.language_code,
		}),
	);

	const existingCheckin = await conversation.external(() =>
		getTodayCheckin(telegramId),
	);

	if (existingCheckin) {
		state.existingCheckinId = existingCheckin.id;

		const shouldContinue = await askExistingCheckin(
			conversation,
			ctx,
			existingCheckin,
			locale,
		);
		if (!shouldContinue) {
			await ctx.reply(t("checkin_kept", locale, {}));
			return;
		}
	}

	const moodResult = await askMood(conversation, ctx, locale);
	if (moodResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.mood = moodResult;

	const energyResult = await askEnergy(conversation, ctx, locale);
	if (energyResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.energy = energyResult;

	const sleepDurationResult = await askSleepDuration(conversation, ctx, locale);
	if (sleepDurationResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.sleepDuration = sleepDurationResult;

	const sleepQualityResult = await askSleepQuality(conversation, ctx, locale);
	if (sleepQualityResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.sleepQuality = sleepQualityResult;

	const anxietyResult = await askAnxiety(conversation, ctx, locale);
	if (anxietyResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.anxiety = anxietyResult;

	const irritabilityResult = await askIrritability(conversation, ctx, locale);
	if (irritabilityResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.irritability = irritabilityResult;

	const medicationResult = await askMedication(conversation, ctx, locale);
	if (medicationResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.medicationTaken = medicationResult;

	const noteResult = await askNote(conversation, ctx, locale);
	if (noteResult === "cancelled") {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}
	state.note = noteResult;

	const confirmed = await askConfirmation(
		conversation,
		ctx,
		state as Required<Omit<CheckinState, "existingCheckinId">> & {
			existingCheckinId?: string;
		},
		locale,
	);

	if (!confirmed) {
		await ctx.reply(t("checkin_cancelled", locale, {}));
		return;
	}

	await conversation.external(() =>
		saveCheckin(telegramId, state as CheckinData, state.existingCheckinId),
	);

	await ctx.reply(t("checkin_saved", locale, {}));
	logger.info({ telegramId }, "Checkin saved successfully");
}

/**
 * Waits for a callback query (button click) and handles cancel.
 */
async function waitForCallback(
	conversation: BotConversation,
	validPrefixes: string[],
): Promise<string | "cancelled"> {
	const response = await conversation.waitFor("callback_query:data");
	const data = response.callbackQuery.data;

	await response.answerCallbackQuery();

	if (data === CB.CANCEL) {
		return "cancelled";
	}

	if (validPrefixes.some((prefix) => data.startsWith(prefix))) {
		return data;
	}

	// Invalid callback (shouldn't happen with proper keyboards) - wait again
	return waitForCallback(conversation, validPrefixes);
}

function addCancelButton(
	keyboard: InlineKeyboard,
	locale: Locale,
): InlineKeyboard {
	return keyboard.row().text(t("checkin_btn_cancel", locale, {}), CB.CANCEL);
}

/**
 * Parses callback data like "checkin:mood:-3" into the value part ("-3").
 */
function parseCallbackValue(data: string): string {
	const parts = data.split(":");
	return parts.at(-1) ?? "";
}

async function askExistingCheckin(
	conversation: BotConversation,
	ctx: ConversationContext,
	existing: NonNullable<Awaited<ReturnType<typeof getTodayCheckin>>>,
	locale: Locale,
): Promise<boolean> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_btn_record_new", locale, {}), CB.RECORD_NEW)
		.text(t("checkin_btn_keep_current", locale, {}), CB.KEEP_CURRENT);

	const text = t("checkin_existing", locale, {
		mood: t("checkin_display_mood", locale, { value: existing.mood }),
		energy: t("checkin_display_energy", locale, { value: existing.energy }),
		sleepHours: String(existing.sleepDuration),
		sleepQuality: t("checkin_display_sleep_quality", locale, {
			value: existing.sleepQuality,
		}),
		anxiety: t("checkin_display_anxiety", locale, { value: existing.anxiety }),
		irritability: t("checkin_display_irritability", locale, {
			value: existing.irritability,
		}),
		medication: t("checkin_display_medication", locale, {
			value: existing.medicationTaken,
		}),
		note: existing.note,
	});

	await ctx.reply(text, { reply_markup: keyboard });

	const response = await conversation.waitFor("callback_query:data");
	await response.answerCallbackQuery();

	return response.callbackQuery.data === CB.RECORD_NEW;
}

async function askMood(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_mood_m3", locale, {}), "checkin:mood:-3")
		.row()
		.text(t("checkin_mood_m2", locale, {}), "checkin:mood:-2")
		.row()
		.text(t("checkin_mood_m1", locale, {}), "checkin:mood:-1")
		.row()
		.text(t("checkin_mood_0", locale, {}), "checkin:mood:0")
		.row()
		.text(t("checkin_mood_p1", locale, {}), "checkin:mood:1")
		.row()
		.text(t("checkin_mood_p2", locale, {}), "checkin:mood:2")
		.row()
		.text(t("checkin_mood_p3", locale, {}), "checkin:mood:3");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_mood", locale, {}), { reply_markup: keyboard });

	const result = await waitForCallback(conversation, ["checkin:mood:"]);
	if (result === "cancelled") return "cancelled";

	return Number.parseInt(parseCallbackValue(result), 10);
}

async function askEnergy(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_energy_1", locale, {}), "checkin:energy:1")
		.row()
		.text(t("checkin_energy_2", locale, {}), "checkin:energy:2")
		.row()
		.text(t("checkin_energy_3", locale, {}), "checkin:energy:3")
		.row()
		.text(t("checkin_energy_4", locale, {}), "checkin:energy:4")
		.row()
		.text(t("checkin_energy_5", locale, {}), "checkin:energy:5");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_energy", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:energy:"]);
	if (result === "cancelled") return "cancelled";

	return Number.parseInt(parseCallbackValue(result), 10);
}

async function askSleepDuration(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_sleep_lt4", locale, {}), "checkin:sleep:lt4")
		.text(t("checkin_sleep_4_5", locale, {}), "checkin:sleep:4_5")
		.text(t("checkin_sleep_5_6", locale, {}), "checkin:sleep:5_6")
		.row()
		.text(t("checkin_sleep_6_7", locale, {}), "checkin:sleep:6_7")
		.text(t("checkin_sleep_7_8", locale, {}), "checkin:sleep:7_8")
		.text(t("checkin_sleep_8_9", locale, {}), "checkin:sleep:8_9")
		.text(t("checkin_sleep_gt9", locale, {}), "checkin:sleep:gt9");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_sleep_duration", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:sleep:"]);
	if (result === "cancelled") return "cancelled";

	const key = parseCallbackValue(result);
	return SLEEP_DURATION_MAP[key] ?? 7;
}

async function askSleepQuality(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<SleepQuality | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_sleep_poor", locale, {}), "checkin:quality:POOR")
		.text(t("checkin_sleep_fair", locale, {}), "checkin:quality:FAIR")
		.text(t("checkin_sleep_good", locale, {}), "checkin:quality:GOOD");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_sleep_quality", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:quality:"]);
	if (result === "cancelled") return "cancelled";

	return parseCallbackValue(result) as SleepQuality;
}

async function askAnxiety(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_anxiety_0", locale, {}), "checkin:anxiety:0")
		.row()
		.text(t("checkin_anxiety_1", locale, {}), "checkin:anxiety:1")
		.row()
		.text(t("checkin_anxiety_2", locale, {}), "checkin:anxiety:2")
		.row()
		.text(t("checkin_anxiety_3", locale, {}), "checkin:anxiety:3");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_anxiety", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:anxiety:"]);
	if (result === "cancelled") return "cancelled";

	return Number.parseInt(parseCallbackValue(result), 10);
}

async function askIrritability(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_irritability_0", locale, {}), "checkin:irritability:0")
		.row()
		.text(t("checkin_irritability_1", locale, {}), "checkin:irritability:1")
		.row()
		.text(t("checkin_irritability_2", locale, {}), "checkin:irritability:2")
		.row()
		.text(t("checkin_irritability_3", locale, {}), "checkin:irritability:3");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_irritability", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:irritability:"]);
	if (result === "cancelled") return "cancelled";

	return Number.parseInt(parseCallbackValue(result), 10);
}

async function askMedication(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<MedicationStatus | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_med_taken", locale, {}), "checkin:med:TAKEN")
		.row()
		.text(t("checkin_med_skipped", locale, {}), "checkin:med:SKIPPED")
		.row()
		.text(t("checkin_med_na", locale, {}), "checkin:med:NOT_APPLICABLE");

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_medication", locale, {}), {
		reply_markup: keyboard,
	});

	const result = await waitForCallback(conversation, ["checkin:med:"]);
	if (result === "cancelled") return "cancelled";

	return parseCallbackValue(result) as MedicationStatus;
}

async function askNote(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<string | null | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_btn_add_note", locale, {}), CB.ADD_NOTE)
		.text(t("checkin_btn_skip", locale, {}), CB.SKIP_NOTE);

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_note", locale, {}), { reply_markup: keyboard });

	const result = await waitForCallback(conversation, [
		CB.ADD_NOTE,
		CB.SKIP_NOTE,
	]);
	if (result === "cancelled") return "cancelled";

	if (result === CB.SKIP_NOTE) {
		return null;
	}

	await ctx.reply(t("checkin_q_note_prompt", locale, {}));

	const textResponse = await conversation.waitFor("message:text");
	return textResponse.message.text;
}

async function askConfirmation(
	conversation: BotConversation,
	ctx: ConversationContext,
	state: Required<Omit<CheckinState, "existingCheckinId">> & {
		existingCheckinId?: string;
	},
	locale: Locale,
): Promise<boolean> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_btn_save", locale, {}), CB.SAVE)
		.text(t("checkin_btn_cancel", locale, {}), CB.CANCEL);

	const text = t("checkin_summary", locale, {
		mood: t("checkin_display_mood", locale, { value: state.mood }),
		energy: t("checkin_display_energy", locale, { value: state.energy }),
		sleepHours: String(state.sleepDuration),
		sleepQuality: t("checkin_display_sleep_quality", locale, {
			value: state.sleepQuality,
		}),
		anxiety: t("checkin_display_anxiety", locale, { value: state.anxiety }),
		irritability: t("checkin_display_irritability", locale, {
			value: state.irritability,
		}),
		medication: t("checkin_display_medication", locale, {
			value: state.medicationTaken,
		}),
		note: state.note,
	});

	await ctx.reply(text, { reply_markup: keyboard });

	const response = await conversation.waitFor("callback_query:data");
	await response.answerCallbackQuery();

	return response.callbackQuery.data === CB.SAVE;
}
