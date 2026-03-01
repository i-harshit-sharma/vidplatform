import test, { expect } from "@playwright/test";

test.describe('Logout Functionality', () => {
    test.beforeEach(async ({ page }) => {
        // The global auth setup should already have us logged in
        await page.goto('http://localhost:3000/');
    });

    test("Should be logged in from global setup", async ({ page }) => {
        // Verify we are on the home page and not redirected to login
        await expect(page).toHaveURL('http://localhost:3000/');

        // Verify the avatar/user menu is visible (indicates logged in)
        const avatarTitle = page.locator('div[title]');
        const avatarBtn = page.locator('button').filter({ has: avatarTitle }).first();
        await expect(avatarBtn).toBeVisible();

        // Perform logout
        await avatarBtn.click();
        await page.locator('button', { hasText: 'Logout' }).first().click();

        // Verify we are no longer logged in (avatar should not be visible)
        await expect(page.locator('div[title]')).not.toBeVisible();
    });
});