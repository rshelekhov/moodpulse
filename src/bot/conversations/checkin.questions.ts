import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { InlineKeyboard } from "grammy";
import { getCheckinConfig } from "../../config/config";
import { type Locale, t } from "../../lib/i18n";
import type { BotConversation, ConversationContext } from "../context";
import {
	addCancelButton,
	CB,
	createGridKeyboard,
	createHorizontalKeyboard,
	createVerticalKeyboard,
	parseCallbackValue,
} from "./checkin.keyboards";
import {
	parseAnxietyValue,
	parseEnergyValue,
	parseIrritabilityValue,
	parseMedicationValue,
	parseMoodValue,
	parseSleepDurationValue,
	parseSleepQualityValue,
} from "./checkin.validation";

type CallbackWaitOptions<T> = {
	validPrefixes?: string[];
	validValues?: string[];
	parse?: (data: string) => T | null;
};

function isExpectedUser(
	response: ConversationContext,
	ctx: ConversationContext,
): boolean {
	const expectedUserId = ctx.from?.id;
	const expectedChatId = ctx.chat?.id;

	if (expectedUserId && response.from?.id !== expectedUserId) {
		return false;
	}

	if (
		expectedChatId &&
		response.chat?.id &&
		response.chat?.id !== expectedChatId
	) {
		return false;
	}

	return true;
}

async function waitForCallback<T>(
	conversation: BotConversation,
	ctx: ConversationContext,
	options: CallbackWaitOptions<T>,
): Promise<T | "cancelled"> {
	while (true) {
		const response = await conversation.waitFor("callback_query:data");
		const data = response.callbackQuery.data;

		await response.answerCallbackQuery();

		if (!isExpectedUser(response, ctx)) {
			continue;
		}

		if (data === CB.CANCEL) {
			return "cancelled";
		}

		const matchesValue = options.validValues?.includes(data) ?? false;
		const matchesPrefix =
			options.validPrefixes?.some((prefix) => data.startsWith(prefix)) ?? false;

		if (!matchesValue && !matchesPrefix) {
			continue;
		}

		if (options.parse) {
			const parsed = options.parse(data);
			if (parsed === null) {
				continue;
			}
			return parsed;
		}

		return data as T;
	}
}

export async function askMood(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = createVerticalKeyboard(
		[
			{ label: t("checkin_mood_m3", locale, {}), data: "checkin:mood:-3" },
			{ label: t("checkin_mood_m2", locale, {}), data: "checkin:mood:-2" },
			{ label: t("checkin_mood_m1", locale, {}), data: "checkin:mood:-1" },
			{ label: t("checkin_mood_0", locale, {}), data: "checkin:mood:0" },
			{ label: t("checkin_mood_p1", locale, {}), data: "checkin:mood:1" },
			{ label: t("checkin_mood_p2", locale, {}), data: "checkin:mood:2" },
			{ label: t("checkin_mood_p3", locale, {}), data: "checkin:mood:3" },
		],
		locale,
	);

	await ctx.reply(t("checkin_q_mood", locale, {}), { reply_markup: keyboard });

	return waitForCallback<number>(conversation, ctx, {
		validPrefixes: ["checkin:mood:"],
		parse: (data) => parseMoodValue(parseCallbackValue(data)),
	});
}

