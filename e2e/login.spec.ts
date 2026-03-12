import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders the login page with all elements", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByPlaceholder("riya@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
    await expect(page.getByText("Forgot password?")).toBeVisible();
  });

  test("shows error when submitting empty form", async ({ page }) => {
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByText("Please fill in all fields")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    // Mock supabase to return auth error
    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.getByPlaceholder("riya@example.com").fill("wrong@test.com");
    await page.getByPlaceholder("••••••••").fill("WrongPass1");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("toggle password visibility", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("••••••••");
    await passwordInput.fill("TestPass1");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: /show password/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: /hide password/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("shows loading state while logging in", async ({ page }) => {
    // Delay the auth response
    await page.route("**/auth/v1/token**", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "invalid_grant" }),
      });
    });

    await page.getByPlaceholder("riya@example.com").fill("test@test.com");
    await page.getByPlaceholder("••••••••").fill("TestPass1");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText("Logging in...")).toBeVisible();
  });

  test("successful login navigates to /for-you", async ({ page }) => {
    // Mock successful auth
    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh",
          user: {
            id: "test-user-id",
            email: "test@test.com",
            user_metadata: { full_name: "Test User" },
          },
        }),
      });
    });

    await page.getByPlaceholder("riya@example.com").fill("test@test.com");
    await page.getByPlaceholder("••••••••").fill("ValidPass1");
    await page.getByRole("button", { name: /log in/i }).click();

    await page.waitForURL("**/for-you", { timeout: 10_000 });
  });

  test("forgot password requires email first", async ({ page }) => {
    await page.getByText("Forgot password?").click();
    await expect(
      page.getByText(/enter your email first/i)
    ).toBeVisible();
  });

  test("forgot password sends reset email", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.getByPlaceholder("riya@example.com").fill("test@test.com");
    await page.getByText("Forgot password?").click();

    await expect(page.getByText(/check your inbox/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("has link to signup page", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: /sign up/i });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("has back to home link", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /back to home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });
});
