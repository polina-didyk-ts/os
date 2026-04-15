import { Page, Locator } from "@playwright/test";

export class HeaderComponent {
  readonly page: Page;
  readonly logo: Locator;
  readonly dashboardLink: Locator;
  readonly notesLink: Locator;
  readonly userInfo: Locator;
  readonly signOutButton: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByTestId("header-logo");
    this.dashboardLink = page.getByTestId("header-dashboard-link");
    this.notesLink = page.getByTestId("header-notes-link");
    this.userInfo = page.getByTestId("header-user-info");
    this.signOutButton = page.getByTestId("header-signout-button");
    this.mobileMenuButton = page.getByTestId("header-mobile-menu-button");
  }

  async goToDashboard() {
    await this.dashboardLink.click();
  }

  async goToNotes() {
    await this.notesLink.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }

  async isUserInfoVisible(): Promise<boolean> {
    return await this.userInfo.isVisible();
  }
}
