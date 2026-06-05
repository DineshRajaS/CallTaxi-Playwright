# CallTaxiService — AI-Powered Playwright Test Suite
## Assessment 2 — Playwright + AI Integration

### Quick Start
```bash
npm install
npx playwright install chromium
npm test
npx playwright show-report
```

### Project Structure
```
src/
├── fixtures/          bookingFixture.ts    — custom test.extend fixture
├── pages/             BookingPage.ts       — POM with readonly Locators
│                      CommonPage.ts        — nav + validation errors POM
├── testData/          generateBooking.ts   — Faker.js data generator
├── tests/
│   ├── booking/       happyPath.spec.ts    — TC01–TC06
│   ├── validation/    negativeValidation   — TC07–TC11
│   ├── navigation/    navigation.spec.ts   — TC12–TC15
│   ├── dataIntegrity/ dataIntegrity.spec   — TC16–TC19
│   └── aiInsights/    aiDebug.spec.ts      — TC20–TC21 (debug exercise)
└── utils/             helper.ts            — low-level page wrapper
```

### Concepts Implemented
| Concept | File |
|---|---|
| POM with readonly Locators | pages/bookingPage.ts |
| Faker.js dynamic data | testData/generateBooking.ts |
| BVA / EP / Negative test cases | happyPath + dataIntegrity specs |
| expect.soft() | negativeValidation.spec.ts |
| test.describe + beforeEach via fixture | bookingFixture.ts |
| Custom fixture (test.extend) | fixtures/bookingFixture.ts |
| Deliberate break + AI debug | aiDebug.spec.ts |
| HTML + JUnit reporters | playwright.config.ts |
| Trace on failure | playwright.config.ts |
| Screenshot on failure | playwright.config.ts |
