/* ==========================================================================
   Shopfront — vanilla JS only. No third-party libraries. Each init guard-clauses.
   ========================================================================== */
(function () {
  "use strict";

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.8l1.2-6.6L2.5 9l6.6-.9z"/></svg>';

  /* ---- toast helper ---- */
  function toast(msg) {
    var host = document.getElementById("toastWrap");
    if (!host) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<span class="tick" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>' +
      "<span>" + msg + "</span>";
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 2600);
  }

  /* ---- fill every .stars container with 5 star glyphs ---- */
  function initStars() {
    var groups = document.querySelectorAll(".stars");
    if (!groups.length) return;
    groups.forEach(function (g) {
      if (g.dataset.filled) return;
      g.innerHTML = STAR + STAR + STAR + STAR + STAR;
      g.dataset.filled = "1";
    });
  }

  /* ---- dismissable announcement ---- */
  function initAnnounce() {
    var bar = document.getElementById("announce");
    var btn = document.getElementById("announceClose");
    if (!bar || !btn) return;
    btn.addEventListener("click", function () { bar.classList.add("is-hidden"); });
  }

  /* ---- sticky header shadow ---- */
  function initStickyHeader() {
    var header = document.getElementById("header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile drawer ---- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var drawer = document.getElementById("drawer");
    var backdrop = document.getElementById("drawerBackdrop");
    var closeBtn = document.getElementById("drawerClose");
    if (!toggle || !drawer || !backdrop) return;

    function open() {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function close() {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", open);
    backdrop.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) close();
    });
  }

  /* ---- cart count + add to cart ---- */
  function initCart() {
    var badge = document.getElementById("cartCount");
    if (!badge) return;

    function currentCount() {
      var n = parseInt(badge.textContent, 10);
      return isNaN(n) ? 0 : n;
    }
    function setCount(n) {
      badge.textContent = n;
      var cartBtn = document.getElementById("cartBtn");
      if (cartBtn) cartBtn.setAttribute("aria-label", "Shopping cart, " + n + " items");
      badge.classList.remove("bump");
      void badge.offsetWidth; /* restart animation */
      badge.classList.add("bump");
    }
    function add(qty, name) {
      setCount(currentCount() + qty);
      toast("Added " + (qty > 1 ? qty + " × " : "") + (name || "item") + " to cart");
    }

    document.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-add");
        var qty = 1;
        if (btn.id === "pdAdd") {
          var qv = document.getElementById("qtyVal");
          if (qv) qty = parseInt(qv.textContent, 10) || 1;
        }
        add(qty, name);
      });
    });
  }

  /* ---- product filter ---- */
  function initFilter() {
    var bar = document.querySelector(".filter-bar");
    var grid = document.getElementById("productGrid");
    if (!bar || !grid) return;
    var cards = grid.querySelectorAll(".card-p");

    bar.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      bar.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var f = chip.getAttribute("data-filter");
      cards.forEach(function (card) {
        var show = f === "all" || card.getAttribute("data-category") === f;
        card.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ---- wishlist toggles (cards + pd) ---- */
  function initWishlist() {
    document.querySelectorAll(".wishlist, #pdWish").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.classList.toggle("active");
        if (btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", on ? "true" : "false");
        toast(on ? "Saved to wishlist" : "Removed from wishlist");
      });
    });
  }

  /* ---- newsletter validation ---- */
  function initNewsletter() {
    var form = document.getElementById("newsForm");
    if (!form) return;
    var input = document.getElementById("newsEmail");
    var msg = document.getElementById("newsMsg");
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (!re.test(val)) {
        input.classList.add("invalid");
        msg.textContent = "Please enter a valid email address.";
        msg.className = "news-msg err";
        input.focus();
        return;
      }
      input.classList.remove("invalid");
      msg.textContent = "You're in! Check your inbox for a 10% code.";
      msg.className = "news-msg ok";
      form.reset();
    });
    input.addEventListener("input", function () {
      input.classList.remove("invalid");
      if (msg.classList.contains("err")) { msg.textContent = ""; msg.className = "news-msg"; }
    });
  }

  /* ---- copy promo code ---- */
  function initCopyCode() {
    var btn = document.getElementById("copyCode");
    var code = document.getElementById("promoCode");
    if (!btn || !code) return;
    btn.addEventListener("click", function () {
      var text = code.textContent.trim();
      var done = function () { btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    function fallback(text, cb) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      cb();
    }
  }

  /* ---- sale countdown ---- */
  function initCountdown() {
    var box = document.getElementById("countdown");
    if (!box) return;
    var cells = {
      days: box.querySelector('[data-c="days"]'),
      hours: box.querySelector('[data-c="hours"]'),
      mins: box.querySelector('[data-c="mins"]'),
      secs: box.querySelector('[data-c="secs"]')
    };
    var end = Date.now() + ((2 * 24 + 8) * 3600 + 45 * 60 + 30) * 1000;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = Math.max(0, end - Date.now());
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      if (cells.days) cells.days.textContent = pad(d);
      if (cells.hours) cells.hours.textContent = pad(h);
      if (cells.mins) cells.mins.textContent = pad(m);
      if (cells.secs) cells.secs.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---- scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- smooth scroll for same-page anchors ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      a.addEventListener("click", function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.scrollY - 78;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  }

  /* ========================= PRODUCT PAGE ========================= */

  /* ---- gallery thumbnail swap ---- */
  function initThumbSwap() {
    var main = document.getElementById("pdMain");
    var thumbs = document.querySelectorAll(".pd-thumb");
    if (!main || !thumbs.length) return;
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        var full = t.getAttribute("data-full");
        if (!full) return;
        main.style.opacity = "0";
        setTimeout(function () { main.src = full; main.style.opacity = "1"; }, 120);
        thumbs.forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
      });
    });
    main.style.transition = "opacity .18s ease";
  }

  /* ---- colour + size selectors ---- */
  function initVariants() {
    var swatches = document.querySelectorAll(".swatch");
    var picked = document.getElementById("colourPicked");
    swatches.forEach(function (sw) {
      sw.addEventListener("click", function () {
        swatches.forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
        sw.classList.add("active");
        sw.setAttribute("aria-pressed", "true");
        if (picked) picked.textContent = sw.getAttribute("data-color");
      });
    });

    var sizes = document.querySelectorAll(".size-btn");
    sizes.forEach(function (b) {
      if (b.disabled) return;
      b.addEventListener("click", function () {
        sizes.forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("active");
        b.setAttribute("aria-pressed", "true");
      });
    });
  }

  /* ---- quantity stepper ---- */
  function initQtyStepper() {
    var minus = document.getElementById("qtyMinus");
    var plus = document.getElementById("qtyPlus");
    var val = document.getElementById("qtyVal");
    if (!minus || !plus || !val) return;
    var MAX = 6;
    function get() { return parseInt(val.textContent, 10) || 1; }
    function set(n) {
      n = Math.max(1, Math.min(MAX, n));
      val.textContent = n;
      minus.disabled = n <= 1;
      plus.disabled = n >= MAX;
    }
    minus.addEventListener("click", function () { set(get() - 1); });
    plus.addEventListener("click", function () { set(get() + 1); });
    set(1);
  }

  /* ---- product tabs ---- */
  function initTabs() {
    var nav = document.querySelector(".tab-nav");
    if (!nav) return;
    var buttons = nav.querySelectorAll("button");
    var panels = document.querySelectorAll(".tab-panel");
    function activate(name) {
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-tab") === name;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-panel") === name);
      });
    }
    nav.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      activate(btn.getAttribute("data-tab"));
    });
    /* deep link: "Read reviews" jumps to reviews tab */
    document.querySelectorAll('a[href="#reviews-tab-btn"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        activate("reviews");
        var t = document.getElementById("reviews-tab-btn");
        if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* ---- boot ---- */
  function boot() {
    initStars();
    initAnnounce();
    initStickyHeader();
    initMobileNav();
    initCart();
    initFilter();
    initWishlist();
    initNewsletter();
    initCopyCode();
    initCountdown();
    initReveal();
    initSmoothScroll();
    initThumbSwap();
    initVariants();
    initQtyStepper();
    initTabs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
