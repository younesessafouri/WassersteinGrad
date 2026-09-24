# WassersteinGrad — project page

Project page for **"Explanation of Dynamic Physical Field Predictions using
WassersteinGrad: Application to Autoregressive Weather Forecasting"**,
accepted at **NeurIPS 2026**.

Younes Essafouri, Laure Raynaud, Luciano Drozda, Laurent Risser — arXiv:2604.22580

🌐 **https://younesessafouri.github.io/WassersteinGrad/**

---

## Running it locally

There is no build step. It is one HTML file, one stylesheet, one script.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)`.
The `.nojekyll` file keeps Pages from running the content through Jekyll.

**Vercel / Netlify** — deploy the repository root with no build command and no
output directory.

All asset paths are relative, so the site also works from a subdirectory.

## The page

The page follows one sentence:

> Gradient explanations of weather forecasts can move under small perturbations;
> averaging them pointwise blurs the structure, while Wasserstein averaging
> preserves their spatial geometry.

| Section | Carries |
|---|---|
| Hero | Title, authors, venue, Paper / Code / BibTeX, SmoothGrad vs WassersteinGrad on the same forecast |
| The sentence | The paper in one sentence; each clause links to the section that makes the case |
| 01 The problem | What a local explanation is, SmoothGrad's pointwise average, and the assumption behind it (schematic) |
| 02 The observation | Clean → perturbed → transport flux, the 115 km / 1.5 % dissociation; Fig. 4 and the mechanism behind disclosures |
| 03 The idea | Pointwise mean vs Wasserstein barycenter of eight rings, a 1-D interactive, the Fréchet mean |
| 04 The method | Perturb → gradients → measures → barycenter → explanation, the one line that changes, the two variants |
| 05 Results | LLE<sub>cos</sub> dumbbell chart, headline numbers, Table 1 behind a disclosure, the SmoothGrad ↔ WassersteinGrad wipe |
| 06 Citation | BibTeX, authors, affiliations, acknowledgements, links |

The visual system is the one of the portfolio
([younesessafouri/Portfolio](https://github.com/younesessafouri/Portfolio)):
paper and ink, one dark band, and colour used by meaning, never decoration.

- `--atmo` (teal): atmospheric input fields
- `--xai` (cobalt): WassersteinGrad and the Wasserstein average
- `--target` (orange): displacement
- `--mute` (grey): metadata and the pointwise average

## Layout

```
.
├── index.html
├── .nojekyll
└── assets/
    ├── css/style.css
    ├── js/main.js          # progressive enhancement only — page works without it
    ├── fonts/              # self-hosted, SIL OFL, licences alongside
    └── figures/*.webp      # 24 files
```

**Fonts.** Newsreader (display serif), Instrument Sans (text) and IBM Plex Mono
(annotations) are the portfolio's files. Equations use a subset of STIX Two Text
that carries Greek and the operators on the page (∇, ∑, ℬ, 𝒴, 𝒩, ‖ …); if an
equation needs a new symbol, regenerate the subset from Google Fonts with the
`text=` parameter.

**Lead time.** One lead-time state drives every map with `data-src-t1` /
`data-src-t5`: the hero, the two variants and the wipe. Any of the switches changes
all of them.

**Schematics.** The 1-D curves in sections 01 and 03 are computed by the
`WGShapes` block at the top of `main.js` (the copies form a location–scale family,
so their 1-D Wasserstein barycenter is exact). The static SVG paths in
`index.html` were rendered once from that same block, so the page reads without
JavaScript; the script redraws the section 03 demo live.

## Figures

Every map and plot is extracted from the paper PDF or the presentation slides.
Nothing is redrawn, resynthesised or invented: vector page regions are cropped at
6–9× zoom, and embedded rasters are pulled at native resolution. The only drawn
elements are the labelled schematics (1-D curves, pipeline glyphs).

| File(s) | Source |
|---|---|
| `attribution-pipeline` | Paper Figure 1 (b), cropped to the three maps |
| `noise-*` | Paper Figure 1 (c) |
| `map-{basegrad,smoothgrad,wgbary,wgbarygrad}-{t1,t5}` | Paper Figure 2 |
| `displacement-t1`, `displacement-t5` | Paper Figure 4 |
| `barycenter-input-1..8`, `barycenter-{pointwise-mean,wasserstein}` | Slides, p. 19 |

All quantitative claims come from Table 1, Section 4.2, or Appendix C.2/E.2 of
the paper — no numbers are estimated off a plot.

## Before publishing

- **Proceedings link.** The Paper button points at the arXiv PDF. Swap in the
  NeurIPS proceedings / OpenReview page once it exists, and add its URL to the
  BibTeX and JSON-LD.
- **Code link.** The hero and citation section point at upstream
  [`meteofrance/py4cast`](https://github.com/meteofrance/py4cast). Swap in the
  WassersteinGrad code once it is public.
- **arXiv identifier.** `2604.22580` appears in the links, BibTeX and JSON-LD.

## Licence

Figures are reproduced from the authors' own paper and presentation. Fonts are
under the SIL Open Font License (see `assets/fonts/`). Add a licence file before
reuse by third parties.
