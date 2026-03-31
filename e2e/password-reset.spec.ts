import { test, expect } from "@playwright/test";

test.describe("Password reset flow", () => {
  test("renders reset password page", async ({ page }) => {
    await page.goto("/reset-password");

    // The reset password page should render
    await expect(page.locator("body")).toBeVisible();
  });

  test("forgot password from login - shows error without email", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByText("Forgot password?").click();

    await expect(
      page.getByText(/enter your email first/i)
    ).toBeVisible();
  });

  test("forgot password from login - sends reset email", async ({ page }) => {
    // Mock the reset password API
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto("/login");
    await page.getByPlaceholder("riya@example.com").fill("user@test.com");
    await page.getByText("Forgot password?").click();

    // Should show success toast
    await expect(page.getByText("Check your inbox", { exact: true })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("forgot password - shows error on API failure", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "server_error",
          error_description: "Internal server error",
        }),
      });
    });

    await page.goto("/login");
    await page.getByPlaceholder("riya@example.com").fill("user@test.com");
    await page.getByText("Forgot password?").click();

    await expect(
      page.getByText(/could not send reset email/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});
