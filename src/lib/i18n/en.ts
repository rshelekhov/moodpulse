export const en = {
	start: ({ name }: { name: string }) =>
		`Hi, ${name}! I'm MoodPulse — a gentle self‑tracking diary for people living with bipolar disorder.\n\n` +
		`I'll help you quickly log mood, energy, sleep, and key signals, so you can notice changes over time.\n\n` +
		`This isn't a diagnosis or a substitute for care — it's a supportive way to keep track. When you're ready, type /checkin and we'll begin.`,
	error_generic: (_: Record<string, never>) =>
		"Something went wrong on my side. I'll try again, and you can repeat the command. If it keeps happening, please try a bit later.",

	// ===== CHECKIN: Existing record found =====
	checkin_existing: ({
		mood,
		energy,
		sleepHours,
		sleepQuality,
		anxiety,
		irritability,
		medication,
		note,
	}: {
		mood: string;
		energy: string;
		sleepHours: string;
		sleepQuality: string;
		anxiety: string;
		irritability: string;
		medication: string;
		note: string | null;
	}) =>
		`You already have a check-in for today.\n\n` +
		`Mood: ${mood}\n` +
		`Energy: ${energy}\n` +
		`Sleep: ${sleepHours}h (${sleepQuality})\n` +
		`Anxiety: ${anxiety}\n` +
		`Irritability: ${irritability}\n` +
		`Medication: ${medication}` +
		`${note ? `\nNote: ${note}` : ""}\n\n` +
		`Would you like to record a new one?`,

	checkin_btn_record_new: (_: Record<string, never>) => "Record new",
	checkin_btn_keep_current: (_: Record<string, never>) => "Keep current",
	checkin_private_only: (_: Record<string, never>) =>
		"Please use this command in a private chat with me.",
	checkin_already_active: (_: Record<string, never>) =>
		"You already have a check-in in progress. Please finish it or tap Cancel.",

	// ===== CHECKIN: Questions =====
	checkin_q_mood: (_: Record<string, never>) =>
		`How is your mood right now?\n\n` +
		`−3 — low, depression\n` +
		` 0 — baseline, stable\n` +
		`+3 — elevated, mania`,

	checkin_q_energy: (_: Record<string, never>) => "What's your energy level?",
	checkin_q_sleep_duration: (_: Record<string, never>) =>
		"How many hours did you sleep?",
	checkin_q_sleep_quality: (_: Record<string, never>) =>
		"How was your sleep quality?",
	checkin_q_anxiety: (_: Record<string, never>) =>
		"Are you feeling any anxiety?",
	checkin_q_irritability: (_: Record<string, never>) => "Any irritability?",
	checkin_q_medication: (_: Record<string, never>) =>
		"Did you take your medication today?",
	checkin_q_note: (_: Record<string, never>) =>
		`Would you like to add a note?\n\n` +
		`You can record context, events of the day, triggers — anything you find relevant.`,
	checkin_q_note_prompt: (_: Record<string, never>) =>
		"Type your note, or tap Skip/Cancel.",
	checkin_note_too_long: ({ limit }: { limit: number }) =>
		`That note is too long (max ${limit} characters). Please shorten it.`,

	// ===== CHECKIN: Mood buttons =====
	checkin_mood_m3: (_: Record<string, never>) => "−3 depression",
	checkin_mood_m2: (_: Record<string, never>) => "−2",
	checkin_mood_m1: (_: Record<string, never>) => "−1",
	checkin_mood_0: (_: Record<string, never>) => "0 baseline",
	checkin_mood_p1: (_: Record<string, never>) => "+1",
	checkin_mood_p2: (_: Record<string, never>) => "+2",
	checkin_mood_p3: (_: Record<string, never>) => "+3 mania",

	// ===== CHECKIN: Energy buttons =====
	checkin_energy_1: (_: Record<string, never>) => "1 — very low",
	checkin_energy_2: (_: Record<string, never>) => "2 — low",
	checkin_energy_3: (_: Record<string, never>) => "3 — normal",
	checkin_energy_4: (_: Record<string, never>) => "4 — high",
	checkin_energy_5: (_: Record<string, never>) => "5 — excessive",

	// ===== CHECKIN: Sleep duration buttons =====
	checkin_sleep_lt4: (_: Record<string, never>) => "< 4h",
	checkin_sleep_4_5: (_: Record<string, never>) => "4-5h",
	checkin_sleep_5_6: (_: Record<string, never>) => "5-6h",
	checkin_sleep_6_7: (_: Record<string, never>) => "6-7h",
	checkin_sleep_7_8: (_: Record<string, never>) => "7-8h",
	checkin_sleep_8_9: (_: Record<string, never>) => "8-9h",
	checkin_sleep_gt9: (_: Record<string, never>) => "> 9h",

	// ===== CHECKIN: Sleep quality buttons =====
	checkin_sleep_poor: (_: Record<string, never>) => "Poor",
	checkin_sleep_fair: (_: Record<string, never>) => "Fair",
	checkin_sleep_good: (_: Record<string, never>) => "Good",

	// ===== CHECKIN: Anxiety buttons =====
	checkin_anxiety_0: (_: Record<string, never>) => "0 — none",
	checkin_anxiety_1: (_: Record<string, never>) => "1 — mild",
	checkin_anxiety_2: (_: Record<string, never>) => "2 — moderate",
	checkin_anxiety_3: (_: Record<string, never>) => "3 — severe",

	// ===== CHECKIN: Irritability buttons =====
	checkin_irritability_0: (_: Record<string, never>) => "0 — none",
	checkin_irritability_1: (_: Record<string, never>) => "1 — mild",
	checkin_irritability_2: (_: Record<string, never>) => "2 — moderate",
	checkin_irritability_3: (_: Record<string, never>) => "3 — severe",

	// ===== CHECKIN: Medication buttons =====
	checkin_med_taken: (_: Record<string, never>) => "Yes, taken",
	checkin_med_skipped: (_: Record<string, never>) => "Skipped",
	checkin_med_na: (_: Record<string, never>) => "Not applicable",

	// ===== CHECKIN: Note buttons =====
	checkin_btn_add_note: (_: Record<string, never>) => "Add note",
	checkin_btn_skip: (_: Record<string, never>) => "Skip",

	// ===== CHECKIN: Confirmation =====
	checkin_summary: ({
		mood,
		energy,
		sleepHours,
		sleepQuality,
		anxiety,
		irritability,
		medication,
		note,
	}: {
		mood: string;
		energy: string;
		sleepHours: string;
		sleepQuality: string;
		anxiety: string;
		irritability: string;
		medication: string;
		note: string | null;
	}) =>
		`Please review:\n\n` +
		`Mood: ${mood}\n` +
		`Energy: ${energy}\n` +
		`Sleep: ${sleepHours}h (${sleepQuality})\n` +
		`Anxiety: ${anxiety}\n` +
		`Irritability: ${irritability}\n` +
		`Medication: ${medication}\n` +
		`${note ? `Note: ${note}` : "Note: —"}\n\n` +
		`Is this correct?`,

	checkin_btn_save: (_: Record<string, never>) => "Save",
	checkin_btn_cancel: (_: Record<string, never>) => "Cancel",

	// ===== CHECKIN: Result messages =====
	checkin_saved: (_: Record<string, never>) =>
		"Recorded. Thank you for tracking your well-being.",
	checkin_cancelled: (_: Record<string, never>) => "Check-in cancelled.",
	checkin_kept: (_: Record<string, never>) => "Okay, keeping the current one.",

	// ===== CHECKIN: Display formatters =====
	checkin_display_mood: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			[-3]: "−3 (depression)",
			[-2]: "−2",
			[-1]: "−1",
			0: "0 (baseline)",
			1: "+1",
			2: "+2",
			3: "+3 (mania)",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_energy: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			1: "very low",
			2: "low",
			3: "normal",
			4: "high",
			5: "excessive",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_sleep_quality: ({ value }: { value: string }) => {
		const labels: Record<string, string> = {
			POOR: "poor",
			FAIR: "fair",
			GOOD: "good",
		};
		return labels[value] ?? value;
	},

	checkin_display_anxiety: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			0: "none",
			1: "mild",
			2: "moderate",
			3: "severe",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_irritability: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			0: "none",
			1: "mild",
			2: "moderate",
			3: "severe",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_medication: ({ value }: { value: string }) => {
		const labels: Record<string, string> = {
			TAKEN: "taken",
			SKIPPED: "skipped",
			NOT_APPLICABLE: "n/a",
		};
		return labels[value] ?? value;
	},
} as const;
