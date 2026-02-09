import { getConfig } from "./config/config";
import { createChildLogger } from "./lib/logger";

const logger = createChildLogger("health");

let lastHeartbeat = Date.now();

export function updateHeartbeat(): void {
	lastHeartbeat = Date.now();
}

export function startHealthServer(): void {
	const port = getConfig().HEALTH_PORT;

	Bun.serve({
		port,
		routes: {
			"/health": () => {
				const now = Date.now();
				const staleSec = (now - lastHeartbeat) / 1000;
				const ok = staleSec < 120;

				return Response.json(
					{
						status: ok ? "ok" : "stale",
						uptime: Math.floor(process.uptime()),
						heartbeatAgeSec: Math.floor(staleSec),
					},
					{ status: ok ? 200 : 503 },
				);
			},
		},
		fetch() {
			return new Response("Not Found", { status: 404 });
		},
	});

	logger.info({ port }, "Health server started");
}
