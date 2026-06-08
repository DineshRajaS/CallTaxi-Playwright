// src/tests/apiAndContext.spec.ts
// NEW FILE
// Module 6: API testing with Playwright (request fixture)
// Module 5: Browser contexts — session isolation
//
// ── COPILOT REVIEW NOTE ─────────────────────────────────────────────────────
// Copilot generated JSON assertions for the API tests:
//   const json = await response.json();
//   expect(json.status).toBe('ok');
//
// Problem: CallTaxi is a static HTML site — every page returns text/html.
// response.json() throws a SyntaxError on HTML content.
// Corrected to response.text() with toContain() checks on real strings
// found on each page (verified by visiting the live URLs directly).
//
// Copilot also used browser.newPage() for the context isolation test.
// Problem: newPage() shares the same browser context — same cookies,
// same local storage — so it does NOT demonstrate true session isolation.
// Must use browser.newContext() which creates a fully independent session.
// ────────────────────────────────────────────────────────────────────────────

import { test, expect, request } from '@playwright/test';

const BASE = 'https://webapps.tekstac.com/SeleniumApp2/CallTaxiService';

// ── Module 6: API testing ─────────────────────────────────────────────────────
// Calls each page as a plain HTTP request — no browser launched.
// Validates status code and presence of key content specific to that page.

// test.describe('API — CallTaxi page HTTP responses', () => {

//     test('TC-API-01 | GET booking.html — 200, booking form elements present', async ({ request }) => {
//         const response = await request.get(`${BASE}/booking.html`);

//         expect(response.status()).toBe(200);

//         const body = await response.text();
//         expect(body).toContain('Book Now');
//         expect(body).toContain('fullname');      // Full Name input ID
//         expect(body).toContain('cabselect');     // Cab dropdown ID
//         expect(body).toContain('submitted');     // Submit button ID
//     });

//     test('TC-API-02 | GET Home.html — 200, home page content present', async ({ request }) => {
//         const response = await request.get(`${BASE}/Home.html`);

//         expect(response.status()).toBe(200);

//         const body = await response.text();
//         expect(body).toContain('Call Taxi Service');
//         expect(body).toContain('Book Now');
//     });

//     test('TC-API-03 | GET services.html — 200, all four cab types listed', async ({ request }) => {
//         const response = await request.get(`${BASE}/services.html`);

//         expect(response.status()).toBe(200);

//         const body = await response.text();
//         expect(body).toContain('Type of Cab Services');
//         expect(body).toContain('Mini');
//         expect(body).toContain('Micro');
//         expect(body).toContain('Sedan');
//         expect(body).toContain('Suv');
//     });

//     test('TC-API-04 | GET contact.html — 200, real contact details present', async ({ request }) => {
//         const response = await request.get(`${BASE}/contact.html`);

//         expect(response.status()).toBe(200);

//         const body = await response.text();
//         expect(body).toContain('Contact');
//         expect(body).toContain('0422 4567890');          // real phone from the page
//         expect(body).toContain('info@jujutaxi.co.in');   // real email from the page
//     });

//     test('TC-API-05 | GET nonexistent page — returns 404', async ({ request }) => {
//         const response = await request.get(`${BASE}/nonexistent-xyz.html`);
//         expect(response.status()).toBe(404);
//     });

// });


const baseURL = "http://lmsreact.tekstac.com:3003/taxiBooking";

test.describe('API — CallTaxi page HTTP responses', () => {

  test('GET /taxiBooking - should return 200 and valid booking data', async () => {
    const context = await request.newContext();
    const response = await context.get(`${baseURL}`);

    // Check status code
    expect(response.status()).toBe(200);

    // Check that response body is valid
    const body = await response.json();
    expect(body).toBeDefined();
    expect(typeof body).toBe('object');
    expect(Object.keys(body).length).toBeGreaterThan(0);
  });

  test('POST /taxiBooking - should create a new booking and return 201', async () => {
    const context = await request.newContext();

    const newData = {
        "id": "TC-011",
        "fullName": "Marco Johnson",
        "phoneNumber": "9876543110",
        "email": "marc0@gmail.com",
        "tripValue": "long trip",
        "cabSelect": "mini",
        "cabType": "ac",
        "pickupDate": "2027-03-12",
        "pickupTime": "11:00",
        "passengerCount": "4",
        "tripType": "oneway"
    }

    const response = await context.post(`${baseURL}`, {
      data: newData
    });

    // Check status code
    expect(response.status()).toBe(201);

    // Check response body
    const body = await response.json();
    expect(body).toBeDefined();
    expect(body.fullName).toBe(newData.fullName);
    expect(body.cabType).toBe(newData.cabType);
  });

});


// ── Module 5: Browser contexts — session isolation ───────────────────────────
// Each newContext() is a completely independent browser session.
// Proves that User A's form state does not leak into User B's session.

test.describe('Browser contexts — session isolation', () => {

    test('TC-CTX-01 | Two sessions keep form state independent', async ({ browser }) => {
        // Session A: User A fills their name in the booking form
        const contextA = await browser.newContext();
        const pageA    = await contextA.newPage();
        await pageA.goto(`${BASE}/booking.html`);
        await pageA.locator('#fullname').fill('Alice Johnson');

        // Session B: completely fresh session — form must be empty
        const contextB = await browser.newContext();
        const pageB    = await contextB.newPage();
        await pageB.goto(`${BASE}/booking.html`);

        const valueInB = await pageB.locator('#fullname').inputValue();
        expect(valueInB).toBe('');   // Session B sees a clean empty form

        const valueInA = await pageA.locator('#fullname').inputValue();
        expect(valueInA).toBe('Alice Johnson');  // Session A is unaffected

        await contextA.close();
        await contextB.close();
    });

    test('TC-CTX-02 | Two sessions can navigate different pages simultaneously', async ({ browser }) => {
        const [ctxA, ctxB] = await Promise.all([
            browser.newContext(),
            browser.newContext(),
        ]);

        const [pageA, pageB] = await Promise.all([
            ctxA.newPage(),
            ctxB.newPage(),
        ]);

        // Both load different pages in parallel
        await Promise.all([
            pageA.goto(`${BASE}/services.html`),
            pageB.goto(`${BASE}/contact.html`),
        ]);

        const bodyA = await pageA.content();
        const bodyB = await pageB.content();

        // Each session loaded its own page — no crossover
        expect(bodyA).toContain('Type of Cab Services');  // services page
        expect(bodyB).toContain('0422 4567890');           // contact page

        await ctxA.close();
        await ctxB.close();
    });

});
