"use client";
import * as THREE from "three";
import { feature, mesh } from "topojson-client";
import { geoContains, geoEquirectangular, geoPath, geoDistance } from "d3-geo";
import type { Feature, Geometry, MultiLineString } from "geojson";
import { COUNTRIES, type Country } from "@bleusim/geospatial";
import { latLngToVec3 } from "@/lib/geo";

export interface GeoBundle {
  features: Feature<Geometry, { name: string }>[];
  bboxes: [number, number, number, number][];
  borderPositions: Float32Array;
  idMap: THREE.CanvasTexture;
  pick(lat: number, lng: number, allowNearest?: string[]): Country | null;
  outlinePositions(index: number): Float32Array;
}

let cache: Promise<GeoBundle> | null = null;
export function loadGeo(): Promise<GeoBundle> {
  return (cache ??= build());
}

async function build(): Promise<GeoBundle> {
  const topo = await fetch("/geo/countries-50m.topo.json").then((r) => r.json());
  const fc = feature(topo, topo.objects.countries) as unknown as { features: Feature<Geometry, { name: string }>[] };
  const features = fc.features;
  const bboxes = COUNTRIES.map((c) => c.bbox);

  // Borders + coastlines as one line-segment buffer on a slightly raised sphere.
  const borders = mesh(topo, topo.objects.countries) as unknown as MultiLineString;
  const borderPositions = linesToSegments(borders.coordinates, 1.0015);

  // GPU id-map: each country painted with R = index (1..255). Used for hover/selection/coverage shading.
  const W = 4096, H = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  const proj = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]).precision(0.1);
  const path = geoPath(proj, ctx);
  features.forEach((f, i) => {
    ctx.beginPath();
    path(f);
    ctx.fillStyle = `rgb(${i + 1},0,0)`;
    ctx.fill();
  });
  const idMap = new THREE.CanvasTexture(canvas);
  idMap.minFilter = THREE.NearestFilter;
  idMap.magFilter = THREE.NearestFilter;
  idMap.generateMipmaps = false;
  idMap.colorSpace = THREE.NoColorSpace;
  idMap.flipY = true;

  function pick(lat: number, lng: number, allowNearest: string[] = []): Country | null {
    for (let i = 0; i < features.length; i++) {
      const b = bboxes[i]!;
      const inLat = lat >= b[1] - 0.5 && lat <= b[3] + 0.5;
      const inLng = b[0] <= b[2] ? lng >= b[0] - 0.5 && lng <= b[2] + 0.5 : lng >= b[0] - 0.5 || lng <= b[2] + 0.5; // antimeridian
      if (!inLat || !inLng) continue;
      if (geoContains(features[i]!, [lng, lat])) return COUNTRIES[i] ?? null;
    }
    // Small territories: snap to the nearest small destination within ~1.2°.
    let best: Country | null = null, bestD = (1.2 * Math.PI) / 180;
    for (const c of COUNTRIES) {
      if (!c.small || !c.iso2 || (allowNearest.length && !allowNearest.includes(c.iso2))) continue;
      const d = geoDistance(c.centroid, [lng, lat]);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }

  function outlinePositions(index: number) {
    const f = features[index - 1];
    if (!f) return new Float32Array();
    const g = f.geometry;
    const rings: number[][][] = g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
    return linesToSegments(rings, 1.0025);
  }

  return { features, bboxes, borderPositions, idMap, pick, outlinePositions };
}

const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
function linesToSegments(lines: number[][][], r: number): Float32Array {
  const out: number[] = [];
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lng1, lat1] = line[i]!, [lng2, lat2] = line[i + 1]!;
      if (Math.abs(lng1! - lng2!) > 180) continue; // skip antimeridian wrap segments
      latLngToVec3(lat1!, lng1!, r, tmpA);
      latLngToVec3(lat2!, lng2!, r, tmpB);
      out.push(tmpA.x, tmpA.y, tmpA.z, tmpB.x, tmpB.y, tmpB.z);
    }
  }
  return new Float32Array(out);
}
