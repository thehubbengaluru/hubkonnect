import { test, expect } from "@playwright/test";
import { mockAuthSession } from "./helpers";

test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear onboarding draft
    await page.addInitScript(() => {
      localStorage.removeItem("hubkonnect_onboarding_draft");
    });

    // Mock auth with onboarding NOT completed
    await mockAuthSession(page, {
      id: "test-user-id",
      email: "test@test.com",
      fullName: "Test User",
      onboardingCompleted: false,
    });
  });

  test("renders step 1 with step indicator", async ({ page }) => {
    await page.goto("/onboarding");

    // Step labels should be visible
    await expect(page.getByText("Basics")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Type").first()).toBeVisible();
    await expect(page.getByText("Skills").first()).toBeVisible();
    await expect(page.getByText("Goals").first()).toBeVisible();
  });

  test("shows nudge text for step 1", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText(/great start/i)).toBeVisible({ timeout: 15_000 });
  });

  test("step indicator shows all four labels", async ({ page }) => {
    await page.goto("/onboarding");
    const stepLabels = ["Basics", "Type", "Skills", "Goals"];
    for (const label of stepLabels) {
      await expect(page.getByText(label).first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test("saves draft to localStorage", async ({ page }) => {
    await page.goto("/onboarding");
    // Wait for the page to fully load and save draft
    await expect(page.getByText("Basics")).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(2000);

    const draft = await page.evaluate(() =>
      localStorage.getItem("hubkonnect_onboarding_draft")
    );
    expect(draft).not.toBeNull();
    const parsed = JSON.parse(draft!);
    expect(parsed).toHaveProperty("step");
    expect(parsed).toHaveProperty("data");
  });

  test("restores draft from localStorage on reload", async ({ page }) => {
    // Pre-set a draft at step 2
    await page.addInitScript(() => {
      localStorage.setItem(
        "hubkonnect_onboarding_draft",
        JSON.stringify({
          step: 2,
          data: {
            fullName: "Saved User",
            bio: "My saved bio",
            instagram: "",
            linkedin: "",
            photoPreview: "",
            memberTypes: ["Co-living"],
            skills: [],
            interests: [],
            lookingFor: [],
          },
        })
      );
    });

    await page.goto("/onboarding");

    // Should restore to step 2 and show the step 2 nudge
    await expect(page.getByText(/building your network/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
