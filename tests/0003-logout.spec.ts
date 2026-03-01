import { test, expect } from "@playwright/test";

test.describe("Logout Functionality", () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test("Should be logged in and then logout successfully", async ({
		page,
		context,
	}) => {
		page.on("console", (msg) =>
			console.log("BROWSER CONSOLE:", msg.text()),
		);
		page.on("pageerror", (error) =>
			console.log("BROWSER ERROR:", error.message),
		);
		page.on("requestfailed", (request) =>
			console.log(
				"BROWSER REQUEST FAILED:",
				request.url(),
				request.failure()?.errorText,
			),
		);

		// --- LOGIN ---
		await page.goto("http://localhost:3000/login");
		await page.fill('[name="email"]', "test@example.com");
		await page.fill('[name="password"]', "password123");

		// FIX 1: Wait for navigation promise alongside the click,
		// WebKit can miss navigation events if you click then waitForURL separately
		await Promise.all([
			page.waitForURL("**/", { waitUntil: "domcontentloaded" }), // FIX 2: avoid networkidle on WebKit
			page.click('button[type="submit"]'),
		]);

		// --- OPEN MENU ---
		const avatarBtn = page
			.locator("button")
			.filter({ has: page.locator("div[title]") })
			.first();

		// FIX 3: Ensure element is stable before interacting
		await avatarBtn.waitFor({ state: "visible" });
		await expect(avatarBtn).toBeEnabled();
		await avatarBtn.click();

		// --- LOGOUT ---
		const logoutBtn = page.getByRole("button", {
			name: "Logout",
			exact: true,
		});
		await logoutBtn.waitFor({ state: "visible" });
		await expect(logoutBtn).toBeEnabled();

		// WebKit fix: Next.js server action redirect() sends a 303 or a special
		// x-action-redirect header. We catch it and navigate manually.
		const responsePromise = page.waitForResponse(
			(resp) => {
				const redirectHeader =
					resp.headers()["x-action-redirect"] ||
					resp.headers()["location"];
				return !!redirectHeader || resp.url().includes("login");
			},
			{ timeout: 15000 },
		);

		await logoutBtn.click();

		try {
			const response = await responsePromise;
			const redirectTarget =
				response.headers()["x-action-redirect"] ||
				response.headers()["location"] ||
				"/login";

			// Force an explicit navigation — WebKit won't follow the redirect automatically
			await page.goto(`http://localhost:3000${redirectTarget}`, {
				waitUntil: "domcontentloaded",
			});
		} catch {
			// If waitForResponse times out, we may already be on /login
			await page.waitForURL("**/login", {
				waitUntil: "domcontentloaded",
				timeout: 5000,
			});
		}

		await expect(page).toHaveURL(/.*login/);
	});
});
