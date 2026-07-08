# IronGrid Technologies LLC

Marketing website for [irongridtechnologiesllc.com](https://irongridtechnologiesllc.com) —
a technology contracting agency offering software development, cloud &
infrastructure work, staff augmentation, and technical consulting.

## Stack

Plain static HTML + CSS + vanilla JS. No build step, no frameworks, no
external dependencies — fonts are self-hosted.

```
index.html                # Single-page site (hero, services, approach, models, principles, FAQ, contact)
404.html                  # Custom "off the grid" 404 page (GitHub Pages picks it up)
css/styles.css            # All styling (dark forge theme, ember accent, kinetic type)
js/main.js                # WebGL forge shader, particles, cursor, magnetic buttons, scroll FX
assets/fonts/             # Space Grotesk + Inter, variable woff2 (SIL OFL)
assets/logo.png           # Logo, navy on transparent (for light backgrounds)
assets/logo-white.png     # Logo, white on transparent (used in the dark header)
assets/favicon.png        # Grid mark on navy chip
assets/logo-original.png  # Original uploaded logo artwork
CNAME                     # Custom domain for GitHub Pages
```

## Notable machinery

- **Hero** — a hand-written WebGL fragment shader (fbm noise) renders a
  molten forge under a heat-warped grid, with a cursor-tracking heat
  bloom; a 2D canvas layers rising ember sparks on top. Falls back to a
  static gradient without WebGL.
- **Kinetic type** — the headline splits into characters that rise in
  with a forge easing after the preloader counts up.
- **Scroll choreography** — reveal-on-scroll, a timeline that draws
  itself, ghost section numerals with parallax, and a marquee that skews
  with scroll velocity.
- **Pointer craft** — custom cursor (fine pointers only), magnetic
  buttons, 3D-tilt service cards with glare.
- **Respect for the visitor** — every effect is disabled under
  `prefers-reduced-motion`; canvases pause offscreen and on hidden tabs;
  semantic HTML, focus-visible states, and no layout shift. Try the
  Konami code.

## Local preview

Open `index.html` directly in a browser, or serve it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

The site is static, so it can be hosted anywhere (GitHub Pages, Netlify,
Cloudflare Pages, S3, …). For GitHub Pages:

1. Repo **Settings → Pages** → deploy from the `main` branch, root directory.
2. Point the domain's DNS at GitHub Pages (the `CNAME` file here already
   declares `irongridtechnologiesllc.com`).
