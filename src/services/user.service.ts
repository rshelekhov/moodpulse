import { upsertUserByTelegramId } from "../repositories/user.repository";

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
