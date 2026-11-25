(() => {
  "use strict";

  // 1. Initialize bilingual i18n
  if (window.I18N) {
    window.I18N.init();
  }

  // 2. Dynamic copyright year & WhatsApp links from SITE_CONFIG
  const yearEl = document.getElementById("copyright-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const whatsappUrl = window.SITE_CONFIG?.whatsappUrl;
  if (whatsappUrl) {
    document.querySelectorAll("[data-whatsapp-link]").forEach((a) => {
      a.setAttribute("href", whatsappUrl);
    });
  }

  const instagramUrl = window.SITE_CONFIG?.instagramUrl;
  if (instagramUrl) {
    document.querySelectorAll("[data-instagram-link]").forEach((a) => {
      a.setAttribute("href", instagramUrl);
    });
  }

  // 3. Mobile navigation menu
  const menuBtn = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");

  function setMenuOpen(open) {
    if (!menuBtn || !nav) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    const labelKey = open ? "nav.menuClose" : "nav.menuOpen";
    if (window.I18N) {
      menuBtn.setAttribute("aria-label", window.I18N.t(labelKey));
    }
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      setMenuOpen(!isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });
  }

  // 4. Accessible form validation (:user-invalid + ARIA sync + fallback) & Google Apps Script submit
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusBox = document.getElementById("form-status");
  const submitBtn = document.getElementById("form-submit");

  // Single polite live region for deferred field validation errors
  const announcer = document.createElement("div");
  announcer.setAttribute("aria-live", "polite");
  announcer.className = "visually-hidden";
  document.body.append(announcer);
  let announceTimer;
  let announcedField;

  const linkError = (el, shown) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute("aria-describedby") || "")
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
    else el.removeAttribute("aria-describedby");
  };

  const spokenText = (node) => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    copy.querySelectorAll('[role="img"][aria-label]').forEach((n) => {
      n.replaceWith(`${n.getAttribute("aria-label")}: `);
    });
    return copy.textContent.replace(/\s+/g, " ").trim();
  };

  const announceError = (el) => {
    const error = document.getElementById(el.dataset.error);
    if (!error) return;
    const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : "";
    clearTimeout(announceTimer);
    announcer.textContent = "";
    announcedField = el;
    announceTimer = setTimeout(() => {
      announcer.textContent = label + spokenText(error);
    }, 500);
  };

  const supportsUserInvalid = CSS.supports("selector(:user-invalid)");
  const dirtyState = new WeakMap();
  const flagged = new WeakSet();
  const announced = new WeakSet();

  const isFieldUserInvalid = (el) => {
    if (el.classList.contains("user-invalid-fallback")) return !el.validity.valid;
    if (supportsUserInvalid) return el.matches(":user-invalid");
    return false;
  };

  const syncAria = (el, shouldAnnounce = false) => {
    if (!el.matches?.("input, select, textarea")) return;
    const invalid = isFieldUserInvalid(el);
    if (invalid) {
      if (shouldAnnounce && !announced.has(el)) {
        announceError(el);
        announced.add(el);
      }
      el.setAttribute("aria-invalid", "true");
      linkError(el, true);
      flagged.add(el);
    } else if (flagged.has(el) || el.getAttribute("aria-invalid") !== "true") {
      el.setAttribute("aria-invalid", "false");
      linkError(el, false);
      flagged.delete(el);
      announced.delete(el);
      if (announcedField === el) {
        clearTimeout(announceTimer);
        announcer.textContent = "";
      }
    }
  };

  const updateFallbackClass = (el) => {
    if (supportsUserInvalid || !el.validity) return;
    el.classList.toggle("user-invalid-fallback", !el.validity.valid);
  };

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.type === "hidden" || el.closest(".hp-field")) return;
    el.setAttribute("aria-invalid", "false");
  });

  form.addEventListener(
    "blur",
    (e) => {
      const el = e.target;
      if (!el.matches?.("input, select, textarea")) return;
      if (!supportsUserInvalid) {
        const st = dirtyState.get(el) || { interacted: false, blurred: false };
        st.blurred = true;
        dirtyState.set(el, st);
        if (st.interacted) updateFallbackClass(el);
      }
      if (el.classList.contains("user-invalid-fallback") && el.validity.valid) {
        el.classList.remove("user-invalid-fallback");
      }
      syncAria(el, true);
    },
    true
  );

  form.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.matches?.("input, select, textarea")) return;
    if (!supportsUserInvalid) {
      const st = dirtyState.get(el) || { interacted: false, blurred: false };
      st.interacted = true;
      dirtyState.set(el, st);
      if (st.blurred) updateFallbackClass(el);
    }
    if (el.classList.contains("user-invalid-fallback") && el.validity.valid) {
      el.classList.remove("user-invalid-fallback");
    }
    if (el.hasAttribute("aria-invalid")) syncAria(el, false);
  });

  form.addEventListener(
    "change",
    (e) => {
      const el = e.target;
      if (!el.matches?.("input, select, textarea")) return;
      if (!supportsUserInvalid) {
        dirtyState.set(el, { interacted: true, blurred: true });
        updateFallbackClass(el);
      }
      if (el.classList.contains("user-invalid-fallback") && el.validity.valid) {
        el.classList.remove("user-invalid-fallback");
      }
      syncAria(el, true);
    },
    true
  );

  form.addEventListener(
    "invalid",
    (e) => {
      const el = e.target;
      if (!supportsUserInvalid) {
        dirtyState.set(el, { interacted: true, blurred: true });
        updateFallbackClass(el);
      }
      announced.add(el);
      syncAria(el, false);
    },
    true
  );

  form.addEventListener("reset", () => {
    setTimeout(() => {
      form.querySelectorAll("input, select, textarea").forEach((el) => {
        dirtyState.delete(el);
        el.classList.remove("user-invalid-fallback");
        syncAria(el, false);
      });
    });
  });

  function showStatus(type, message) {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.className = `form-status form-status--${type}`;
    statusBox.textContent = message;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      form.querySelectorAll(":invalid").forEach((el) => {
        el.classList.add("user-invalid-fallback");
        syncAria(el, false);
      });
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const endpoint = (window.SITE_CONFIG?.contactFormEndpoint || "").trim();
    const t = window.I18N ? window.I18N.t : (k) => k;

    if (!endpoint) {
      showStatus("error", t("form.notConfigured"));
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || "").trim(), // honeypot
      lang: window.I18N ? window.I18N.getLang() : "es"
    };

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = t("form.sending");
    if (statusBox) statusBox.hidden = true;

    try {
      // Sending text/plain avoids CORS preflight OPTIONS with Google Apps Script Web Apps
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json().catch(() => ({ ok: true }));
      if (result && result.ok === false) {
        throw new Error(result.error || "Submission rejected");
      }

      form.reset();
      showStatus("success", t("form.success"));
    } catch (_) {
      showStatus("error", t("form.error"));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
