import { describe, it, expect } from "vitest";
import { COUNTRIES, REGIONS, createSearch } from "../src/index";
const search = createSearch(COUNTRIES, REGIONS);
const top = (q: string, l: any = "en") => search(q, l)[0];

describe("destination search", () => {
  it("finds Japan by name, ISO and French", () => {
    expect(top("Japan")).toMatchObject({ kind: "country", iso2: "JP" });
    expect(top("JPN")).toMatchObject({ iso2: "JP" });
    expect(top("japon", "fr")).toMatchObject({ iso2: "JP", label: "Japon" });
  });
  it("resolves USA and United States", () => {
    expect(top("USA")).toMatchObject({ iso2: "US" });
    expect(top("united states")).toMatchObject({ iso2: "US" });
  });
  it("tolerates typos", () => {
    expect(top("Morroco")).toMatchObject({ iso2: "MA" });
    expect(top("Japn")).toMatchObject({ iso2: "JP" });
  });
  it("maps cities to countries", () => {
    expect(top("Marrakech")).toMatchObject({ iso2: "MA", sub: "Marrakech" });
    expect(top("Kyoto")).toMatchObject({ iso2: "JP" });
  });
  it("finds regions and global", () => {
    expect(top("Europe")).toMatchObject({ kind: "region", id: "europe" });
    expect(top("worldwide")).toMatchObject({ kind: "global" });
  });
  it("returns Arabic labels", () => {
    expect(top("المغرب", "ar")).toMatchObject({ iso2: "MA", label: "المغرب" });
  });
});
describe("dataset", () => {
  it("has ISO codes and centroids for key countries", () => {
    const jp = COUNTRIES.find((c) => c.iso2 === "JP")!;
    expect(jp.centroid[0]).toBeGreaterThan(125);
    expect(COUNTRIES.filter((c) => c.iso2).length).toBeGreaterThan(230);
  });
});
