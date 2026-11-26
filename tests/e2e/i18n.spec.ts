import { test, expect } from "@playwright/test";

test.describe("languages: routing, hreflang, RTL", () => {
  test("French destination page is server-rendered in French with full hreflang", async ({ page }) => {
    await page.goto("/fr/esim/japan");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1, name: "eSIM Japon" })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/fr\/esim\/japan$/);
    for (const l of ["en", "fr", "es", "de", "ar", "pt", "it", "x-default"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${l}"]`)).toHaveCount(1);
    }
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /bleusim\.com\/esim\/japan$/);
    // Covered/region links stay in French; checkout stays on the shared English-only route.
    await expect(page.getByRole("link", { name: /Acheter/ }).first()).toHaveAttribute("href", /^\/checkout\?plan=/);
  });

  test("Arabic is right-to-left with Arabic country names", async ({ page }) => {
    await page.goto("/ar/esim/morocco");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("المغرب");
  });

  test("/en/... redirects to the unprefixed English URL", async ({ page }) => {
    const r = await page.goto("/en/esim/japan");
    expect(new URL(page.url()).pathname).toBe("/esim/japan");
    expect(r?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("unknown language prefix is a 404", async ({ request }) => {
    expect((await request.get("/xx/esim/japan")).status()).toBe(404);
  });

  test("home in Spanish: hero, search in Spanish, switcher goes to German", async ({ page }) => {
    await page.goto("/es?nogl");
    await expect(page.getByRole("heading", { level: 1, name: "Datos móviles para cada viaje, listos antes de aterrizar." })).toBeVisible();
    const box = page.getByRole("combobox", { name: "¿A dónde vas?" });
    await box.fill("Alemania");
    await expect(page.getByRole("listbox").getByRole("option", { name: /Alemania/ }).first()).toBeVisible();
    await page.getByTestId("language-switcher").first().selectOption("de");
    await expect(page).toHaveURL(/\/de(\?nogl)?$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("sitemap lists every language version with alternates", async ({ request }) => {
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).toContain("<loc>https://bleusim.com/ar/esim/morocco</loc>");
    expect(sm).toContain('hreflang="pt" href="https://bleusim.com/pt/esim/japan"');
  });
});
