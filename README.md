# Testing your studio with Playwright and Jest

At some point you may add custom functionality to Sanity studio. Maybe a plugin, a custom component or some other interface that builds on top of the out of the box studio. To be able to  upgrade Sanity worry free it can be a good idea to add automated tests. This is how you can  test inside your interface inside the studio with Playwright and Jest.

Of course you could do the same thing using Puppeteer, Cypress or other headless testing software.

## Setting up the studio

First we need a working studio with a custom plugin. For testing you should create a dataset named 'testing', so your tests won't accidentally ruin your real content `sanity dataset create testing`.

We need a custom plugin. For demo purposes I've set up a minimal clicks counter. 

Add this plugin in sanity.json inside the plugins array.

```json
{
	...,
	"plugins": [
    "@sanity/base",
    "@sanity/components",
    "@sanity/default-layout",
    "@sanity/default-login",
    "@sanity/desk-tool",
    "my-clicker"
  ]
}
```

studio/plugins/my-clicker/sanity.json

```json
{
  "parts": [
    {
      "implements": "part:@sanity/base/tool",
      "path": "./index.js"
    }
  ]
}
```

studio/plugins/my-clicker/index.js

```json
import MyClicker from './MyClicker'

export default {
  title: 'MyClicker',
  name: 'myclicker',
  component: MyClicker
}
```

studio/plugins/my-clicker/MyClicker.js

```json

import React, { useState} from 'react'

const MyClicker = () => {
  const [clicks, setClicks] = useState(0)

  return (
    <div>
      <h2>Click it!</h2>
      <button onClick={() => setClicks((click) => ++click)}>CLICK</button> <strong aria-label="counter">{clicks}</strong>
    </div>
  )
}

export default MyClicker
```

---

## Make a testing token

Create a .env file with the following fields:

```bash
SANITY_PLAYWRIGHT_TEST_TOKEN=<SANITY_PLAYWRIGHT_TEST_TOKEN>
SANITY_PROJECT_ID=<PROJECT_ID>
```

Go to manage.sanity.io

Create a Sanity bot token with write access at settings/api. Call it SANITY_PLAYWRIGHT_TEST_TOKEN and paste the value that is shown in your .env file.

Also add a new origin for [localhost:3000](http://localhost:3000). Be sure to check 'Allow credentials'. This allows you to login to the studio.

---

## Setting up testing

```bash
yarn add dotenv jest-playwright-preset jest playwright -D
```

Now create three files:

test/jest-playwright.config.js

```js
// https://github.com/playwright-community/jest-playwright/#configuration
module.exports = {
  browsers: ['chromium'],
  exitOnPageError: false,
  launchOptions: {
    headless: false,
  },
  serverOptions: {
    launchTimeout: 60000,
    command: 'cd ../studio/ && SANITY_STUDIO_API_DATASET=testing sanity start --port 3000',
  },
};
```

You can set headless to true if you don't want to see the tests being run. 

Be sure to `cd` into the correct folder and set the right dataset. I'm using port 3000 here to avoid conflicts with an already running studio.

test/jest.config.js

```js
module.exports = {
  verbose: true,
  preset: 'jest-playwright-preset',
  setupFiles: ['dotenv/config'],
};
```

test/my-plugin.test.js

```js
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
```

This runs three tests. One for getting past the login, one for navigating to the plugin and the last one to actually test the plugin interface.

## Running the test

Add this script in your package.json:

```json
{
  …,
  "scripts": {
    "test": "cd test/ && DEBUG=pw:api jest --detectOpenHandles --runInBand"
  }
}
```