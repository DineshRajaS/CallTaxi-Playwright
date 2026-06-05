/**
 * negativeValidation.spec.ts
 * TC07–TC11: Negative testing with expect.soft() + visibility assertions
 */
import { expect } from '@playwright/test';
import { test }   from '../../fixtures/bookingFixture';
import { generateBookingScenarios } from '../../testData/generateBooking';

test.describe('Booking — Negative Validation', () => {

  test('TC07: Empty form submit shows all required field errors', async ({ booking, common }) => {
    await booking.submitForm();

    // expect.soft() collects ALL failures instead of stopping at first
    expect.soft(await common.getFullNameError(),    'Full name error').toBe('Please enter the name');
    expect.soft(await common.getPhoneNumberError(), 'Phone error').toBe('Please enter the Phone number');
    expect.soft(await common.getEmailError(),       'Email error').toBe('Please enter the email');
    expect.soft(await common.getTripError(),        'Trip error').toBe('Please Select the Trip');
    expect.soft(await common.getCabTypeError(),     'Cab error').toBe('Please Select the Cab Type');
    expect.soft(await common.getPassengerError(),   'Passenger error').toBe('Please Select the number of passengers');

    // Final hard check: fail if any soft assertion failed
    expect(test.info().errors).toHaveLength(0);
  });

  test('TC08: Partial fill (name only) shows remaining errors', async ({ booking, common }) => {
    await booking.fullNameInput.fill('Partial User');
    await booking.submitForm();

    await expect(common.phoneNumberError).toBeVisible();
    await expect(common.emailError).toBeVisible();
    await expect(common.tripError).toBeVisible();
    await expect(common.cabTypeError).toBeVisible();
    await expect(common.passengerError).toBeVisible();
    // await expect(common.fullNameError).not.toBeVisible();
    await expect(common.fullNameError).toHaveText('', { timeout: 5000 });
  });

  test('TC09: Invalid email format triggers email error', async ({ booking, common }) => {
    const { invalidEmail } = generateBookingScenarios();
    await booking.fullNameInput.fill(invalidEmail.fullName);
    await booking.phoneInput.fill(invalidEmail.phoneNumber);
    await booking.emailInput.fill('not-an-email-address');
    await booking.submitForm();
    await expect(common.emailError).toBeVisible();
    await expect(booking.confirmationMsg).not.toBeVisible();
  });

  test('TC10: Submit button is visible and enabled on page load', async ({ booking }) => {
    await expect(booking.submitButton).toBeVisible();
    await expect(booking.submitButton).toBeEnabled();
  });

  test('TC11: Confirmation message is not visible before form submit', async ({ booking }) => {
    await expect(booking.confirmationMsg).not.toBeVisible();
    await expect(booking.bookingTable).not.toBeVisible();
  });

});
