import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.locator('button[type="submit"]').click();
  
  await page.waitForURL('http://localhost:3000/');
  
  await page.context().storageState({ path: authFile });
});
