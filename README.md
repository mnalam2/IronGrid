# IronGrid Technologies LLC

Marketing website for [irongridtechnologiesllc.com](https://irongridtechnologiesllc.com) —
a premium technology contracting agency: custom software, web and mobile
development, AI solutions, cloud engineering, DevOps, and staff augmentation.

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

- Dark-first design system: deep neutrals, single violet accent, Space
  Grotesk + Inter (self-hosted), mono kickers and terminal motifs.
- Constellation canvas background with cursor-linked nodes; typing
  terminal in the hero; animated CI pipeline; git-style contribution
  graph; spotlight service cards; animated stat counters.
- Honest content: no invented clients or testimonials — commitments,
  a self-referential case study, and a reserved "your project" slot.
- All animation disabled under prefers-reduced-motion; canvas pauses
  offscreen; semantic HTML, skip link, focus states.

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
