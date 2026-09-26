# Multimedia promotional landing page

Only `index.html` loads this directory. Do not import these assets into the reader.

## Protected existing files

`book.html`, `reader.html`, all PDF content, `brainfacts-3d.html`, other existing pages,
`style.css`, `scripts.js`, and `.github/` are unchanged. The reading destination remains
`book.html`, opened in a separate tab with `rel="noopener"`.

## Runtime

Static HTML, scoped CSS, and native ES modules. No installation or build step is
required. The existing GitHub Pages branch deployment publishes these files.
Three.js 0.170.0 is vendored and minified with esbuild 0.28.2; its MIT license is in
`vendor/THREE-LICENSE.txt`. Vazirmatn is locally hosted under its included OFL license.
The book cover, lens, headphones, environmental lighting, and interactive studies
are original procedural artwork, requiring no remote asset requests.

Animations are limited to 30 fps, pause offscreen/in background tabs, and honor
reduced motion. The scene has a CSS book fallback when WebGL cannot initialize.
Sound is synthesized only after an explicit visitor click, stops on tab changes,
and stops when the document is hidden. AI and XR studies are labeled conceptual.

## Verification

- Chromium: 1440, 768, 390, and 360 px widths; no horizontal page overflow.
- All seven media tabs and parameter controls update their canvas output.
- Keyboard tab navigation, audio start/stop, hero controls, and pause control.
- Reading CTA opens the unchanged `book.html` in a new tab.
- Reduced motion and failed WebGL dependency fallback.
- No JavaScript page errors.
- Every pre-existing file except `index.html` compared byte-for-byte with
  baseline commit `c085c303cee088b968051b3a4fcec2c1d400a87b`.

The external Google PDF service remains the reader's existing dependency;
landing-page tests do not replace or modify that service.
