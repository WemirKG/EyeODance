(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const money = (n) => `$${Number(n).toFixed(0)}`;

  /************************************************************
   * CONFIG — Replace these to monetize properly
   ************************************************************/
  const PRODUCTS = [
    {
      id: "cypher-foundations",
      title: "Cypher Foundations: Control, Bounce, Authority",
      creator: "Saint (Founder)",
      style: "Hip-Hop",
      level: "Beginner",
      durationMin: 48,
      price: 50,
      tagline: "Build the base that makes every move look expensive.",
      buyUrl: "REPLACE_WITH_STRIPE_PAYMENT_LINK_50",
      previewEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: "afro-fusion-flow",
      title: "Afro Fusion Flow: Rhythm + Storytelling",
      creator: "Guest Creator",
      style: "Afro / Fusion",
      level: "Intermediate",
      durationMin: 62,
      price: 70,
      tagline: "Learn to move like the music is inside your chest.",
      buyUrl: "REPLACE_WITH_STRIPE_PAYMENT_LINK_70",
      previewEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: "popping-precision",
      title: "Popping Precision: Hits, Angles, Clean Illusions",
      creator: "Guest Creator",
      style: "Popping",
      level: "Advanced",
      durationMin: 55,
      price: 80,
      tagline: "Turn sharp technique into a signature.",
      buyUrl: "REPLACE_WITH_STRIPE_PAYMENT_LINK_80",
      previewEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    }
  ];

  // For creator applications on a static site: Formspree endpoint like https://formspree.io/f/xxxxxx
  const CREATOR_FORM_ACTION = "REPLACE_WITH_FORMSPREE_ENDPOINT";

  /************************************************************
   * Init
   ************************************************************/
  document.addEventListener("DOMContentLoaded", () => {
    $("#year").textContent = new Date().getFullYear();

    // Toast
    function showToast(title, body) {
      $("#toastTitle").textContent = title;
      $("#toastBody").textContent = body;
      $("#toast").classList.add("show");
    }
    $("#toastClose").addEventListener("click", () => $("#toast").classList.remove("show"));

    // Typewriter
    const LINES = [
      "The future isn’t coming. It’s already in the room.",
      "This is Black excellence, engineered for motion.",
      "Turn skill into legacy. Turn rhythm into revenue.",
      "Welcome to the cypher where the platform pays you back."
    ];
    let lineIndex = 0;
    let typing = false;

    async function typeLine() {
      if (typing) return;
      typing = true;
      const el = $("#typeText");
      const line = LINES[lineIndex % LINES.length];
      el.textContent = "";
      for (let i = 1; i <= line.length; i++) {
        el.textContent = line.slice(0, i);
        await new Promise((r) => setTimeout(r, 22));
      }
      await new Promise((r) => setTimeout(r, 1100));
      lineIndex++;
      typing = false;
      typeLine();
    }
    typeLine();

    // Filters + render
    const state = { style: "All", level: "All", search: "" };
    const uniqueStyles = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.style)))];
    const uniqueLevels = ["All", "Beginner", "Intermediate", "Advanced"];

    function escapeHtml(s) {
      return String(s)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function renderChips(containerId, options, activeValue, onPick) {
      const root = $(containerId);
      root.innerHTML = "";
      options.forEach((opt) => {
        const b = document.createElement("button");
        b.className = "chip" + (opt === activeValue ? " on" : "");
        b.type = "button";
        b.textContent = opt;
        b.addEventListener("click", () => onPick(opt));
        root.appendChild(b);
      });
    }

    function filteredProducts() {
      const q = state.search.trim().toLowerCase();
      return PRODUCTS.filter((p) => {
        const styleOk = state.style === "All" ? true : p.style === state.style;
        const levelOk = state.level === "All" ? true : p.level === state.level;
        const searchOk = !q
          ? true
          : (p.title + " " + p.tagline + " " + p.style + " " + p.level + " " + p.creator)
              .toLowerCase()
              .includes(q);
        return styleOk && levelOk && searchOk;
      });
    }

    function closeModal() {
      $("#modalRoot").innerHTML = "";
      document.body.style.overflow = "";
    }

    function openBuyModal(product) {
      const buyUrl = product.buyUrl || "";
      const urlLooksSet = buyUrl.startsWith("http");

      const html = `
        <div class="overlay" role="dialog" aria-modal="true" id="overlay">
          <div class="modal" role="document">
            <div class="modalTop">
              <div>
                <div class="modalTitle">${escapeHtml(product.title)}</div>
                <div class="modalSub">${escapeHtml(product.style)} • ${escapeHtml(product.level)} • ${product.durationMin} min</div>
              </div>
              <button class="x" id="closeX" aria-label="Close" type="button">✕</button>
            </div>

            <div class="modalBody">
              <div class="previewArt">
                <div class="previewGlow"></div>
                <div class="previewText">
                  <div class="pt1">TRAILER PREVIEW</div>
                  <div class="pt2">Swap this embed with your real teaser (YouTube/Vimeo). Keep it 10–20 seconds for conversion.</div>
                </div>
              </div>

              <div class="embedWrap">
                <iframe
                  width="100%" height="315"
                  src="${escapeHtml(product.previewEmbed)}"
                  title="Preview"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>

              <div class="embedNote">
                Monetization note: on GitHub Pages, your Buy button should link to Stripe Payment Links (or Gumroad/Payhip).
              </div>
            </div>

            <div class="modalActions">
              <button class="btn" id="buyBtn" type="button">Buy for ${money(product.price)}</button>
              <button class="btn ghost2" id="notNow" type="button">Not now</button>
            </div>

            <div class="modalFine">
              For secure access control later: add login + a backend (Phase 2).
            </div>
          </div>
        </div>
      `;
      $("#modalRoot").innerHTML = html;
      document.body.style.overflow = "hidden";

      $("#overlay").addEventListener("mousedown", (e) => {
        if (e.target.id === "overlay") closeModal();
      });
      $("#closeX").addEventListener("click", closeModal);
      $("#notNow").addEventListener("click", closeModal);

      $("#buyBtn").addEventListener("click", () => {
        if (!urlLooksSet) {
          showToast(
            "Set your checkout link",
            "Replace product.buyUrl with your Stripe Payment Link (https://buy.stripe.com/...) or Gumroad/Payhip product link."
          );
          return;
        }
        window.location.href = buyUrl;
      });
    }

    function openCreatorModal() {
      const html = `
        <div class="overlay" role="dialog" aria-modal="true" id="overlay">
          <div class="modal" role="document">
            <div class="modalTop">
              <div>
                <div class="modalTitle">Creator Application</div>
                <div class="modalSub">Curated marketplace — mastery only.</div>
              </div>
              <button class="x" id="closeX" aria-label="Close" type="button">✕</button>
            </div>

            <div class="modalBody">
              <div class="previewArt" style="height: 160px;">
                <div class="previewGlow"></div>
                <div class="previewText">
                  <div class="pt1">TEACH • SELL • BUILD LEGACY</div>
                  <div class="pt2">MVP uses Formspree to collect applications (static-site friendly).</div>
                </div>
              </div>

              <form class="form" id="creatorForm" method="POST">
                <div class="fRow">
                  <label class="fLabel">Stage name</label>
                  <input class="fInput" name="stage_name" placeholder="e.g., Nova Grooves" required />
                </div>
                <div class="fRow">
                  <label class="fLabel">Primary style</label>
                  <input class="fInput" name="primary_style" placeholder="Hip-Hop, Afro, Contemporary..." required />
                </div>
                <div class="fRow">
                  <label class="fLabel">Portfolio link</label>
                  <input class="fInput" name="portfolio" placeholder="Instagram / YouTube / Website" required />
                </div>
                <div class="fRow">
                  <label class="fLabel">What would you teach?</label>
                  <textarea class="fArea" name="pitch" placeholder="Tell us your specialty and what your drop would cover." required></textarea>
                </div>
              </form>
            </div>

            <div class="modalActions">
              <button class="btn" id="submitCreator" type="button">Submit application</button>
              <button class="btn ghost2" id="cancelCreator" type="button">Cancel</button>
            </div>

            <div class="modalFine">
              Phase 2: approvals, creator dashboards, payouts (Stripe Connect), and content delivery upgrades.
            </div>
          </div>
        </div>
      `;
      $("#modalRoot").innerHTML = html;
      document.body.style.overflow = "hidden";

      $("#overlay").addEventListener("mousedown", (e) => {
        if (e.target.id === "overlay") closeModal();
      });
      $("#closeX").addEventListener("click", closeModal);
      $("#cancelCreator").addEventListener("click", closeModal);

      const form = $("#creatorForm");
      form.action = CREATOR_FORM_ACTION;

      $("#submitCreator").addEventListener("click", async () => {
        if (!CREATOR_FORM_ACTION.startsWith("http")) {
          showToast(
            "Connect your creator form",
            "Set CREATOR_FORM_ACTION to your Formspree endpoint (https://formspree.io/f/xxxxxx)."
          );
          return;
        }
        const fd = new FormData(form);
        try {
          const res = await fetch(form.action, {
            method: "POST",
            body: fd,
            headers: { Accept: "application/json" }
          });
          if (res.ok) {
            closeModal();
            showToast("Application sent", "You’ll review creators manually in MVP. Phase 2 automates onboarding and payouts.");
          } else {
            showToast("Submission failed", "Check your Formspree endpoint or try again.");
          }
        } catch {
          showToast("Submission failed", "Network issue. Try again.");
        }
      });
    }

    function renderProducts() {
      const grid = $("#productGrid");
      const list = filteredProducts();

      if (!list.length) {
        grid.innerHTML = `<div class="card" style="grid-column: 1 / -1;">
          <div class="cardTitle">No drops match your filters.</div>
          <p class="cardTagline">Try a different style/level or clear search.</p>
        </div>`;
        return;
      }

      grid.innerHTML = "";
      list.forEach((p) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="cardTop">
            <div class="kicker">${escapeHtml(p.style)}</div>
            <div class="price">${money(p.price)}</div>
          </div>
          <h3 class="cardTitle">${escapeHtml(p.title)}</h3>
          <p class="cardTagline">${escapeHtml(p.tagline)}</p>
          <div class="meta">
            <div class="pill2">${escapeHtml(p.level)}</div>
            <div class="pill2">${p.durationMin} min</div>
            <div class="pill2">Creator: ${escapeHtml(p.creator)}</div>
          </div>
          <div class="cardActions">
            <button class="btn" data-preview="${p.id}" type="button">Preview + Buy</button>
            <button class="btn ghost2" data-save="${p.id}" type="button">Save</button>
          </div>
          <div class="fine">MVP delivery: checkout redirect. Phase 2: secure library + streaming.</div>
        `;
        grid.appendChild(card);
      });

      $$("[data-preview]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-preview");
          const product = PRODUCTS.find((x) => x.id === id);
          if (product) openBuyModal(product);
        });
      });

      $$("[data-save]").forEach((btn) => {
        btn.addEventListener("click", () => {
          showToast("Saved (Phase 2)", "Next upgrade: create accounts + personal library so users can save drops and access purchased content securely.");
        });
      });
    }

    function setStyle(v) {
      state.style = v;
      renderChips("#styleChips", uniqueStyles, state.style, setStyle);
      renderProducts();
    }
    function setLevel(v) {
      state.level = v;
      renderChips("#levelChips", uniqueLevels, state.level, setLevel);
      renderProducts();
    }

    renderChips("#styleChips", uniqueStyles, state.style, setStyle);
    renderChips("#levelChips", uniqueLevels, state.level, setLevel);
    $("#search").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderProducts();
    });
    renderProducts();

    // Buttons
    $("#applyBtn").addEventListener("click", openCreatorModal);
    $("#applyBtn2").addEventListener("click", openCreatorModal);
    $("#teachBtn").addEventListener("click", openCreatorModal);

    // Time/Vibe/Intensity
    let timeMode = "Night";
    let vibe = "Smooth";
    let intensity = parseFloat($("#intensity").value);

    function setTime(mode) {
      timeMode = mode;
      $("#page").classList.toggle("matinee", timeMode === "Matinée");
      $("#timeMatinee").classList.toggle("on", timeMode === "Matinée");
      $("#timeNight").classList.toggle("on", timeMode === "Night");
    }
    $("#timeMatinee").addEventListener("click", () => setTime("Matinée"));
    $("#timeNight").addEventListener("click", () => setTime("Night"));

    $$(".segBtn[data-vibe]").forEach((b) => {
      b.addEventListener("click", () => {
        vibe = b.getAttribute("data-vibe");
        $$(".segBtn[data-vibe]").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        $("#vibeChip").textContent = vibe + " Mode";
      });
    });

    $("#intensity").addEventListener("input", (e) => {
      intensity = parseFloat(e.target.value);
    });

    // Cursor grid coordinates
    const heroSurface = $("#heroSurface");
    const coordsEl = $("#coords");
    const gridSize = 42;
    const cursor = { x: 0, y: 0, gx: 0, gy: 0 };

    heroSurface.addEventListener(
      "mousemove",
      (e) => {
        const r = heroSurface.getBoundingClientRect();
        cursor.x = clamp(e.clientX - r.left, 0, r.width);
        cursor.y = clamp(e.clientY - r.top, 0, r.height);
        cursor.gx = Math.floor(cursor.x / gridSize);
        cursor.gy = Math.floor(cursor.y / gridSize);
        coordsEl.textContent = `Grid: ${cursor.gx},${cursor.gy}`;
      },
      { passive: true }
    );

    // Canvas theatre
    const canvas = $("#theatre");
    const ctx = canvas.getContext("2d", { alpha: true });
    const particles = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || 580;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function seed() {
      particles.length = 0;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || 580;
      for (let i = 0; i < 140; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: rand(-0.25, 0.25),
          vy: rand(-0.18, 0.18),
          r: rand(1.3, 4.1),
          a: rand(0.28, 0.75),
          hue: rand(42, 68)
        });
      }
    }
    seed();

    function vibeParams() {
      if (vibe === "Smooth") return { sparks: 0.55, drift: 0.35 };
      if (vibe === "Raw") return { sparks: 0.85, drift: 0.55 };
      return { sparks: 1.0, drift: 0.75 };
    }

    let t0 = performance.now();
    function frame(t) {
      const dt = Math.min(0.032, (t - t0) / 1000);
      t0 = t;

      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || 580;
      ctx.clearRect(0, 0, w, h);

      const isNight = timeMode === "Night";
      const baseAlpha = isNight ? 0.85 : 0.55;

      // Aurora (parallax)
      const grd = ctx.createRadialGradient(
        w * 0.2 + cursor.x * 0.06,
        h * 0.2 + cursor.y * 0.06,
        40,
        w * 0.55,
        h * 0.45,
        w * 0.9
      );
      grd.addColorStop(0, `rgba(215,184,90,${0.16 * baseAlpha})`);
      grd.addColorStop(0.45, `rgba(168,85,247,${0.10 * baseAlpha})`);
      grd.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.save();
      ctx.globalAlpha = isNight ? 0.12 : 0.08;
      ctx.strokeStyle = "rgba(215,184,90,0.75)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x + cursor.x * 0.02, 0);
        ctx.lineTo(x + cursor.x * 0.02, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + cursor.y * 0.02);
        ctx.lineTo(w, y + cursor.y * 0.02);
        ctx.stroke();
      }
      ctx.restore();

      // Spotlight sweep
      const sweepX = (t / 1000) % 6;
      const sx = (sweepX / 6) * w;
      const spotlight = ctx.createLinearGradient(sx - 260, 0, sx + 260, 0);
      spotlight.addColorStop(0, "rgba(0,0,0,0)");
      spotlight.addColorStop(0.5, `rgba(245,211,107,${0.12 + intensity * 0.10})`);
      spotlight.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, w, h);

      // Particles
      const vp = vibeParams();
      const drift = (0.25 + vp.drift) * (0.55 + intensity);
      const sparks = (0.65 + vp.sparks) * (0.65 + intensity);

      for (const p of particles) {
        const cx = cursor.x / w - 0.5;
        const cy = cursor.y / h - 0.5;

        p.vx += cx * 0.035 * sparks * dt;
        p.vy += cy * 0.025 * sparks * dt;

        p.x += p.vx * (1 + drift);
        p.y += p.vy * (1 + drift);

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        glow.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.a})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.9 + intensity * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }

      // Vignette
      const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, isNight ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.52)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Success/cancel toast if you use index.html?success=1
    const params = new URLSearchParams(location.search);
    if (params.get("success") === "1") {
      showToast("Payment complete", "If you want fully automated delivery on a static site, use Gumroad/Payhip links for each video, or upgrade to Phase 2 backend.");
    }
    if (params.get("canceled") === "1") {
      showToast("Checkout canceled", "No charge was made. You can purchase anytime.");
    }
  });
})();
