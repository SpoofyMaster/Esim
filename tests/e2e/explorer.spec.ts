import { test, expect } from "@playwright/test";

test.describe("Earth explorer", () => {
  test("search Japan → panel, URL and plans stay in sync", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("combobox", { name: "Where are you going?" });
    await box.fill("Japan");
    await expect(page.getByRole("option", { name: /Japan/ }).first()).toBeVisible();
    await box.press("Enter");
    const panel = page.getByRole("complementary", { name: "Japan eSIM plans" });
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(/[?&]d=jp/);
    await expect(panel.getByRole("radio")).toHaveCount(6);
    await expect(panel.getByText(/development fixtures/)).toBeVisible();
  });

  test("USA alias and typo tolerance resolve", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("combobox", { name: "Where are you going?" });
    await box.fill("USA");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("United States");
    await box.fill("Morroco");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("Morocco");
    await box.fill("Marrakech");
    await expect(page.getByRole("listbox").getByRole("option").first()).toContainText("Morocco");
  });

  test("region chip opens regional plans", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Europe", exact: true }).click();
    await expect(page.getByRole("complementary", { name: "Europe eSIM plans" })).toBeVisible();
    await expect(page).toHaveURL(/[?&]r=europe/);
  });

  test("deep link restores selection; close clears it", async ({ page }) => {
    await page.goto("/?d=ma");
    const panel = page.getByRole("complementary", { name: "Morocco eSIM plans" });
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Close destination panel" }).click();
    await expect(panel).toBeHidden();
    await expect(page).not.toHaveURL(/d=ma/);
  });

  test("dragging the globe does not select a country", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "mouse drag check runs on desktop");
    await page.goto("/");
    await page.waitForTimeout(3500);
    const canvas = page.locator("canvas");
    const b = (await canvas.boundingBox())!;
    const x = b.x + b.width * 0.72, y = b.y + b.height * 0.5;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 160, y + 20, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    await expect(page.getByRole("complementary")).toHaveCount(0);
  });

  test("clicking a country on the globe opens it", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "pointer click check runs on desktop");
    await page.goto("/");
    await page.waitForTimeout(4000);
    const canvas = page.locator("canvas");
    const b = (await canvas.boundingBox())!;
    // Centre of the planet on desktop sits at +20% width (view offset); land there at load is Africa/Europe.
    await page.mouse.click(b.x + b.width * 0.7, b.y + b.height * 0.5);
    await expect(page.getByRole("complementary")).toBeVisible();
    await expect(page).toHaveURL(/[?&]d=[a-z]{2}/);
  });

  test("no-WebGL fallback keeps search and directory working", async ({ page }) => {
    await page.goto("/?nogl");
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.getByRole("combobox", { name: "Where are you going?" }).fill("Thailand");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("complementary", { name: "Thailand eSIM plans" })).toBeVisible();
    await page.getByRole("button", { name: "Close destination panel" }).click();
    // Popular destinations stay reachable as plain links (tabs: Country / Region / Global).
    const dest = page.locator("#destinations");
    await expect(dest.getByRole("link", { name: /Japan/ })).toHaveAttribute("href", "/esim/japan");
    await dest.getByRole("tab", { name: "Region" }).click();
    await expect(dest.getByRole("link", { name: /Europe/ })).toHaveAttribute("href", "/esim/region/europe");
  });
});
