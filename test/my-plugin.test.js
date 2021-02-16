jest.setTimeout(40000);

const DOMAIN = 'http://localhost:3000';

describe('Testing the studio', () => {
  it('should login', async () => {
    await context.addCookies([
      {
        name: 'sanitySession',
        value: process.env.SANITY_PLAYWRIGHT_TEST_TOKEN,
        secure: true,
        path: '/',
        httpOnly: true,
        sameSite: 'None',
        domain: `.${process.env.SANITY_PROJECT_ID}.api.sanity.io`,
      },
    ]);

    await page.goto(`${DOMAIN}/desk`, { timeout: 60000 });
    await expect(page).toHaveText('p', 'Your schema does not contain any document types.');
  });

  it('should open the plugin', async () => {
    await page.goto(`${DOMAIN}/myclicker`);
    await expect(page).toHaveText('h2', 'Click it!');
  });

  it('should count clicks', async () => {
    await page.click(`text=CLICK ME`);
    await expect(page).toHaveText('[aria-label="counter"]', '1');
    await page.click(`text=CLICK ME`);
    await expect(page).toHaveText('[aria-label="counter"]', '2');
    await page.click(`text=CLICK ME`);
    await expect(page).toHaveText('[aria-label="counter"]', '3');
  });
});