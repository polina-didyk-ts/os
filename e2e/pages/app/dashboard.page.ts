import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly userInfo: Locator;
  readonly userName: Locator;
  readonly userEmail: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userInfo = page.getByTestId("dashboard-user-info");
    this.userName = page.getByTestId("dashboard-user-name");
    this.userEmail = page.getByTestId("dashboard-user-email");
    this.successMessage = page.getByTestId("dashboard-success-message");
  }

  async goto() {
    await this.page.goto("/app");
  }

  async getUserName(): Promise<string> {
    return (await this.userName.textContent()) || "";
  }

  async getUserEmail(): Promise<string> {
    return (await this.userEmail.textContent()) || "";
  }
}
