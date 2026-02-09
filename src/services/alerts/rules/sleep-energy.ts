import type { RuleInput, RuleMatch } from "./types";

const WINDOWS: Record<string, number> = { HIGH: 2, MEDIUM: 3, LOW: 4 };

export function evaluateSleepEnergy(input: RuleInput): RuleMatch {
	const { checkins, sensitivity } = input;
	const window = WINDOWS[sensitivity];
	if (!window || checkins.length < window) return null;

	const recent = checkins.slice(-window);

	const allMatch = recent.every((c) => c.sleepDuration < 6 && c.energy >= 4);
	if (!allMatch) return null;

	const sleeps = recent.map((c) => c.sleepDuration);
	const energies = recent.map((c) => c.energy);

	return {
		ruleId: "sleep_energy",
		details: {
			days: window,
			sleepInfo: `${Math.min(...sleeps)}–${Math.max(...sleeps)}h`,
			energyInfo: `${Math.min(...energies)}–${Math.max(...energies)}`,
		},
	};
}
