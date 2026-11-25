# Architecture

## Monorepo (pnpm workspaces)
apps/web (Next.js) · apps/api (NestJS, planned) · apps/admin (Next.js, planned) · apps/mobile (Expo, planned)
packages: geospatial · catalog · design-tokens · (planned) types, database (Prisma), api-client, validation, localization, earth-engine, provider-adapters, ui, config

## Earth engine (apps/web/components/globe → future packages/earth-engine)
- Sphere 160×120 segments, custom ShaderMaterial: day (Blue Marble) + night lights (Black Marble) blended by a camera-relative art-directed sun; water mask for ocean grading + specular; inner fresnel rim.
- **Id-map**: Natural Earth 50m countries rasterised at runtime into a 4096×2048 canvas (R = country index). Sampled with nearest filtering to shade hover / selection / coverage per country, with a 256×1 coverage lookup texture. One draw call for all country highlighting.
- **Picking**: raycast → UV point → lat/lng → bbox prefilter → `d3.geoContains` (exact spherical point-in-polygon, antimeridian-safe). Small territories snap to nearest covered small country within 1.2°.
- Borders: TopoJSON mesh → LineSegments at r=1.0015. Selected outline: LineSegments at r=1.0025, additive.
- Clouds shell r=1.009, atmosphere back-face shell ×1.09 with limb-normalised glow, drei Stars, 12 animated great-circle arcs (shader pulse).
- Camera: OrbitControls (damping, zoom limits, auto-rotate after 4 s idle when nothing selected); flights = quaternion slerp + distance tween with mid-flight lift (GSAP), instant under reduced motion. `setViewOffset` keeps the planet clear of hero copy / side panel / bottom sheet; portrait screens use a fixed horizontal FOV.
- Adaptive: quality tier (4k vs 2k textures, segment counts, star count) from viewport/deviceMemory/cores; drei PerformanceMonitor lowers DPR; context loss → fallback.

## State & sync
`lib/store.ts`: selection (country/region/global), hover, flyRequest. Every selection writes the URL (`?d=`, `?r=`, `?g=`); URL is read on load. Search, globe clicks, chips and deep links all go through `explorer.select()`.

## Catalog
`@bleusim/catalog` defines Plan/Destination contracts and `CatalogProvider`. Dev: in-browser DEV FIXTURE provider. Next: API-backed provider with supplier adapters.
