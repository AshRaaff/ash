(() => {
  const C = window.CONFIG, P = window.PRODUCTS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => n.toFixed(2) + " " + C.currency;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    return `<a class="card" href="#/p/${p.id}">
      ${p.isNew ? '<span class="badge">NEW</span>' : p.oldPrice ? '<span class="badge">SALE</span>' : ""}
      <div class="ph"><div class="layer a">${innerMedia(p, 0)}</div>${second ? `<div class="layer b">${innerMedia(p, 1)}</div>` : ""}</div>
      <div class="info"><span>${esc(p.name)}</span><span class="p">${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="sale">${money(p.price)}</span>` : money(p.price)}</span></div>
    </a>`;
  }
  function innerMedia(p, i) {
    const src = p.images && p.images[i];
    return src ? `<div style="position:absolute;inset:0;background:url('${esc(src)}') center/cover"></div>` : placeholder(p.tone, i % 2);
  }
  const tile = (t, cls = "") => `<a class="tile ${cls}" href="${t.link}">
    <div class="bg" style="background-color:${t.tone};${t.img ? `background-image:url('${esc(t.img)}')` : `background-image:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.28))`}"></div>
    <div class="cap"><small>${esc(t.sub)}</small><b>${esc(t.title)}</b><u>VIEW</u></div></a>`;

  // ---------- views ----------
  const app = $("#app"), header = $("#header");

  function home() {
    setHeader(true);
    const featured = P.filter(p => p.isNew).slice(0, 8);
    app.innerHTML = `
      <section class="hero">${C.hero.map(t => tile(t)).join("")}</section>
      <div class="section-title"><span>NEW IN</span><a href="#/c/new">VIEW ALL</a></div>
      <section class="grid">${featured.map(card).join("")}</section>
      <section class="banners" style="margin-top:56px">${C.banners.map(t => tile(t)).join("")}</section>`;
  }

  function catalog(id = "new") {
    setHeader(false);
    const cat = C.categories.find(c => c.id === id) || { id, label: id.toUpperCase() };
    let list = P.filter(p => id === "new" ? p.isNew : id === "sale" ? p.oldPrice : p.cat === id);
    app.innerHTML = `<div class="page">
      <div class="catalog-head"><h1>${esc(cat.label)} <span class="muted">· <span id="cnt">${list.length}</span></span></h1>
      <div class="filters"><label>SORT <select id="sort"><option value="">FEATURED</option><option value="asc">PRICE ↑</option><option value="desc">PRICE ↓</option></select></label></div></div>
      <div class="grid" id="list"></div></div>`;
    const draw = () => {
      const v = $("#sort").value;
      const l = [...list].sort((a, b) => v === "asc" ? a.price - b.price : v === "desc" ? b.price - a.price : 0);
      $("#list").innerHTML = l.length ? l.map(card).join("") : `<div class="empty" style="grid-column:1/-1">Nothing here yet.</div>`;
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
      <div class="gallery">${[0, 1, 2, 3].map(i => media(p, i)).join("")}</div>
      <div class="pinfo">
        <div class="crumbs"><a href="#/">HOME</a> / <a href="#/c/${p.cat}">${esc(cat ? cat.label : p.cat)}</a></div>
        <h1>${esc(p.name)}</h1>
        <div class="price">${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="sale">${money(p.price)}</span>` : money(p.price)}</div>
        <p class="desc">${esc(p.desc)}</p>
        <div class="color">${esc(p.colors.join(" | "))}</div>
        <div><div class="muted" style="margin-bottom:8px">SELECT YOUR SIZE</div>
        <div class="sizes">${p.sizes.map(s => `<button data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div></div>
        <button class="btn" id="add">ADD</button>
        <div class="shipinfo">Free shipping on orders over ${money(C.freeShippingFrom)}. Free returns within 30 days.</div>
      </div></div>`;
    $$(".sizes button").forEach(b => b.onclick = () => {
      $$(".sizes button").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); size = b.dataset.s;
    });
    $("#add").onclick = () => {
      if (!size) { toast("PLEASE SELECT A SIZE"); return; }
      const it = cart.find(c => c.id === p.id && c.size === size);
      it ? it.qty++ : cart.push({ id: p.id, size, qty: 1 });
      saveCart(); openDrawer("cart");
    };
  }

  const INFO = {
    help: ["HELP", "Questions about orders, sizes or payment? Write to us and we will reply within one business day."],
    shipping: ["SHIPPING & RETURNS", "Standard delivery takes 2–4 business days. Free shipping over " + "{free}" + ". You can return any item within 30 days in its original condition."],
    contact: ["CONTACT", "E-mail: {mail}. Replace this text with your address, phone and opening hours."],
    about: ["ABOUT US", "Write a few lines about your store, your story and your values here."]
  };
  function info(k) {
    setHeader(false);
    const [t, txt] = INFO[k] || INFO.about;
    app.innerHTML = `<div class="info-page"><h1>${t}</h1><p>${esc(txt.replace("{free}", money(C.freeShippingFrom)).replace("{mail}", C.email))}</p></div>`;
  }

  // ---------- router ----------
  function route() {
    const [a, b] = location.hash.replace(/^#\/?/, "").split("/");
    closeAll();
    ({ p: () => product(b), c: () => catalog(b), info: () => info(b) }[a] || home)();
    window.scrollTo(0, 0);
    onScroll();
  }
  function setHeader(over) { header.classList.toggle("over", over); }
  function onScroll() { header.classList.toggle("scrolled", scrollY > window.innerHeight * .6 - 56 || !header.classList.contains("over")); }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("hashchange", route);

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
  $("#loginBtn").onclick = () => toast("LOGIN IS NOT CONNECTED YET");
  overlay.onclick = closeAll;
  $$("[data-close]").forEach(b => b.onclick = closeAll);
  addEventListener("keydown", e => e.key === "Escape" && closeAll());

  // ---------- cart ----------
  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = count;
    const rows = cart.map((it, idx) => ({ ...it, idx, p: P.find(p => p.id === it.id) })).filter(r => r.p);
    $("#cartBody").innerHTML = rows.length ? rows.map(r => `<div class="cart-item">
      <a href="#/p/${r.p.id}">${media(r.p, 0).replace('class="ph "', 'class="ph"')}</a>
      <div><h5>${esc(r.p.name)} <span class="pr">${money(r.p.price * r.qty)}</span></h5>
      <div class="meta">${esc(r.p.colors[0])} · ${esc(r.size)}</div>
      <div class="qty"><button data-d="-1" data-i="${r.idx}" aria-label="Less">−</button><span>${r.qty}</span><button data-d="1" data-i="${r.idx}" aria-label="More">+</button></div>
      <button class="rm" data-rm="${r.idx}">Remove</button></div></div>`).join("")
      : `<div class="cart-empty">YOUR BAG IS EMPTY</div>`;
    const total = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
    $("#cartFoot").innerHTML = rows.length ? `
      <div class="row"><span>TOTAL</span><b>${money(total)}</b></div>
      <div class="note">${total >= C.freeShippingFrom ? "Free shipping included." : `Add ${money(C.freeShippingFrom - total)} more for free shipping.`}</div>
      <button class="btn" id="checkout">CONTINUE</button>` : "";
    const co = $("#checkout"); if (co) co.onclick = () => toast("CHECKOUT & PAYMENT: TO BE CONNECTED");
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
    const res = q ? P.filter(p => (p.name + " " + p.cat + " " + p.colors.join(" ")).toLowerCase().includes(q)) : [];
    $("#searchResults").innerHTML = q && !res.length ? `<div class="empty" style="grid-column:1/-1">No results.</div>` : res.map(card).join("");
  });
  $("#searchResults").addEventListener("click", e => e.target.closest("a") && closeAll());

  // ---------- misc ----------
  let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400); }
  $("#newsletter").onsubmit = e => { e.preventDefault(); $("#nlMsg").textContent = "Thank you for subscribing."; e.target.reset(); };

  // ---------- init ----------
  document.title = C.storeName + " — Fashion Store";
  $("#logo").textContent = C.storeName;
  $$(".sn").forEach(e => e.textContent = C.storeName);
  $("#year").textContent = "© " + new Date().getFullYear();
  $("#menuList").innerHTML = C.categories.map(c => `<li><a href="#/c/${c.id}">${esc(c.label)}</a></li>`).join("");
  renderCart(); route();
})();
