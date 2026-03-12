import { test, expect } from "@playwright/test";
import { mockAuthSession } from "./helpers";

test.describe("Profile pages", () => {
  test.describe("My Profile (/profile)", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthSession(page, {
        id: "test-user-id",
        email: "test@test.com",
        fullName: "Test User",
        onboardingCompleted: true,
      });
    });

    test("renders profile page with user info", async ({ page }) => {
      await page.goto("/profile");
      await expect(page.getByText("Test User")).toBeVisible({ timeout: 15_000 });
    });

    test("page loads without crashing", async ({ page }) => {
      await page.goto("/profile");
      // Should not redirect to login
      await page.waitForTimeout(3000);
      expect(page.url()).toContain("/profile");
    });
  });

  test.describe("Other user Profile (/profile/:id)", () => {
    test.beforeEach(async ({ page }) => {
      await mockAuthSession(page, {
        id: "my-user-id",
        email: "me@test.com",
        fullName: "My User",
        onboardingCompleted: true,
      });

      // Override profile route to serve different profiles based on URL
      await page.route("**/rest/v1/profiles*", async (route) => {
        const url = route.request().url();
        if (route.request().method() !== "GET") {
          await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
          return;
        }

        if (url.includes("other-user-id")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "other-user-id",
              full_name: "Other User",
              bio: "This is another user's bio",
              instagram: "otheruser",
              linkedin: "",
              avatar_url: "",
              privacy: "public",
              onboarding_completed: true,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "my-user-id",
              full_name: "My User",
              bio: "Me",
              onboarding_completed: true,
              privacy: "public",
              avatar_url: "",
              instagram: "",
              linkedin: "",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            }),
          });
        }
      });

      // Mock connections
      await page.route("**/rest/v1/connections*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });
    });

    test("renders other user profile", async ({ page }) => {
      await page.goto("/profile/other-user-id");
      await expect(page.getByText("Other User")).toBeVisible({ timeout: 15_000 });
    });

    test("shows connect button for non-connected users", async ({ page }) => {
      await page.goto("/profile/other-user-id");
      await expect(
        page.getByRole("button", { name: /connect/i }).first()
      ).toBeVisible({ timeout: 15_000 });
    });
  });
});
