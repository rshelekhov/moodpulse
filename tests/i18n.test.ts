import { describe, expect, test } from "bun:test";
import { t } from "../src/lib/i18n";
import { en } from "../src/lib/i18n/en";
import { ru } from "../src/lib/i18n/ru";

describe("i18n", () => {
	test("en has the same keys as ru", () => {
		const ruKeys = Object.keys(ru).sort();
		const enKeys = Object.keys(en).sort();
		expect(enKeys).toEqual(ruKeys);
	});

	test("t returns strings for both locales", () => {
		const ruText = t("start", "ru", { name: "Alex" });
		const enText = t("start", "en", { name: "Alex" });
		expect(ruText).toBeTypeOf("string");
		expect(enText).toBeTypeOf("string");
		expect(ruText.length).toBeGreaterThan(0);
		expect(enText.length).toBeGreaterThan(0);
	});

	test("normalize texts are different for ru and en", () => {
		const ruText = t("start", "ru", { name: "Alex" });
		const enText = t("start", "en", { name: "Alex" });
		expect(ruText).not.toEqual(enText);
	});
});
