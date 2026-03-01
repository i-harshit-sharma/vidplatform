import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }, testInfo) => {
  const authFile = testInfo.project.name === 'setup-webkit'
    ? 'playwright/.auth/user-webkit.json'
    : 'playwright/.auth/user.json';

  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.waitForTimeout(1000); // wait for hydration in WebKit
  await page.locator('button[type="submit"]').click({ force: true });

  await page.waitForURL('**/');

  await page.context().storageState({ path: authFile });
});
