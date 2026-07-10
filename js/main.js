/* IronGrid Technologies — premium contracting edition.
   Constellation background, terminal typing, counters, reveals,
   spotlight cards, contribution graph. No dependencies. */

(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  document.getElementById("year").textContent = new Date().getFullYear();

  /* Header + mobile nav */
  const header = document.getElementById("header");
  addEventListener("scroll", () => header.classList.toggle("on", scrollY > 20), { passive: true });
  header.classList.toggle("on", scrollY > 20);

  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  menuBtn.addEventListener("click", () => {
    const open = document.body.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      document.body.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  /* Active nav */
  const links = [...nav.querySelectorAll("a")];
  const byLink = new Map(links.map((a) => [document.querySelector(a.getAttribute("href")), a]).filter(([s]) => s));
  const navObs = new IntersectionObserver((es) => {
    es.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.removeAttribute("aria-current"));
        byLink.get(en.target)?.setAttribute("aria-current", "true");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  byLink.forEach((_, s) => navObs.observe(s));

  /* Reveals */
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduced) reveals.forEach((el) => el.classList.add("in"));
  else {
    const obs = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => obs.observe(el));
  }

  /* Stat counters */
  let counted = false;
  function count() {
    if (counted) return;
    counted = true;
    document.querySelectorAll(".num").forEach((el) => {
      const t = parseInt(el.dataset.target, 10);
      if (reduced) { el.textContent = t; return; }
      const t0 = performance.now();
      (function step(now) {
        const p = clamp((now - t0) / 1400, 0, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * t);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  setTimeout(count, 500);

  /* Spotlight on service cards */
  document.querySelectorAll(".svc").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* Terminal typing */
  (function term() {
    const el = document.getElementById("termBody");
    if (!el) return;
    const LINES = [
      ["$ ", "irongrid init --client you", ""],
      ["", "✓ requirements captured", "g"],
      ["", "✓ architecture approved", "g"],
      ["$ ", "irongrid build --senior-only", ""],
      ["", "✓ weekly demo shipped", "g"],
      ["", "✓ tests passing", "g"],
      ["$ ", "irongrid deploy --env production", ""],
      ["", "✓ live — keys handed to you", "g"],
    ];
    if (reduced) {
      el.innerHTML = LINES.map(([p, t, c]) =>
        `<span class="p">${p}</span><span class="${c}">${t}</span>`).join("\n");
      return;
    }
    let li = 0, ci = 0;
    let html = "";
    (function type() {
      if (li >= LINES.length) { el.innerHTML = html + '<span class="cursor"></span>'; return; }
      const [p, text, cls] = LINES[li];
      if (ci === 0) html += `<span class="p">${p}</span><span class="${cls}">`;
      ci++;
      const partial = text.slice(0, ci);
      el.innerHTML = html + partial + '</span><span class="cursor"></span>';
      if (ci >= text.length) { html += text + "</span>\n"; li++; ci = 0; setTimeout(type, p ? 420 : 260); }
      else setTimeout(type, p ? 26 : 10);
    })();
  })();

  /* Contribution graph */
  (function graph() {
    const g = document.getElementById("gitGraph");
    if (!g) return;
    const COLS = 26, ROWS = 7;
    let seed = 42;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const frag = document.createDocumentFragment();
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const i = document.createElement("i");
        const v = rand();
        if (v > 0.82) i.className = "l4";
        else if (v > 0.6) i.className = "l3";
        else if (v > 0.38) i.className = "l2";
        else if (v > 0.16) i.className = "l1";
        i.style.setProperty("--d", `${(c * ROWS + r) * 6}ms`);
        frag.appendChild(i);
      }
    }
    g.appendChild(frag);
    new IntersectionObserver((es, o) => {
      es.forEach((en) => { if (en.isIntersecting) { g.classList.add("on"); o.disconnect(); } });
    }, { threshold: 0.3 }).observe(g);
  })();

  /* Constellation background */
  (function field() {
    const canvas = document.getElementById("field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    let W = 0, H = 0, pts = [];
    const mouse = { x: -9999, y: -9999 };
    let visible = true;

    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor((W * H) / 26000);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: 0.8 + Math.random() * 1.4,
      }));
    }
    resize();
    addEventListener("resize", () => { resize(); if (reduced) draw(); });

    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.x = -9999; });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (!reduced) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const near = clamp(1 - d / 200, 0, 1);
        ctx.fillStyle = `rgba(167, 147, 255, ${(0.16 + near * 0.6).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + near, 0, Math.PI * 2); ctx.fill();
      }
      // link nearby points around cursor
      if (mouse.x > -999) {
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          if (Math.hypot(a.x - mouse.x, a.y - mouse.y) > 180) continue;
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j];
            const d2 = Math.hypot(a.x - b.x, a.y - b.y);
            if (d2 < 110) {
              ctx.strokeStyle = `rgba(124, 107, 255, ${(0.22 * (1 - d2 / 110)).toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
      }
    }

    if (reduced) { draw(); return; }
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      draw();
    })();
  })();

  console.log("%cIRONGRID%c  Inspecting the work? Good instinct.\n→ contact@irongridtechnologiesllc.com",
    "color:#7c6bff;font-weight:bold;font-size:18px;font-family:monospace",
    "color:#9a9ab0;font-family:monospace;font-size:12px");
})();
