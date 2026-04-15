import { Page, Locator } from "@playwright/test";

export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("signin-email-input");
    this.passwordInput = page.getByTestId("signin-password-input");
    this.submitButton = page.getByTestId("signin-submit-button");
    this.signUpLink = page.getByTestId("signin-signup-link");
    this.errorMessage = page.getByTestId("signin-error-message");
  }

  async goto() {
    await this.page.goto("/signin");
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async goToSignUp() {
    await this.signUpLink.click();
  }
}
