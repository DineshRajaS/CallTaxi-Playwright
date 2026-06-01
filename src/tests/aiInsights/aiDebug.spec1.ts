/**
 * aiDebug.spec.ts
 *
 * Test Suite: AI-Assisted Debugging (Assessment 2 — Task 5)
 *
 * PURPOSE:
 *   This file demonstrates the AI debugging workflow required by Assessment 2.
 *   TC20 uses a DELIBERATELY BROKEN selector to trigger a TimeoutError.
 *   TC21 shows the FIXED version after AI diagnosis.
 *
 * HOW TO USE:
 *   1. Run TC20 first — it will FAIL with a TimeoutError on the broken selector
 *   2. Copy the full error message and paste it into ChatGPT/Claude with Prompt T5.1
 *   3. Apply the fix suggested by AI → TC21 is the result
 *   4. Screenshot the HTML report showing TC20 failing and TC21 passing
 *
 * PROMPT T5.1 (paste into ChatGPT or Claude after TC20 fails):
 * ─────────────────────────────────────────────────────────────
 *   I am testing a taxi booking form at:
 *   https://webapps.tekstac.com/SeleniumApp2/CallTaxiService/booking.html
 *
 *   My test is failing with this error:
 *   [PASTE FULL PLAYWRIGHT ERROR MESSAGE HERE]
 *
 *   The test is trying to click the submit button.
 *   Current broken selector: page.locator('#submitted-broken-selector')
 *
 *   Help me:
 *   1. Explain exactly why this TimeoutError is happening
 *   2. Suggest 3 alternative selectors to try
 *   3. Which selector type is most resilient and why?
 *   4. Show the corrected line of code
 * ─────────────────────────────────────────────────────────────
 */

import { expect, test as base } from '@playwright/test';
import { Helper }       from '../../utils/helper';
import BookingPage      from '../../pages/bookingPage';
import { generateBooking } from '../../testData/generateBooking';

const BASE_URL = '/booking.html';

test.describe('AI-Assisted Debugging (Task 5)', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // TC20: DELIBERATELY BROKEN — wrong selector to trigger TimeoutError
  // Run this, copy the error, paste into AI for diagnosis
  // ─────────────────────────────────────────────────────────────────────────
  base('TC20 [BROKEN]: Wrong selector triggers TimeoutError — for AI debug exercise',
    async ({ page }) => {
      await page.goto(BASE_URL);
      const helper  = new Helper(page);
      const booking = new BookingPage(helper);
      const data    = generateBooking();

      await booking.fillForm(data);

      // INTENTIONALLY WRONG SELECTOR — will fail with TimeoutError
      // AI diagnosis prompt (T5.1 above) will identify the fix
      await page.locator('#submitted-broken-selector').click({ timeout: 5000 });
    }
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TC21: FIXED — corrected selector after AI debug session
  // Documents: which AI suggestion was used and why
  //
  // AI suggested 3 options:
  //   Option 1: page.locator('#submitted')          ← ID selector (used)
  //   Option 2: page.getByRole('button',{name:/submit/i})  ← role-based
  //   Option 3: page.locator('input[type="submit"]')       ← attribute
  //
  // Chose Option 1 (#submitted) because the ID is stable and matches
  // the application's own identifier. Role-based would be preferred
  // for a real application without stable IDs.
  // ─────────────────────────────────────────────────────────────────────────
  base('TC21 [FIXED]: Corrected selector after AI diagnosis confirms booking',
    async ({ page }) => {
      await page.goto(BASE_URL);
      const helper  = new Helper(page);
      const booking = new BookingPage(helper);
      const data    = generateBooking();

      await booking.fillForm(data);

      // FIXED: Using the correct selector identified by AI
      await booking.submitButton.click();  // submitButton = page.locator('#submitted')

      await expect(booking.confirmationMsg).toBeVisible();
      const message = await booking.getConfirmationMessage();
      expect(message).toContain('Your Booking has been Confirmed');
    }
  );

});
