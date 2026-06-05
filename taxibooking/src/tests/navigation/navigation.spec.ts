/**
 * navigation.spec.ts
 * TC12–TC15: Navigation links + page state verification
 */
import { expect } from '@playwright/test';
import { test }   from '../../fixtures/bookingFixture';

test.describe('Navigation & Page State', () => {

  test('TC12: All navigation links lead to correct pages', async ({ common, page }) => {
    await common.goToHome();     await expect(page).toHaveURL(/Home/i);
    await common.goToServices(); await expect(page).toHaveURL(/services/i);
    await common.goToContact();  await expect(page).toHaveURL(/contact/i);
    await common.goToBooking();  await expect(page).toHaveURL(/booking/i);
  });

  test('TC13: Booking page URL contains /booking', async ({ page }) => {
    await expect(page).toHaveURL(/booking/i);
  });

  test('TC14: Booking page has a non-empty title', async ({ page }) => {
    expect((await page.title()).length).toBeGreaterThan(0);
  });

  test('TC15: All required form fields are visible on page load', async ({ booking }) => {
    await expect(booking.fullNameInput).toBeVisible();
    await expect(booking.phoneInput).toBeVisible();
    await expect(booking.emailInput).toBeVisible();
    await expect(booking.cabSelectDropdown).toBeVisible();
    await expect(booking.cabTypeDropdown).toBeVisible();
    await expect(booking.pickupDateInput).toBeVisible();
    await expect(booking.pickupTimeInput).toBeVisible();
    await expect(booking.passengerDropdown).toBeVisible();
    await expect(booking.submitButton).toBeVisible();
  });

});
