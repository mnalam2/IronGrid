# IronGrid Technologies LLC

Marketing website for [irongridtechnologiesllc.com](https://irongridtechnologiesllc.com) —
a technology contracting agency offering software development, cloud &
infrastructure work, staff augmentation, and technical consulting.

## Stack

Plain static HTML + CSS. No build step, no frameworks, no dependencies.

```
index.html       # Single-page site (hero, services, approach, about, contact)
css/styles.css   # All styling (system fonts, dark industrial theme)
CNAME            # Custom domain for GitHub Pages
```

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
