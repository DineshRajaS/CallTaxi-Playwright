/**
 * happyPath.spec.ts — Positive booking flow
 * TC01–TC06: Functional, BVA, Equivalence Partitioning
 */
import { expect } from '@playwright/test';
import { test }   from '../../fixtures/bookingFixture';
import { generateBooking, generateBookingScenarios } from '../../testData/generateBooking';

test.describe('Booking — Positive / Happy Path', () => {

  test('TC01: Standard booking with Faker.js data confirms with correct table data',
    async ({ booking }) => {
      const data = generateBooking();
      console.log("TC01 Booking Data: ", data);
      await booking.fillForm(data);
      await booking.submitForm();

      await expect(booking.confirmationMsg).toBeVisible();
      expect(await booking.getConfirmationMessage()).toContain('Your Booking has been Confirmed');

      const t = await booking.getBookingTableData();
      console.log("Table Data: ", t);
      console.log("Table Data: ", t['Type of the cab']);
      expect(t['Passenger Name']).toBe(data.fullName);
      expect(t['Phone number']).toBe(data.phoneNumber);
      expect(t['Passenger email Id']).toBe(data.email);
      expect(t['Trip Type']).toBe(data.tripValue);
      expect(t['Type of the cab']).toBe(`${data.cabSelect.toLowerCase()} - ${data.cabType.replace('-','').toLowerCase()}`);
      expect(t['Pick up Date']).toBe(data.pickupDate);
      expect(t['Pick up Time']).toBe(data.pickupTime);
      expect(t['Number of passengers']).toBe(data.passengerCount);
      expect(t['Way of Trip']).toBe(data.tripType);
    }
  );

  test('TC02: Roundtrip + SUV + Non-AC (equivalence partition) confirms',
    async ({ booking }) => {
      const { roundtripSUV } = generateBookingScenarios();
      await booking.fillForm(roundtripSUV);
      await booking.submitForm();
      await expect(booking.confirmationMsg).toBeVisible();
      const t = await booking.getBookingTableData();
      expect(t['Way of Trip']).toBe('roundtrip');
      expect(t['Type of the cab']).toContain('suv');
      expect(t['Type of the cab']).toContain('nonac');
    }
  );

  test('TC03: Maximum passengers (6) — BVA upper boundary', async ({ booking }) => {
    const { maxPassengers } = generateBookingScenarios();
    await booking.fillForm(maxPassengers);
    await booking.submitForm();
    await expect(booking.confirmationMsg).toBeVisible();
    expect((await booking.getBookingTableData())['Number of passengers']).toBe('6');
  });

  test('TC04: Minimum passengers (1) — BVA lower boundary', async ({ booking }) => {
    const { minPassengers } = generateBookingScenarios();
    await booking.fillForm(minPassengers);
    await booking.submitForm();
    await expect(booking.confirmationMsg).toBeVisible();
    expect((await booking.getBookingTableData())['Number of passengers']).toBe('1');
  });

  test('TC05: Tomorrow as pickup date — BVA nearest valid date', async ({ booking }) => {
    const { tomorrowPickup } = generateBookingScenarios();
    await booking.fillForm(tomorrowPickup);
    await booking.submitForm();
    await expect(booking.confirmationMsg).toBeVisible();
    expect((await booking.getBookingTableData())['Pick up Date']).toBe(tomorrowPickup.pickupDate);
  });

  test('TC06: 50-character name — BVA max length boundary', async ({ booking, page }) => {
    const { longName } = generateBookingScenarios();
    await booking.fillForm(longName);
    await booking.submitForm();
    const confirmed  = await booking.isConfirmationVisible();
    const errorShown = await page.locator('#invalidname').isVisible().catch(() => false);
    expect(confirmed || errorShown).toBe(true);
  });

});
