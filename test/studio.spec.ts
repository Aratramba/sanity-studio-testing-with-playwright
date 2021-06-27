import { test, expect } from "@playwright/test";

require("dotenv").config();

const DOMAIN = "http://localhost:3000";
const SANITY_PROJECT_ID = require("../sanity.json")?.api?.projectId;

async function setCookies(context) {
  await context.addCookies([
    {
      name: "sanitySession",
      value: process.env.STUDIO_TEST_TOKEN,
      secure: true,
      path: "/",
      httpOnly: true,
      sameSite: "None",
      domain: `.${SANITY_PROJECT_ID}.api.sanity.io`,
    },
  ]);
}

test.describe("Studio", () => {
  test.beforeEach(async ({ page, context }) => {
    await setCookies(context);
    await page.goto(DOMAIN);
    await page.waitForNavigation();
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
    await page.click("text=Test movie");
    await page.click('[aria-label="Actions"]');
    await page.click('[aria-label="Delete"]');
    await page.click('text=Delete now');
    expect(await page.isHidden('[class*="PaneItem_"]:has-text("Test movie")'));
    // await expect((await page.$$('[class*="PaneItem_"]:has-text("Test movie")')).length).toBe(0);
  });


});
