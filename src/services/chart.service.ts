import { resolve } from "node:path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import type { ChartConfiguration } from "chart.js";
import { Chart, registerables } from "chart.js";
import type { Locale } from "../lib/i18n";
import { t } from "../lib/i18n";
import { createChildLogger } from "../lib/logger";
import type { ChartSeries } from "./chart-data.service";

const logger = createChildLogger("chart");

const WIDTH = 1200;
const HEIGHT = 800;
const GRID_COLOR = "#E5E7EB";
const FONT_FAMILY = "Inter, sans-serif";

let initialized = false;

function ensureInit() {
	if (initialized) return;
	initialized = true;
	Chart.register(...registerables);
	try {
		const fontPath = resolve(
			import.meta.dirname,
			"../assets/Inter-Regular.ttf",
		);
		GlobalFonts.registerFromPath(fontPath, "Inter");
	} catch (err) {
		logger.warn({ err }, "Failed to register Inter font, using fallback");
	}
}

function renderChart(config: ChartConfiguration): Buffer {
	ensureInit();
	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	// Chart.js expects HTMLCanvasElement-like; cast is necessary for SSR
	// biome-ignore lint/suspicious/noExplicitAny: Chart.js SSR requires canvas shim
	new Chart(ctx as any, {
		...config,
		options: {
			...config.options,
			responsive: false,
			animation: false,
		},
	});

	return canvas.toBuffer("image/png");
}

function shortLabel(dateKey: string): string {
	return dateKey.slice(5);
}

export async function renderMoodEnergyChart(
	series: ChartSeries,
	locale: Locale,
): Promise<Buffer> {
	const config: ChartConfiguration = {
		type: "line",
		data: {
			labels: series.labels.map(shortLabel),
			datasets: [
				{
					label: t("chart_axis_mood", locale, {}),
					data: series.mood,
					borderColor: "#3B82F6",
					backgroundColor: "#3B82F6",
					borderWidth: 2,
					pointRadius: 4,
					spanGaps: false,
					yAxisID: "yMood",
				},
				{
					label: t("chart_axis_energy", locale, {}),
					data: series.energy,
					borderColor: "#F59E0B",
					backgroundColor: "#F59E0B",
					borderWidth: 2,
					pointRadius: 4,
					spanGaps: false,
					yAxisID: "yEnergy",
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: t("chart_mood_energy_title", locale, {}),
					font: { size: 20, family: FONT_FAMILY },
				},
				legend: {
					labels: { font: { family: FONT_FAMILY } },
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: t("chart_axis_date", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY }, autoSkip: true },
				},
				yMood: {
					type: "linear",
					position: "left",
					min: -3,
					max: 3,
					title: {
						display: true,
						text: t("chart_axis_mood", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY }, stepSize: 1 },
				},
				yEnergy: {
					type: "linear",
					position: "right",
					min: 1,
					max: 5,
					title: {
						display: true,
						text: t("chart_axis_energy", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { drawOnChartArea: false },
					ticks: { font: { family: FONT_FAMILY }, stepSize: 1 },
				},
			},
		},
	};

	return renderChart(config);
}

export async function renderSleepChart(
	series: ChartSeries,
	locale: Locale,
): Promise<Buffer> {
	const qualityColors = series.sleepQuality.map((q) => {
		if (q === "POOR") return "#EF4444";
		if (q === "FAIR") return "#F59E0B";
		if (q === "GOOD") return "#22C55E";
		return "#9CA3AF";
	});

	const config: ChartConfiguration = {
		type: "bar",
		data: {
			labels: series.labels.map(shortLabel),
			datasets: [
				{
					label: t("chart_axis_sleep", locale, {}),
					data: series.sleepHours,
					backgroundColor: qualityColors,
					borderWidth: 1,
					borderColor: qualityColors,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: t("chart_sleep_title", locale, {}),
					font: { size: 20, family: FONT_FAMILY },
				},
				legend: {
					labels: { font: { family: FONT_FAMILY } },
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: t("chart_axis_date", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY }, autoSkip: true },
				},
				y: {
					min: 0,
					title: {
						display: true,
						text: t("chart_axis_sleep", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY } },
				},
			},
		},
	};

	return renderChart(config);
}

