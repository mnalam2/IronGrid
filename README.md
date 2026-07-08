# IronGrid Technologies LLC

Marketing website for [irongridtechnologiesllc.com](https://irongridtechnologiesllc.com) —
a technology contracting agency offering software development, cloud &
infrastructure work, staff augmentation, and technical consulting.

## Stack

Plain static HTML + CSS + vanilla JS. No build step, no frameworks, no
dependencies (Google Fonts is the only external resource).

```
index.html                # Single-page site (hero, services, approach, models, principles, FAQ, contact)
css/styles.css            # All styling (dark forge theme, ember accent, grid motif)
js/main.js                # Interactive hero grid canvas, reveals, nav, FAQ accordion
assets/logo.png           # Logo, navy on transparent (for light backgrounds)
assets/logo-white.png     # Logo, white on transparent (used in the dark header)
assets/favicon.png        # Grid mark on navy chip
assets/logo-original.png  # Original uploaded logo artwork
CNAME                     # Custom domain for GitHub Pages
```

Animations respect `prefers-reduced-motion`, the hero canvas pauses when
offscreen, and the layout is responsive down to small phones.

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
