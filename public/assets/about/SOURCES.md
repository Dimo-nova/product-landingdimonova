# About page assets

| File | What it shows | Origin |
|------|---------------|--------|
| `owner-at-bar.webp` | A bar owner leaning on his counter, a bartender working behind him. Used beside the "why we exist" copy on `/about`. | Supplied by the owner as `hombre_canva.png` (1920×1080, exported from Canva, 2026-09-10) and then as an upscaled copy, `upscale_image_01 (1).png` (3840×2160, JPEG data despite the extension), because the first one looked soft. Cropped from the upscaled copy to 4:3 around the man (x 960–3840, full height) and encoded as WebP at 1600px wide with sharp. **Licence not recorded**: Canva's terms depend on the plan and the element — check before launch, same as the hero photographs (see `public/assets/hero/SOURCES.md` and TODO.md). |

Neither original is needed at runtime; keep them out of `public/` (anything there is deployed).
