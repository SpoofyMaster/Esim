// Visual QA: screenshots of the Earth explorer at spec viewports. Usage: node shoot.mjs <outDir> [scenario]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = process.argv[2] ?? "shots";
const base = process.env.BASE ?? "http://localhost:3000";
const views = [[1920,1080],[1440,900],[1280,800],[768,1024],[390,844],[375,667]];
const only = process.env.VIEWS ? process.env.VIEWS.split(",").map(v=>v.split("x").map(Number)) : views;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const errors = [];
for (const [w,h] of only) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.on("console", m => { if (m.type()==="error") errors.push(`${w}x${h}: ${m.text()}`); });
  page.on("pageerror", e => errors.push(`${w}x${h}: ${e.message}`));
  await page.goto(base + (process.env.QS ?? "/"), { waitUntil: "networkidle" });
  await page.waitForTimeout(Number(process.env.WAIT ?? 6000));
  await page.screenshot({ path: `${out}/home-${w}x${h}${process.env.TAG ?? ""}.png` });
  await page.close();
}
console.log(errors.length ? errors.join("\n") : "no console errors");
await browser.close();
