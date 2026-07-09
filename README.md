# IronGrid Technologies LLC

Marketing website for [irongridtechnologiesllc.com](https://irongridtechnologiesllc.com) —
a web design & development studio that builds fast, custom websites for
businesses of every kind: business sites, e-commerce & booking, redesigns,
landing pages, SEO & performance, and ongoing care plans.

> Note: the `claude/iron-grid-tech-website-bg1nmt` branch holds an alternate
> version of this site positioned as a general tech contracting agency,
> kept for future use.

## Stack

Plain static HTML + CSS + vanilla JS. No build step, no frameworks, no
external dependencies — fonts are self-hosted.

```
index.html                # Single-page site (hero, services, process, packages, principles, FAQ, contact)
404.html                  # Custom 404 page (GitHub Pages picks it up)
css/styles.css            # All styling (light editorial theme, brand navy, restrained accent)
js/main.js                # Minimal: footer year + mobile nav toggle
assets/fonts/             # Space Grotesk + Inter, variable woff2 (SIL OFL)
assets/logo.png           # Logo, navy on transparent (used in the header)
assets/logo-white.png     # Logo, white on transparent (for dark backgrounds)
assets/favicon.png        # Grid mark on navy chip
assets/logo-original.png  # Original uploaded logo artwork
CNAME                     # Custom domain for GitHub Pages
```

The design is deliberately restrained: light palette anchored to the
brand navy, sentence-case typography, static layout, native
`<details>` FAQ, and semantic HTML throughout.

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
