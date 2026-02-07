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
	// ===== TODAY: Show today's check-in =====
	today_checkin: ({
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
		`Your check-in for today:\n\n` +
		`Mood: ${mood}\n` +
		`Energy: ${energy}\n` +
		`Sleep: ${sleepHours}h (${sleepQuality})\n` +
		`Anxiety: ${anxiety}\n` +
		`Irritability: ${irritability}\n` +
		`Medication: ${medication}` +
		`${note ? `\nNote: ${note}` : ""}`,

	today_no_checkin: (_: Record<string, never>) =>
		"No check-in recorded today yet. Would you like to log one?",

	today_btn_checkin: (_: Record<string, never>) => "Record check-in",

	// ===== TREND =====
	trend_rising: (_: Record<string, never>) => "↗ rising",
	trend_falling: (_: Record<string, never>) => "↘ falling",
	trend_stable: (_: Record<string, never>) => "→ stable",
	trend_insufficient: (_: Record<string, never>) => "— insufficient data",

	// ===== HISTORY =====
	history_title: (_: Record<string, never>) => "📋 Check-in history",
	history_empty: (_: Record<string, never>) =>
		"No records yet. Make your first check-in with /checkin",
	history_entry: ({
		date,
		mood,
		energy,
		sleepHours,
		anxiety,
		irritability,
		medication,
		note,
	}: {
		date: string;
		mood: string;
		energy: string;
		sleepHours: string;
		anxiety: string;
		irritability: string;
		medication: string;
		note: string | null;
	}) =>
		`📅 ${date}\n` +
		`Mood: ${mood}\n` +
		`Energy: ${energy}\n` +
		`Sleep: ${sleepHours}h\n` +
		`Anxiety: ${anxiety}\n` +
		`Irritability: ${irritability}\n` +
		`Medication: ${medication}` +
		`${note ? `\n💬 ${note}` : ""}`,
	history_btn_prev: (_: Record<string, never>) => "← Previous",
	history_btn_next: (_: Record<string, never>) => "Next →",

	// ===== WEEK =====
	week_title: ({
		startDate,
		endDate,
	}: {
		startDate: string;
		endDate: string;
	}) => `📊 Week: ${startDate} — ${endDate}`,
	week_stats: ({
		records,
		totalDays,
		avgMood,
		avgEnergy,
		avgSleep,
		avgAnxiety,
		avgIrritability,
		trend,
	}: {
		records: number;
		totalDays: number;
		avgMood: string;
		avgEnergy: string;
		avgSleep: string;
		avgAnxiety: string;
		avgIrritability: string;
		trend: string;
	}) =>
		`Records: ${records}/${totalDays}\n\n` +
		`Mood (avg): ${avgMood}\n` +
		`Energy (avg): ${avgEnergy}\n` +
		`Sleep (avg): ${avgSleep}h\n` +
		`Anxiety (avg): ${avgAnxiety}\n` +
		`Irritability (avg): ${avgIrritability}\n\n` +
		`Mood trend: ${trend}`,
	week_no_data: (_: Record<string, never>) => "No check-ins this week.",
	week_btn_prev: (_: Record<string, never>) => "← Prev week",
	week_btn_next: (_: Record<string, never>) => "Next week →",

	// ===== MONTH =====
	month_title: ({ monthName, year }: { monthName: string; year: number }) =>
		`📅 ${monthName} ${year}`,
	month_stats: ({
		records,
		totalDays,
		avgMood,
		avgEnergy,
		avgSleep,
		avgAnxiety,
		avgIrritability,
		trend,
	}: {
		records: number;
		totalDays: number;
		avgMood: string;
		avgEnergy: string;
		avgSleep: string;
		avgAnxiety: string;
		avgIrritability: string;
		trend: string;
	}) =>
		`Records: ${records}/${totalDays}\n\n` +
		`Mood (avg): ${avgMood}\n` +
		`Energy (avg): ${avgEnergy}\n` +
		`Sleep (avg): ${avgSleep}h\n` +
		`Anxiety (avg): ${avgAnxiety}\n` +
		`Irritability (avg): ${avgIrritability}\n\n` +
		`Mood trend: ${trend}`,
	month_no_data: (_: Record<string, never>) => "No check-ins this month.",
	month_btn_prev: (_: Record<string, never>) => "← Prev",
	month_btn_next: (_: Record<string, never>) => "Next →",
	month_btn_back: (_: Record<string, never>) => "← Back to calendar",
	month_day_checkin: ({
		date,
		mood,
		energy,
		sleepHours,
		sleepQuality,
		anxiety,
		irritability,
		medication,
		note,
	}: {
		date: string;
		mood: string;
		energy: string;
		sleepHours: string;
		sleepQuality: string;
		anxiety: string;
		irritability: string;
		medication: string;
		note: string | null;
	}) =>
		`📅 ${date}\n\n` +
		`Mood: ${mood}\n` +
		`Energy: ${energy}\n` +
		`Sleep: ${sleepHours}h (${sleepQuality})\n` +
		`Anxiety: ${anxiety}\n` +
		`Irritability: ${irritability}\n` +
		`Medication: ${medication}` +
		`${note ? `\nNote: ${note}` : ""}`,
	month_day_no_checkin: ({ date }: { date: string }) =>
		`📅 ${date}\n\nNo check-in recorded on this day.`,
	month_day_btn_record: (_: Record<string, never>) => "Record check-in",
	month_day_btn_overwrite: (_: Record<string, never>) => "Overwrite check-in",

	// ===== REMINDER SETTINGS =====
	reminder_title: (_: Record<string, never>) => "Reminder settings",
	reminder_status: ({
		enabled,
		time,
		timezone,
	}: {
		enabled: boolean;
		time: string;
		timezone: string;
	}) =>
		`Reminders: ${enabled ? "on" : "off"}\n` +
		`Time: ${time}\n` +
		`Timezone: ${timezone}`,
	reminder_enabled: (_: Record<string, never>) => "Reminders enabled.",
	reminder_disabled: (_: Record<string, never>) => "Reminders disabled.",
	reminder_time_updated: ({ time }: { time: string }) =>
		`Reminder time set to ${time}`,
	reminder_select_time: (_: Record<string, never>) => "Choose a reminder time:",
	reminder_enter_custom_time: (_: Record<string, never>) =>
		"Enter time in HH:MM format (24-hour):",
	reminder_invalid_time: (_: Record<string, never>) =>
		"Invalid format. Please enter time as HH:MM, e.g. 21:00",
	reminder_tz_required: (_: Record<string, never>) =>
		"You need to set your timezone first.\nPlease choose your timezone:",
	reminder_btn_enable: (_: Record<string, never>) => "Enable reminders",
	reminder_btn_disable: (_: Record<string, never>) => "Disable reminders",
	reminder_btn_change_time: (_: Record<string, never>) => "Change time",
	reminder_btn_change_tz: (_: Record<string, never>) => "Change timezone",
	reminder_btn_custom_time: (_: Record<string, never>) => "Other time",

	// ===== REMINDER NOTIFICATION =====
	reminder_message: (_: Record<string, never>) =>
		"Hi! Time for your daily check-in. How are you today?",
	reminder_btn_start_checkin: (_: Record<string, never>) => "Record check-in",
	reminder_btn_snooze_30: (_: Record<string, never>) => "In 30 min",
	reminder_btn_snooze_60: (_: Record<string, never>) => "In 1 hour",
	reminder_btn_snooze_120: (_: Record<string, never>) => "In 2 hours",
	reminder_btn_skip_today: (_: Record<string, never>) => "Skip today",
	reminder_snoozed: ({ minutes }: { minutes: number }) =>
		`Got it, I'll remind you in ${minutes} min.`,
	reminder_skipped: (_: Record<string, never>) => "Okay, no reminder today.",

	// ===== TIMEZONE =====
	timezone_title: (_: Record<string, never>) => "Choose your timezone",
	timezone_current: ({ timezone }: { timezone: string }) =>
		`Current timezone: ${timezone}`,
	timezone_updated: ({ timezone }: { timezone: string }) =>
		`Timezone set to ${timezone}`,
	timezone_btn_moscow: (_: Record<string, never>) => "Moscow (UTC+3)",
	timezone_btn_kaliningrad: (_: Record<string, never>) => "Kaliningrad (UTC+2)",
	timezone_btn_samara: (_: Record<string, never>) => "Samara (UTC+4)",
	timezone_btn_yekaterinburg: (_: Record<string, never>) =>
		"Yekaterinburg (UTC+5)",
	timezone_btn_novosibirsk: (_: Record<string, never>) => "Novosibirsk (UTC+7)",
	timezone_btn_krasnoyarsk: (_: Record<string, never>) => "Krasnoyarsk (UTC+7)",
	timezone_btn_vladivostok: (_: Record<string, never>) =>
		"Vladivostok (UTC+10)",
	timezone_btn_kyiv: (_: Record<string, never>) => "Kyiv (UTC+2/+3)",
	timezone_btn_minsk: (_: Record<string, never>) => "Minsk (UTC+3)",
	timezone_btn_london: (_: Record<string, never>) => "London (UTC+0/+1)",
	timezone_btn_berlin: (_: Record<string, never>) => "Berlin (UTC+1/+2)",
	timezone_btn_new_york: (_: Record<string, never>) => "New York (UTC-5/-4)",
	timezone_btn_other: (_: Record<string, never>) => "Other (enter manually)",
	timezone_enter_custom: (_: Record<string, never>) =>
		"Enter an IANA timezone name (e.g. Asia/Tokyo, America/Chicago):",
	timezone_invalid: (_: Record<string, never>) =>
		"Invalid timezone. Please try again. Examples: Europe/Moscow, Asia/Tokyo",
} as const;
