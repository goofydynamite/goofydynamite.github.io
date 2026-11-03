(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Resume button: if the PDF isn't uploaded yet, fall back to asking by email.
  fetch("assets/Deepti_Singh_Kushwaha_Resume.pdf", { method: "HEAD" })
    .then((r) => { if (!r.ok) throw 0; })
    .catch(() => {
      document.querySelectorAll(".js-resume").forEach((a) => {
        a.removeAttribute("download");
        a.href = "mailto:deepti.sngh.kushwaha@gmail.com?subject=Resume%20request";
      });
    });

  // ---- side rails: fill with doodle tiles (twice, so the loop is seamless) ----
  // Each tile is a link. Left rail: projects and sections. Right rail: ways to reach me.
  const RAILS = [
    [
      ["shield", "Aegis: fraud detection", "https://github.com/goofydynamite/aegis-aml-detection"],
      ["line", "Bitcoin live dashboard", "https://goofydynamite.github.io/btc-market-analysis/"],
      ["mag", "Hippocrates on Tableau", "https://public.tableau.com/app/profile/deepti.singh.kushwaha/viz/HippocratesTrialScout/TrialScout"],
      ["bars", "Zomato BI pipeline", "https://github.com/goofydynamite/Automated-Business-Intelligence-Dashboard-for-Zomato"],
      ["table", "Netflix SQL", "https://github.com/goofydynamite/netflix_sql"],
      ["scatter", "AI job trends", "https://github.com/goofydynamite/ai-job-trends-2025"],
      ["sigma", "A/B testing", "https://github.com/goofydynamite/Digitial-marketing-a-b-testing"],
      ["pie", "all my work", "#work"],
      ["mug", "about me", "#about"],
    ],
    [
      ["linkedin", "LinkedIn", "https://www.linkedin.com/in/deepti-s-27a1b3158"],
      ["github", "GitHub", "https://github.com/goofydynamite"],
      ["mail", "email me", "mailto:deepti.sngh.kushwaha@gmail.com"],
      ["db", "Tableau Public", "https://public.tableau.com/app/profile/deepti.singh.kushwaha"],
      ["doc", "my resume", "assets/Deepti_Singh_Kushwaha_Resume.pdf"],
      ["pencil", "certificates", "#certs"],
      ["laptop", "say hi", "#contact"],
    ],
  ];
  document.querySelectorAll(".rail__track").forEach((track, k) => {
    const html = RAILS[k].map(([icon, label, href]) => {
      const ext = /^https?:/.test(href);
      const cls = icon === "doc" ? " js-resume" : "";
      return `<a class="tile${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""} aria-label="${label}">`
        + `<svg aria-hidden="true"><use href="#i-${icon}"/></svg><span class="tile__tip">${label}</span></a>`;
    }).join("");
    // three copies so the loop never shows a gap; only the first copy is reachable by keyboard
    track.innerHTML = html + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ') + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ');
  });

  // ---- cutting-mat rulers ----
  const top = document.querySelector(".mat__ruler--top"), left = document.querySelector(".mat__ruler--left");
  if (top) top.innerHTML = Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join("");
  if (left) left.innerHTML = Array.from({ length: 8 }, (_, i) => `<span>${i + 1}</span>`).join("");

  if (!window.gsap || reduce) {
    document.querySelectorAll("mark").forEach((m) => m.classList.add("on"));
    return;
  }

  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  // ---- rails drift on their own, and run faster while you scroll ----
  const third = -100 / 3;
  const rails = gsap.utils.toArray(".rail__track").map((t, k) =>
    gsap.fromTo(t, { yPercent: k ? third : 0 }, { yPercent: k ? 0 : third, duration: 40, ease: "none", repeat: -1 }));
  let boost = 1, hovering = false;
  const setSpeed = () => rails.forEach((t) => t.timeScale(hovering ? 0 : boost));
  ScrollTrigger.create({
    onUpdate: (self) => { boost = 1 + Math.min(Math.abs(self.getVelocity()) / 220, 9); setSpeed(); },
  });
  gsap.ticker.add(() => { if (boost > 1) { boost = Math.max(1, boost * 0.93); setSpeed(); } });

  // pause a rail while the pointer is on it, and show a handwritten label next to the hovered tile
  const tip = document.querySelector(".rail-tip");
  document.querySelectorAll(".rail").forEach((rail) => {
    rail.addEventListener("mouseenter", () => { hovering = true; setSpeed(); });
    rail.addEventListener("mouseleave", () => { hovering = false; setSpeed(); gsap.to(tip, { opacity: 0, duration: 0.15 }); });
  });
  const showTip = (tile) => {
    const r = tile.getBoundingClientRect(), right = tile.closest(".rail--r");
    tip.textContent = tile.getAttribute("aria-label");
    tip.classList.toggle("rail-tip--r", !!right);
    const x = right ? r.left - 12 : r.right + 12;
    gsap.set(tip, { left: x, top: r.top + r.height / 2, xPercent: right ? -100 : 0, yPercent: -50 });
    gsap.fromTo(tip, { opacity: 0, x: right ? 8 : -8 }, { opacity: 1, x: 0, duration: 0.2 });
  };
  document.querySelectorAll(".tile").forEach((t) => {
    t.addEventListener("mouseenter", () => showTip(t));
    t.addEventListener("focus", () => { hovering = true; setSpeed(); showTip(t); });
    t.addEventListener("blur", () => { hovering = false; setSpeed(); gsap.to(tip, { opacity: 0, duration: 0.15 }); });
  });

  // ---- hero: page drops in, chart sketches itself ----
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".book", { y: 80, rotate: -5, opacity: 0, duration: 1.1 })
    .from(".dd", { opacity: 0, scale: 0.6, duration: 0.6, stagger: 0.1, ease: "back.out(2)" }, 0.5)
    .from(".hero__text > *", { y: 18, opacity: 0, stagger: 0.08, duration: 0.6 }, "-=0.6")
    .add(() => document.querySelector(".hero__lede mark").classList.add("on"), "-=0.1")
    .from(".ribbon", { scaleY: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.3");

  const strokes = gsap.utils.toArray(".hero__chart .draw");
  strokes.forEach((p) => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
  gsap.set(".hero__chart .pop, .hero__chart .note", { opacity: 0 });
  tl.to(strokes.slice(0, 2), { strokeDashoffset: 0, duration: 0.7, stagger: 0.1, ease: "power1.inOut" }, "-=0.5")
    .to(strokes[2], { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut" })
    .to(".hero__chart .pop", { opacity: 1, scale: 1.6, transformOrigin: "center", duration: 0.25, yoyo: true, repeat: 1 })
    .to(strokes[3], { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" })
    .to(strokes[4], { strokeDashoffset: 0, duration: 0.35 })
    .to(".hero__chart .note", { opacity: 1, duration: 0.4, stagger: 0.2 });

  // rotating handwritten word: obvious → honest → useful
  const words = gsap.utils.toArray(".rotator > span");
  let wi = 0;
  gsap.set(words.slice(1), { opacity: 0, yPercent: 60, rotate: 6 });
  gsap.delayedCall(2.4, function cycle() {
    const out = words[wi]; wi = (wi + 1) % words.length; const inn = words[wi];
    gsap.to(out, { opacity: 0, yPercent: -60, rotate: -6, duration: 0.45, ease: "power2.in" });
    gsap.fromTo(inn, { opacity: 0, yPercent: 60, rotate: 6 }, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.6, ease: "back.out(2)", delay: 0.3 });
    gsap.delayedCall(2.6, cycle);
  });

  // notebook page tilts gently toward the mouse
  const page = document.querySelector(".book");
  gsap.utils.toArray(".dd").forEach((d, i) => {
    gsap.to(d, { y: i % 2 ? 10 : -10, rotation: `+=${i % 2 ? 6 : -6}`, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.5 });
  });
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      gsap.to(page, { rotationY: x * 5, rotationX: -y * 4, rotate: -0.8 + x * 1.2, duration: 0.8, ease: "power2.out", transformPerspective: 1400 });
    });
  }

  // ---- stage: notes stay pinned in the middle while dashboards float past ----
  const notes = gsap.utils.toArray(".note-card");
  gsap.set(notes, { opacity: 0, y: 120, scale: 0.85 });
  gsap.set(notes[0], { opacity: 1, y: 0, scale: 1 });
  const stage = document.querySelector(".stage");
  const floaters = gsap.utils.toArray(".fl");
  floaters.forEach((el) => {
    const x = +el.dataset.x, y = +el.dataset.y, s = +el.dataset.s, r = +el.dataset.r;
    gsap.set(el, { left: x + "%", rotate: r, scale: el.classList.contains("fl--doodle") ? 1 : Math.min(s, 1.15) });
    gsap.fromTo(el, { y: () => (y / 100) * innerHeight }, {
      y: () => (y / 100) * innerHeight - innerHeight * 3.4 * s,
      rotate: r + (s > 1 ? 4 : -4),
      ease: "none",
      scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
    });
  });
  // swap the top note at 1/3 and 2/3 of the way through
  const noteTl = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: 0.5 } });
  noteTl.from(".stage__label", { opacity: 0, y: 20, duration: 0.3 })
    .to({}, { duration: 1 })
    .to(notes[0], { y: -160, rotate: -18, opacity: 0, duration: 0.5, ease: "power2.in" })
    .to(notes[1], { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, "<0.15")
    .to({}, { duration: 1 })
    .to(notes[1], { y: -160, rotate: 18, opacity: 0, duration: 0.5, ease: "power2.in" })
    .to(notes[2], { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, "<0.15")
    .to({}, { duration: 1.2 });

  // ---- scroll reveals ----
  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.fromTo(els, { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: "power3.out",
        onComplete() { els.forEach((el) => el.querySelectorAll("mark").forEach((m) => m.classList.add("on"))); } }),
  });

  document.querySelectorAll(".count").forEach((el) => {
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || "";
    const obj = { v: 0 };
    gsap.to(obj, { v: to, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true },
      onUpdate: () => { el.textContent = obj.v.toFixed(dec) + suf; } });
  });

  gsap.utils.toArray(".case > .snap, .case > .pile").forEach((el) => {
    gsap.fromTo(el, { y: 50 }, { y: -50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
  });

  // cards drop onto the cutting mat
  gsap.from(".chip", {
    y: -120, opacity: 0, rotate: () => gsap.utils.random(-20, 20), duration: 0.9, ease: "bounce.out", stagger: 0.09,
    scrollTrigger: { trigger: ".mat", start: "top 70%", once: true },
    onComplete() { gsap.utils.toArray(".chip").forEach((c) => gsap.to(c, { rotate: gsap.utils.random(-3, 3), duration: 0.4 })); },
  });

  gsap.utils.toArray(".stamp").forEach((s, i) => {
    gsap.from(s, { scale: 2.4, opacity: 0, rotate: -40, duration: 0.45, delay: i * 0.12, ease: "back.out(2.2)",
      scrollTrigger: { trigger: ".certs__row", start: "top 80%", once: true } });
  });

  // polaroid swings on its string, and swings harder when you scroll past
  const hang = document.querySelector(".hang");
  gsap.fromTo(hang, { rotate: -5 }, { rotate: 5, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  ScrollTrigger.create({ trigger: ".about", start: "top bottom", end: "bottom top",
    onUpdate: (self) => gsap.to(".polaroid", { rotate: gsap.utils.clamp(-8, 8, self.getVelocity() / -180), transformOrigin: "50% -60px", duration: 0.6, ease: "elastic.out(1, 0.35)", overwrite: "auto" }) });

  // ticks get drawn into the checklist
  const ticks = gsap.utils.toArray(".checks .tick");
  ticks.forEach((t) => { const l = t.getTotalLength(); gsap.set(t, { strokeDasharray: l, strokeDashoffset: l }); });
  gsap.to(ticks, { strokeDashoffset: 0, duration: 0.45, stagger: 0.35, ease: "power2.out", scrollTrigger: { trigger: ".checks", start: "top 75%", once: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
