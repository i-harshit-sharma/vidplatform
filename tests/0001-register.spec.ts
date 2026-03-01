import {test, expect} from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/register');
        await expect(page.locator('h1', { hasText: 'Create an Account' })).toBeVisible();
    });

    test('should display registration form', async ({ page }) => {
        await expect(page.locator('h1', { hasText: 'Create an Account' })).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]', { hasText: 'Create Account' })).toBeVisible();
    });

    test('should show error for missing email and password', async ({ page }) => {
        // Native HTML5 validation will likely prevent form submission,
        // but if we bypass it or test the action directly, it would show the message.
        // Let's test by clicking submit without filling (if required attributes are somehow bypassed)
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');
        const usernameInput = page.locator('input[name="username"]');
        // Remove 'required' attribute using JS to test server-side validation message, 
        // or just rely on native browser validation.
        await emailInput.evaluate(node => node.removeAttribute('required'));
        await passwordInput.evaluate(node => node.removeAttribute('required'));
        await usernameInput.evaluate(node => node.removeAttribute('required'));
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('text=All fields are required.')).toBeVisible();
    });

    test('should show error for duplicate email or username', async ({ page }) => {
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'wrongemail@example.com');
    await page.fill('input[name="password"]', 'password123');

    // 1. Wait for a POST request that includes the Next-Action header
    const actionPromise = page.waitForResponse(response => 
        response.request().method() === 'POST' && 
        response.request().headers()['next-action'] !== undefined
    );

    // 2. Click the submit button
    await page.locator('button[type="submit"]').click();

    // 3. Wait for the Server Action network request to complete
    await actionPromise;

    // 4. Now assert the UI
    await expect(page.locator('text=That email or username is already taken. Please choose another one.')).toBeVisible();
});
});