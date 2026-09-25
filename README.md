# PriceWise

An interactive MVP price-comparison app — compares products across Amazon, Flipkart, Meesho, Zepto, Blinkit and Instamart.

**Live:** https://pricewise-app-alpha.vercel.app
**Repo:** https://github.com/thepakpal/pricewise-app

## What's actually functional (not mocked)

- Multi-platform price comparison with sorting, filtering and a card/table view toggle
- **Pincode-based serviceability** — quick-commerce platforms (Zepto/Blinkit/Instamart) only show up when your saved address is in a serviceable metro pincode; per-listing in/out-of-stock state, deterministic per pincode
- Login / create account / "Continue with Gmail" (demo auth — no real backend, clearly labeled as such), with a first-time onboarding tour
- Wishlist, price alerts (with a demo "simulate a price drop" action), purchase history
- AI shopping assistant — rule-based, answers from the sample catalogue (not a live LLM)
- Accessibility: colour-blind simulation modes (Protanopia/Deuteranopia/Tritanopia/Monochromacy via SVG filters), high-contrast mode, adjustable font size
- **Light/Dark/System theme**, toggleable from the Home header or Accessibility Settings
- Real navigation: every screen push, tab switch and modal is mirrored onto the browser's History API, so the mobile back gesture / hardware back button actually steps back through screens instead of exiting the app. App state (current screen, tab, chat) persists in `localStorage` across relaunches — reopening resumes exactly where you left off.
- Installable PWA (manifest + service worker, network-first for the app shell so updates show up on next reopen, cache-first for images so it still works offline)

**Not real:** prices, stock levels, offers, ratings and 30-day price histories are generated sample data. The "Buy Now" flow ends in a clearly-labeled simulated checkout — nothing is scraped or fetched from real retailer APIs.

## Structure

```
index.html          built output — the whole app as one file (do not hand-edit)
src/
  head.html          <head> content + all CSS + the static app shell markup
  js1.js              data: product catalogue, platform/pricing tables, icons, seed state
  js2.js              view templates (one function per screen)
  js3.js              router, navigation/history wiring, action handlers, AI assistant logic
manifest.json         PWA manifest (icons, theme colour, start_url)
sw.js                 service worker (network-first shell, cache-first assets)
icons/                app icons — any/maskable 192 & 512, apple-touch-icon, favicon
assets/products/      product photos
assets/logos/         retailer logos
```

## Editing

**Edit the files in `src/`, never `index.html` directly** — it's a generated build artifact and your changes will be lost next rebuild.

Rebuild after any change in `src/`:

```bash
python3 -c "
content = open('src/head.html', encoding='utf-8').read()
marker = '<svg width=\"0\" height=\"0\"'
idx = content.index(marker)
doc = ['<!DOCTYPE html>', '<html lang=\"en\">', '<head>', content[:idx].rstrip(), '</head>', '<body>', content[idx:].rstrip()]
open('index.html', 'w', encoding='utf-8').write('\n'.join(doc) + '\n')
"
cat src/js1.js src/js2.js src/js3.js >> index.html
cat >> index.html <<'EOF'
</script>
<script>
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); }); }
</script>
</body>
</html>
EOF
```

## Run locally

No build step needed to serve it — just:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Push to GitHub `main` — Vercel is connected to this repo and auto-deploys on every push (no framework preset, no build command, output directory `.`).

## Install as an app

Open the live URL on a phone:
- **Android (Chrome):** menu → "Install app" / "Add to Home screen"
- **iPhone (Safari):** Share → "Add to Home Screen"
