import { Page, expect } from "@playwright/test";

const SUPABASE_PROJECT_REF = "hlgssmptnrmjgusnkqhc";
const STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

interface MockUser {
  id: string;
  email: string;
  fullName: string;
  onboardingCompleted?: boolean;
}

/**
 * Mock a Supabase authenticated session for protected route tests.
 * Injects session into localStorage and intercepts auth/profile API calls.
 */
export async function mockAuthSession(
  page: Page,
  user: MockUser = {
    id: "test-user-id",
    email: "test@test.com",
    fullName: "Test User",
    onboardingCompleted: true,
  }
) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;

  const mockSession = {
    access_token: "mock-access-token-for-e2e",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    refresh_token: "mock-refresh-token",
    user: {
      id: user.id,
      aud: "authenticated",
      role: "authenticated",
      email: user.email,
      email_confirmed_at: "2025-01-01T00:00:00Z",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { full_name: user.fullName },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  };

  // Inject session into localStorage before page loads
  await page.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: STORAGE_KEY, session: mockSession }
  );

  // Intercept /auth/v1/user (session validation)
  await page.route("**/auth/v1/user**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSession.user),
    });
  });

  // Intercept /auth/v1/token (refresh)
  await page.route("**/auth/v1/token**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSession),
    });
  });

  // Intercept profile fetch
  await page.route("**/rest/v1/profiles*", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: user.id,
          full_name: user.fullName,
          bio: "E2E test bio",
          instagram: "testuser",
          linkedin: "https://linkedin.com/in/testuser",
          avatar_url: "",
          privacy: "public",
          onboarding_completed: user.onboardingCompleted ?? true,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
  });

  // Mock related profile tables (return empty by default)
  for (const table of [
    "profile_skills",
    "profile_interests",
    "profile_looking_for",
    "profile_member_types",
  ]) {
    await page.route(`**/rest/v1/${table}*`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });
  }
}

/**
 * Sign up a brand-new user through the UI.
 */
export async function signUpViaUI(
  page: Page,
  { name, email, password }: { name: string; email: string; password: string }
) {
  await page.goto("/signup");
  await page.getByPlaceholder("Riya Sharma").fill(name);
  await page.getByPlaceholder("riya@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("checkbox", { name: /terms/i }).check();
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/signup"), {
    timeout: 15_000,
  });
}

/**
 * Log in an existing user through the UI.
 */
export async function loginViaUI(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByPlaceholder("riya@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("**/for-you", { timeout: 15_000 });
}

/**
 * Ensure the user is logged out.
 */
export async function logout(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.context().clearCookies();
}

/**
 * Wait for the app shell / Navbar to be visible.
 */
export async function waitForAppShell(page: Page) {
  await expect(
    page.locator("nav, [data-testid='navbar'], header").first()
  ).toBeVisible({ timeout: 15_000 });
}
