export const ru = {
	start: ({ name }: { name: string }) =>
		`Привет, ${name}! Я MoodPulse — тёплый дневник самонаблюдения для людей с БАР.\n\n` +
		`Я помогу быстро отмечать настроение, энергию, сон и важные сигналы, чтобы мягко замечать изменения во времени.\n\n` +
		`Это не диагностика и не замена врача, а удобный способ бережно следить за собой. Когда будешь готов(а), напиши /checkin и начнём.`,
	error_generic: (_: Record<string, never>) =>
		"Похоже, что-то пошло не так. Я попробую снова, а ты можешь повторить команду. Если проблема повторится, напиши чуть позже.",

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
		`Ты уже делал чек-ин сегодня.\n\n` +
		`Настроение: ${mood}\n` +
		`Энергия: ${energy}\n` +
		`Сон: ${sleepHours}ч (${sleepQuality})\n` +
		`Тревога: ${anxiety}\n` +
		`Раздражительность: ${irritability}\n` +
		`Лекарства: ${medication}` +
		`${note ? `\nЗаметка: ${note}` : ""}\n\n` +
		`Хочешь записать новый?`,

	checkin_btn_record_new: (_: Record<string, never>) => "Записать новый",
	checkin_btn_keep_current: (_: Record<string, never>) => "Оставить как есть",
	checkin_private_only: (_: Record<string, never>) =>
		"Эта команда работает только в личном чате со мной.",
	checkin_already_active: (_: Record<string, never>) =>
		"У тебя уже есть активный чек-ин. Заверши его или нажми «Отмена».",

	// ===== CHECKIN: Questions =====
	checkin_q_mood: (_: Record<string, never>) =>
		`Как твоё настроение сейчас?\n\n` +
		`−3 — тяжело, депрессия\n` +
		` 0 — нормальное состояние\n` +
		`+3 — приподнятое, мания`,

	checkin_q_energy: (_: Record<string, never>) =>
		"Какой у тебя уровень энергии?",
	checkin_q_sleep_duration: (_: Record<string, never>) =>
		"Сколько часов ты спал?",
	checkin_q_sleep_quality: (_: Record<string, never>) =>
		"Как оценишь качество сна?",
	checkin_q_anxiety: (_: Record<string, never>) => "Ощущаешь тревогу?",
	checkin_q_irritability: (_: Record<string, never>) => "Раздражительность?",
	checkin_q_medication: (_: Record<string, never>) =>
		"Принял лекарства сегодня?",
	checkin_q_note: (_: Record<string, never>) =>
		`Хочешь добавить заметку?\n\n` +
		`Можешь записать контекст, события дня, триггеры — всё, что считаешь важным.`,
	checkin_q_note_prompt: (_: Record<string, never>) =>
		"Напиши заметку текстом или нажми «Пропустить/Отмена».",
	checkin_note_too_long: ({ limit }: { limit: number }) =>
		`Заметка слишком длинная (макс. ${limit} символов). Сократи, пожалуйста.`,

	// ===== CHECKIN: Mood buttons =====
	checkin_mood_m3: (_: Record<string, never>) => "−3 депрессия",
	checkin_mood_m2: (_: Record<string, never>) => "−2",
	checkin_mood_m1: (_: Record<string, never>) => "−1",
	checkin_mood_0: (_: Record<string, never>) => "0 норма",
	checkin_mood_p1: (_: Record<string, never>) => "+1",
	checkin_mood_p2: (_: Record<string, never>) => "+2",
	checkin_mood_p3: (_: Record<string, never>) => "+3 мания",

	// ===== CHECKIN: Energy buttons =====
	checkin_energy_1: (_: Record<string, never>) => "1 — очень низкая",
	checkin_energy_2: (_: Record<string, never>) => "2 — низкая",
	checkin_energy_3: (_: Record<string, never>) => "3 — обычная",
	checkin_energy_4: (_: Record<string, never>) => "4 — высокая",
	checkin_energy_5: (_: Record<string, never>) => "5 — чрезмерная",

	// ===== CHECKIN: Sleep duration buttons =====
	checkin_sleep_lt4: (_: Record<string, never>) => "< 4ч",
	checkin_sleep_4_5: (_: Record<string, never>) => "4-5ч",
	checkin_sleep_5_6: (_: Record<string, never>) => "5-6ч",
	checkin_sleep_6_7: (_: Record<string, never>) => "6-7ч",
	checkin_sleep_7_8: (_: Record<string, never>) => "7-8ч",
	checkin_sleep_8_9: (_: Record<string, never>) => "8-9ч",
	checkin_sleep_gt9: (_: Record<string, never>) => "> 9ч",

	// ===== CHECKIN: Sleep quality buttons =====
	checkin_sleep_poor: (_: Record<string, never>) => "Плохое",
	checkin_sleep_fair: (_: Record<string, never>) => "Нормальное",
	checkin_sleep_good: (_: Record<string, never>) => "Хорошее",

	// ===== CHECKIN: Anxiety buttons =====
	checkin_anxiety_0: (_: Record<string, never>) => "0 — нет",
	checkin_anxiety_1: (_: Record<string, never>) => "1 — лёгкая",
	checkin_anxiety_2: (_: Record<string, never>) => "2 — умеренная",
	checkin_anxiety_3: (_: Record<string, never>) => "3 — сильная",

	// ===== CHECKIN: Irritability buttons =====
	checkin_irritability_0: (_: Record<string, never>) => "0 — нет",
	checkin_irritability_1: (_: Record<string, never>) => "1 — лёгкая",
	checkin_irritability_2: (_: Record<string, never>) => "2 — умеренная",
	checkin_irritability_3: (_: Record<string, never>) => "3 — сильная",

	// ===== CHECKIN: Medication buttons =====
	checkin_med_taken: (_: Record<string, never>) => "Да, принял",
	checkin_med_skipped: (_: Record<string, never>) => "Пропустил",
	checkin_med_na: (_: Record<string, never>) => "Не принимаю",

	// ===== CHECKIN: Note buttons =====
	checkin_btn_add_note: (_: Record<string, never>) => "Добавить заметку",
	checkin_btn_skip: (_: Record<string, never>) => "Пропустить",

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
		`Проверь данные:\n\n` +
		`Настроение: ${mood}\n` +
		`Энергия: ${energy}\n` +
		`Сон: ${sleepHours}ч (${sleepQuality})\n` +
		`Тревога: ${anxiety}\n` +
		`Раздражительность: ${irritability}\n` +
		`Лекарства: ${medication}\n` +
		`${note ? `Заметка: ${note}` : "Заметка: —"}\n\n` +
		`Всё верно?`,

	checkin_btn_save: (_: Record<string, never>) => "Сохранить",
	checkin_btn_cancel: (_: Record<string, never>) => "Отмена",

	// ===== CHECKIN: Result messages =====
	checkin_saved: (_: Record<string, never>) =>
		"Записано. Спасибо, что следишь за своим состоянием.",
	checkin_cancelled: (_: Record<string, never>) => "Чек-ин отменён.",
	checkin_kept: (_: Record<string, never>) => "Хорошо, оставляем как есть.",

	// ===== CHECKIN: Display formatters =====
	// These functions format raw values into human-readable strings
	checkin_display_mood: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			[-3]: "−3 (депрессия)",
			[-2]: "−2",
			[-1]: "−1",
			0: "0 (норма)",
			1: "+1",
			2: "+2",
			3: "+3 (мания)",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_energy: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			1: "очень низкая",
			2: "низкая",
			3: "обычная",
			4: "высокая",
			5: "чрезмерная",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_sleep_quality: ({ value }: { value: string }) => {
		const labels: Record<string, string> = {
			POOR: "плохое",
			FAIR: "нормальное",
			GOOD: "хорошее",
		};
		return labels[value] ?? value;
	},

	checkin_display_anxiety: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			0: "нет",
			1: "лёгкая",
			2: "умеренная",
			3: "сильная",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_irritability: ({ value }: { value: number }) => {
		const labels: Record<number, string> = {
			0: "нет",
			1: "лёгкая",
			2: "умеренная",
			3: "сильная",
		};
		return labels[value] ?? String(value);
	},

	checkin_display_medication: ({ value }: { value: string }) => {
		const labels: Record<string, string> = {
			TAKEN: "принял",
			SKIPPED: "пропустил",
			NOT_APPLICABLE: "не принимаю",
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
		`Твой чек-ин за сегодня:\n\n` +
		`Настроение: ${mood}\n` +
		`Энергия: ${energy}\n` +
		`Сон: ${sleepHours}ч (${sleepQuality})\n` +
		`Тревога: ${anxiety}\n` +
		`Раздражительность: ${irritability}\n` +
		`Лекарства: ${medication}` +
		`${note ? `\nЗаметка: ${note}` : ""}`,

	today_no_checkin: (_: Record<string, never>) =>
		"Сегодня ещё нет чек-ина. Хочешь записать?",

	today_btn_checkin: (_: Record<string, never>) => "Записать чек-ин",
} as const;
