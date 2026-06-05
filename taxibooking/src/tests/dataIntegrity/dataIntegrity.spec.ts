/**
 * dataIntegrity.spec.ts
 *
 * Test Suite: Data Integrity — Faker.js data-driven tests
 *
 * Covers:
 *   TC16 — Short name (2 chars) BVA lower boundary
 *   TC17 — Exactly 10-digit phone number BVA
 *   TC18 — Cab type equivalence partitions (data-driven loop)
 *   TC19 — Faker.js email echoed exactly in table
 */

import { expect } from '@playwright/test';
import { test }   from '../../fixtures/bookingFixture';
import {
  generateBooking,
  generateBookingScenarios,
  CabSelect,
  CabType,
} from '../../testData/generateBooking';

test.describe('Data Integrity — Faker.js Driven', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // TC16: Short name (2 chars) — BVA lower boundary
  // ─────────────────────────────────────────────────────────────────────────
  test('TC16: 2-character name is accepted or shows validation', async ({ booking, common }) => {
    const { shortName } = generateBookingScenarios();
    await booking.fillForm(shortName);
    await booking.submitForm();
    const confirmed  = await booking.isConfirmationVisible();
    const errorShown = await common.fullNameError.isVisible().catch(() => false);
    expect(confirmed || errorShown).toBe(true);
    if (confirmed) {
      const tableData = await booking.getBookingTableData();
      expect(tableData['Passenger Name']).toBe(shortName.fullName);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC17: Exactly 10-digit phone — BVA exact boundary
  // ─────────────────────────────────────────────────────────────────────────
  test('TC17: 10-digit phone is accepted and echoed correctly', async ({ booking }) => {
    const { exactPhone } = generateBookingScenarios();
    await booking.fillForm(exactPhone);
    await booking.submitForm();
    await expect(booking.confirmationMsg).toBeVisible();
    const tableData = await booking.getBookingTableData();
    expect(tableData['Phone number']).toBe(exactPhone.phoneNumber);
    expect(exactPhone.phoneNumber).toHaveLength(10);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC18: Equivalence Partitioning — 3 representative cab+type partitions
  // This is a data-driven loop: same test logic, different inputs
  // ─────────────────────────────────────────────────────────────────────────
  const cabPartitions: Array<{ cabSelect: CabSelect; cabType: CabType }> = [
    { cabSelect: 'Sedan', cabType: 'AC'     },
    { cabSelect: 'Micro', cabType: 'Non-Ac' },
    { cabSelect: 'Mini',   cabType: 'AC'     },
  ];

  for (const { cabSelect, cabType } of cabPartitions) {
    test(`TC18-${cabSelect}-${cabType}: Cab ${cabSelect}/${cabType} books successfully`,
      async ({ booking }) => {
        const data = { ...generateBooking(), cabSelect, cabType };
        await booking.fillForm(data);
        await booking.submitForm();
        await expect(booking.confirmationMsg).toBeVisible();
        const tableData = await booking.getBookingTableData();
        expect(tableData['Type of the cab']).toBe(`${data.cabSelect.toLowerCase()} - ${data.cabType.replace('-','').toLowerCase()}`);
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TC19: Faker.js-generated email echoed exactly in table
  // ─────────────────────────────────────────────────────────────────────────
  test('TC19: Faker.js email is echoed exactly in confirmation table', async ({ booking }) => {
    const data = generateBooking();
    await booking.fillForm(data);
    await booking.submitForm();
    await expect(booking.confirmationMsg).toBeVisible();
    const tableData = await booking.getBookingTableData();
    expect(tableData['Passenger email Id']).toBe(data.email);
    expect(data.email).toMatch(/^taxi_\d+@testmail\.com$/);
  });

});
