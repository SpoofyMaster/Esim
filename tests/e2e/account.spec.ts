import { test, expect } from "@playwright/test";

test("register → buy signed in → My eSIMs shows usage → top up adds data", async ({ page }) => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a long enough password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("No eSIMs yet")).toBeVisible();

  await page.goto("/checkout?plan=dev-tr-3-30");
  await expect(page.getByLabel("Email for your eSIM")).toHaveValue(email);
  await page.getByLabel(/supports eSIM/).check();
  await page.getByRole("button", { name: /Continue to payment/ }).click();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("status")).toHaveText("Ready to install");

  await page.goto("/account");
  await expect(page.getByText("3 GB left")).toBeVisible();
  await page.getByRole("button", { name: "Top up" }).click();
  await page.getByText(/^5 GB ·/).click();
  await page.getByRole("button", { name: /Pay \(sandbox\) and add data/ }).click();
  await expect(page.getByText("8 GB left")).toBeVisible();
  await expect(page.getByText("top-up", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Install details" }).click();
  await expect(page.getByRole("img", { name: "eSIM QR code" })).toBeVisible();
});
