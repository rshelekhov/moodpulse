import type { AlertSensitivity, Checkin } from "@prisma/client";

export type RuleInput = {
	checkins: Checkin[];
	sensitivity: AlertSensitivity;
	takingMedications: boolean;
};

export type RuleMatch = {
	ruleId: string;
	details: Record<string, string | number>;
} | null;
