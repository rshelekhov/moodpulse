import type { RuleInput, RuleMatch } from "./types";

const THRESHOLDS: Record<string, number> = { HIGH: 2, MEDIUM: 3, LOW: 4 };

export function evaluateMoodSwing(input: RuleInput): RuleMatch {
	const { checkins, sensitivity } = input;
	if (checkins.length < 2) return null;

	const threshold = THRESHOLDS[sensitivity];
	if (!threshold) return null;

	const recent = checkins.slice(-3);
	for (let i = 1; i < recent.length; i++) {
		const prev = recent.at(i - 1);
		const curr = recent.at(i);
		if (!prev || !curr) continue;

		const diff = Math.abs(curr.mood - prev.mood);
		if (diff >= threshold) {
			return {
				ruleId: "mood_swing",
				details: {
					diff,
					fromMood: prev.mood,
					toMood: curr.mood,
					days: 1,
				},
			};
		}
	}

	return null;
}
