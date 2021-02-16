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
  