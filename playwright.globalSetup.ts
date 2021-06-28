import { chromium } from "@playwright/test";

require("dotenv").config();
const DOMAIN = "http://localhost:3000";
const SANITY_PROJECT_ID = require("./sanity.json")?.api?.projectId;

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.context().addCookies([
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

  await page.context().storageState({ path: "state.json" });
  await page.goto(DOMAIN);
  await browser.close();
}

export default globalSetup;
