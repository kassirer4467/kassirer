# Painter's Portfolio — Gallery (stage 1)

Plain HTML, CSS and vanilla JavaScript. No build step, no dependencies.

## Folder structure

```
index.html            Gallery page
css/styles.css        All styling (colors and spacing are variables at the top)
js/gallery.js         Grid, pagination and viewer. Never edit to add paintings.
js/site.js            Builds the top menu, site title and footer from data/site.json
data/paintings.json   YOUR PAINTINGS: the only file you edit regularly
data/site.json        Site title, footer text and top menu links
images/full/          Original, full-resolution files (never modified by the site)
images/thumbs/        Optional smaller copies used only for the grid
```

## Adding a painting

1. Upload the original file to `images/full/` (e.g. `sunrise.jpg`).
2. Optional but recommended: upload a ~600–800 px wide copy to `images/thumbs/` with the same name.
3. Add an entry to `data/paintings.json`, inside the `"paintings"` list. **Order in the file = order on the site.** Put new works at the top to show them first.

```json
{
  "image": "sunrise.jpg",
  "thumb": "sunrise.jpg",
  "title": "Sunrise",
  "caption": "Oil on canvas | 90 × 70 cm | 2026",
  "alt": "Orange sun rising over a field"
}
```

| Field     | Required | Meaning |
|-----------|----------|---------|
| `image`   | yes | File name in `images/full/` (or a full path / URL starting with `/` or `http`) |
| `thumb`   | no  | File name in `images/thumbs/`. If omitted, the full image is used in the grid (slower) |
| `title`   | no  | Shown above the caption in the viewer and used for the default alt text |
| `caption` | no  | Free text under the image. `\n` makes a new line. Hebrew/RTL text works |
| `alt`     | no  | Description for screen readers. Defaults to the title |

Pages, thumbnails, viewer order and arrows update automatically. Keep entries separated by commas and the file valid JSON (a JSON validator helps if the gallery shows an error).

`"perPage": 16` at the top of `paintings.json` controls paintings per page.

## Adding pages later (About, Contact…)

Create e.g. `about.html` (copy the `<header>` from `index.html`), then add `{ "label": "About", "href": "about.html" }` to `menu` in `data/site.json`. The menu and current-page highlight update on every page that loads `js/site.js`.

## Test locally

The gallery loads JSON with `fetch`, which browsers block on `file://`. Run a local server from this folder:

```
python3 -m http.server 8000
```
then open http://localhost:8000.

## Deploy

Upload the whole folder to any static host (FTP/cPanel, Netlify, GitHub Pages…). No server-side software needed. After uploading new images or editing JSON, hard-refresh (Ctrl/Cmd+Shift+R) if you still see the old version.

## Notes

- The sample images in `images/` are generated placeholders. Delete them and the sample entries before launch.
- Original images are never resized or altered by the site. The viewer scales them down only on screen, and only when they don't fit.
