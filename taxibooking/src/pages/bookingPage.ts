import { Page, Locator } from '@playwright/test';
import { Helper } from '@utils/helper';
import { BookingData } from '@testData/generateBooking';

/**
 * BookingPage — POM for the Call Taxi Service booking form.
 *
 * Design decisions:
 *  - All locators declared as readonly Locator properties in the constructor.
 *  - Methods are named after user intent, not element interactions.
 *  - fillForm() accepts the full BookingData interface — no magic strings in tests.
 */
export default class BookingPage {
  private readonly helper: Helper;
  private readonly page  : Page;

  // ── Form field locators ───────────────────────────────────────────────────
  readonly fullNameInput    : Locator;
  readonly phoneInput       : Locator;
  readonly emailInput       : Locator;
  readonly longTripRadio    : Locator;
  readonly localTripRadio   : Locator;
  readonly cabSelectDropdown: Locator;
  readonly cabTypeDropdown  : Locator;
  readonly pickupDateInput  : Locator;
  readonly pickupTimeInput  : Locator;
  readonly passengerDropdown: Locator;
  readonly onewayRadio      : Locator;
  readonly roundtripRadio   : Locator;
  readonly submitButton     : Locator;

  // ── Result locators ───────────────────────────────────────────────────────
  readonly confirmationMsg  : Locator;
  readonly bookingTable     : Locator;

  constructor(helper: Helper) {
    this.helper = helper;
    this.page   = helper.getPage();

    // Form fields — using stable IDs from the application
    this.fullNameInput     = this.page.locator('#fullname');
    this.phoneInput        = this.page.locator('#phonenumber');
    this.emailInput        = this.page.locator('#email');
    this.longTripRadio     = this.page.locator('#long');
    this.localTripRadio    = this.page.locator('#local');
    this.cabSelectDropdown = this.page.locator('#cabselect');
    this.cabTypeDropdown   = this.page.locator('#cabType');
    this.pickupDateInput   = this.page.locator('#pickupdate');
    this.pickupTimeInput   = this.page.locator('#pickuptime');
    this.passengerDropdown = this.page.locator('#passenger');
    this.onewayRadio       = this.page.locator('#oneway');
    this.roundtripRadio    = this.page.locator('#roundtrip');
    this.submitButton      = this.page.locator('#submitted');

    // Result elements
    this.confirmationMsg   = this.page.locator('#confirm');
    this.bookingTable      = this.page.locator('#display');
  }

  // ── Page action methods ───────────────────────────────────────────────────

  /**
   * fillForm() — fills the entire booking form from a BookingData object.
   * Keeps all element interaction inside the POM; tests stay declarative.
   */
  async fillForm(data: BookingData): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.phoneInput.fill(data.phoneNumber);
    await this.emailInput.fill(data.email);

    // Trip type (radio)
    if (data.tripValue === 'long trip') {
      await this.longTripRadio.check();
    } else {
      await this.localTripRadio.check();
    }

    await this.cabSelectDropdown.selectOption(data.cabSelect);
    await this.cabTypeDropdown.selectOption(data.cabType);
    await this.pickupDateInput.fill(data.pickupDate);
    await this.pickupTimeInput.fill(data.pickupTime);
    await this.passengerDropdown.selectOption(data.passengerCount);

    // Way of trip (radio)
    if (data.tripType === 'oneway') {
      await this.onewayRadio.check();
    } else {
      await this.roundtripRadio.check();
    }
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  /** Returns the confirmation message text */
  async getConfirmationMessage(): Promise<string> {
    await this.confirmationMsg.waitFor({ state: 'visible', timeout: 8000 });
    return (await this.confirmationMsg.textContent()) ?? '';
  }

  /**
   * getBookingTableData()
   * Reads the summary table into a key-value map.
   * e.g. { 'Passenger Name': 'John Smith', 'Trip Type': 'long trip' }
   */
  async getBookingTableData(): Promise<Record<string, string>> {
    await this.bookingTable.waitFor({ state: 'visible', timeout: 8000 });
    const rows: Record<string, string> = {};
    const tableRows = await this.page.locator('#display tr').all();
    for (const row of tableRows) {
      const cells = await row.locator('td').allTextContents();
      if (cells.length === 2) {
        rows[cells[0].trim()] = cells[1].trim();
      }
    }
    return rows;
  }

  /** Checks whether the confirmation section is visible */
  async isConfirmationVisible(): Promise<boolean> {
    return await this.confirmationMsg.isVisible();
  }
}
