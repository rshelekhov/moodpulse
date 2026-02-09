import type { RuleInput, RuleMatch } from "./types";

const THRESHOLDS: Record<string, number> = { HIGH: 2, MEDIUM: 3, LOW: 4 };

export function evaluateMissedMeds(input: RuleInput): RuleMatch {
	const { checkins, sensitivity, takingMedications } = input;
	if (!takingMedications) return null;

	const threshold = THRESHOLDS[sensitivity];
	if (!threshold) return null;

	const last7 = checkins.slice(-7);
	const skippedCount = last7.filter(
		(c) => c.medicationTaken === "SKIPPED",
	).length;

	if (skippedCount < threshold) return null;

	return {
		ruleId: "missed_meds",
		details: { count: skippedCount },
	};
}
