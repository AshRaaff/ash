(() => {
  const C = window.CONFIG;
  let P = window.PRODUCTS || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => n.toFixed(2) + " " + C.currency;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- i18n ----------
  const UK = window.PRODUCTS_UK || {};
  const STR = {
    en: { search:"SEARCH", login:"LOG IN", bag:"BAG", help:"HELP", shipRet:"SHIPPING & RETURNS", contact:"CONTACT",
      faq:"FAQ", shipping:"Shipping", returns:"Returns", contactL:"Contact", follow:"FOLLOW US", company:"COMPANY", about:"About us",
      stores:"Stores", careers:"Careers", newsletter:"NEWSLETTER", email:"E-mail", rights:"ALL RIGHTS RESERVED", thanks:"Thank you for subscribing.",
      view:"VIEW", viewAll:"VIEW ALL", newIn:"NEW IN", sort:"SORT", featured:"FEATURED", priceUp:"PRICE ↑", priceDown:"PRICE ↓", nothing:"Nothing here yet.",
      home:"HOME", selectSize:"SELECT YOUR SIZE", add:"ADD", pickSize:"PLEASE SELECT A SIZE",
      shipNote:"Free shipping on orders over {free}. Free returns within 30 days.",
      empty:"YOUR BAG IS EMPTY", total:"TOTAL", freeIncl:"Free shipping included.", addMore:"Add {n} more for free shipping.", cont:"CONTINUE", remove:"Remove",
      noResults:"No results.", loginToast:"LOGIN IS NOT CONNECTED YET", checkoutToast:"CHECKOUT & PAYMENT: TO BE CONNECTED", titleSuffix:"Fashion Store",
      info:{ help:["HELP","Questions about orders, sizes or payment? Write to us and we will reply within one business day."],
        shipping:["SHIPPING & RETURNS","Standard delivery takes 2–4 business days. Free shipping over {free}. You can return any item within 30 days in its original condition."],
        contact:["CONTACT","E-mail: {mail}. Replace this text with your address, phone and opening hours."],
        about:["ABOUT US","Write a few lines about your store, your story and your values here."] } },
    uk: { search:"ПОШУК", login:"УВІЙТИ", bag:"КОШИК", help:"ДОПОМОГА", shipRet:"ДОСТАВКА ТА ПОВЕРНЕННЯ", contact:"КОНТАКТИ",
      faq:"Часті питання", shipping:"Доставка", returns:"Повернення", contactL:"Контакти", follow:"МИ В СОЦМЕРЕЖАХ", company:"КОМПАНІЯ", about:"Про нас",
      stores:"Магазини", careers:"Вакансії", newsletter:"РОЗСИЛКА", email:"Електронна пошта", rights:"УСІ ПРАВА ЗАХИЩЕНО", thanks:"Дякуємо за підписку.",
      view:"ДИВИТИСЬ", viewAll:"УСІ ТОВАРИ", newIn:"НОВИНКИ", sort:"СОРТУВАННЯ", featured:"ЗА ЗАМОВЧУВАННЯМ", priceUp:"ЦІНА ↑", priceDown:"ЦІНА ↓", nothing:"Тут поки нічого немає.",
      home:"ГОЛОВНА", selectSize:"ОБЕРІТЬ РОЗМІР", add:"ДОДАТИ", pickSize:"БУДЬ ЛАСКА, ОБЕРІТЬ РОЗМІР",
      shipNote:"Безкоштовна доставка від {free}. Безкоштовне повернення протягом 30 днів.",
      empty:"ВАШ КОШИК ПОРОЖНІЙ", total:"РАЗОМ", freeIncl:"Доставка безкоштовна.", addMore:"Додайте ще {n} для безкоштовної доставки.", cont:"ПРОДОВЖИТИ", remove:"Видалити",
      noResults:"Нічого не знайдено.", loginToast:"ВХІД ЩЕ НЕ ПІДКЛЮЧЕНО", checkoutToast:"ОФОРМЛЕННЯ ТА ОПЛАТА: БУДЕ ПІДКЛЮЧЕНО", titleSuffix:"Магазин одягу",
      info:{ help:["ДОПОМОГА","Питання щодо замовлень, розмірів чи оплати? Напишіть нам, і ми відповімо протягом одного робочого дня."],
        shipping:["ДОСТАВКА ТА ПОВЕРНЕННЯ","Стандартна доставка триває 2–4 робочі дні. Безкоштовна доставка від {free}. Будь-який товар можна повернути протягом 30 днів в оригінальному стані."],
        contact:["КОНТАКТИ","Електронна пошта: {mail}. Замініть цей текст на вашу адресу, телефон і години роботи."],
        about:["ПРО НАС","Напишіть кілька рядків про ваш магазин, історію та цінності."] } }
  };
  const AUTH_STR = {
    en: { account:"ACCOUNT", register:"REGISTER", resetTitle:"RESET PASSWORD", name:"Name", password:"Password", forgot:"Forgot password?", submitLogin:"LOG IN", submitReg:"CREATE ACCOUNT",
      submitReset:"SEND LINK", noAcc:"Don't have an account?", haveAcc:"Already have an account?", back:"Back to log in", logout:"LOG OUT", hello:"Hello, {n}",
      myOrders:"MY ORDERS", noOrders:"You have no orders yet.", demoNote:"Demo mode: accounts are stored only in this browser and are not protected. Connect a server before real customers sign up.",
      loggedIn:"WELCOME", loggedOut:"YOU HAVE LOGGED OUT", created:"ACCOUNT CREATED", resetSent:"If this e-mail exists, we sent a reset link.",
      e_badEmail:"Enter a valid e-mail.", e_shortPass:"Password must be at least 8 characters.", e_exists:"An account with this e-mail already exists.",
      e_wrong:"Wrong e-mail or password.", e_net:"Connection error. Please try again.", e_resetDemo:"Password reset is not available in demo mode.",
      e_confirmEmail:"Check your e-mail and confirm your account, then log in." },
    uk: { account:"АКАУНТ", register:"РЕЄСТРАЦІЯ", resetTitle:"СКИДАННЯ ПАРОЛЯ", name:"Ім'я", password:"Пароль", forgot:"Забули пароль?", submitLogin:"УВІЙТИ", submitReg:"СТВОРИТИ АКАУНТ",
      submitReset:"НАДІСЛАТИ ПОСИЛАННЯ", noAcc:"Ще немає акаунта?", haveAcc:"Вже є акаунт?", back:"Назад до входу", logout:"ВИЙТИ", hello:"Вітаємо, {n}",
      myOrders:"МОЇ ЗАМОВЛЕННЯ", noOrders:"У вас ще немає замовлень.", demoNote:"Демо-режим: акаунти зберігаються лише в цьому браузері й не захищені. Підключіть сервер до того, як реєструватимуться справжні клієнти.",
      loggedIn:"ЛАСКАВО ПРОСИМО", loggedOut:"ВИ ВИЙШЛИ З АКАУНТА", created:"АКАУНТ СТВОРЕНО", resetSent:"Якщо така пошта існує, ми надіслали посилання для скидання.",
      e_badEmail:"Введіть коректну електронну адресу.", e_shortPass:"Пароль має містити щонайменше 8 символів.", e_exists:"Акаунт з такою поштою вже існує.",
      e_wrong:"Невірна пошта або пароль.", e_net:"Помилка з'єднання. Спробуйте ще раз.", e_resetDemo:"У демо-режимі скидання пароля недоступне.",
      e_confirmEmail:"Перевірте пошту й підтвердьте акаунт, потім увійдіть." }
  };
  Object.assign(STR.en, AUTH_STR.en); Object.assign(STR.uk, AUTH_STR.uk);
  const LANGS = C.languages || ["en", "uk"];
  let lang = "en";
  try { const s = localStorage.getItem("lang"); lang = LANGS.includes(s) ? s : (navigator.language || "").toLowerCase().startsWith("uk") ? "uk" : "en"; } catch {}
  const T = k => (STR[lang] && STR[lang][k]) ?? STR.en[k] ?? k;
  const L = x => (x && typeof x === "object") ? (x[lang] ?? x.en) : x;
  const uk = p => (p.uk && Object.keys(p.uk).length ? p.uk : UK[p.id]) || {};
  const pn = p => (lang === "uk" && uk(p).name) || p.name;
  const pd = p => (lang === "uk" && uk(p).desc) || p.desc;
  const pc = p => (lang === "uk" && uk(p).colors && uk(p).colors.length ? uk(p).colors : p.colors) || [];

  // ---------- storage ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  let cart = store.get("cart", []); // [{id,size,qty}]
  const saveCart = () => { store.set("cart", cart); renderCart(); };

  // ---------- placeholders ----------
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, v + amt));
    return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, "0")).join("");
  }
  function placeholder(tone, variant = 0) {
    const a = shade(tone, variant ? -14 : 10), b = shade(tone, variant ? 6 : -12);
    // simple garment silhouette so the grid looks like a catalog until real photos are added
    const body = "M50 14 L35 20 L18 32 L26 46 L34 41 L34 94 L66 94 L66 41 L74 46 L82 32 L65 20 Q50 30 35 20";
    return `<svg viewBox="0 0 100 133" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="g${variant}${tone.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="100" height="133" fill="url(#g${variant}${tone.slice(1)})"/>
      <g transform="translate(0 ${variant ? 8 : 12}) scale(1)" fill="${shade(tone, -34)}" opacity=".35"><path d="${body}"/></g></svg>`;
  }
  function media(p, i = 0, cls = "") {
    const src = p.images && p.images[i];
    return src ? `<div class="ph ${cls}" style="background-image:url('${esc(src)}')"></div>`
               : `<div class="ph ${cls}">${placeholder(p.tone, i % 2)}</div>`;
  }

  // ---------- cards ----------
  function card(p) {
    const second = (p.images && p.images[1]) || !p.images || !p.images.length;
    return `<a class="card" href="#p-${p.id}">
      ${p.isNew ? '<span class="badge">NEW</span>' : p.oldPrice ? '<span class="badge">SALE</span>' : ""}
      <div class="ph"><div class="layer a">${innerMedia(p, 0)}</div>${second ? `<div class="layer b">${innerMedia(p, 1)}</div>` : ""}</div>
      <div class="info"><span>${esc(pn(p))}</span><span class="p">${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="sale">${money(p.price)}</span>` : money(p.price)}</span></div>
    </a>`;
  }
  function innerMedia(p, i) {
    const src = p.images && p.images[i];
    return src ? `<div style="position:absolute;inset:0;background:url('${esc(src)}') center/cover"></div>` : placeholder(p.tone, i % 2);
  }
  const tile = (t, cls = "") => `<a class="tile ${cls}" href="${t.link}">
    <div class="bg" style="background-color:${t.tone};${t.img ? `background-image:url('${esc(t.img)}')` : `background-image:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.28))`}"></div>
    <div class="cap"><small>${esc(L(t.sub))}</small><b>${esc(L(t.title))}</b><u>${T("view")}</u></div></a>`;

  // ---------- views ----------
  const app = $("#app"), header = $("#header");

  function home() {
    setHeader(true);
    const featured = P.filter(p => p.isNew).slice(0, 8);
    app.innerHTML = `
      <section class="hero">${C.hero.map(t => tile(t)).join("")}</section>
      <div class="section-title"><span>${T("newIn")}</span><a href="#c-new">${T("viewAll")}</a></div>
      <section class="grid">${featured.map(card).join("")}</section>
      <section class="banners" style="margin-top:56px">${C.banners.map(t => tile(t)).join("")}</section>`;
  }

  function catalog(id = "new") {
    setHeader(false);
    const cat = C.categories.find(c => c.id === id) || { id, label: id.toUpperCase() };
    const label = L(cat.label);
    let list = P.filter(p => id === "new" ? p.isNew : id === "sale" ? p.oldPrice : p.cat === id);
    app.innerHTML = `<div class="page">
      <div class="catalog-head"><h1>${esc(label)} <span class="muted">· <span id="cnt">${list.length}</span></span></h1>
      <div class="filters"><label>${T("sort")} <select id="sort"><option value="">${T("featured")}</option><option value="asc">${T("priceUp")}</option><option value="desc">${T("priceDown")}</option></select></label></div></div>
      <div class="grid" id="list"></div></div>`;
    const draw = () => {
      const v = $("#sort").value;
      const l = [...list].sort((a, b) => v === "asc" ? a.price - b.price : v === "desc" ? b.price - a.price : 0);
      $("#list").innerHTML = l.length ? l.map(card).join("") : `<div class="empty" style="grid-column:1/-1">${T("nothing")}</div>`;
    };
    $("#sort").onchange = draw; draw();
  }

  function product(id) {
    setHeader(false);
    const p = P.find(x => x.id == id);
    if (!p) return catalog("new");
    const cat = C.categories.find(c => c.id === p.cat);
    let size = null;
    app.innerHTML = `<div class="product">
      <div class="gallery">${Array.from({ length: p.images && p.images.length ? p.images.length : 4 }, (_, i) => media(p, i)).join("")}</div>
      <div class="pinfo">
        <div class="crumbs"><a href="#home">${T("home")}</a> / <a href="#c-${p.cat}">${esc(cat ? L(cat.label) : p.cat)}</a></div>
        <h1>${esc(pn(p))}</h1>
        <div class="price">${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="sale">${money(p.price)}</span>` : money(p.price)}</div>
        <p class="desc">${esc(pd(p))}</p>
        <div class="color">${esc(pc(p).join(" | "))}</div>
        <div><div class="muted" style="margin-bottom:8px">${T("selectSize")}</div>
        <div class="sizes">${p.sizes.map(s => `<button data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>
        <button class="btn" id="add">${T("add")}</button>
        <div class="shipinfo">${T("shipNote").replace("{free}", money(C.freeShippingFrom))}</div>
      </div></div>`;
    $$(".sizes button").forEach(b => b.onclick = () => {
      $$(".sizes button").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); size = b.dataset.s;
    });
    $("#add").onclick = () => {
      if (!size) { toast(T("pickSize")); return; }
      const it = cart.find(c => c.id === p.id && c.size === size);
      it ? it.qty++ : cart.push({ id: p.id, size, qty: 1 });
      saveCart(); openDrawer("cart");
    };
  }

  function info(k) {
    setHeader(false);
    const [t, txt] = STR[lang].info[k] || STR[lang].info.about;
    app.innerHTML = `<div class="info-page"><h1>${t}</h1><p>${esc(txt.replace("{free}", money(C.freeShippingFrom)).replace("{mail}", C.email))}</p></div>`;
  }

  // ---------- router ----------
  function route(keepScroll) {
    const h = location.hash.replace(/^#/, ""), i = h.indexOf("-"), a = i < 0 ? h : h.slice(0, i), b = i < 0 ? "" : h.slice(i + 1);
    closeAll();
    ({ p: () => product(b), c: () => catalog(b), info: () => info(b) }[a] || home)();
    if (keepScroll !== true) window.scrollTo(0, 0);
    onScroll();
  }
  function setHeader(over) { header.classList.toggle("over", over); }
  function onScroll() { header.classList.toggle("scrolled", scrollY > window.innerHeight * .6 - 56 || !header.classList.contains("over")); }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("hashchange", () => route());

  // ---------- drawers ----------
  const overlay = $("#overlay");
  function openDrawer(id) {
    closeAll();
    const el = $("#" + id); el.classList.add("on"); el.setAttribute("aria-hidden", "false");
    if (id !== "search") overlay.classList.add("on");
    else setTimeout(() => $("#searchInput").focus(), 300);
  }
  function closeAll() {
    $$(".drawer,.search").forEach(e => { e.classList.remove("on"); e.setAttribute("aria-hidden", "true"); });
    overlay.classList.remove("on");
  }
  $("#menuBtn").onclick = () => openDrawer("menu");
  $("#cartBtn").onclick = () => openDrawer("cart");
  $("#searchBtn").onclick = () => openDrawer("search");
  $("#loginBtn").onclick = () => openAuth("login");
  $("#menuLogin").onclick = () => openAuth("login");
  overlay.onclick = closeAll;
  $$("[data-close]").forEach(b => b.onclick = closeAll);
  addEventListener("keydown", e => e.key === "Escape" && closeAll());

  // ---------- cart ----------
  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = count;
    const rows = cart.map((it, idx) => ({ ...it, idx, p: P.find(p => p.id === it.id) })).filter(r => r.p);
    $("#cartBody").innerHTML = rows.length ? rows.map(r => `<div class="cart-item">
      <a href="#p-${r.p.id}">${media(r.p, 0).replace('class="ph "', 'class="ph"')}</a>
      <div><h5>${esc(pn(r.p))} <span class="pr">${money(r.p.price * r.qty)}</span></h5>
      <div class="meta">${esc([pc(r.p)[0], r.size].filter(Boolean).join(" · "))}</div>
      <div class="qty"><button data-d="-1" data-i="${r.idx}" aria-label="Less">−</button><span>${r.qty}</span><button data-d="1" data-i="${r.idx}" aria-label="More">+</button></div>
      <button class="rm" data-rm="${r.idx}">${T("remove")}</button></div></div>`).join("")
      : `<div class="cart-empty">${T("empty")}</div>`;
    const total = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
    $("#cartFoot").innerHTML = rows.length ? `
      <div class="row"><span>${T("total")}</span><b>${money(total)}</b></div>
      <div class="note">${total >= C.freeShippingFrom ? T("freeIncl") : T("addMore").replace("{n}", money(C.freeShippingFrom - total))}</div>
      <button class="btn" id="checkout">${T("cont")}</button>` : "";
    const co = $("#checkout"); if (co) co.onclick = () => toast(T("checkoutToast"));
  }
  $("#cartBody").addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.d) { const it = cart[+t.dataset.i]; it.qty += +t.dataset.d; if (it.qty < 1) cart.splice(+t.dataset.i, 1); saveCart(); }
    if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); saveCart(); }
  });
  $("#cartBody").addEventListener("click", e => { if (e.target.closest("a")) closeAll(); });

  // ---------- search ----------
  $("#searchInput").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    const res = q ? P.filter(p => (pn(p) + " " + p.name + " " + p.cat + " " + pc(p).join(" ")).toLowerCase().includes(q)) : [];
    $("#searchResults").innerHTML = q && !res.length ? `<div class="empty" style="grid-column:1/-1">${T("noResults")}</div>` : res.map(card).join("");
  });
  $("#searchResults").addEventListener("click", e => e.target.closest("a") && closeAll());

  // ---------- misc ----------
  let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400); }
  $("#newsletter").onsubmit = e => { e.preventDefault(); $("#nlMsg").textContent = T("thanks"); e.target.reset(); };

  // ---------- auth ----------
  let authMode = "login";
  function renderAuthBtn() {
    const u = AUTH.user(), label = u ? T("account") : T("login");
    $("#loginBtn").textContent = label; $("#menuLogin").textContent = label;
  }
  function openAuth(mode) { authMode = mode || "login"; renderAuth(); openDrawer("auth"); setTimeout(() => { const i = $("#authBody input"); if (i) i.focus(); }, 350); }
  function renderAuth() {
    const u = AUTH.user(), body = $("#authBody");
    if (u) {
      $("#authTitle").textContent = T("account");
      body.innerHTML = `<div class="auth-account"><p class="auth-hello">${esc(T("hello").replace("{n}", u.name || u.email))}</p><p class="muted">${esc(u.email)}</p>
        <h5 class="auth-h">${T("myOrders")}</h5><p class="muted">${T("noOrders")}</p><button class="btn light" id="logoutBtn">${T("logout")}</button></div>`;
      $("#logoutBtn").onclick = async () => { await AUTH.signOut(); authMode = "login"; renderAuth(); renderAuthBtn(); toast(T("loggedOut")); };
      return;
    }
    const reg = authMode === "register", forgot = authMode === "forgot";
    $("#authTitle").textContent = reg ? T("register") : forgot ? T("resetTitle") : T("login");
    body.innerHTML = `<form class="auth-form" id="authForm" novalidate>
        ${reg ? `<label>${T("name")}<input name="name" type="text" autocomplete="name"></label>` : ""}
        <label>E-mail<input name="email" type="email" autocomplete="email" inputmode="email" required></label>
        ${forgot ? "" : `<label>${T("password")}<input name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}" required></label>`}
        <p class="auth-msg" id="authMsg" role="alert"></p>
        <button class="btn" type="submit">${reg ? T("submitReg") : forgot ? T("submitReset") : T("submitLogin")}</button>
      </form>
      <div class="auth-alt">
        ${forgot ? `<button class="linkbtn" data-am="login">${T("back")}</button>` :
          reg ? `<span class="muted">${T("haveAcc")}</span><button class="btn light" data-am="login">${T("submitLogin")}</button>` :
          `<button class="linkbtn" data-am="forgot">${T("forgot")}</button><span class="muted">${T("noAcc")}</span><button class="btn light" data-am="register">${T("register")}</button>`}
      </div>
      ${AUTH.demo ? `<p class="auth-note">${T("demoNote")}</p>` : ""}`;
    $$("[data-am]", body).forEach(b => b.onclick = () => { authMode = b.dataset.am; renderAuth(); const i = $("#authBody input"); if (i) i.focus(); });
    $("#authForm").onsubmit = async e => {
      e.preventDefault();
      const f = e.target, msg = $("#authMsg"), btn = $("button[type=submit]", f), v = n => (f.elements[n] ? f.elements[n].value : "");
      msg.className = "auth-msg"; msg.textContent = ""; btn.disabled = true;
      try {
        if (forgot) { await AUTH.reset({ email: v("email") }); msg.className = "auth-msg ok"; msg.textContent = T("resetSent"); }
        else {
          if (reg) await AUTH.signUp({ email: v("email"), password: v("password"), name: v("name") });
          else await AUTH.signIn({ email: v("email"), password: v("password") });
          renderAuthBtn(); renderAuth(); toast(T(reg ? "created" : "loggedIn"));
        }
      } catch (err) { msg.textContent = T("e_" + (err.code || "net")); }
      finally { btn.disabled = false; }
    };
  }

  // ---------- language ----------
  function applyLang(keepScroll) {
    document.documentElement.lang = lang === "uk" ? "uk" : "en";
    document.title = C.storeName + " — " + T("titleSuffix");
    $$("[data-i18n]").forEach(e => e.textContent = T(e.dataset.i18n));
    $$("[data-i18n-ph]").forEach(e => e.placeholder = T(e.dataset.i18nPh));
    $$("[data-setlang]").forEach(e => { e.classList.toggle("act", e.dataset.setlang === lang); e.style.display = LANGS.includes(e.dataset.setlang) ? "" : "none"; });
    $("#menuList").innerHTML = C.categories.map(c => `<li><a href="#c-${c.id}">${esc(L(c.label))}</a></li>`).join("");
    $("#nlMsg").textContent = "";
    renderCart();
    renderAuthBtn(); renderAuth();
    route(keepScroll);
    $("#searchInput").dispatchEvent(new Event("input"));
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-setlang]"); if (!b) return;
    lang = b.dataset.setlang;
    try { localStorage.setItem("lang", lang); } catch {}
    applyLang(true);
  });

  // ---------- init ----------
  $$(".sn").forEach(e => e.textContent = C.storeName);
  $("#year").textContent = "© " + new Date().getFullYear();
  // товары берём из хранилища (демо: браузер / сервер: Supabase); пока грузим, показываем стартовые
  DB.list().then(l => { P = l; }).catch(() => {}).finally(() => applyLang());
})();
