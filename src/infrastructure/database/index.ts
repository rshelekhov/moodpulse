import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getConfig } from "../../config/config";
import { createChildLogger } from "../../lib/logger";

const logger = createChildLogger("database");

const adapter = new PrismaPg({
	connectionString: getConfig().DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

export async function connectDatabase(): Promise<void> {
	logger.debug("Connecting to database...");
	await prisma.$connect();
	logger.info("Database connected");
}

export async function disconnectDatabase(): Promise<void> {
	logger.debug("Disconnecting from database...");
	await prisma.$disconnect();
	logger.info("Database disconnected");
}
