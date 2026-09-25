# PriceWise

An interactive MVP price-comparison app — compares products across Amazon, Flipkart, Meesho, Zepto, Blinkit and Instamart, with pincode-based stock/delivery filtering, an AI shopping assistant, wishlist, price alerts, and accessibility modes (colorblind filters, high contrast).

This is a static, dependency-free build: plain HTML/CSS/JS, no framework, no build step. It's also an installable PWA — open it on a phone and use "Add to Home Screen" to install it like a native app.

Sample data only — prices, stock and offers are illustrative, not live.

## Run locally

No build step needed. Just serve the folder:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Push this repo to GitHub, then import it into Vercel as a static project (no framework preset, no build command, output directory `.`). It'll be live at a `*.vercel.app` URL in under a minute.

## Structure

```
index.html        the whole app (single file: markup + CSS + JS)
manifest.json      PWA manifest (installability, icons, theme)
sw.js               service worker (offline caching)
icons/              app icons (192/512, maskable variants, apple-touch-icon)
assets/products/    product photos
assets/logos/       retailer logos
```
