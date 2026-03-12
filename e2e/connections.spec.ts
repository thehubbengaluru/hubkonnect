import { test, expect } from "@playwright/test";
import { mockAuthSession } from "./helpers";

test.describe("Connections page", () => {
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
      await page.route("**/rest/v1/connections*", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });
    });

    test("renders connections page header", async ({ page }) => {
      await page.goto("/connections");
      await expect(
        page.getByRole("heading", { name: /my connections/i })
      ).toBeVisible({ timeout: 15_000 });
    });

    test("shows three tabs", async ({ page }) => {
      await page.goto("/connections");
      await expect(page.getByText(/pending/i).first()).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(/sent/i).first()).toBeVisible();
    });

    test("shows empty state for pending tab", async ({ page }) => {
      await page.goto("/connections");
      await expect(page.getByText(/no pending requests/i)).toBeVisible({
        timeout: 15_000,
      });
    });

    test("shows empty state for sent tab", async ({ page }) => {
      await page.goto("/connections");
      await page.getByRole("tab", { name: /sent/i }).click();
      await expect(page.getByText(/no sent requests/i)).toBeVisible({
        timeout: 15_000,
      });
    });

    test("shows empty state for connections tab", async ({ page }) => {
      await page.goto("/connections");
      await page.getByRole("tab", { name: /connections/i }).click();
      await expect(page.getByText(/no connections yet/i)).toBeVisible({
        timeout: 15_000,
      });
    });
  });

  test.describe("With data", () => {
    test.beforeEach(async ({ page }) => {
      // Track request count per pattern to handle the 4 parallel queries
      let acceptedCallCount = 0;

      await page.route("**/rest/v1/connections*", async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        if (method !== "GET") {
          await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
          return;
        }

        // The hook fires 4 parallel queries using .eq() filters:
        // 1) receiver_id=eq.test-user-id & status=eq.pending (incoming)
        // 2) requester_id=eq.test-user-id & status=eq.pending (sent)
        // 3) requester_id=eq.test-user-id & status=eq.accepted
        // 4) receiver_id=eq.test-user-id & status=eq.accepted
        // Note: use "=eq." patterns to distinguish filter params from select column names

        // Pending incoming: receiver_id=eq.test-user-id & status=eq.pending
        if (url.includes("receiver_id=eq.") && url.includes("status=eq.pending")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                id: "conn-1",
                requester_id: "user-a",
                receiver_id: "test-user-id",
                status: "pending",
                message: "Let's connect!",
                created_at: "2025-12-01T00:00:00Z",
                updated_at: "2025-12-01T00:00:00Z",
                profile: {
                  id: "user-a",
                  full_name: "Alice Sender",
                  bio: "Hi there",
                  avatar_url: "",
                  instagram: "",
                },
              },
            ]),
          });
          return;
        }

        // Pending sent: requester_id=eq.test-user-id & status=eq.pending
        if (url.includes("requester_id=eq.") && url.includes("status=eq.pending")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                id: "conn-2",
                requester_id: "test-user-id",
                receiver_id: "user-b",
                status: "pending",
                message: "",
                created_at: "2025-12-02T00:00:00Z",
                updated_at: "2025-12-02T00:00:00Z",
                profile: {
                  id: "user-b",
                  full_name: "Bob Receiver",
                  bio: "Hey!",
                  avatar_url: "",
                  instagram: "",
                },
              },
            ]),
          });
          return;
        }

        // Accepted connections — only return data from one of the two queries to avoid duplication
        if (url.includes("status=eq.accepted")) {
          acceptedCallCount++;
          if (acceptedCallCount % 2 === 1) {
            // First accepted query (requester_id=me) - return the connection
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify([
                {
                  id: "conn-3",
                  requester_id: "user-c",
                  receiver_id: "test-user-id",
                  status: "accepted",
                  message: "",
                  created_at: "2025-11-01T00:00:00Z",
                  updated_at: "2025-11-15T00:00:00Z",
                  profile: {
                    id: "user-c",
                    full_name: "Charlie Connected",
                    bio: "Connected user",
                    avatar_url: "",
                    instagram: "",
                  },
                },
              ]),
            });
          } else {
            // Second accepted query (receiver_id=me) - return empty to avoid duplicate
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify([]),
            });
          }
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });
    });

    test("shows pending request with accept/decline buttons", async ({ page }) => {
      await page.goto("/connections");
      await expect(page.getByText("Alice Sender")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("button", { name: /accept/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /decline/i })).toBeVisible();
    });

    test("shows connection message on pending request", async ({ page }) => {
      await page.goto("/connections");
      await expect(page.getByText(/let's connect/i)).toBeVisible({ timeout: 15_000 });
    });

    test("shows sent request with cancel button", async ({ page }) => {
      await page.goto("/connections");
      await page.getByRole("tab", { name: /sent/i }).click();
      await expect(page.getByText("Bob Receiver")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("button", { name: /cancel request/i })).toBeVisible();
    });

    test("shows accepted connections with message button", async ({ page }) => {
      await page.goto("/connections");
      await page.getByRole("tab", { name: /connections/i }).click();
      await expect(page.getByText("Charlie Connected")).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("button", { name: /^message$/i })).toBeVisible();
    });

    test("search filters connections", async ({ page }) => {
      await page.goto("/connections");
      await page.getByRole("tab", { name: /connections/i }).click();
      await expect(page.getByText("Charlie Connected")).toBeVisible({ timeout: 15_000 });

      const searchInput = page.getByPlaceholder(/search connections/i);
      await searchInput.fill("nonexistent");
      await expect(page.getByText(/no connections found/i)).toBeVisible();
    });
  });
});
