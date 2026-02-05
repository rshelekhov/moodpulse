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
	findCheckinByUserIdAndDate,
	findUserByTelegramId,
	updateCheckinById,
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

function getTodayMidnight(): Date {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
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
			const today = getTodayMidnight();
			const checkinData = {
				userId: testUserId!,
				mood: -1,
				energy: 2,
				sleepDuration: 6.5,
				sleepQuality: "FAIR" as const,
				anxiety: 2,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				note: "Integration test note",
				date: today,
			};

			const checkin = await createCheckin(checkinData);
			testCheckinIds.push(checkin.id);

			expect(checkin.id).toBeDefined();
			expect(checkin.userId).toBe(testUserId!);
			expect(checkin.mood).toBe(-1);
			expect(checkin.energy).toBe(2);
			expect(checkin.sleepDuration).toBe(6.5);
			expect(checkin.sleepQuality).toBe("FAIR");
			expect(checkin.anxiety).toBe(2);
			expect(checkin.irritability).toBe(1);
			expect(checkin.medicationTaken).toBe("TAKEN");
			expect(checkin.note).toBe("Integration test note");
		});

		test("creates checkin with null note", async () => {
			const checkinData = {
				userId: testUserId!,
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "NOT_APPLICABLE" as const,
				note: null,
				date: getTodayMidnight(),
			};

			const checkin = await createCheckin(checkinData);
			testCheckinIds.push(checkin.id);

			expect(checkin.note).toBeNull();
		});

		test("enforces unique constraint on userId + date", async () => {
			const today = getTodayMidnight();
			const checkin1 = await createCheckin({
				userId: testUserId!,
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "TAKEN" as const,
				date: today,
			});
			testCheckinIds.push(checkin1.id);

			await expect(
				createCheckin({
					userId: testUserId!,
					mood: 1,
					energy: 4,
					sleepDuration: 8,
					sleepQuality: "GOOD" as const,
					anxiety: 0,
					irritability: 0,
					medicationTaken: "TAKEN" as const,
					date: today,
				}),
			).rejects.toThrow();
		});
	});

	describe("findCheckinByUserIdAndDate", () => {
		test("returns checkin when exists", async () => {
			const today = getTodayMidnight();
			const created = await createCheckin({
				userId: testUserId!,
				mood: 2,
				energy: 4,
				sleepDuration: 8,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "SKIPPED" as const,
				date: today,
			});
			testCheckinIds.push(created.id);

			const found = await findCheckinByUserIdAndDate(testUserId!, today);

			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
			expect(found?.mood).toBe(2);
		});

		test("returns null when no checkin for that date", async () => {
			const today = getTodayMidnight();
			const created = await createCheckin({
				userId: testUserId!,
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "FAIR" as const,
				anxiety: 1,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				date: today,
			});
			testCheckinIds.push(created.id);

			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			const found = await findCheckinByUserIdAndDate(testUserId!, yesterday);

			expect(found).toBeNull();
		});

		test("returns null when no checkin for that user", async () => {
			const found = await findCheckinByUserIdAndDate(
				"non-existent-user-id",
				getTodayMidnight(),
			);

			expect(found).toBeNull();
		});
	});

	describe("updateCheckinById", () => {
		test("updates specified fields only", async () => {
			const checkin = await createCheckin({
				userId: testUserId!,
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "FAIR" as const,
				anxiety: 1,
				irritability: 1,
				medicationTaken: "TAKEN" as const,
				note: "Original note",
				date: getTodayMidnight(),
			});
			testCheckinIds.push(checkin.id);

			const updated = await updateCheckinById(checkin.id, {
				mood: 2,
				note: "Updated note",
			});

			expect(updated.mood).toBe(2);
			expect(updated.note).toBe("Updated note");
			expect(updated.energy).toBe(3);
			expect(updated.sleepQuality).toBe("FAIR");
		});

		test("can update note to null", async () => {
			const checkin = await createCheckin({
				userId: testUserId!,
				mood: 0,
				energy: 3,
				sleepDuration: 7,
				sleepQuality: "GOOD" as const,
				anxiety: 0,
				irritability: 0,
				medicationTaken: "TAKEN" as const,
				note: "Has a note",
				date: getTodayMidnight(),
			});
			testCheckinIds.push(checkin.id);

			const updated = await updateCheckinById(checkin.id, { note: null });

			expect(updated.note).toBeNull();
		});
	});
});