export async function renderAnxietyIrritabilityChart(
	series: ChartSeries,
	locale: Locale,
): Promise<Buffer> {
	const config: ChartConfiguration = {
		type: "line",
		data: {
			labels: series.labels.map(shortLabel),
			datasets: [
				{
					label: t("chart_axis_anxiety", locale, {}),
					data: series.anxiety,
					borderColor: "#8B5CF6",
					backgroundColor: "#8B5CF6",
					borderWidth: 2,
					pointRadius: 4,
					spanGaps: false,
				},
				{
					label: t("chart_axis_irritability", locale, {}),
					data: series.irritability,
					borderColor: "#EF4444",
					backgroundColor: "#EF4444",
					borderWidth: 2,
					pointRadius: 4,
					spanGaps: false,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: t("chart_anxiety_irritability_title", locale, {}),
					font: { size: 20, family: FONT_FAMILY },
				},
				legend: {
					labels: { font: { family: FONT_FAMILY } },
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: t("chart_axis_date", locale, {}),
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY }, autoSkip: true },
				},
				y: {
					min: 0,
					max: 3,
					title: {
						display: true,
						text: "",
						font: { family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: { font: { family: FONT_FAMILY }, stepSize: 1 },
				},
			},
		},
	};

	return renderChart(config);
}

export async function renderMedicationChart(
	series: ChartSeries,
	locale: Locale,
): Promise<Buffer> {
	const medLabels = {
		0: t("chart_med_na", locale, {}),
		1: t("chart_med_skipped", locale, {}),
		2: t("chart_med_taken", locale, {}),
	};

	const takenPoints: { x: number; y: number }[] = [];
	const skippedPoints: { x: number; y: number }[] = [];
	const naPoints: { x: number; y: number }[] = [];

	for (const [i, med] of series.medication.entries()) {
		if (med === null) continue;
		if (med === "TAKEN") {
			takenPoints.push({ x: i, y: 2 });
		} else if (med === "SKIPPED") {
			skippedPoints.push({ x: i, y: 1 });
		} else {
			naPoints.push({ x: i, y: 0 });
		}
	}

	const config: ChartConfiguration = {
		type: "scatter",
		data: {
			labels: series.labels.map(shortLabel),
			datasets: [
				{
					label: t("chart_med_taken", locale, {}),
					data: takenPoints,
					pointBackgroundColor: "#10B981",
					pointBorderColor: "#10B981",
					pointStyle: "circle",
					pointRadius: 10,
					showLine: false,
				},
				{
					label: t("chart_med_skipped", locale, {}),
					data: skippedPoints,
					pointBackgroundColor: "#F59E0B",
					pointBorderColor: "#F59E0B",
					pointStyle: "triangle",
					pointRadius: 10,
					showLine: false,
				},
				{
					label: t("chart_med_na", locale, {}),
					data: naPoints,
					pointBackgroundColor: "#9CA3AF",
					pointBorderColor: "#9CA3AF",
					pointStyle: "rect",
					pointRadius: 10,
					showLine: false,
				},
			],
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: t("chart_medication_title", locale, {}),
					font: { size: 20, family: FONT_FAMILY },
				},
				legend: {
					display: true,
					labels: {
						font: { size: 14, family: FONT_FAMILY },
						usePointStyle: true,
						pointStyleWidth: 16,
					},
				},
			},
			scales: {
				x: {
					type: "linear",
					min: 0,
					max: series.labels.length - 1,
					title: {
						display: true,
						text: t("chart_axis_date", locale, {}),
						font: { size: 14, family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: {
						font: { family: FONT_FAMILY },
						stepSize: 1,
						callback(tickValue: string | number) {
							const idx =
								typeof tickValue === "number"
									? tickValue
									: Number.parseInt(tickValue, 10);
							const label = series.labels[idx];
							return label ? shortLabel(label) : "";
						},
					},
				},
				y: {
					min: -0.5,
					max: 2.5,
					title: {
						display: true,
						text: t("chart_medication_title", locale, {}),
						font: { size: 14, family: FONT_FAMILY },
					},
					grid: { color: GRID_COLOR },
					ticks: {
						font: { family: FONT_FAMILY },
						stepSize: 1,
						callback(tickValue: string | number) {
							const val =
								typeof tickValue === "number"
									? tickValue
									: Number.parseInt(tickValue, 10);
							return medLabels[val as keyof typeof medLabels] ?? "";
						},
					},
				},
			},
		},
	};

	return renderChart(config);
}
