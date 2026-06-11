import { expect, test, type Page } from "@playwright/test";

// E2e-doorloop van alle vier de versies (verbeterrapport §3.4.3).
// De student-login-API wordt gemockt; meerkeuzevragen worden beantwoord met de
// eerste optie, performance tasks via "Ik weet het niet" (skip). Doel is de
// volledige afnameflow: start → alle stappen → resultaatscherm.

const versions = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"] as const;

const mockApi = async (page: Page, versionId: string) => {
  await page.route("**/api/student-login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        status: "not_started",
        student: {
          accessCode: `E2E-${versionId.toUpperCase()}`,
          participantLabel: "E2E-test",
          classCode: "E2E-KLAS",
          versionId,
          measurementMoment: "nulmeting",
        },
      }),
    }),
  );
  await page.route("**/api/sessions", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  await page.route("**/api/results", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  // 500 forceert de dev-fallback: lokale herscoring met volledige data.
  await page.route("**/api/finalize", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "e2e_mock" }),
    }),
  );
};

const isVisible = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .isVisible()
    .catch(() => false);

for (const versionId of versions) {
  test(`volledige doorloop ${versionId}`, async ({ page }) => {
    await mockApi(page, versionId);
    await page.goto("/");

    // Stap 1: afnamecode
    await page.getByPlaceholder("Bijv. K7M4Q2").fill(`E2E-${versionId}`);
    await page.getByRole("button", { name: /Volgende/ }).click();

    // Stap 2: privacy + start
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Start de voortgangsmeting/ }).click();

    // Doorloop: maximaal 80 stappen tot het resultaatscherm.
    const resultHeading = page.getByRole("heading", {
      name: "Jouw nulmeting is klaar.",
    });

    for (let step = 0; step < 80; step += 1) {
      if (await resultHeading.first().isVisible().catch(() => false)) {
        break;
      }

      // Meerkeuzevraag: eerste optie + volgende.
      if (await isVisible(page, ".q-next-btn")) {
        await page.locator(".option-card").first().click();
        await page.locator(".q-next-btn").click();
        continue;
      }

      // Zelfinschatting: slider staat al op 50, direct verder.
      if (await isVisible(page, 'input[type="range"]')) {
        await page.locator(".primary-button").first().click();
        continue;
      }

      // Performance task: overslaan via "Ik weet het niet".
      if (await isVisible(page, ".task-nav-skip")) {
        await page.locator(".task-nav-skip").first().click();
        continue;
      }

      await page.waitForTimeout(250);
    }

    await expect(resultHeading.first()).toBeVisible({ timeout: 15_000 });

    // Resultaatscherm toont een totaalpercentage.
    await expect(page.locator("body")).toContainText("%");
  });
}
