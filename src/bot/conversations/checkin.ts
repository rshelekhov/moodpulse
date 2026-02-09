import type { MedicationStatus, SleepQuality } from "@prisma/client";
import { normalizeLocale, t } from "../../lib/i18n";
import { createChildLogger } from "../../lib/logger";
import { analyzeAfterCheckin } from "../../services/alerts/analysis.service";
import {
	type CheckinData,
	getTodayCheckin,
	saveCheckin,
} from "../../services/checkin.service";
import { createOrUpdateUserFromTelegram } from "../../services/user.service";
import type { BotConversation, ConversationContext } from "../context";
import {
	askAnxiety,
	askConfirmation,
	askEnergy,
	askExistingCheckin,
	askIrritability,
	askMedication,
	askMood,
	askNote,
	askSleepDuration,
	askSleepQuality,
} from "./checkin.questions";

const logger = createChildLogger("bot.checkin");

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
	targetDate?: string,
): Promise<void> {
	const telegramId = ctx.from?.id;
	if (!telegramId) {
		logger.warn("Checkin conversation started without user ID");
		return;
	}

	const locale = normalizeLocale(ctx.from?.language_code);

	if (ctx.chat?.type !== "private") {
		await ctx.reply(t("checkin_private_only", locale, {}));
		return;
	}

	const state: CheckinState = {};

	await conversation.external(async () => {
		logger.info({ telegramId, targetDate }, "Checkin conversation started");
		await createOrUpdateUserFromTelegram({
			telegramId,
			username: ctx.from?.username,
			firstName: ctx.from?.first_name,
			lastName: ctx.from?.last_name,
			languageCode: ctx.from?.language_code,
		});
		return null;
	});

	const existingCheckin = await conversation.external(() =>
		getTodayCheckin(telegramId, new Date(), targetDate),
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
		saveCheckin(
			telegramId,
			state as CheckinData,
			state.existingCheckinId,
			new Date(),
			targetDate,
		),
	);

	await ctx.reply(t("checkin_saved", locale, {}));
	logger.info({ telegramId }, "Checkin saved successfully");

	const alerts = await conversation.external(() =>
		analyzeAfterCheckin(telegramId, locale),
	);
	for (const alert of alerts) {
		await ctx.reply(alert.text);
	}
}
