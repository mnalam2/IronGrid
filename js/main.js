/* IronGrid Technologies — site behavior
   Interactive hero grid, scroll reveals, nav state, FAQ accordion,
   card spotlight. No dependencies. Respects prefers-reduced-motion. */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Header state + scroll progress ---------- */
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  siteNav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Active nav link ---------- */
  const navLinks = [...siteNav.querySelectorAll("a[href^='#']")];
  const sectionByLink = new Map(
    navLinks
      .map((a) => [document.querySelector(a.getAttribute("href")), a])
      .filter(([s]) => s)
  );

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = sectionByLink.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sectionByLink.forEach((_, section) => navObserver.observe(section));

  /* ---------- Scroll reveals ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Card spotlight ---------- */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Hero canvas: living grid ---------- */
  const canvas = document.getElementById("gridCanvas");
  const hero = document.getElementById("hero");
  const ctx = canvas.getContext("2d");

  const CELL = 56;
  const LINE_COLOR = "rgba(148, 170, 197, 0.07)";
  const DOT_COLOR = "90, 167, 255";   // steel
  const PULSE_STEEL = "90, 167, 255";
  const PULSE_EMBER = "255, 106, 61";

  let W = 0, H = 0, dpr = 1;
  const mouse = { x: -9999, y: -9999 };
  let pulses = [];
  let rafId = null;
  let visible = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawStaticGrid() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0.5; x <= W; x += CELL) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0.5; y <= H; y += CELL) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function spawnPulse() {
    const horizontal = Math.random() < 0.5;
    const lines = horizontal ? Math.floor(H / CELL) : Math.floor(W / CELL);
    pulses.push({
      horizontal,
      line: (Math.floor(Math.random() * lines) + 0.5) * CELL,
      t: -0.15,
      speed: 0.0016 + Math.random() * 0.0022,
      len: 90 + Math.random() * 150,
      color: Math.random() < 0.28 ? PULSE_EMBER : PULSE_STEEL,
      dir: Math.random() < 0.5 ? 1 : -1,
    });
    if (pulses.length > 9) pulses.shift();
  }

  let lastSpawn = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!visible) return;

    drawStaticGrid();

    // Traveling light pulses along grid lines
    if (now - lastSpawn > 620) { spawnPulse(); lastSpawn = now; }

    pulses = pulses.filter((p) => p.t < 1.2);
    for (const p of pulses) {
      p.t += p.speed * 16;
      const span = p.horizontal ? W : H;
      const head = p.dir === 1 ? p.t * (span + p.len) : span - p.t * (span + p.len);
      const tail = head - p.dir * p.len;
      const grad = p.horizontal
        ? ctx.createLinearGradient(tail, 0, head, 0)
        : ctx.createLinearGradient(0, tail, 0, head);
      grad.addColorStop(0, `rgba(${p.color}, 0)`);
      grad.addColorStop(1, `rgba(${p.color}, 0.55)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      if (p.horizontal) { ctx.moveTo(tail, p.line); ctx.lineTo(head, p.line); }
      else { ctx.moveTo(p.line, tail); ctx.lineTo(p.line, head); }
      ctx.stroke();
    }

    // Intersection dots glow near the cursor
    if (mouse.x > -999) {
      const R = 190;
      const x0 = Math.max(CELL * Math.floor((mouse.x - R) / CELL), 0);
      const x1 = Math.min(CELL * Math.ceil((mouse.x + R) / CELL), W);
      const y0 = Math.max(CELL * Math.floor((mouse.y - R) / CELL), 0);
      const y1 = Math.min(CELL * Math.ceil((mouse.y + R) / CELL), H);
      for (let gx = x0; gx <= x1; gx += CELL) {
        for (let gy = y0; gy <= y1; gy += CELL) {
          const d = Math.hypot(gx + 0.5 - mouse.x, gy + 0.5 - mouse.y);
          if (d > R) continue;
          const a = (1 - d / R) ** 2;
          ctx.fillStyle = `rgba(${DOT_COLOR}, ${(a * 0.85).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(gx + 0.5, gy + 0.5, 1.6 + a * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // soft ember halo
      const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R * 1.15);
      halo.addColorStop(0, "rgba(255, 106, 61, 0.05)");
      halo.addColorStop(1, "rgba(255, 106, 61, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(mouse.x - R * 1.15, mouse.y - R * 1.15, R * 2.3, R * 2.3);
    }
  }

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) drawStaticGrid();
  });

  if (reducedMotion) {
    drawStaticGrid();
  } else {
    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });

    // Pause work when the hero is offscreen or the tab is hidden
    new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    ).observe(hero);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!document.hidden && !rafId) { rafId = requestAnimationFrame(frame); }
    });

    rafId = requestAnimationFrame(frame);
  }
})();
