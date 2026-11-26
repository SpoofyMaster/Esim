import { test, expect } from "@playwright/test";

test.describe("sandbox purchase (needs API on :4000)", () => {
  test("globe search → plan → checkout → simulated payment → QR + manual details", async ({ page }) => {
    await page.goto("/explore?nogl");
    await page.getByRole("combobox", { name: "Where are you going?" }).fill("Japan");
    await page.keyboard.press("Enter");
    const panel = page.getByRole("complementary", { name: "Japan eSIM plans" });
    await panel.getByText("10 GB").click();
    await panel.getByRole("link", { name: /Continue/ }).click();
    await expect(page).toHaveURL(/\/checkout\?plan=dev-jp-10-30/);
    await expect(page.getByText("Sandbox mode.")).toBeVisible();
    await page.getByLabel("Email for your eSIM").fill("traveller@example.com");
    await page.getByLabel(/supports eSIM/).check();
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await page.getByRole("button", { name: "Simulate successful payment" }).click();
    await expect(page).toHaveURL(/\/order\/[a-z0-9]+#t=/);
    await expect(page.getByRole("status")).toHaveText("Ready to install");
    await expect(page.getByRole("img", { name: "eSIM QR code" }).locator("svg")).toBeVisible();
    await expect(page.getByText("smdp.sandbox.bleusim.invalid")).toBeVisible();
    await expect(page.getByText("Sandbox QR · will not install")).toBeVisible();
  });

  test("declined payment shows recovery path", async ({ page }) => {
    await page.goto("/checkout?plan=dev-ma-3-30");
    await page.getByLabel("Email for your eSIM").fill("traveller@example.com");
    await page.getByLabel(/supports eSIM/).check();
    await page.getByRole("button", { name: /Continue to payment/ }).click();
    await page.getByRole("button", { name: "Simulate declined payment" }).click();
    await expect(page.getByRole("status")).toHaveText("Payment declined");
    await expect(page.getByRole("link", { name: "Choose a plan again" })).toBeVisible();
  });
});
