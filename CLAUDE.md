# Pixel Coloring Webapp

Kid-friendly pixel art coloring prototype for playtesting with kids on iPads/iPhones in Safari.

**Live:** https://dogacanaydin.github.io/pixel-coloring/

## Stack

Pure HTML/CSS/JS. No build tools, no server, no modules, no fetch. Runs on file:// and GitHub Pages. Data embedded via `<script>` tags. `localStorage` passes sheet ID between pages.

## File Structure

- `index.html` — Home screen with horizontally scrolling sheet cards
- `color.html` — Coloring canvas with "Tap to start!" overlay
- `js/audio-ctx.js` — Single shared AudioContext (required for iOS)
- `js/music.js` — Background music via GainNode (page-specific tracks)
- `js/sounds.js` — Procedural SFX (fill, wrong, select, color complete, sheet complete, panel whoosh)
- `js/canvas.js` — Core engine: 2x2 brush, background pre-fill, touch/drag painting
- `js/app.js` — Home screen cards, desktop wheel/drag scroll
- `js/utils.js` — Color math helpers
- `sheets/sheetN/data.js` — Sheet data (palette, colorGrid, gridSize, optional bgIndex)
- `generate_sheets.py` — Python PIL batch generator for sheet data from PNGs
- `assets/` — Music files, UI images

## Active Sheets

1 (Rubble), 2-4, 8-16. Sheets 5-7 were removed.

Sheet 1 (Rubble) has `bgIndex: 5`. All others default to `bgIndex: 0`.

## iOS Safari Rules

These are hard-won lessons — do not deviate:

- **Audio volume:** `audio.volume` is IGNORED on iOS. Always use Web Audio API `GainNode` through the shared `AudioContext` in `audio-ctx.js`.
- **Single AudioContext:** iOS kills competing AudioContexts. Everything (music + SFX) must share one context.
- **Scroll:** Use `touch-action: pan-x` on horizontal scroll containers. Use `passive: true` on touch listeners that shouldn't block scroll.
- **Viewport:** Use `100dvh`, not `100vh`. PWA manifest has `display: fullscreen`.
- **CSS scroll traps:** `justify-content: center` on a flex container breaks `overflow-y: auto`. Use `::before`/`::after` flex spacers instead.

## Deploy

Push to `main` — GitHub Actions deploys to Pages automatically.
