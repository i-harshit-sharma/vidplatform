// import { test, expect } from "@playwright/test";

// test.describe("Logout Functionality", () => {
// 	// 1. Tell this test NOT to use the global storage state
// 	test.use({ storageState: { cookies: [], origins: [] } });

// 	test("Should be logged in and then logout successfully", async ({
// 		page,
// 	}) => {
//         page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
//         page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
//         page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText));

// 		// 2. Perform a manual login for JUST this test
// 		await page.goto("http://localhost:3000/login");
// 		await page.fill('[name="email"]', "test@example.com");
// 		await page.fill('[name="password"]', "password123");
// 		await page.click('button[type="submit"]');

// 		// 1. Wait for the URL to change first (ensures login finished)
// 		await page.waitForURL("**/", { waitUntil: "networkidle" }); // or whatever your post-login URL is

// 		// 2. Open the menu
// 		const avatarBtn = page
// 			.locator("button")
// 			.filter({ has: page.locator("div[title]") })
// 			.first();
// 		await avatarBtn.click();

// 		// 3. Use a more resilient click for the logout button
// 		const logoutBtn = page.getByRole("button", {
// 			name: "Logout",
// 			exact: true,
// 		});
// 		await logoutBtn.waitFor({ state: "visible" });
// 		await page.waitForTimeout(1000); // Wait for hydration / animation
// 		await logoutBtn.click({ force: true });

//         await page.waitForURL("**/login"); // Wait for the login page to load after logout

// 		// 4. Final verification
// 		await expect(page).toHaveURL(/.*login/);
// 	});
// });


import { test, expect } from "@playwright/test";

test.describe("Logout Functionality", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Should be logged in and then logout successfully", async ({ page, context }) => {
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
        page.on('requestfailed', request => 
            console.log('BROWSER REQUEST FAILED:', request.url(), request.failure()?.errorText)
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
        const logoutBtn = page.getByRole("button", { name: "Logout", exact: true });
        await logoutBtn.waitFor({ state: "visible" });

        // FIX 4: Replace arbitrary timeout with an actionability check
        await expect(logoutBtn).toBeEnabled();

        // FIX 5: Use dispatchEvent as a WebKit-safe alternative to force:true
        // force:true skips actionability checks and can silently fail on WebKit
        await logoutBtn.dispatchEvent('click');

        // FIX 6: Wait for navigation tied to the logout action
        await page.waitForURL("**/login", { waitUntil: "domcontentloaded" });

        // --- VERIFY ---
        await expect(page).toHaveURL(/.*login/);
    });
});