# Asset registry

| File | Source | Method | Licence | Resolution | Size | Usage | Optimised |
|---|---|---|---|---|---|---|---|
| apps/web/public/earth/day-4k.jpg / day-2k.jpg | NASA Blue Marble via three-globe@2.45.6 npm | re-encoded (Pillow, q86 progressive) | NASA imagery public domain; package MIT | 4096×2048 / 2048×1024 | 1.26 MB / 0.33 MB | Earth day surface | JPEG |
| night-4k.jpg / night-2k.jpg | NASA Black Marble via three-globe | re-encoded | public domain / MIT | 4096×2048 / 2048×1024 | 0.54 / 0.16 MB | City lights | JPEG |
| water-mask.jpg | three-globe earth-water.png | greyscale | MIT (provenance: NASA-derived, verify) | 2048×1024 | 0.18 MB | Ocean mask | JPEG |
| topology.jpg | three-globe earth-topology.png | greyscale | MIT (verify upstream) | 2048×1024 | 0.10 MB | Reserved for bump | JPEG |
| clouds-2k.jpg | three-globe clouds.png alpha | alpha extract, blur 1.2, downscale | MIT; **upstream provenance to verify before production** | 2048×1024 | 0.52 MB | Cloud layer | JPEG |
| public/geo/countries-50m.topo.json | Natural Earth via world-atlas@2.0.2 | copied | Public domain (NE), ISC (package) | 1:50m | 0.76 MB | Borders, picking | none yet |
| public/brand/favicon.svg, components/brand/Logo.tsx | Original (Claude) | hand-authored SVG | BLEUSIM-owned | vector | <1 KB | Logo/favicon | — |

## Higgsfield generation run, 2026-11-25 (approved by Badr: full balance)

- Budget: 600 credits, all spent. 54 images (Cinema Studio Image 2.5, 4K, 4 credits each) and 3 videos (Seedance 2.5, 1080p, 8 s, 128 credits each). Jobs flagged by the provider's filter were refunded and re-prompted.
- Originals (4K PNG / 1080p MP4) with job ids: `/mnt/project-files/bleusim/higgsfield/` and `assets/higgsfield-manifest.tsv` (file, job id, model, prompt summary). Originals are not in git (≈1.5 GB).
- Web copies: `apps/web/public/media/` (WebP 1200/2400 px, H.264 720p without audio, WebP posters), made by `scripts/optimize-media.py`.
- Usage: destination hero images on `/esim/*` (47 countries, 7 regions, global), Morocco gallery + Sahara→Dakhla video on `/esim/morocco`, Earth orbit loop as the no-WebGL hero. Vertical Earth video and 21:9 brand banner are for app splash / social / OG work.
- Every image is labelled "Illustrative image" in the UI. These are AI-generated scenes, not photographs of real moments, and are never used as reviews, testimonials or proof of coverage.
- Licensing: generated under Badr's Higgsfield Pro plan; check Higgsfield's commercial-use terms for the plan before launch.
