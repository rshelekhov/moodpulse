import { en } from "./en";
import { ru } from "./ru";

export type Locale = "ru" | "en";

export function normalizeLocale(languageCode?: string): Locale {
	if (!languageCode) return "ru";
	const code = languageCode.toLowerCase();
	if (code.startsWith("ru")) return "ru";
	return "en";
}

// This is the single source of truth for message keys.
type Messages = typeof ru;

export type MessageKey = keyof Messages;
export type MessageParams<K extends MessageKey> = Parameters<Messages[K]>[0];

const messages: Record<Locale, Messages> = {
	ru,
	// Ensure EN has the same keys as RU at compile time.
	en: en satisfies Messages,
};

export function createTranslator(customMessages: Record<Locale, Messages>) {
	return function t<K extends MessageKey>(
		key: K,
		locale: Locale,
		params: MessageParams<K>,
	): string {
		const primary = customMessages[locale][key] as Messages[K] | undefined;
		const fallback = customMessages.ru[key] as Messages[K] | undefined;
		const fn = (primary ?? fallback) as
			| ((p: MessageParams<K>) => string)
			| undefined;
		if (!fn) {
			throw new Error(`Missing i18n message: ${String(key)}`);
		}
		return fn(params);
	};
}

export const t = createTranslator(messages);
