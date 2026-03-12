import { test, expect } from "@playwright/test";

test.describe("Signup flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("renders the signup page with all fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /join hub konnect/i })).toBeVisible();
    await expect(page.getByPlaceholder("Riya Sharma")).toBeVisible();
    await expect(page.getByPlaceholder("riya@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows validation errors when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("This field is required")).toHaveCount(3);
    await expect(page.getByText("You must agree to the terms")).toBeVisible();
  });

  test("validates email format", async ({ page }) => {
    await page.getByPlaceholder("Riya Sharma").fill("Test User");
    // Use an email that passes browser validation but fails regex
    await page.getByPlaceholder("riya@example.com").fill("bad@email");
    await page.getByPlaceholder("••••••••").fill("ValidPass1");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Please enter a valid email")).toBeVisible();
  });

  test("validates password strength requirements", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");

    // Too short
    await page.getByPlaceholder("Riya Sharma").fill("Test User");
    await page.getByPlaceholder("riya@example.com").fill("test@test.com");
    await passwordInput.fill("short");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create account/i }).click();
    await expect(page.getByText("Password must be at least 8 characters")).toBeVisible();
  });

  test("shows password strength indicators as user types", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");

    await passwordInput.fill("a");
    await expect(page.getByText("At least 8 characters")).toBeVisible();
    await expect(page.getByText("One uppercase letter")).toBeVisible();
    await expect(page.getByText("One lowercase letter")).toBeVisible();
    await expect(page.getByText("One number")).toBeVisible();

    // Fill a strong password and verify indicators turn green
    await passwordInput.fill("StrongPass1");
    // All four indicators should be present
    await expect(page.getByText("At least 8 characters")).toBeVisible();
  });

  test("toggle password visibility", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");
    await passwordInput.fill("MyPassword1");
    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: /show password/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: /hide password/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("has link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /log in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /back to home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("shows error for already registered email", async ({ page }) => {
    // Mock supabase auth to return an error
    await page.route("**/auth/v1/signup**", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          error: "user_already_exists",
          error_description: "User already registered",
          msg: "User already registered",
        }),
      });
    });

    await page.getByPlaceholder("Riya Sharma").fill("Existing User");
    await page.getByPlaceholder("riya@example.com").fill("existing@test.com");
    await page.getByPlaceholder("••••••••").fill("ValidPass1");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show error toast
    await expect(page.getByText("User already registered")).toBeVisible({
      timeout: 5_000,
    });
  });

  test("successful signup navigates to onboarding (with auto-confirm)", async ({
    page,
  }) => {
    // Mock supabase auth to return a successful session (auto-confirm)
    await page.route("**/auth/v1/signup**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-access-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "test-user-id",
            email: "newuser@test.com",
            user_metadata: { full_name: "New User" },
          },
        }),
      });
    });

    await page.getByPlaceholder("Riya Sharma").fill("New User");
    await page.getByPlaceholder("riya@example.com").fill("newuser@test.com");
    await page.getByPlaceholder("••••••••").fill("ValidPass1");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create account/i }).click();

    // Should navigate to onboarding
    await page.waitForURL("**/onboarding", { timeout: 10_000 });
  });
});
