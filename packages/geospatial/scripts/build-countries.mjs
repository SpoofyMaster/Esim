// Builds packages/geospatial/data/countries.json from Natural Earth (via world-atlas, public domain)
// and i18n-iso-countries (MIT) names. Geography only — no commercial coverage here.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoCentroid, geoBounds, geoArea } from "d3-geo";
import countries from "i18n-iso-countries";

const require = createRequire(import.meta.url);
const LANGS = ["en", "fr", "es", "de", "ar", "pt", "it"];
for (const l of LANGS) countries.registerLocale(require(`i18n-iso-countries/langs/${l}.json`));

const topoPath = require.resolve("world-atlas/countries-50m.json");
const topo = JSON.parse(readFileSync(topoPath, "utf8"));
const fc = feature(topo, topo.objects.countries);

// Natural Earth entities without an ISO numeric code in world-atlas.
const NAME_FALLBACK = { Kosovo: "XK", "N. Cyprus": null, Somaliland: null, "Indian Ocean Ter.": null, "Ashmore and Cartier Is.": null, "Siachen Glacier": null };
const XK_NAMES = { en: "Kosovo", fr: "Kosovo", es: "Kosovo", de: "Kosovo", ar: "كوسوفو", pt: "Kosovo", it: "Kosovo" };

const out = [];
fc.features.forEach((f, i) => {
  const numeric = f.id ?? null;
  let iso2 = numeric ? countries.numericToAlpha2(numeric) : undefined;
  if (!iso2 && f.properties.name in NAME_FALLBACK) iso2 = NAME_FALLBACK[f.properties.name] ?? undefined;
  const names = {};
  for (const l of LANGS) names[l] = iso2 === "XK" ? XK_NAMES[l] : (iso2 && countries.getName(iso2, l, { select: "official" }) && countries.getName(iso2, l)) || f.properties.name;
  const aliases = iso2 && iso2 !== "XK" ? (countries.getNames("en", { select: "all" })[iso2] ?? []) : [];
  const [lng, lat] = geoCentroid(f);
  const [[w, s], [e, n]] = geoBounds(f);
  const areaSr = geoArea(f); // steradians
  out.push({
    index: i + 1, // id used in the GPU id-map (0 = ocean)
    iso2: iso2 ?? null,
    iso3: iso2 && iso2 !== "XK" ? countries.alpha2ToAlpha3(iso2) : iso2 === "XK" ? "XKX" : null,
    numeric,
    neName: f.properties.name,
    names,
    aliases: aliases.filter((a) => a !== names.en),
    centroid: [round(lng), round(lat)],
    bbox: [round(w), round(s), round(e), round(n)],
    areaKm2: Math.round(areaSr * 6371 * 6371),
    small: areaSr * 6371 * 6371 < 15000,
  });
});
function round(v) { return Math.round(v * 1000) / 1000; }

mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/countries.json", import.meta.url), JSON.stringify(out));
copyFileSync(topoPath, new URL("../data/countries-50m.topo.json", import.meta.url));
const missing = out.filter((c) => !c.iso2).map((c) => c.neName);
console.log(`countries: ${out.length}, without ISO: ${missing.length} (${missing.join(", ")})`);
