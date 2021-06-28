import { test, expect, PlaywrightTestConfig } from "@playwright/test";
import { chromium } from "playwright";

require("dotenv").config();
const DOMAIN = "http://localhost:3000";
test.use({ storageState: 'state.json' });


test.describe("Studio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DOMAIN);
  });

  test("add movie", async ({ page }) => {
    await page.click("text=Movie");
    await page.click('[title="Create new Movie"]');
    await page.click('label:has-text("Title")');
    await page.fill("input:focus", "Test movie");
    await page.click("text=Publish");
    expect(await page.isVisible('[class*="PaneItem_"]:has-text("Test movie")'));
  });

  test("remove movie", async ({ page }) => {
    await page.click("text=Movie");
    await page.click("text=Test movie");
    await page.click('[aria-label="Actions"]');
    await page.click('[aria-label="Delete"]');
    await page.click("text=Delete now");
    await page.waitForTimeout(2000);
    await expect(
      (
        await page.$$('[class*="PaneItem_"]:has-text("Test movie")')
      ).length
    ).toBe(0);
  });
});
