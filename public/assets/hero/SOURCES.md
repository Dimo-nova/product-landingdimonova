# Hero background image sources

## hero.webp and hero-mobile.webp — CURRENTLY IN USE, SOURCE UNKNOWN

`components/home/HeroBgPhoto.tsx` points at these two files, so they are the photographs the home
page ships today: `hero.webp` on desktop (a dining room during service) and `hero-mobile.webp`
below 900px (a pan on the fire). They were produced from `upscale_image_01.png` and
`sarten_canva.png`, both supplied by the owner, with:

```bash
ffmpeg -i upscale_image_01.png -vf scale=2560:-2 -c:v libwebp -quality 82 -compression_level 6 -preset photo hero.webp
ffmpeg -i sarten_canva.png -c:v libwebp -quality 82 -compression_level 6 -preset photo hero-mobile.webp
```

3840 × 2160 down to 2560 × 1440 and 1.3 MB down to 152 KB for the first; 1920 × 1080 kept as is
and 2.8 MB down to 131 KB for the second. Neither source carried EXIF or an embedded copyright or
author field, and both have been moved out of the repository to `../_media-originals/hero/` so
unused multi-megabyte files are not deployed.

**Nothing is recorded about where either photograph came from.** Before launch this needs either a
licence and attribution written up here the way `hero-stock.jpg` is below, or a replacement. A
stock or generated image used without a licence is the one image risk on this site that is not
theoretical. Tracked in `TODO.md`. The `_canva` in the second file's original name suggests it
came out of Canva, whose licence terms depend on the plan and on whether the photo is a Canva
stock asset, so that one needs checking specifically.

`hero-stock.jpg` was the documented CC0 fallback until 2026-09-11, when it was deleted along
with every other unused media file. Its record is kept below in case it is ever needed again.

## hero-stock.jpg

- **Title:** Red Lion Pub Room Interior 2024
- **Source URL:** https://commons.wikimedia.org/wiki/File:Red_Lion_Pub_Room_Interior_2024.jpg
- **Direct file:** https://upload.wikimedia.org/wikipedia/commons/8/86/Red_Lion_Pub_Room_Interior_2024.jpg
- **Photographer:** BrooksyTPS (Wikimedia Commons)
- **Licence:** CC0 1.0 Universal (Public Domain Dedication) — https://creativecommons.org/publicdomain/zero/1.0/deed.en
- **Original dimensions:** 4032 × 2268 px
- **Date downloaded:** 2026-09-07
- **Notes:** Real photograph, not a placeholder. Depicts the pub room of the Red Lion, Ampney St Peter (UK). No attribution required by the licence; credited here as good practice.
- **2026-09-08:** Re-encoded with `magick hero-stock.jpg -strip hero-stock.jpg` to remove the original EXIF metadata (device model, GPS location block) before publishing; image bytes/dimensions otherwise unchanged. Licence and attribution above are unaffected.
