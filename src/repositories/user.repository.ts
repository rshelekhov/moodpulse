import { prisma } from "../infrastructure/database";

export type UpsertUserInput = {
	telegramId: bigint;
	username?: string | null | undefined;
	firstName?: string | null | undefined;
	lastName?: string | null | undefined;
	languageCode?: string | null | undefined;
};

export async function upsertUserByTelegramId(input: UpsertUserInput) {
	const updateData: {
		username?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		languageCode?: string | null;
	} = {};

	if (input.username !== undefined) updateData.username = input.username;
	if (input.firstName !== undefined) updateData.firstName = input.firstName;
	if (input.lastName !== undefined) updateData.lastName = input.lastName;
	if (input.languageCode !== undefined)
		updateData.languageCode = input.languageCode;

	return prisma.user.upsert({
		where: { telegramId: input.telegramId },
		create: {
			telegramId: input.telegramId,
			username: input.username ?? null,
			firstName: input.firstName ?? null,
			lastName: input.lastName ?? null,
			languageCode: input.languageCode ?? null,
		},
		update: updateData,
	});
}
