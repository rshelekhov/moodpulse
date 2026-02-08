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

	// ===== TREND =====
	trend_rising: (_: Record<string, never>) => "↗ растёт",
	trend_falling: (_: Record<string, never>) => "↘ снижается",
	trend_stable: (_: Record<string, never>) => "→ стабильно",
	trend_insufficient: (_: Record<string, never>) => "— мало данных",

	// ===== HISTORY =====
	history_title: (_: Record<string, never>) => "📋 История чек-инов",
	history_empty: (_: Record<string, never>) =>
		"Пока нет записей. Сделай первый чек-ин командой /checkin",
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
		`Настроение: ${mood}\n` +
		`Энергия: ${energy}\n` +
		`Сон: ${sleepHours}ч\n` +
		`Тревога: ${anxiety}\n` +
		`Раздражительность: ${irritability}\n` +
		`Лекарства: ${medication}` +
		`${note ? `\n💬 ${note}` : ""}`,
	history_btn_prev: (_: Record<string, never>) => "← Предыдущие",
	history_btn_next: (_: Record<string, never>) => "Следующие →",

	// ===== WEEK =====
	week_title: ({
		startDate,
		endDate,
	}: {
		startDate: string;
		endDate: string;
	}) => `📊 Неделя: ${startDate} — ${endDate}`,
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
		`Записей: ${records}/${totalDays}\n\n` +
		`Настроение (ср): ${avgMood}\n` +
		`Энергия (ср): ${avgEnergy}\n` +
		`Сон (ср): ${avgSleep}ч\n` +
		`Тревога (ср): ${avgAnxiety}\n` +
		`Раздражительность (ср): ${avgIrritability}\n\n` +
		`Тренд настроения: ${trend}`,
	week_no_data: (_: Record<string, never>) => "Нет чек-инов за эту неделю.",
	week_btn_prev: (_: Record<string, never>) => "← Пред. неделя",
	week_btn_next: (_: Record<string, never>) => "След. неделя →",

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
		`Записей: ${records}/${totalDays}\n\n` +
		`Настроение (ср): ${avgMood}\n` +
		`Энергия (ср): ${avgEnergy}\n` +
		`Сон (ср): ${avgSleep}ч\n` +
		`Тревога (ср): ${avgAnxiety}\n` +
		`Раздражительность (ср): ${avgIrritability}\n\n` +
		`Тренд настроения: ${trend}`,
	month_no_data: (_: Record<string, never>) => "Нет чек-инов за этот месяц.",
	month_btn_prev: (_: Record<string, never>) => "← Пред.",
	month_btn_next: (_: Record<string, never>) => "След. →",
	month_btn_back: (_: Record<string, never>) => "← К календарю",
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
		`Настроение: ${mood}\n` +
		`Энергия: ${energy}\n` +
		`Сон: ${sleepHours}ч (${sleepQuality})\n` +
		`Тревога: ${anxiety}\n` +
		`Раздражительность: ${irritability}\n` +
		`Лекарства: ${medication}` +
		`${note ? `\nЗаметка: ${note}` : ""}`,
	month_day_no_checkin: ({ date }: { date: string }) =>
		`📅 ${date}\n\nВ этот день чек-ина не было.`,
	month_day_btn_record: (_: Record<string, never>) => "Записать чек-ин",
	month_day_btn_overwrite: (_: Record<string, never>) => "Перезаписать чек-ин",

	// ===== REMINDER SETTINGS =====
	reminder_title: (_: Record<string, never>) => "Настройки напоминаний",
	reminder_status: ({
		enabled,
		time,
		timezone,
	}: {
		enabled: boolean;
		time: string;
		timezone: string;
	}) =>
		`Напоминания: ${enabled ? "включены" : "выключены"}\n` +
		`Время: ${time}\n` +
		`Часовой пояс: ${timezone}`,
	reminder_enabled: (_: Record<string, never>) => "Напоминания включены.",
	reminder_disabled: (_: Record<string, never>) => "Напоминания выключены.",
	reminder_time_updated: ({ time }: { time: string }) =>
		`Время напоминания установлено: ${time}`,
	reminder_select_time: (_: Record<string, never>) =>
		"Выберите время напоминания:",
	reminder_enter_custom_time: (_: Record<string, never>) =>
		"Введите время в формате ЧЧ:ММ (24-часовой формат):",
	reminder_invalid_time: (_: Record<string, never>) =>
		"Неверный формат. Введите время в формате ЧЧ:ММ, например 21:00",
	reminder_tz_required: (_: Record<string, never>) =>
		"Сначала нужно установить часовой пояс.\nВыберите ваш часовой пояс:",
	reminder_btn_enable: (_: Record<string, never>) => "Включить напоминания",
	reminder_btn_disable: (_: Record<string, never>) => "Выключить напоминания",
	reminder_btn_change_time: (_: Record<string, never>) => "Изменить время",
	reminder_btn_change_tz: (_: Record<string, never>) => "Изменить часовой пояс",
	reminder_btn_custom_time: (_: Record<string, never>) => "Другое время",

	// ===== REMINDER NOTIFICATION =====
	reminder_message: (_: Record<string, never>) =>
		"Здравствуйте! Время для ежедневного чек-ина. Как вы сегодня?",
	reminder_btn_start_checkin: (_: Record<string, never>) => "Записать чек-ин",
	reminder_btn_snooze_30: (_: Record<string, never>) => "Через 30 мин",
	reminder_btn_snooze_60: (_: Record<string, never>) => "Через 1 час",
	reminder_btn_snooze_120: (_: Record<string, never>) => "Через 2 часа",
	reminder_btn_skip_today: (_: Record<string, never>) => "Пропустить сегодня",
	reminder_snoozed: ({ minutes }: { minutes: number }) =>
		`Хорошо, напомню через ${minutes} мин.`,
	reminder_skipped: (_: Record<string, never>) =>
		"Хорошо, сегодня без напоминания.",

	// ===== TIMEZONE =====
	timezone_title: (_: Record<string, never>) => "Выберите часовой пояс",
	timezone_current: ({ timezone }: { timezone: string }) =>
		`Текущий часовой пояс: ${timezone}`,
	timezone_updated: ({ timezone }: { timezone: string }) =>
		`Часовой пояс установлен: ${timezone}`,
	timezone_btn_moscow: (_: Record<string, never>) => "Москва (UTC+3)",
	timezone_btn_kaliningrad: (_: Record<string, never>) => "Калининград (UTC+2)",
	timezone_btn_samara: (_: Record<string, never>) => "Самара (UTC+4)",
	timezone_btn_yekaterinburg: (_: Record<string, never>) =>
		"Екатеринбург (UTC+5)",
	timezone_btn_novosibirsk: (_: Record<string, never>) => "Новосибирск (UTC+7)",
	timezone_btn_krasnoyarsk: (_: Record<string, never>) => "Красноярск (UTC+7)",
	timezone_btn_vladivostok: (_: Record<string, never>) =>
		"Владивосток (UTC+10)",
	timezone_btn_kyiv: (_: Record<string, never>) => "Киев (UTC+2/+3)",
	timezone_btn_minsk: (_: Record<string, never>) => "Минск (UTC+3)",
	timezone_btn_london: (_: Record<string, never>) => "Лондон (UTC+0/+1)",
	timezone_btn_berlin: (_: Record<string, never>) => "Берлин (UTC+1/+2)",
	timezone_btn_new_york: (_: Record<string, never>) => "Нью-Йорк (UTC-5/-4)",
	timezone_btn_other: (_: Record<string, never>) => "Другой (ввести вручную)",
	timezone_enter_custom: (_: Record<string, never>) =>
		"Введите IANA название часового пояса (например, Asia/Tokyo, America/Chicago):",
	timezone_invalid: (_: Record<string, never>) =>
		"Неверный часовой пояс. Попробуйте ещё раз. Примеры: Europe/Moscow, Asia/Tokyo",

	// ===== STATS =====
	stats_title: (_: Record<string, never>) => "Статистика",
	stats_btn_week: (_: Record<string, never>) => "Неделя",
	stats_btn_month: (_: Record<string, never>) => "Месяц",
	stats_btn_last7: (_: Record<string, never>) => "Последние 7",
	stats_btn_calendar: (_: Record<string, never>) => "Календарь",
	stats_btn_export: (_: Record<string, never>) => "Экспорт",
	stats_btn_email: (_: Record<string, never>) => "На почту",
	stats_btn_csv: (_: Record<string, never>) => "CSV",
	stats_btn_xlsx: (_: Record<string, never>) => "Excel",
	stats_btn_back: (_: Record<string, never>) => "← Назад",
	stats_last7_title: (_: Record<string, never>) => "📋 Последние 7 чек-инов",
	stats_last7_empty: (_: Record<string, never>) => "Пока нет записей.",
	stats_export_select: (_: Record<string, never>) =>
		"Выберите период для экспорта:",
	stats_export_format: (_: Record<string, never>) => "Выберите формат:",
	stats_email_ask: (_: Record<string, never>) =>
		"Введите email для отправки отчёта:",
	stats_email_invalid: (_: Record<string, never>) =>
		"Неверный формат email. Попробуйте ещё раз.",
	stats_email_sending: (_: Record<string, never>) => "Отправляю отчёт...",
	stats_email_sent: ({ email }: { email: string }) =>
		`Отчёт отправлен на ${email}`,
	stats_email_error: (_: Record<string, never>) =>
		"Не удалось отправить. Проверьте адрес и попробуйте позже.",
	stats_email_not_configured: (_: Record<string, never>) =>
		"Email-отправка не настроена.",
	stats_export_no_data: (_: Record<string, never>) =>
		"Нет данных для экспорта.",
} as const;
