import test, { expect } from "@playwright/test";

test.describe("Home Page", () => {
    test("should display welcome message", async ({ page }) => {
        await page.goto("http://localhost:3000/");
        await expect(page.locator("h1")).toHaveText("Welcome");
    });
});