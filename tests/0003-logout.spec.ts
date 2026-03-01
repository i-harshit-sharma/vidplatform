import { test, expect } from "@playwright/test";

test.describe('Logout Functionality', () => {
    // 1. Tell this test NOT to use the global storage state
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Should be logged in and then logout successfully", async ({ page }) => {
        // 2. Perform a manual login for JUST this test
        await page.goto('http://localhost:3000/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // 3. Perform logout
        const avatarBtn = page.locator('button').filter({ has: page.locator('div[title]') }).first();
        await avatarBtn.click();
        await page.click('text=Logout');

        // 4. Verify
        await expect(page).toHaveURL(/.*login/);
    });
});