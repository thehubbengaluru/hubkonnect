import { test, expect } from "@playwright/test";
import { mockAuthSession } from "./helpers";

test.describe("Messages page", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, {
      id: "test-user-id",
      email: "test@test.com",
      fullName: "Test User",
      onboardingCompleted: true,
    });
  });

  test.describe("Empty state", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/rest/v1/messages*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });
    });

    test("renders messages page header", async ({ page }) => {
      await page.goto("/messages");
      await expect(
        page.getByRole("heading", { name: /messages/i })
      ).toBeVisible({ timeout: 15_000 });
    });

    test("shows empty conversations state", async ({ page }) => {
      await page.goto("/messages");
      await expect(
        page.getByText(/no conversations yet/i)
      ).toBeVisible({ timeout: 15_000 });
    });

    test("shows select conversation prompt on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto("/messages");
      await expect(
        page.getByText(/select a conversation/i)
      ).toBeVisible({ timeout: 15_000 });
    });
  });

  test.describe("With conversations", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/rest/v1/messages*", async (route) => {
        const method = route.request().method();

        if (method === "PATCH") {
          await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
          return;
        }

        if (method === "POST") {
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify([{
              id: "new-msg-id",
              sender_id: "test-user-id",
              receiver_id: "partner-id",
              content: "Hello!",
              read: false,
              created_at: new Date().toISOString(),
            }]),
          });
          return;
        }

        // GET messages
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "msg-1",
              sender_id: "partner-id",
              receiver_id: "test-user-id",
              content: "Hey there! How are you?",
              read: false,
              created_at: "2025-12-01T10:00:00Z",
            },
            {
              id: "msg-2",
              sender_id: "test-user-id",
              receiver_id: "partner-id",
              content: "I'm doing great, thanks!",
              read: true,
              created_at: "2025-12-01T10:05:00Z",
            },
            {
              id: "msg-3",
              sender_id: "partner-id",
              receiver_id: "test-user-id",
              content: "Glad to hear that!",
              read: false,
              created_at: "2025-12-01T10:10:00Z",
            },
          ]),
        });
      });

      // Mock profile lookup for partner
      await page.route("**/rest/v1/profiles*", async (route) => {
        const url = route.request().url();
        if (route.request().method() !== "GET") {
          await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
          return;
        }
        if (url.includes("partner-id")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([{
              id: "partner-id",
              full_name: "Chat Partner",
              avatar_url: "",
              bio: "Partner bio",
              onboarding_completed: true,
              privacy: "public",
              instagram: "",
              linkedin: "",
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            }]),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "test-user-id",
              full_name: "Test User",
              bio: "E2E test bio",
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
    });

    test("shows conversation list with partner name", async ({ page }) => {
      await page.goto("/messages");
      await expect(page.getByText("Chat Partner")).toBeVisible({ timeout: 15_000 });
    });

    test("shows last message preview", async ({ page }) => {
      await page.goto("/messages");
      await expect(
        page.getByText(/glad to hear|hey there|doing great/i).first()
      ).toBeVisible({ timeout: 15_000 });
    });

    test("opens chat when clicking a conversation", async ({ page }) => {
      await page.goto("/messages");
      await page.getByText("Chat Partner").first().click();
      await expect(page.getByText("Hey there! How are you?")).toBeVisible({ timeout: 15_000 });
    });

    test("shows message input when chat is open", async ({ page }) => {
      await page.goto("/messages?chat=partner-id");
      await expect(page.getByPlaceholder(/type a message/i)).toBeVisible({ timeout: 15_000 });
    });

    test("can type a message in the input", async ({ page }) => {
      await page.goto("/messages?chat=partner-id");
      const msgInput = page.getByPlaceholder(/type a message/i);
      await expect(msgInput).toBeVisible({ timeout: 15_000 });
      await msgInput.fill("Hello from E2E test!");
      await expect(msgInput).toHaveValue("Hello from E2E test!");
    });

    test("shows conversations label", async ({ page }) => {
      await page.goto("/messages");
      await expect(page.getByText("Conversations")).toBeVisible({ timeout: 15_000 });
    });
  });
});
