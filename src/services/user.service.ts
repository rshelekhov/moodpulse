import {
	deleteUserByTelegramId as deleteUserByTelegramIdRepo,
	upsertUserByTelegramId,
} from "../repositories/user.repository";

export type TelegramUserInput = {
	telegramId: number;
	username?: string;
	firstName?: string;
	lastName?: string;
	languageCode?: string;
};

export async function createOrUpdateUserFromTelegram(input: TelegramUserInput) {
	return upsertUserByTelegramId({
		telegramId: BigInt(input.telegramId),
		username: input.username,
		firstName: input.firstName,
		lastName: input.lastName,
		languageCode: input.languageCode,
	});
}

export async function deleteUserByTelegramId(
	telegramId: number,
): Promise<boolean> {
	const result = await deleteUserByTelegramIdRepo(BigInt(telegramId));
	return result.count > 0;
}
