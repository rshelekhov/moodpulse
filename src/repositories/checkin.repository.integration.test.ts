import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { prisma } from "../infrastructure/database";
import {
	createCheckin,
	findCheckinByUserIdAndLocalDate,
	findUserByTelegramId,
	updateCheckinByIdForUser,
} from "./checkin.repository";

const TEST_TELEGRAM_ID = BigInt(999999999);

let testUserId: string | null = null;
let testCheckinIds: string[] = [];

beforeAll(async () => {
	await prisma.$connect();
});

afterAll(async () => {
	await cleanupTestData();
	await prisma.$disconnect();
});

beforeEach(async () => {
	const user = await prisma.user.create({
		data: {
			telegramId: TEST_TELEGRAM_ID,
			username: "integration_test_user",
			firstName: "Test",
			lastName: "User",
		},
	});
	testUserId = user.id;
});

afterEach(async () => {
	await cleanupTestData();
	testCheckinIds = [];
	testUserId = null;
});

async function cleanupTestData() {
	if (testCheckinIds.length > 0) {
		await prisma.checkin.deleteMany({
			where: { id: { in: testCheckinIds } },
		});
	}

	await prisma.user.deleteMany({
		where: { telegramId: TEST_TELEGRAM_ID },
	});
}

function getTodayLocalDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function getYesterdayLocalDate(): string {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	return yesterday.toISOString().slice(0, 10);
}

function getRequiredTestUserId(): string {
	if (!testUserId) {
		throw new Error("testUserId is not initialized");
	}
	return testUserId;
}

describe("checkin.repository integration", () => {
	describe("findUserByTelegramId", () => {
		test("returns user when exists", async () => {
			const user = await findUserByTelegramId(TEST_TELEGRAM_ID);

			expect(user).not.toBeNull();
			expect(user?.telegramId).toBe(TEST_TELEGRAM_ID);
			expect(user?.username).toBe("integration_test_user");
		});

		test("returns null when user does not exist", async () => {
			const user = await findUserByTelegramId(BigInt(111111111));

			expect(user).toBeNull();
		});
	});

	describe("createCheckin", () => {
		test("creates checkin with all fields", async () => {
			const localDate = getTodayLocalDate();
			const checkinData = {
				userId: getRequiredTestUserId(),
				mood: -1,
				energy: 2,
				sleepDuration: 6.5,
				sleepQuality: "FAIR" as const,
				anxiety: 2,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				note: "Integration test note",
				localDate,
			};

			const checkin = await createCheckin(checkinData);
			testCheckinIds.push(checkin.id);

			expect(checkin.id).toBeDefined();
			expect(checkin.userId).toBe(getRequiredTestUserId());
			expect(checkin.mood).toBe(-1);
			expect(checkin.energy).toBe(2);
			expect(checkin.sleepDuration).toBe(6.5);
			expect(checkin.sleepQuality).toBe("FAIR");
			expect(checkin.anxiety).toBe(2);
			expect(checkin.irritability).toBe(1);
			expect(checkin.medicationTaken).toBe("TAKEN");
			expect(checkin.note).toBe("Integration test note");
			expect(checkin.localDate).toBe(localDate);
		});

		test("creates checkin with null note", async () => {
			const checkinData = {
				userId: getRequiredTestUserId(),
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "NOT_APPLICABLE" as const,
				note: null,
				localDate: getTodayLocalDate(),
			};

			const checkin = await createCheckin(checkinData);
			testCheckinIds.push(checkin.id);

			expect(checkin.note).toBeNull();
		});

		test("enforces unique constraint on userId + localDate", async () => {
			const localDate = getTodayLocalDate();
			const checkin1 = await createCheckin({
				userId: getRequiredTestUserId(),
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "TAKEN" as const,
				localDate,
			});
			testCheckinIds.push(checkin1.id);

			await expect(
				createCheckin({
					userId: getRequiredTestUserId(),
					mood: 1,
					energy: 4,
					sleepDuration: 8,
					sleepQuality: "GOOD" as const,
					anxiety: 0,
					irritability: 0,
					medicationTaken: "TAKEN" as const,
					localDate,
				}),
			).rejects.toThrow();
		});
	});

	describe("findCheckinByUserIdAndLocalDate", () => {
		test("returns checkin when exists", async () => {
			const localDate = getTodayLocalDate();
			const created = await createCheckin({
				userId: getRequiredTestUserId(),
				mood: 2,
				energy: 4,
				sleepDuration: 8,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "SKIPPED" as const,
				localDate,
			});
			testCheckinIds.push(created.id);

			const found = await findCheckinByUserIdAndLocalDate(
				getRequiredTestUserId(),
				localDate,
			);

			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
			expect(found?.mood).toBe(2);
		});

		test("returns null when no checkin for that localDate", async () => {
			const localDate = getTodayLocalDate();
			const created = await createCheckin({
				userId: getRequiredTestUserId(),
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "FAIR" as const,
				anxiety: 1,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				localDate,
			});
			testCheckinIds.push(created.id);

			const found = await findCheckinByUserIdAndLocalDate(
				getRequiredTestUserId(),
				getYesterdayLocalDate(),
			);

			expect(found).toBeNull();
		});

		test("returns null when no checkin for that user", async () => {
			const found = await findCheckinByUserIdAndLocalDate(
				"non-existent-user-id",
				getTodayLocalDate(),
			);

			expect(found).toBeNull();
		});
	});

	describe("updateCheckinByIdForUser", () => {
		test("updates specified fields only", async () => {
			const localDate = getTodayLocalDate();
			const checkin = await createCheckin({
				userId: getRequiredTestUserId(),
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "FAIR" as const,
				anxiety: 1,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				note: "Original note",
				localDate,
			});
			testCheckinIds.push(checkin.id);

			const updateResult = await updateCheckinByIdForUser(
				checkin.id,
				getRequiredTestUserId(),
				{
					mood: 2,
					note: "Updated note",
				},
			);

			expect(updateResult.count).toBe(1);
			const updated = await findCheckinByUserIdAndLocalDate(
				getRequiredTestUserId(),
				localDate,
			);
			expect(updated?.mood).toBe(2);
			expect(updated?.note).toBe("Updated note");
			expect(updated?.energy).toBe(3);
			expect(updated?.sleepQuality).toBe("FAIR");
		});

		test("can update note to null", async () => {
			const localDate = getTodayLocalDate();
			const checkin = await createCheckin({
				userId: getRequiredTestUserId(),
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "TAKEN" as const,
				note: "Has a note",
				localDate,
			});
			testCheckinIds.push(checkin.id);

			const updateResult = await updateCheckinByIdForUser(
				checkin.id,
				getRequiredTestUserId(),
				{ note: null },
			);
			expect(updateResult.count).toBe(1);
			const updated = await findCheckinByUserIdAndLocalDate(
				getRequiredTestUserId(),
				localDate,
			);
			expect(updated?.note).toBeNull();
		});
	});
});
