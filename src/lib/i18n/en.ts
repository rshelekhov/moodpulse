export const en = {
	start: ({ name }: { name: string }) =>
		`Hi, ${name}! I’m MoodPulse — a gentle self‑tracking diary for people living with bipolar disorder.\n\n` +
		`I’ll help you quickly log mood, energy, sleep, and key signals, so you can notice changes over time.\n\n` +
		`This isn’t a diagnosis or a substitute for care — it’s a supportive way to keep track. When you’re ready, type /checkin and we’ll begin.`,
	error_generic: (_: Record<string, never>) =>
		"Something went wrong on my side. I’ll try again, and you can repeat the command. If it keeps happening, please try a bit later.",
} as const;
