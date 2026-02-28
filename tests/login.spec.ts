import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3000/login");
	});

	test("should display login form", async ({ page }) => {
		await expect(
			page.locator("h1", { hasText: "Login Page" }),
		).toBeVisible();
		await expect(page.locator('input[name="email"]')).toBeVisible();
		await expect(page.locator('input[name="password"]')).toBeVisible();
		await expect(
			page.locator('button[type="submit"]', { hasText: "Login" }),
		).toBeVisible();
	});

	test("should show error for missing email and password", async ({
		page,
	}) => {
		// Native HTML5 validation will likely prevent form submission,
		// but if we bypass it or test the action directly, it would show the message.
		// Let's test by clicking submit without filling (if required attributes are somehow bypassed)
		const emailInput = page.locator('input[name="email"]');
		const passwordInput = page.locator('input[name="password"]');

		// Remove 'required' attribute using JS to test server-side validation message,
		// or just rely on native browser validation.
		await emailInput.evaluate((node) => node.removeAttribute("required"));
		await passwordInput.evaluate((node) =>
			node.removeAttribute("required"),
		);

		await page.locator('button[type="submit"]').click();

		await expect(
			page.locator("text=Both email and password are required."),
		).toBeVisible();
	});

	test("should show error for invalid credentials", async ({ page }) => {
		await page.fill('input[name="email"]', "wrong@example.com");
		await page.fill('input[name="password"]', "wrongpassword");

		await page.locator('button[type="submit"]').click();

		await expect(
			page.locator("text=Invalid email or password."),
		).toBeVisible();
	});

	test("should login user and redirect to home on successful login", async ({
		page,
	}) => {
		// Example with a placeholder valid user:
		await page.fill('input[name="email"]', "test@example.com");
		await page.fill('input[name="password"]', "password123");
		await page.locator('button[type="submit"]').click();
        await page.waitForURL('http://localhost:3000/');
		// await navigationPromise;
		// Ensure successful login redirects to '/'
		await expect(page).toHaveURL("http://localhost:3000/");
	});
});
