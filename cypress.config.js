const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5500', // Matches http-server src -p 5500
    supportFile: false,
    viewportWidth: 375, // iPhone X/12 width
    viewportHeight: 812, // iPhone X/12 height
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  },
});
