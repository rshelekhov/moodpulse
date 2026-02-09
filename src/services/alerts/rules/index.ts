import { evaluateIrritabilityEnergy } from "./irritability-energy";
import { evaluateMissedMeds } from "./missed-meds";
import { evaluateMoodDowntrend } from "./mood-downtrend";
import { evaluateMoodSwing } from "./mood-swing";
import { evaluateSleepEnergy } from "./sleep-energy";
import type { RuleInput, RuleMatch } from "./types";

export type { RuleInput, RuleMatch };

export const ALL_RULES = [
	{ id: "sleep_energy", evaluate: evaluateSleepEnergy },
	{ id: "missed_meds", evaluate: evaluateMissedMeds },
	{ id: "mood_swing", evaluate: evaluateMoodSwing },
	{ id: "mood_downtrend", evaluate: evaluateMoodDowntrend },
	{ id: "irritability_energy", evaluate: evaluateIrritabilityEnergy },
] as const;
