import type { RuleInput, RuleMatch } from "./types";

const WINDOWS: Record<string, number> = { HIGH: 2, MEDIUM: 3, LOW: 4 };

export function evaluateMoodDowntrend(input: RuleInput): RuleMatch {
	const { checkins, sensitivity } = input;
	const window = WINDOWS[sensitivity];
	if (!window || checkins.length < window) return null;

	const recent = checkins.slice(-window);

	for (let i = 1; i < recent.length; i++) {
		const prev = recent.at(i - 1);
		const curr = recent.at(i);
		if (!prev || !curr) return null;
		if (curr.mood >= prev.mood) return null;
	}

	const first = recent.at(0);
	const last = recent.at(-1);
	if (!first || !last) return null;

	return {
		ruleId: "mood_downtrend",
		details: {
			days: window,
			fromMood: first.mood,
			toMood: last.mood,
		},
	};
}
