# Hero background image sources

## hero.webp — CURRENTLY IN USE, SOURCE UNKNOWN

`components/home/HeroBgPhoto.tsx` points at this file, so it is the photograph the home page
ships today. It was produced from `upscale_image_01.png`, supplied by the owner, with:

```bash
ffmpeg -i upscale_image_01.png -vf scale=2560:-2 -c:v libwebp -quality 82 -compression_level 6 -preset photo hero.webp
```

3840 × 2160 down to 2560 × 1440, and 1.3 MB down to 152 KB. The source PNG carried no EXIF and
no embedded copyright or author field, and it has been moved out of the repository to
`../_media-originals/hero/` so an unused 1.3 MB file is not deployed.

**Nothing is recorded about where the photograph came from.** Before launch this needs either a
licence and attribution written up here the way `hero-stock.jpg` is below, or a replacement. A
stock or generated image used without a licence is the one image risk on this site that is not
theoretical. Tracked in `TODO.md`.

`hero-stock.jpg` is kept in the repository as the fallback: it is CC0 and its provenance is
documented, so switching back is a one-line change in `HeroBgPhoto.tsx`.

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
