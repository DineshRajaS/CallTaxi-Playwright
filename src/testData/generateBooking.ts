import { faker } from '@faker-js/faker';

// ── Types ─────────────────────────────────────────────────────────────────────

export type TripValue    = 'long trip' | 'local trip';
// export type CabSelect    = 'Micro' | 'Mini' | 'Sedan' | 'SUV' | 'XUV';
export type CabSelect    = 'Micro' | 'Mini' | 'Sedan' | 'Suv';
export type CabType      = 'AC' | 'Non-Ac';
export type PassengerCount = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type TripType     = 'oneway' | 'roundtrip';

export interface BookingData {
  fullName      : string;
  phoneNumber   : string;
  email         : string;
  tripValue     : TripValue;
  cabSelect     : CabSelect;
  cabType       : CabType;
  pickupDate    : string;   // YYYY-MM-DD
  pickupTime    : string;   // HH:MM
  passengerCount: PassengerCount;
  tripType      : TripType;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// const CAB_SELECTS:   CabSelect[]      = ['Micro', 'Mini', 'Sedan', 'SUV', 'XUV'];
const CAB_SELECTS:   CabSelect[]      = ['Micro', 'Mini', 'Sedan', 'Suv'];
const CAB_TYPES:     CabType[]        = ['AC', 'Non-Ac'];
const PASSENGER_COUNTS: PassengerCount[] = ['1','2','3','4','5','6','7','8'];
const TRIP_VALUES:   TripValue[]      = ['long trip', 'local trip'];
const TRIP_TYPES:    TripType[]       = ['oneway', 'roundtrip'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Future date in YYYY-MM-DD format, offset days ahead */
function futureDate(offsetDays = 3): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/** Time as HH:MM */
function randomTime(): string {
  const h = String(faker.number.int({ min: 6, max: 22 })).padStart(2, '0');
  const m = String(faker.helpers.arrayElement([0, 15, 30, 45])).padStart(2, '0');
  return `${h}:${m}`;
}

// ── Generators ────────────────────────────────────────────────────────────────

/**
 * generateBooking()
 * Produces a fully random, realistic BookingData on every call.
 * Email is timestamped to guarantee uniqueness per test run.
 */
export function generateBooking(): BookingData {
  return {
    fullName:       faker.person.fullName(),
    phoneNumber:    faker.string.numeric(10),           // 10-digit number
    email:          `taxi_${Date.now()}@testmail.com`,  // unique per run
    tripValue:      pick(TRIP_VALUES),
    cabSelect:      pick(CAB_SELECTS),
    cabType:        pick(CAB_TYPES),
    pickupDate:     futureDate(faker.number.int({ min: 1, max: 30 })),
    pickupTime:     randomTime(),
    passengerCount: pick(PASSENGER_COUNTS),
    tripType:       pick(TRIP_TYPES),
  };
}

/**
 * generateBookingScenarios()
 * Named scenarios used by specific test cases — BVA, edge, negative.
 */
export function generateBookingScenarios() {
  const base = generateBooking();
  return {

    // ── Happy path (standard valid booking) ──────────────────────────────
    standard: {
      ...generateBooking(),
      tripValue:      'long trip'  as TripValue,
      cabSelect:      'Sedan'      as CabSelect,
      cabType:        'AC'         as CabType,
      passengerCount: '2'          as PassengerCount,
      tripType:       'oneway'     as TripType,
    },

    // ── Boundary: maximum length full name (50 chars) ────────────────────
    longName: {
      ...base,
      fullName: faker.string.alpha({ length: 50 }),
    },

    // ── Boundary: minimum length full name (2 chars) ─────────────────────
    shortName: {
      ...base,
      fullName: faker.string.alpha({ length: 2 }),
    },

    // ── Boundary: exactly 10-digit phone number ───────────────────────────
    exactPhone: {
      ...base,
      phoneNumber: faker.string.numeric(10),
    },

    // ── Boundary: pickup date = tomorrow (closest valid date) ─────────────
    tomorrowPickup: {
      ...base,
      pickupDate: futureDate(1),
    },

    // ── Boundary: maximum passengers (6) ─────────────────────────────────
    maxPassengers: {
      ...base,
      passengerCount: '6' as PassengerCount,
    },

    // ── Boundary: minimum passengers (1) ─────────────────────────────────
    minPassengers: {
      ...base,
      passengerCount: '1' as PassengerCount,
    },

    // ── Negative: empty phone (for validation test) ───────────────────────
    emptyPhone: {
      ...base,
      phoneNumber: '',
    },

    // ── Negative: invalid email format ────────────────────────────────────
    invalidEmail: {
      ...base,
      email: 'not-an-email-address',
    },

    // ── Equivalence: roundtrip + SUV + Non-AC ────────────────────────────
    roundtripSUV: {
      ...generateBooking(),
      tripValue:  'local trip'  as TripValue,
      cabSelect:  'Suv'         as CabSelect,
      cabType:    'Non-Ac'      as CabType,
      tripType:   'roundtrip'   as TripType,
    },

  };
}

// ── Standalone runner ─────────────────────────────────────────────────────────
// Run: npx ts-node src/testData/generateBooking.ts
if (require.main === module) {
  const scenarios = generateBookingScenarios();
  console.log('\n=== Generated Booking Scenarios ===\n');
  Object.entries(scenarios).forEach(([key, val]) => {
    console.log(`[${key}]`, JSON.stringify(val, null, 2));
  });
}
