# WassersteinGrad — project page

Project page for **"Explanation of Dynamic Physical Field Predictions using
WassersteinGrad: Application to Autoregressive Weather Forecasting"**

Younes Essafouri, Laure Raynaud, Luciano Drozda, Laurent Risser — arXiv:2604.22580

🌐 **https://younesessafouri.github.io/WassersteinGrad/**

---

## Running it locally

There is no build step. It is one HTML file, one stylesheet, one script.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Layout

```
.
├── index.html
├── .nojekyll
└── assets/
    ├── css/style.css
    ├── js/main.js          # progressive enhancement only — page works without it
    └── figures/*.webp      # 30 files, ~1.1 MB total
```
