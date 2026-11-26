// Screenshots of the web export at iPhone size. Usage:
//   node scripts/serve-dist.mjs dist &   (serves on :8090)
//   NODE_PATH=$(npm root -g) node scripts/screens.cjs <outDir>
const { chromium, devices } = require("playwright");
const out = process.argv[2] ?? "screens";
const SHOTS = [
  ["home", "/"], ["search", "/search", (p) => p.getByTestId("search-input").fill("Dakhla")], ["plans-japan", "/plans/jp"],
  ["plans-europe", "/plans/region-europe"], ["checkout", "/checkout?dest=jp&plan=dev-jp-unl-15"], ["esims", "/esims"],
  ["help", "/help"], ["guide", "/guide/start"], ["profile", "/profile"], ["destinations", "/destinations"],
  ["ar-home", "/?lang=ar"], ["ar-plans-morocco", "/plans/ma?lang=ar"], ["fr-home", "/?lang=fr"],
];
(async () => {
  require("node:fs").mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const page = await (await b.newContext({ ...devices["iPhone 15"] })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [name, url, act] of SHOTS) {
    await page.goto("http://localhost:8090" + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    if (act) { await act(page); await page.waitForTimeout(800); }
    await page.screenshot({ path: `${out}/${name}.png` });
  }
  await b.close();
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
})();
