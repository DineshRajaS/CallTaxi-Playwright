import { Page, Locator } from '@playwright/test';
import { Helper } from '@utils/helper';

/**
 * CommonPage — POM for shared navigation and validation error elements.
 * These elements appear across multiple pages (nav bar, error messages).
 */
export default class CommonPage {
  private readonly helper: Helper;
  private readonly page  : Page;

  // ── Navigation locators ───────────────────────────────────────────────────
  readonly homeLink    : Locator;
  readonly servicesLink: Locator;
  readonly bookingLink : Locator;
  readonly contactLink : Locator;

  // ── Validation error locators ─────────────────────────────────────────────
  readonly fullNameError    : Locator;
  readonly phoneNumberError : Locator;
  readonly emailError       : Locator;
  readonly tripError        : Locator;
  readonly cabTypeError     : Locator;
  readonly passengerError   : Locator;
  readonly pickupDateError  : Locator;
  readonly pickupTimeError  : Locator;

  constructor(helper: Helper) {
    this.helper = helper;
    this.page   = helper.getPage();

    // Navigation — role-based locators (more resilient than text selectors)
    this.homeLink     = this.page.getByRole('link', { name: 'Home' });
    this.servicesLink = this.page.getByRole('link', { name: 'Services' });
    this.bookingLink  = this.page.getByRole('link', { name: 'Booking' });
    this.contactLink  = this.page.getByRole('link', { name: 'Contact' });

    // Validation error spans
    this.fullNameError     = this.page.locator('#invalidname');
    this.phoneNumberError  = this.page.locator('#invalidphno');
    this.emailError        = this.page.locator('#invalidemail');
    this.tripError         = this.page.locator('#invalidtrip');
    this.cabTypeError      = this.page.locator('#invalidcab');
    this.passengerError    = this.page.locator('#invalidcount');
    this.pickupDateError   = this.page.locator('#invaliddate');
    this.pickupTimeError   = this.page.locator('#invalidtime');
  }

  // ── Navigation methods ────────────────────────────────────────────────────

  async goToHome()     : Promise<void> { await this.homeLink.click(); }
  async goToServices() : Promise<void> { await this.servicesLink.click(); }
  async goToBooking()  : Promise<void> { await this.bookingLink.click(); }
  async goToContact()  : Promise<void> { await this.contactLink.click(); }

  // ── Error text getters ────────────────────────────────────────────────────

  async getFullNameError()   : Promise<string> { return (await this.fullNameError.textContent())    ?? ''; }
  async getPhoneNumberError(): Promise<string> { return (await this.phoneNumberError.textContent()) ?? ''; }
  async getEmailError()      : Promise<string> { return (await this.emailError.textContent())       ?? ''; }
  async getTripError()       : Promise<string> { return (await this.tripError.textContent())        ?? ''; }
  async getCabTypeError()    : Promise<string> { return (await this.cabTypeError.textContent())     ?? ''; }
  async getPassengerError()  : Promise<string> { return (await this.passengerError.textContent())   ?? ''; }
  async getPickupDateError() : Promise<string> { return (await this.pickupDateError.textContent())  ?? ''; }
  async getPickupTimeError() : Promise<string> { return (await this.pickupTimeError.textContent())  ?? ''; }

  // ── Visibility checks ─────────────────────────────────────────────────────

  async isErrorVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /** Returns true only when ALL 6 mandatory validation errors are visible */
  async allValidationErrorsVisible(): Promise<boolean> {
    const checks = await Promise.all([
      this.fullNameError.isVisible(),
      this.phoneNumberError.isVisible(),
      this.emailError.isVisible(),
      this.tripError.isVisible(),
      this.cabTypeError.isVisible(),
      this.passengerError.isVisible(),
    ]);
    return checks.every(Boolean);
  }
}
