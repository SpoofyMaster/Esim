import { test, expect } from "@playwright/test";

test.describe("destination pages + SEO (server rendered)", () => {
  test("country page shows plans, FAQ and buys through checkout", async ({ page }) => {
    await page.goto("/esim/japan");
    await expect(page.getByRole("heading", { level: 1, name: "Japan eSIM" })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/esim\/japan$/);
    await expect(page.getByText(/Questions about Japan eSIMs/)).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(ld).toContain("FAQPage");
    expect(ld).not.toContain("AggregateOffer"); // fixtures never publish offer data
    await page.getByRole("link", { name: /Buy/ }).first().click();
    await expect(page).toHaveURL(/\/checkout\?plan=dev-jp-/);
  });
  test("short slug for the US and directory links", async ({ page }) => {
    await page.goto("/destinations");
    await expect(page.getByRole("link", { name: /Japan/ }).first()).toHaveAttribute("href", "/esim/japan");
    const r = await page.goto("/esim/united-states");
    expect(r?.status()).toBe(200);
  });
  test("sitemap lists pages; robots blocks indexing until launch", async ({ request }) => {
    const sm = await (await request.get("/sitemap.xml")).text();
    expect(sm).toContain("/esim/japan");
    expect(sm).toContain("/esim/region/europe");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/\s/);
  });
});
