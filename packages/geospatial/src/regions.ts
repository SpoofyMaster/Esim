import type { Region } from "./types";

// Geographic groupings used for camera framing and default highlighting.
// Commercial regional coverage always comes from the catalog (supplier data), never from this file.
export const REGIONS: Region[] = [
  {
    id: "europe",
    names: { en: "Europe", fr: "Europe", es: "Europa", de: "Europa", ar: "أوروبا", pt: "Europa", it: "Europa" },
    members: "AL AD AT BY BE BA BG HR CY CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO SM RS SK SI ES SE CH UA GB VA".split(" "),
    focus: { lng: 12, lat: 50, distance: 2.35 },
  },
  {
    id: "asia",
    names: { en: "Asia", fr: "Asie", es: "Asia", de: "Asien", ar: "آسيا", pt: "Ásia", it: "Asia" },
    members: "AF AM AZ BD BT BN KH CN GE HK IN ID JP KZ KG LA MO MY MV MN MM NP KP PK PH SG KR LK TW TJ TH TL TM UZ VN".split(" "),
    focus: { lng: 100, lat: 28, distance: 2.6 },
  },
  {
    id: "africa",
    names: { en: "Africa", fr: "Afrique", es: "África", de: "Afrika", ar: "أفريقيا", pt: "África", it: "Africa" },
    members: "DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW".split(" "),
    focus: { lng: 18, lat: 3, distance: 2.6 },
  },
  {
    id: "middle-east",
    names: { en: "Middle East", fr: "Moyen-Orient", es: "Oriente Medio", de: "Naher Osten", ar: "الشرق الأوسط", pt: "Médio Oriente", it: "Medio Oriente" },
    members: "BH IR IQ IL JO KW LB OM PS QA SA SY TR AE YE".split(" "),
    focus: { lng: 45, lat: 27, distance: 2.3 },
  },
  {
    id: "north-america",
    names: { en: "North America", fr: "Amérique du Nord", es: "América del Norte", de: "Nordamerika", ar: "أمريكا الشمالية", pt: "América do Norte", it: "Nord America" },
    members: "US CA MX GL".split(" "),
    focus: { lng: -100, lat: 45, distance: 2.6 },
  },
  {
    id: "latin-america",
    names: { en: "Latin America", fr: "Amérique latine", es: "América Latina", de: "Lateinamerika", ar: "أمريكا اللاتينية", pt: "América Latina", it: "America Latina" },
    members: "AR BO BR CL CO CR CU DO EC SV GT HN NI PA PY PE PR UY VE BZ GY SR".split(" "),
    focus: { lng: -65, lat: -15, distance: 2.7 },
  },
  {
    id: "oceania",
    names: { en: "Oceania", fr: "Océanie", es: "Oceanía", de: "Ozeanien", ar: "أوقيانوسيا", pt: "Oceânia", it: "Oceania" },
    members: "AU NZ FJ PG SB VU NC WS TO".split(" "),
    focus: { lng: 150, lat: -25, distance: 2.6 },
  },
];
