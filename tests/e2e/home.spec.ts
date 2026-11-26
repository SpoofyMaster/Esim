import { test, expect } from "@playwright/test";

test.describe("light home page", () => {
  test("hero: app concept, pink highlight, store buttons are not real links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("every trip");
    await expect(page.getByRole("img", { name: "BLEUSIM app concept" })).toBeVisible();
    for (const name of [/App Store/, /Google Play/]) {
      const b = page.getByRole("link", { name });
      await expect(b).toHaveAttribute("aria-disabled", "true");
      expect(await b.getAttribute("href")).toBeNull();
    }
    await expect(page.getByText("Coming soon", { exact: true })).toBeVisible();
    await expect(page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]')).toHaveCount(0);
  });

  test("destination tabs show the 9 popular countries, then regions", async ({ page }) => {
    await page.goto("/");
    const panel = page.getByRole("tabpanel");
    for (const c of ["United States of America", "Japan", "Thailand", "United Kingdom", "Türkiye", "Portugal", "France", "Germany", "Netherlands"]) {
      await expect(panel.getByRole("link", { name: new RegExp(c) })).toBeVisible();
    }
    await expect(panel.getByRole("listitem")).toHaveCount(9);
    await page.getByRole("tab", { name: "Region" }).click();
    await expect(page.getByRole("tabpanel").getByRole("link", { name: /Europe/ })).toBeVisible();
  });

  test("Arabic hero is right-to-left with translated app screen label", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("img", { name: "تصوّر لتطبيق BLEUSIM" })).toBeVisible();
  });

  test("legal pages and old globe links", async ({ page, request }) => {
    for (const p of ["/privacy", "/terms", "/cookies", "/fr/privacy"]) expect((await request.get(p)).status()).toBe(200);
    const r = await request.get("/?d=jp", { maxRedirects: 0 });
    expect(r.status()).toBe(307);
    expect(r.headers()["location"]).toContain("/explore?d=jp");
    await page.goto("/cookies");
    await page.getByRole("switch", { name: "Analytics" }).click();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByRole("status").filter({ hasText: "saved" })).toBeVisible();
  });
});
