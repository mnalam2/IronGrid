/* IronGrid Technologies — site behavior.
   WebGL molten-forge hero, ember particles, kinetic type, custom cursor,
   magnetic buttons, scroll choreography. No dependencies.
   Everything degrades gracefully and respects prefers-reduced-motion. */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ============================================================
     Theme toggle (initial theme is set inline in <head>)
     ============================================================ */
  const isLight = () => document.documentElement.dataset.theme === "light";

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = isLight() ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("ig-theme", next); } catch (_) {}
    document.dispatchEvent(new CustomEvent("themechange"));
  });

  /* ============================================================
     Split hero title into animatable characters
     ============================================================ */
  document.querySelectorAll("[data-split]").forEach((line) => {
    const nodes = [...line.childNodes];
    line.textContent = "";
    let i = 0;
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        for (const ch of node.textContent) {
          if (ch === " ") { line.appendChild(document.createTextNode(" ")); continue; }
          const s = document.createElement("span");
          s.className = "char";
          s.style.setProperty("--i", i++);
          s.textContent = ch;
          line.appendChild(s);
        }
      } else {
        node.classList?.add("char");
        node.style?.setProperty("--i", i++);
        line.appendChild(node);
      }
    });
    line.setAttribute("aria-hidden", "true");
  });

  /* ============================================================
     Preloader
     ============================================================ */
  const preloader = document.getElementById("preloader");
  const preCount = document.getElementById("preCount");
  let pageLoaded = document.readyState === "complete";
  window.addEventListener("load", () => { pageLoaded = true; });

  function finishPreload() {
    preloader.classList.add("done");
    document.body.classList.remove("preloading");
    document.body.classList.add("loaded");
    startCounters();
  }

  if (reducedMotion) {
    finishPreload();
  } else {
    const t0 = performance.now();
    const DURATION = 1150;
    (function tick(now) {
      const raw = clamp((now - t0) / DURATION, 0, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      preCount.textContent = Math.round(eased * 100);
      if (raw < 1 || !pageLoaded) {
        if (now - t0 > 3200) { finishPreload(); return; } // hard cap
        requestAnimationFrame(tick);
      } else {
        setTimeout(finishPreload, 130);
      }
    })(t0);
  }

  /* ============================================================
     Animated stat counters
     ============================================================ */
  let countersStarted = false;
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    document.querySelectorAll(".num").forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (reducedMotion || target === 0) { el.textContent = target; return; }
      const start = performance.now();
      const dur = 1500;
      (function step(now) {
        const t = clamp((now - start) / dur, 0, 1);
        el.textContent = Math.round((1 - Math.pow(1 - t, 4)) * target);
        if (t < 1) requestAnimationFrame(step);
      })(start);
    });
  }

  /* ============================================================
     Header: scrolled state, hide on scroll down, progress bar
     ============================================================ */
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    if (!document.body.classList.contains("nav-open")) {
      if (y > 420 && y > lastY + 4) header.classList.add("hidden");
      else if (y < lastY - 4 || y < 420) header.classList.remove("hidden");
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ============================================================
     Mobile nav
     ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) header.classList.remove("hidden");
  });

  siteNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ============================================================
     Active nav link
     ============================================================ */
  const navLinks = [...siteNav.querySelectorAll("a[href^='#']")];
  const sectionByLink = new Map(
    navLinks
      .map((a) => [document.querySelector(a.getAttribute("href")), a])
      .filter(([s]) => s)
  );

  {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = sectionByLink.get(entry.target);
          if (link && entry.isIntersecting) {
            navLinks.forEach((a) => a.removeAttribute("aria-current"));
            link.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sectionByLink.forEach((_, section) => obs.observe(section));
  }

  /* ============================================================
     Scroll reveals
     ============================================================ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => obs.observe(el));
  }

  /* ============================================================
     Cards: spotlight + 3D tilt + glare
     ============================================================ */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      if (finePointer && !reducedMotion && card.hasAttribute("data-tilt")) {
        const rx = ((y / r.height) - 0.5) * -7;
        const ry = ((x / r.width) - 0.5) * 7;
        card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
        card.style.setProperty("--gx", (((x / r.width) - 0.5) * 80).toFixed(1));
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  /* ============================================================
     Magnetic elements
     ============================================================ */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      let raf = null;
      let tx = 0, ty = 0, cx = 0, cy = 0;
      const strength = 0.28;

      function animate() {
        cx = lerp(cx, tx, 0.18);
        cy = lerp(cy, ty, 0.18);
        el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
        if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) raf = requestAnimationFrame(animate);
        else raf = null;
      }

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) * strength, -14, 14);
        ty = clamp((e.clientY - (r.top + r.height / 2)) * strength, -12, 12);
        if (!raf) raf = requestAnimationFrame(animate);
      });

      el.addEventListener("pointerleave", () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  /* ============================================================
     Custom cursor
     ============================================================ */
  if (finePointer && !reducedMotion) {
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = -100, my = -100, rx = -100, ry = -100;
    let cursorRaf = null;

    function cursorFrame() {
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px) translate(-50%, -50%)`;
      cursorRaf = requestAnimationFrame(cursorFrame);
    }

    window.addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!document.body.classList.contains("cursor-on")) {
        rx = mx; ry = my;
        document.body.classList.add("cursor-on");
        if (!cursorRaf) cursorRaf = requestAnimationFrame(cursorFrame);
      }
    }, { passive: true });

    document.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget) document.body.classList.remove("cursor-on");
    });

    const HOVER = "a, button, [data-magnetic], .faq-q, .prow";
    document.addEventListener("pointerover", (e) => {
      document.body.classList.toggle("cursor-hover", !!e.target.closest(HOVER));
    });
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-q");
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ============================================================
     Principle rows: hover opens on desktop, click toggles anywhere
     ============================================================ */
  document.querySelectorAll(".prow").forEach((row) => {
    row.addEventListener("click", () => {
      const open = row.classList.toggle("open");
      row.setAttribute("aria-expanded", String(open));
    });
    if (finePointer) {
      row.addEventListener("pointerenter", () => {
        row.classList.add("open");
        row.setAttribute("aria-expanded", "true");
      });
      row.addEventListener("pointerleave", () => {
        row.classList.remove("open");
        row.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* ============================================================
     Quote form — EmailJS
     ============================================================ */
  const quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    const statusEl = document.getElementById("formStatus");
    const submitBtn = quoteForm.querySelector(".form-submit");
    const labelEl = document.getElementById("submitLabel");

    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submitBtn.disabled) return;

      submitBtn.disabled = true;
      labelEl.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.classList.remove("ok", "error");

      try {
        if (!window.emailjs) throw new Error("EmailJS failed to load");
        // The EmailJS template only renders {{name}}, {{email}} and
        // {{message}}, so fold the optional fields into the message body.
        const data = new FormData(quoteForm);
        const phone = String(data.get("phone") || "").trim();
        const business = String(data.get("business") || "").trim();
        let message = String(data.get("message") || "").trim();
        const details = [];
        if (phone) details.push(`Phone: ${phone}`);
        if (business) details.push(`Business: ${business}`);
        if (details.length) message += `\n\n${details.join("\n")}`;
        await emailjs.send(
          "service_8jo6k7h",      // Service ID
          "template_0uweoxf",     // Template ID
          {
            name: String(data.get("name") || "").trim(),
            email: String(data.get("email") || "").trim(),
            message,
          },
          "-aQbtf3t-VTPboaHm"     // Public Key
        );
        quoteForm.reset();
        statusEl.textContent = "Sent! You'll hear back with a flat quote within one business day.";
        statusEl.classList.add("ok");
      } catch (err) {
        statusEl.textContent = "Something went wrong — email us at contact@irongridtechnologiesllc.com instead.";
        statusEl.classList.add("error");
      } finally {
        labelEl.textContent = "Get your free quote";
        submitBtn.disabled = false;
      }
    });
  }

  /* ============================================================
     Scroll-linked effects: ghost parallax, timeline draw,
     marquee velocity skew
     ============================================================ */
  const ghosts = [...document.querySelectorAll("[data-parallax]")];
  const timeline = document.getElementById("timeline");
  const timelineSteps = timeline ? [...timeline.querySelectorAll(".timeline-step")] : [];
  const marquee = document.getElementById("marquee");
  let velo = 0, lastScrollY = window.scrollY;

  if (!reducedMotion) {
    (function scrollFx() {
      const vh = window.innerHeight;
      const y = window.scrollY;

      velo = lerp(velo, y - lastScrollY, 0.12);
      lastScrollY = y;

      if (marquee) {
        const skew = clamp(velo * 0.28, -9, 9);
        marquee.style.transform = `skewY(${skew.toFixed(2)}deg)`;
      }

      ghosts.forEach((g) => {
        const r = g.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(g.dataset.parallax || "0.4");
        const offset = (r.top + r.height / 2 - vh / 2) * speed * -0.35;
        g.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });

      if (timeline) {
        const r = timeline.getBoundingClientRect();
        const p = clamp((vh * 0.72 - r.top) / r.height, 0, 1);
        timeline.style.setProperty("--tp", p.toFixed(4));
        timelineSteps.forEach((step) => {
          const sr = step.getBoundingClientRect();
          step.classList.toggle("lit", sr.top + 30 < vh * 0.72);
        });
      }

      requestAnimationFrame(scrollFx);
    })();
  } else if (timeline) {
    timeline.style.setProperty("--tp", "1");
    timelineSteps.forEach((s) => s.classList.add("lit"));
  }

  /* ============================================================
     WebGL molten-forge hero background
     ============================================================ */
  const forgeCanvas = document.getElementById("forgeCanvas");
  const hero = document.getElementById("hero");
  let overdrive = 0, overdriveTarget = 0;

  const VERT = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uBoost;
    uniform float uLight;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.03 + vec2(11.3, 7.9);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      vec2 p = uv;
      p.x *= uRes.x / uRes.y;
      float t = uTime * 0.055;

      // rising molten field
      float n = fbm(p * 2.1 + vec2(0.0, -t * 1.6));
      float n2 = fbm(p * 3.8 + vec2(t * 0.5, -t * 2.2) + n * 1.4);

      // base: deep steel (dark) or warm paper (light), vertical falloff
      vec3 baseA = mix(vec3(0.012, 0.022, 0.038), vec3(0.985, 0.975, 0.960), uLight);
      vec3 baseB = mix(vec3(0.028, 0.05, 0.085), vec3(0.945, 0.925, 0.895), uLight);
      vec3 col = mix(baseA, baseB, uv.y * 0.9);

      // ember glow, hottest low in the frame (subtler on paper)
      float ember = pow(max(n2, 0.0), 2.4) * smoothstep(0.95, 0.02, uv.y);
      vec3 emberTint = mix(vec3(1.0, 0.4, 0.16), vec3(-0.22, -0.34, -0.38), uLight);
      col += emberTint * ember * (0.4 + uBoost * 0.55) * (1.0 - uLight * 0.45);

      // faint sheen drifting through (skip on light)
      col += vec3(0.3, 0.55, 1.0) * pow(max(n, 0.0), 3.2) * 0.10 * (1.0 - uLight);

      // grid, warped slightly by the heat haze
      vec2 gp = (gl_FragCoord.xy + vec2(n2, n) * 26.0) / 56.0;
      vec2 gf = abs(fract(gp) - 0.5);
      float line = smoothstep(0.47, 0.5, max(gf.x, gf.y));
      vec3 lineTint = mix(vec3(0.5, 0.6, 0.72), vec3(-0.35, -0.28, -0.20), uLight);
      col += lineTint * line * mix(0.055, 0.16, uLight);

      // cursor heat bloom
      vec2 m = uMouse;
      m.x *= uRes.x / uRes.y;
      float d = distance(p, m);
      float heat = exp(-d * 3.4);
      vec3 heatTint = mix(vec3(1.0, 0.45, 0.18), vec3(0.28, -0.06, -0.14), uLight);
      col += heatTint * heat * (0.20 + uBoost * 0.3);
      col += mix(vec3(0.65, 0.78, 1.0), vec3(-0.3, -0.22, -0.12), uLight) * line * heat * 0.55;

      // vignette (gentle on light)
      float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5, 0.48)));
      col *= mix(mix(0.72, 0.955, uLight), 1.0, vig);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  (function initForge() {
    const gl = forgeCanvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { forgeCanvas.style.background = "radial-gradient(1000px 600px at 60% 0%, #0d1826, #04070b)"; return; }

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uBoost = gl.getUniformLocation(prog, "uBoost");
    const uLight = gl.getUniformLocation(prog, "uLight");
    let lightVal = isLight() ? 1 : 0;

    let mTX = 0.5, mTY = 0.62, mX = 0.5, mY = 0.62; // aspect-free targets
    let heroVisible = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      forgeCanvas.width = hero.clientWidth * dpr;
      forgeCanvas.height = hero.clientHeight * dpr;
      gl.viewport(0, 0, forgeCanvas.width, forgeCanvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mTX = (e.clientX - r.left) / r.width;
      mTY = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; })
      .observe(hero);

    const start = performance.now();

    function draw(now) {
      overdrive = lerp(overdrive, overdriveTarget, 0.03);
      lightVal = lerp(lightVal, isLight() ? 1 : 0, 0.05);
      mX = lerp(mX, mTX, 0.06);
      mY = lerp(mY, mTY, 0.06);
      gl.uniform2f(uRes, forgeCanvas.width, forgeCanvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mX, mY);
      gl.uniform1f(uBoost, overdrive);
      gl.uniform1f(uLight, lightVal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    if (reducedMotion) {
      draw(1200); // single static frame
      document.addEventListener("themechange", () => {
        lightVal = isLight() ? 1 : 0;
        draw(1200);
      });
      return;
    }

    (function loop(now) {
      requestAnimationFrame(loop);
      if (!heroVisible || document.hidden) return;
      draw(now);
    })(start);
  })();

  /* ============================================================
     Ember spark particles (2D canvas over the shader)
     ============================================================ */
  (function initSparks() {
    if (reducedMotion) return;
    const canvas = document.getElementById("sparkCanvas");
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0;
    let heroVisible = true;
    const COUNT = finePointer ? 55 : 26;
    const sparks = [];

    function resize() {
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = W;
      canvas.height = H;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawn(s) {
      s.x = Math.random() * W;
      s.y = H + 10 + Math.random() * 60;
      s.vy = -(0.35 + Math.random() * 0.9);
      s.vx = (Math.random() - 0.5) * 0.3;
      s.life = 0;
      s.maxLife = 240 + Math.random() * 300;
      s.size = 0.8 + Math.random() * 1.7;
      s.hue = Math.random() < 0.75 ? "255, 130, 60" : "255, 190, 90";
      s.wobble = Math.random() * Math.PI * 2;
    }

    for (let i = 0; i < COUNT; i++) {
      const s = {};
      spawn(s);
      s.life = Math.random() * s.maxLife; // desync
      s.y = Math.random() * H;
      sparks.push(s);
    }

    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; })
      .observe(hero);

    (function loop() {
      requestAnimationFrame(loop);
      if (!heroVisible || document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      const boost = 1 + overdrive * 1.6;
      const light = isLight();
      for (const s of sparks) {
        s.life++;
        if (s.life > s.maxLife || s.y < -12) { spawn(s); continue; }
        s.wobble += 0.02;
        s.x += s.vx + Math.sin(s.wobble) * 0.25;
        s.y += s.vy * boost;
        const fade = Math.sin((s.life / s.maxLife) * Math.PI);
        ctx.globalAlpha = fade * (light ? 0.5 : 0.75);
        ctx.fillStyle = light ? "rgba(178, 72, 34, 1)" : `rgba(${s.hue}, 1)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    })();
  })();

  /* ============================================================
     Hero word flipper: "For any business." cycles industries
     ============================================================ */
  (function initFlip() {
    const el = document.getElementById("flipWord");
    if (!el || reducedMotion) return;
    const WORDS = [
      "restaurants.", "law firms.", "salons.", "contractors.",
      "clinics.", "real estate.", "startups.", "any business.",
    ];
    let idx = -1;

    function next() {
      idx = (idx + 1) % WORDS.length;
      el.classList.add("out");
      setTimeout(() => {
        el.textContent = WORDS[idx];
        el.classList.remove("out");
        el.classList.add("pre");
        void el.offsetHeight; // reflow so the enter transition runs
        el.classList.remove("pre");
      }, 320);
      // linger longer on the punchline before looping
      setTimeout(next, WORDS[idx] === "any business." ? 3600 : 1900);
    }

    setTimeout(next, 2600); // let the hero reveal finish first
  })();

  /* ============================================================
     Easter eggs
     ============================================================ */
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let kIdx = 0;
  window.addEventListener("keydown", (e) => {
    kIdx = e.key === KONAMI[kIdx] ? kIdx + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      overdriveTarget = overdriveTarget > 0 ? 0 : 1;
      console.log(overdriveTarget ? "%c🔥 FORGE OVERDRIVE ENGAGED" : "%c🌙 Forge cooling down…",
        "color:#ff6a3d; font-weight:bold; font-size:14px");
    }
  });

  console.log(
    "%c▦ IRONGRID%c\n\nWe forge the systems your business runs on.\nLooking under the hood? We like you already.\n→ contact@irongridtechnologiesllc.com\n\nPsst: try the Konami code.",
    "color:#ff6a3d; font-family:monospace; font-size:22px; font-weight:bold;",
    "color:#93a1b4; font-family:monospace; font-size:12px;"
  );
})();
