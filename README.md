# Painter's Portfolio — Gallery

Plain HTML, CSS and vanilla JavaScript. No build step, no dependencies.

## Folder structure

```
index.html            Gallery page (title, left menu, grid and viewer are filled in automatically)
css/styles.css        Styling. Thumbnail size is at the top (--thumb-w, --thumb-ratio)
js/gallery.js         Menu, grid, pagination, viewer. Never edit to add paintings.
js/site.js            Top menu, site title, footer (from data/site.json)
data/paintings.json   YOUR GALLERIES AND PAINTINGS: the only file you edit regularly
data/site.json        Site title, footer text, top menu links
images/full/          Your original image files
```

## How the gallery is organised

`data/paintings.json` holds a list of **galleries** (pages). Each gallery has a name shown in the left menu, and its own list of paintings. Every gallery shows up to 16 paintings, 4 per row, as 170 × 150 px thumbnails cropped to fill the box. The viewer always shows the whole, uncropped painting.

```json
{
  "perPage": 16,
  "menuTitle": "Works",
  "galleries": [
    {
      "id": "2025",
      "title": "2025 – 2026",
      "paintings": [
        { "image": "sunrise.jpg", "title": "Sunrise", "caption": "Oil on canvas | 90 × 70 cm | 2026", "alt": "Orange sun over a field" }
      ]
    },
    {
      "id": "2023",
      "title": "2023 – 2024",
      "paintings": [ ]
    }
  ]
}
```

## Adding a painting

1. Upload the original file to `images/full/`.
2. In `data/paintings.json`, add an entry inside the right gallery's `"paintings"` list. Order in the file = order on the site.

| Field     | Required | Meaning |
|-----------|----------|---------|
| `image`   | yes | File name in `images/full/` (spelling and capitals must match exactly) |
| `title`   | no  | Shown above the caption in the viewer; used as default alt text |
| `caption` | no  | Text under the image (`\n` for a new line). Hebrew works |
| `alt`     | no  | Description for screen readers |
| `focus`   | no  | Which part of the painting stays visible in the cropped thumbnail, e.g. `"50% 30%"` (left-to-right, top-to-bottom). Default is the centre |
| `thumb`   | no  | A smaller copy in `images/thumbs/` for faster loading. If omitted, the full image is used |

## Adding a new gallery page

Add a block to `"galleries"`:

- `id`: short name used in the web address (letters and numbers, no spaces), e.g. `"2020"` gives `?gallery=2020`.
- `title`: the name shown in the left menu (any language).
- `paintings`: the list.
- `folder` (optional): put this gallery's files in a subfolder, e.g. `"folder": "2020"` reads from `images/full/2020/`.

The left menu appears automatically when there are two or more galleries. Menu order = order in the file. If a gallery has more than 16 paintings, it splits into numbered pages automatically.

## Changing the thumbnail size

In `css/styles.css` change both `--thumb-w` and `--thumb-ratio` (width / height), for example 200px and `200 / 180`.

## Adding other pages later (About, Contact…)

Create e.g. `about.html` (copy the `<header>` from `index.html`), then add `{ "label": "About", "href": "about.html" }` to `menu` in `data/site.json`.

## Test locally

The gallery loads JSON with `fetch`, which browsers block on `file://`. Run from this folder:

```
python3 -m http.server 8000
```
then open http://localhost:8000.

## Deploy

Upload the folder to any static host (GitHub Pages, FTP, Netlify…). After changes, hard-refresh (Ctrl/Cmd+Shift+R) if you still see the old version.

## Search engines

`index.html` contains `<meta name="robots" content="noindex, nofollow">`, which asks Google not to list the site. Copy it into every page you add. Delete it when you want to be indexed. This is a request, not privacy protection.
