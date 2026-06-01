import { Page, Locator } from '@playwright/test';

/**
 * Helper — low-level wrapper around Playwright's Page API.
 * Keeps page interaction logic DRY across all POM classes.
 * Every method logs the action via Playwright's built-in step tracing.
 */
export class Helper {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Expose raw page for locator declarations in POM constructors */
  getPage(): Page {
    return this.page;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async click(locator: string): Promise<void> {
    await this.page.locator(locator).click();
  }

  async type(locator: string, value: string): Promise<void> {
    await this.page.locator(locator).fill(value);
  }

  async select(locator: string, value: string): Promise<void> {
    await this.page.locator(locator).selectOption(value);
  }

  async check(locator: string): Promise<void> {
    await this.page.locator(locator).check();
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  async getText(locator: string): Promise<string> {
    return (await this.page.locator(locator).textContent()) ?? '';
  }

  async getValue(locator: string): Promise<string> {
    return await this.page.locator(locator).inputValue();
  }

  async isVisible(locator: string): Promise<boolean> {
    return await this.page.locator(locator).isVisible();
  }

  async isEnabled(locator: string): Promise<boolean> {
    return await this.page.locator(locator).isEnabled();
  }

  // ── Waits ─────────────────────────────────────────────────────────────────

  async waitForVisible(locator: string, timeout = 8000): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(locator: string, timeout = 8000): Promise<void> {
    await this.page.locator(locator).waitFor({ state: 'hidden', timeout });
  }
}
