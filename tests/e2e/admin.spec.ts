import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

const API = "http://localhost:4000";
const password = "correct horse battery";

test.describe("back office (needs API on :4000 and DATABASE_URL)", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL not set");

  test("customer is refused; admin sees overview, orders and audit", async ({ page, request }) => {
    const email = `admin-${randomUUID().slice(0, 8)}@example.com`;
    await request.post(`${API}/v1/auth/register`, { data: { email, password } });
    await page.goto("/login?next=/admin");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByRole("heading", { name: "This account has no back-office access" })).toBeVisible();

    execFileSync("pnpm", ["--filter", "@bleusim/api", "grant-role", email, "ADMIN"], { cwd: path.resolve(__dirname, "../.."), stdio: "ignore" });
    // granting a role signs the user out everywhere, so sign in again
    await page.goto("/login?next=/admin");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /Sign in/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Overview" })).toBeVisible();
    await expect(page.getByText(/Sandbox only/)).toBeVisible();

    await page.getByRole("button", { name: "Orders" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Orders" })).toBeVisible();
    await page.getByRole("button", { name: "Audit log" }).click();
    await page.getByPlaceholder(/action prefix/).fill("cli.user");
    await expect(page.getByRole("cell", { name: "cli.user.role" }).first()).toBeVisible();
  });
});
