
(function () {
  "use strict";
  var CFG = {
    site: "localtools",
    lang: "en",
    workerUrl: "https://sponsor-intake.hanxianqing.workers.dev",
    clientId: "BAAIEzUKc3HZRCPxjSws9J_Nmo4zUo2w1cMMcrQHtuKINI7Rn3H4PVTLi9c1iV0BT1lOak1PaodURJwIYE",
    tiers: {"starter": {"price": 5, "days": 7}, "standard": {"price": 12, "days": 30}, "featured": {"price": 29, "days": 30}},
    shorteners: ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rb.gy", "cutt.ly", "is.gd", "buff.ly", "shorturl.at", "ow.ly", "rebrand.ly", "s.id", "tiny.cc", "shorte.st", "adf.ly", "bit.do", "mcaf.ee", "t2m.io", "bl.ink", "v.gd", "qr.ae", "soo.gd"],
    blocked: ["porn", "xxx", "pornhub", "xvideos", "onlyfans", "escort", "sex cam", "casino", "gambling", "poker", "roulette", "slot machine", "bet365", "crypto giveaway", "double your crypto", "free bitcoin", "free eth", "send 1 get 2", "guaranteed returns", "guaranteed profit", "payday loan", "viagra", "cialis"],
    copy: {"sponsor": "Sponsor", "modal_title": "Sponsor this site", "modal_sub": "Your card appears on this site, clearly labelled Sponsored. Every submission is reviewed by a person before it goes live.", "step_tier": "Tier", "step_details": "Your card", "step_pay": "Payment", "tier_starter": "Starter", "tier_standard": "Standard", "tier_featured": "Featured", "days_7": "7 days", "days_30": "30 days", "starter_desc": "One sponsored card on this site for 7 days.", "standard_desc": "One sponsored card for 30 days. Best for most sponsors.", "featured_desc": "Top placement — your card first — for 30 days.", "most_popular": "Most popular", "continue": "Continue", "back": "Back", "field_brand": "Brand / business name", "field_link": "Link (your website)", "field_title": "Card title", "field_desc": "Card description", "field_logo": "Logo image URL (optional)", "field_email": "Contact email", "chars_left": "characters left", "rules": "No adult, gambling, crypto-giveaway, scam or illegal content. No link shorteners — link to your real site. Every sponsorship is reviewed by a person before it goes live.", "pay_title": "Pay with PayPal", "pay_fixed": "Pay {amount} with PayPal. The amount is fixed and cannot be changed at checkout.", "pay_note": "After payment, your request is submitted automatically. We publish within 24 hours after confirming payment.", "pay_coming_title": "Checkout is not open yet", "pay_coming": "Submit your sponsorship request now and we will email you the PayPal payment link. Your card goes live within 24 hours after payment is confirmed.", "submit_request": "Submit sponsorship request", "submitting": "Submitting…", "success_title": "Request received", "success_paid": "Payment received. Your sponsorship request has been submitted — we publish within 24 hours after confirming payment.", "success_pending": "Thank you! We will email you the PayPal payment link. Your card goes live within 24 hours after payment is confirmed.", "close": "Close", "err_required": "This field is required.", "err_link": "Enter a full website address starting with https:// — no link shorteners.", "err_email": "Enter a valid email address.", "err_title_len": "Keep the title to 60 characters or fewer.", "err_desc_len": "Keep the description to 140 characters or fewer.", "err_logo": "Logo must be an image URL (png, jpg, gif, webp or svg).", "err_blocked": "This content cannot be sponsored here. Please change the title, description or link.", "err_submit": "Something went wrong submitting your request. Please try again.", "err_paypal_load": "PayPal checkout could not be loaded. You can still submit your request and we will email you the payment link.", "err_paypal_cancel": "Payment was cancelled. Your details are still here — you can try again.", "err_rate": "Too many requests — please wait a few minutes and try again.", "err_paypal_error": "PayPal checkout hit an error. Please try again, or submit your request and we will email you the payment link."}
  };
  var T = CFG.copy;
  var PLACEHOLDER = "PAYPAL-CLIENT-ID-NEEDED";
  var hasPaypal = CFG.clientId && CFG.clientId !== PLACEHOLDER;
  var state = { tier: "standard", step: 1, paid: false, submitting: false, paypalReady: false, paypalFailed: false };

  function $(id) { return document.getElementById(id); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var overlay = $("sp-overlay");
  if (!overlay) return;

  var errBox = $("sp-error");

  function showError(msg) {
    errBox.textContent = msg;
    errBox.classList.add("show");
  }
  function clearError() {
    errBox.textContent = "";
    errBox.classList.remove("show");
  }

  function goStep(n) {
    state.step = n;
    qa(".sp-step", overlay).forEach(function (el) {
      el.classList.toggle("on", parseInt(el.getAttribute("data-step"), 10) === n);
    });
    qa(".sp-steps span", overlay).forEach(function (el, i) {
      el.classList.toggle("on", i < n);
    });
    var success = $("sp-success");
    if (success) success.style.display = "none";
    qa(".sp-steps", overlay).forEach(function (el) { el.style.display = ""; });
    clearError();
    if (n === 3) preparePayment();
  }

  function selectTier(id) {
    state.tier = id;
    qa(".sp-tier[data-tier]", overlay).forEach(function (el) {
      el.classList.toggle("sel", el.getAttribute("data-tier") === id);
    });
    updatePayAmount();
    if (state.paypalReady) renderPaypalButtons();
  }

  function updatePayAmount() {
    var tier = CFG.tiers[state.tier];
    var amount = "$" + tier.price;
    qa("[data-pay-amount]", overlay).forEach(function (el) {
      el.textContent = amount;
    });
    var fixed = $("sp-pay-fixed");
    if (fixed) fixed.textContent = T.pay_fixed.replace("{amount}", amount);
  }

  function openModal(tier) {
    if (tier && CFG.tiers[tier]) selectTier(tier);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    goStep(1);
    var title = $("sp-modal-title");
    if (title) title.focus && title.focus();
  }
  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    goStep(1);
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest ? e.target.closest("[data-sponsor-open]") : null;
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-sponsor-tier") || null);
      return;
    }
    var closer = e.target.closest ? e.target.closest("[data-sponsor-close]") : null;
    if (closer) { closeModal(); return; }
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });

  qa("[data-go-step]", overlay).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var n = parseInt(btn.getAttribute("data-go-step"), 10);
      if (n === 3 && !validateForm()) return;
      goStep(n);
    });
  });

  qa(".sp-tier[data-tier]", overlay).forEach(function (el) {
    el.addEventListener("click", function () {
      selectTier(el.getAttribute("data-tier"));
    });
  });

  // ---- character counters ----
  function bindCounter(inputId, countId, max) {
    var input = $(inputId), count = $(countId);
    if (!input || !count) return;
    var update = function () {
      var left = max - input.value.length;
      count.textContent = (left < 0 ? 0 : left) + " " + T.chars_left;
    };
    input.addEventListener("input", update);
    update();
  }
  bindCounter("sp-title", "sp-title-count", 60);
  bindCounter("sp-desc", "sp-desc-count", 140);

  // ---- validation (mirrors the Worker; the Worker re-checks) ----
  function fieldError(input, msg) {
    var wrap = input.closest(".sp-field");
    if (!wrap) return;
    var err = q(".err", wrap);
    if (msg) {
      wrap.classList.add("invalid");
      if (err) err.textContent = msg;
    } else {
      wrap.classList.remove("invalid");
      if (err) err.textContent = "";
    }
  }
  function validUrl(value) {
    try {
      var u = new URL(value);
      if (u.protocol !== "http:" && u.protocol !== "https:") return false;
      var host = u.hostname.toLowerCase();
      if (!host || host === "localhost" || !host.includes(".")) return false;
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
      if (CFG.shorteners.indexOf(host) !== -1) return false;
      return true;
    } catch (e) { return false; }
  }
  function hasBlocked(text) {
    var lower = " " + String(text).toLowerCase() + " ";
    return CFG.blocked.some(function (w) { return lower.indexOf(w) !== -1; });
  }
  function validateForm() {
    var ok = true;
    var brand = $("sp-brand"), link = $("sp-link"), title = $("sp-title"),
        desc = $("sp-desc"), logo = $("sp-logo"), email = $("sp-email");
    var v = function (input) { return input.value.trim(); };
    if (!v(brand)) { fieldError(brand, T.err_required); ok = false; } else fieldError(brand, "");
    if (!v(link) || !validUrl(v(link))) { fieldError(link, T.err_link); ok = false; } else fieldError(link, "");
    if (!v(title)) { fieldError(title, T.err_required); ok = false; }
    else if (v(title).length > 60) { fieldError(title, T.err_title_len); ok = false; }
    else fieldError(title, "");
    if (!v(desc)) { fieldError(desc, T.err_required); ok = false; }
    else if (v(desc).length > 140) { fieldError(desc, T.err_desc_len); ok = false; }
    else fieldError(desc, "");
    if (v(logo)) {
      var okLogo = false;
      try {
        var u = new URL(v(logo));
        okLogo = (u.protocol === "http:" || u.protocol === "https:") &&
          /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(u.pathname);
      } catch (e) { okLogo = false; }
      if (!okLogo) { fieldError(logo, T.err_logo); ok = false; } else fieldError(logo, "");
    } else fieldError(logo, "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v(email))) { fieldError(email, T.err_email); ok = false; } else fieldError(email, "");
    if (ok && hasBlocked(v(brand) + " " + v(title) + " " + v(desc) + " " + v(link))) {
      showError(T.err_blocked);
      return false;
    }
    return ok;
  }
  qa("input, textarea", overlay).forEach(function (input) {
    input.addEventListener("input", function () { fieldError(input, ""); clearError(); });
  });

  // ---- payment step ----
  function preparePayment() {
    updatePayAmount();
    var sdkPanel = $("sp-pay-sdk");
    var soonPanel = $("sp-pay-soon");
    if (hasPaypal) {
      if (sdkPanel) sdkPanel.style.display = "";
      if (soonPanel) soonPanel.style.display = "none";
      loadPaypal();
    } else {
      if (sdkPanel) sdkPanel.style.display = "none";
      if (soonPanel) soonPanel.style.display = "";
    }
  }

  var paypalLoading = false;
  function loadPaypal() {
    if (state.paypalReady || state.paypalFailed || paypalLoading) {
      if (state.paypalReady) renderPaypalButtons();
      return;
    }
    paypalLoading = true;
    var s = document.createElement("script");
    s.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(CFG.clientId) +
      "&currency=USD&intent=capture&components=buttons";
    s.async = true;
    s.onload = function () {
      paypalLoading = false;
      if (window.paypal && window.paypal.Buttons) {
        state.paypalReady = true;
        renderPaypalButtons();
      } else {
        paypalFailed();
      }
    };
    s.onerror = function () { paypalLoading = false; paypalFailed(); };
    document.head.appendChild(s);
  }
  function paypalFailed() {
    state.paypalFailed = true;
    showError(T.err_paypal_load);
    var fb = $("sp-submit-fallback");
    if (fb) fb.style.display = "";
  }
  function renderPaypalButtons() {
    var container = $("sp-paypal-buttons");
    if (!container || !window.paypal) return;
    container.innerHTML = "";
    try {
      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 },
        onClick: function (data, actions) {
          if (!validateForm()) {
            goStep(2);
            return actions.reject();
          }
          return actions.resolve();
        },
        createOrder: function (data, actions) {
          var tier = CFG.tiers[state.tier];
          return actions.order.create({
            purchase_units: [{
              amount: { currency_code: "USD", value: tier.price.toFixed(2) },
              description: "Sponsorship — " + tierName(state.tier) + " (" + tier.days + " days)"
            }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            var txid = data.orderID;
            try {
              var cap = details.purchase_units[0].payments.captures[0];
              if (cap && cap.id) txid = cap.id;
            } catch (e) { /* fall back to the order id */ }
            submitRequest(txid, true);
          });
        },
        onCancel: function () { showError(T.err_paypal_cancel); },
        onError: function () {
          showError(T.err_paypal_error);
          var fb = $("sp-submit-fallback");
          if (fb) fb.style.display = "";
        }
      }).render("#sp-paypal-buttons");
    } catch (e) {
      paypalFailed();
    }
  }
  function tierName(id) {
    return { starter: T.tier_starter, standard: T.tier_standard, featured: T.tier_featured }[id] || id;
  }

  // ---- submit to the Worker ----
  function submitRequest(txid, paid) {
    if (state.submitting) return;
    if (!validateForm()) { goStep(2); return; }
    state.submitting = true;
    clearError();
    var btns = qa("[data-sp-submit]", overlay);
    btns.forEach(function (b) { b.disabled = true; b.textContent = T.submitting; });
    var payload = {
      site: CFG.site,
      tier: state.tier,
      name: $("sp-brand").value.trim(),
      link: $("sp-link").value.trim(),
      title: $("sp-title").value.trim(),
      description: $("sp-desc").value.trim(),
      logo: $("sp-logo").value.trim(),
      email: $("sp-email").value.trim(),
      txid: txid || ""
    };
    fetch(CFG.workerUrl + "/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (resp) { return resp.json(); }).then(function (data) {
      state.submitting = false;
      btns.forEach(function (b) { b.disabled = false; b.textContent = T.submit_request; });
      if (data && data.ok) {
        state.paid = !!paid;
        showSuccess();
      } else {
        var code = data && data.error ? data.error : "submit_failed";
        if (code === "content_not_allowed") showError(T.err_blocked);
        else if (code === "too_many_requests_try_again_in_a_few_minutes") showError(T.err_rate);
        else showError(T.err_submit);
      }
    }).catch(function () {
      state.submitting = false;
      btns.forEach(function (b) { b.disabled = false; b.textContent = T.submit_request; });
      showError(T.err_submit);
    });
  }
  function showSuccess() {
    qa(".sp-step", overlay).forEach(function (el) { el.classList.remove("on"); });
    qa(".sp-steps", overlay).forEach(function (el) { el.style.display = "none"; });
    var msg = $("sp-success-msg");
    if (msg) msg.textContent = state.paid ? T.success_paid : T.success_pending;
    var success = $("sp-success");
    if (success) success.style.display = "";
  }

  var submitSoon = $("sp-submit-soon");
  if (submitSoon) submitSoon.addEventListener("click", function () { submitRequest("", false); });
  var submitFallback = $("sp-submit-fallback");
  if (submitFallback) submitFallback.addEventListener("click", function () { submitRequest("", false); });

  // default tier
  selectTier("standard");
})();
