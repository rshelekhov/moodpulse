import type { RuleInput, RuleMatch } from "./types";

const WINDOWS: Record<string, number> = { HIGH: 2, MEDIUM: 3, LOW: 4 };

export function evaluateIrritabilityEnergy(input: RuleInput): RuleMatch {
	const { checkins, sensitivity } = input;
	const window = WINDOWS[sensitivity];
	if (!window || checkins.length < window) return null;

	const recent = checkins.slice(-window);

	const allMatch = recent.every((c) => c.irritability >= 2 && c.energy >= 4);
	if (!allMatch) return null;

	const irritabilities = recent.map((c) => c.irritability);
	const energies = recent.map((c) => c.energy);

	return {
		ruleId: "irritability_energy",
		details: {
			days: window,
			irritabilityInfo: `${Math.min(...irritabilities)}–${Math.max(...irritabilities)}`,
			energyInfo: `${Math.min(...energies)}–${Math.max(...energies)}`,
		},
	};
}