export async function askEnergy(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = createVerticalKeyboard(
		[
			{ label: t("checkin_energy_1", locale, {}), data: "checkin:energy:1" },
			{ label: t("checkin_energy_2", locale, {}), data: "checkin:energy:2" },
			{ label: t("checkin_energy_3", locale, {}), data: "checkin:energy:3" },
			{ label: t("checkin_energy_4", locale, {}), data: "checkin:energy:4" },
			{ label: t("checkin_energy_5", locale, {}), data: "checkin:energy:5" },
		],
		locale,
	);

	await ctx.reply(t("checkin_q_energy", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<number>(conversation, ctx, {
		validPrefixes: ["checkin:energy:"],
		parse: (data) => parseEnergyValue(parseCallbackValue(data)),
	});
}

export async function askSleepDuration(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = createGridKeyboard(
		[
			[
				{
					label: t("checkin_sleep_lt4", locale, {}),
					data: "checkin:sleep:lt4",
				},
				{
					label: t("checkin_sleep_4_5", locale, {}),
					data: "checkin:sleep:4_5",
				},
				{
					label: t("checkin_sleep_5_6", locale, {}),
					data: "checkin:sleep:5_6",
				},
			],
			[
				{
					label: t("checkin_sleep_6_7", locale, {}),
					data: "checkin:sleep:6_7",
				},
				{
					label: t("checkin_sleep_7_8", locale, {}),
					data: "checkin:sleep:7_8",
				},
				{
					label: t("checkin_sleep_8_9", locale, {}),
					data: "checkin:sleep:8_9",
				},
				{
					label: t("checkin_sleep_gt9", locale, {}),
					data: "checkin:sleep:gt9",
				},
			],
		],
		locale,
	);

	await ctx.reply(t("checkin_q_sleep_duration", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<number>(conversation, ctx, {
		validPrefixes: ["checkin:sleep:"],
		parse: (data) => parseSleepDurationValue(parseCallbackValue(data)),
	});
}

export async function askSleepQuality(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<SleepQuality | "cancelled"> {
	const keyboard = createHorizontalKeyboard(
		[
			{
				label: t("checkin_sleep_poor", locale, {}),
				data: "checkin:quality:POOR",
			},
			{
				label: t("checkin_sleep_fair", locale, {}),
				data: "checkin:quality:FAIR",
			},
			{
				label: t("checkin_sleep_good", locale, {}),
				data: "checkin:quality:GOOD",
			},
		],
		locale,
	);

	await ctx.reply(t("checkin_q_sleep_quality", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<SleepQuality>(conversation, ctx, {
		validPrefixes: ["checkin:quality:"],
		parse: (data) => parseSleepQualityValue(parseCallbackValue(data)),
	});
}

export async function askAnxiety(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = createVerticalKeyboard(
		[
			{ label: t("checkin_anxiety_0", locale, {}), data: "checkin:anxiety:0" },
			{ label: t("checkin_anxiety_1", locale, {}), data: "checkin:anxiety:1" },
			{ label: t("checkin_anxiety_2", locale, {}), data: "checkin:anxiety:2" },
			{ label: t("checkin_anxiety_3", locale, {}), data: "checkin:anxiety:3" },
		],
		locale,
	);

	await ctx.reply(t("checkin_q_anxiety", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<number>(conversation, ctx, {
		validPrefixes: ["checkin:anxiety:"],
		parse: (data) => parseAnxietyValue(parseCallbackValue(data)),
	});
}

export async function askIrritability(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<number | "cancelled"> {
	const keyboard = createVerticalKeyboard(
		[
			{
				label: t("checkin_irritability_0", locale, {}),
				data: "checkin:irritability:0",
			},
			{
				label: t("checkin_irritability_1", locale, {}),
				data: "checkin:irritability:1",
			},
			{
				label: t("checkin_irritability_2", locale, {}),
				data: "checkin:irritability:2",
			},
			{
				label: t("checkin_irritability_3", locale, {}),
				data: "checkin:irritability:3",
			},
		],
		locale,
	);

	await ctx.reply(t("checkin_q_irritability", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<number>(conversation, ctx, {
		validPrefixes: ["checkin:irritability:"],
		parse: (data) => parseIrritabilityValue(parseCallbackValue(data)),
	});
}

export async function askMedication(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<MedicationStatus | "cancelled"> {
	const keyboard = createVerticalKeyboard(
		[
			{ label: t("checkin_med_taken", locale, {}), data: "checkin:med:TAKEN" },
			{
				label: t("checkin_med_skipped", locale, {}),
				data: "checkin:med:SKIPPED",
			},
			{
				label: t("checkin_med_na", locale, {}),
				data: "checkin:med:NOT_APPLICABLE",
			},
		],
		locale,
	);

	await ctx.reply(t("checkin_q_medication", locale, {}), {
		reply_markup: keyboard,
	});

	return waitForCallback<MedicationStatus>(conversation, ctx, {
		validPrefixes: ["checkin:med:"],
		parse: (data) => parseMedicationValue(parseCallbackValue(data)),
	});
}

export async function askNote(
	conversation: BotConversation,
	ctx: ConversationContext,
	locale: Locale,
): Promise<string | null | "cancelled"> {
	const keyboard = new InlineKeyboard()
		.text(t("checkin_btn_add_note", locale, {}), CB.ADD_NOTE)
		.text(t("checkin_btn_skip", locale, {}), CB.SKIP_NOTE);

	addCancelButton(keyboard, locale);

	await ctx.reply(t("checkin_q_note", locale, {}), { reply_markup: keyboard });

	const result = await waitForCallback<string>(conversation, ctx, {
		validValues: [CB.ADD_NOTE, CB.SKIP_NOTE],
	});

	if (result === "cancelled") return "cancelled";
	if (result === CB.SKIP_NOTE) return null;

	const noteKeyboard = new InlineKeyboard()
		.text(t("checkin_btn_skip", locale, {}), CB.SKIP_NOTE)
		.text(t("checkin_btn_cancel", locale, {}), CB.CANCEL);

	await ctx.reply(t("checkin_q_note_prompt", locale, {}), {
		reply_markup: noteKeyboard,
	});

	const { noteMaxLength } = getCheckinConfig();

	while (true) {
		const response = await conversation.wait();

		if (!isExpectedUser(response, ctx)) {
			if (response.callbackQuery?.data) {
				await response.answerCallbackQuery();
			}
			continue;
		}

		if (response.callbackQuery?.data) {
			await response.answerCallbackQuery();
			if (response.callbackQuery.data === CB.CANCEL) {
				return "cancelled";
			}
			if (response.callbackQuery.data === CB.SKIP_NOTE) {
				return null;
			}
			continue;
		}

		const messageText = response.message?.text;
		if (!messageText) {
			continue;
		}

		const trimmed = messageText.trim();
		if (trimmed.length === 0) {
			continue;
		}

		const lowered = trimmed.toLowerCase();
		if (lowered === "/cancel") {
			return "cancelled";
		}
		if (lowered === "/skip") {
			return null;
		}

		if (trimmed.length > noteMaxLength) {
			await ctx.reply(
				t("checkin_note_too_long", locale, { limit: noteMaxLength }),
			);
			continue;
		}

		return trimmed;
	}
}

export async function askConfirmation(
	conversation: BotConversation,
	ctx: ConversationContext,
	state: {
		mood: number;
		energy: number;
		sleepDuration: number;
		sleepQuality: string;
		anxiety: number;
		irritability: number;
		medicationTaken: string;
		note: string | null;
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

	const response = await waitForCallback<string>(conversation, ctx, {
		validValues: [CB.SAVE, CB.CANCEL],
	});

	if (response === "cancelled") {
		return false;
	}

	return response === CB.SAVE;
}

export async function askExistingCheckin(
	conversation: BotConversation,
	ctx: ConversationContext,
	existing: {
		mood: number;
		energy: number;
		sleepDuration: number;
		sleepQuality: string;
		anxiety: number;
		irritability: number;
		medicationTaken: string;
		note: string | null;
	},
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

	const response = await waitForCallback<string>(conversation, ctx, {
		validValues: [CB.RECORD_NEW, CB.KEEP_CURRENT],
	});

	if (response === "cancelled") {
		return false;
	}

	return response === CB.RECORD_NEW;
}
