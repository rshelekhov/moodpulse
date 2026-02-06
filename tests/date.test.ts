import { describe, expect, test } from "bun:test";
import { getLocalDateKey } from "../src/lib/date";

describe("getLocalDateKey", () => {
	test("uses the provided timezone", () => {
		const date = new Date("2026-02-05T01:30:00Z");
		expect(getLocalDateKey(date, "America/Los_Angeles")).toBe("2026-02-04");
		expect(getLocalDateKey(date, "Asia/Tokyo")).toBe("2026-02-05");
	});

	test("falls back to UTC on invalid timezone", () => {
		const date = new Date("2026-02-05T01:30:00Z");
		expect(getLocalDateKey(date, "Invalid/Zone")).toBe("2026-02-05");
	});
});
