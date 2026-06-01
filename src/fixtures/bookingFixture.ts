import { test as base } from '@playwright/test';
import { Helper }       from '@utils/helper';
import BookingPage      from '@pages/bookingPage';
import CommonPage       from '@pages/commonPage';

/**
 * Custom Playwright fixture — BookingFixture
 *
 * Extends the base test with pre-wired POM objects and a navigated page.
 * Tests that use this fixture don't need to:
 *   - new Helper(page) manually
 *   - new BookingPage(helper) manually
 *   - await page.goto(URL) manually
 *
 * Usage in tests:
 *   import { test } from '@fixtures/bookingFixture';
 *   test('my test', async ({ booking, common }) => { ... });
 */

// const BASE_URL = '/booking.html';
const BASE_URL = 'https://webapps.tekstac.com/SeleniumApp2/CallTaxiService/booking.html'

// Type for the extended fixtures
type BookingFixtures = {
  helper : Helper;
  booking: BookingPage;
  common : CommonPage;
};

export const test = base.extend<BookingFixtures>({

  // ── helper fixture ────────────────────────────────────────────────────────
  helper: async ({ page }, use) => {
    const helper = new Helper(page);
    await use(helper);
  },

  // ── booking fixture ───────────────────────────────────────────────────────
  booking: async ({ helper, page }, use) => {
    await page.goto(BASE_URL);
    const booking = new BookingPage(helper);
    await use(booking);
  },

  // ── common fixture ────────────────────────────────────────────────────────
  common: async ({ helper, page }, use) => {
    await page.goto(BASE_URL);
    const common = new CommonPage(helper);
    await use(common);
  },
});

export { expect } from '@playwright/test';
