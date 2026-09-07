(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.getElementById("siteHeader");
  var hamburger = document.getElementById("hamburger");
  var mainNav = document.getElementById("mainNav");
  var themeToggle = document.getElementById("themeToggle");
  var langToggle = document.getElementById("langToggle");
  var langToggleLabel = document.getElementById("langToggleLabel");
  var langMenu = document.getElementById("langMenu");

  /* ---------- Theme (light/dark) ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("aurelia-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "dark");
  }

  var savedTheme = localStorage.getItem("aurelia-theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Sticky header shrink-on-scroll ---------- */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile hamburger menu ---------- */
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Language switcher ---------- */
  function applyLanguage(lang) {
    if (typeof TRANSLATIONS === "undefined" || !TRANSLATIONS[lang]) return;
    var dict = TRANSLATIONS[lang];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    localStorage.setItem("aurelia-lang", lang);
    root.setAttribute("lang", lang);
    if (langToggleLabel) langToggleLabel.textContent = lang.toUpperCase();
    if (langMenu) {
      langMenu.querySelectorAll("li").forEach(function (li) {
        li.setAttribute("aria-selected", String(li.getAttribute("data-lang") === lang));
      });
    }
  }

  function closeLangMenu() {
    if (!langMenu || !langToggle) return;
    langMenu.classList.remove("is-open");
    langToggle.setAttribute("aria-expanded", "false");
  }

  var savedLang = localStorage.getItem("aurelia-lang") || "en";
  if (langToggle && langMenu) {
    applyLanguage(savedLang);

    langToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = langMenu.classList.toggle("is-open");
      langToggle.setAttribute("aria-expanded", String(isOpen));
    });

    langMenu.querySelectorAll("li").forEach(function (li) {
      li.setAttribute("tabindex", "0");
      li.addEventListener("click", function () {
        applyLanguage(li.getAttribute("data-lang"));
        closeLangMenu();
      });
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          applyLanguage(li.getAttribute("data-lang"));
          closeLangMenu();
          langToggle.focus();
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!langMenu.contains(e.target) && e.target !== langToggle) closeLangMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeLangMenu(); }
    });
  }
})();
