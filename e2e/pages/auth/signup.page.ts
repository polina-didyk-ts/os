import { Page, Locator } from "@playwright/test";

export class SignUpPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("signup-name-input");
    this.emailInput = page.getByTestId("signup-email-input");
    this.passwordInput = page.getByTestId("signup-password-input");
    this.submitButton = page.getByTestId("signup-submit-button");
    this.signInLink = page.getByTestId("signup-signin-link");
    this.errorMessage = page.getByTestId("signup-error-message");
  }

  async goto() {
    await this.page.goto("/signup");
  }

  async signUp(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goToSignIn() {
    await this.signInLink.click();
  }
}
