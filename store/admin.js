(() => {
  const C = window.CONFIG;
  const $ = (s, e = document) => e.querySelector(s);
  const $$ = (s, e = document) => [...e.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => Number(n).toFixed(2) + " " + C.currency;
  const csv = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
  const CATS = [["woman", "Женское (Woman)"], ["man", "Мужское (Man)"], ["kids", "Детское (Kids)"]];
  const CAT_NAME = { woman: "Женское", man: "Мужское", kids: "Детское" };
  const SIZES = [["XS–XL", "XS,S,M,L,XL"], ["S–XXL", "S,M,L,XL,XXL"], ["34–42", "34,36,38,40,42"], ["38–46", "38,40,42,44,46"], ["Дети", "2-3,4-5,6-7,8-9"], ["Один размер", "ONE SIZE"]];
  const ERR = { net: "Нет связи с сервером. Попробуйте ещё раз.", auth: "Сессия истекла или нет прав. Войдите заново.", server: "Ошибка сервера.", quota: "Память браузера заполнена: удалите лишние фото или товары.", read: "Не удалось прочитать файл." };
  const root = $("#root"), panel = $("#panel"), shade = $("#shade");
  let products = [];

  // ---------- helpers ----------
  let tt;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); }
  const errText = e => ERR[e && e.code] || (e && e.message) || "Ошибка.";
  const isAdmin = u => (C.admins || []).map(x => String(x).toLowerCase()).includes(String(u.email).toLowerCase());
  const thumb = p => p.images && p.images[0] ? `background-image:url('${esc(p.images[0])}')` : `background-color:${esc(p.tone || "#d8d4cc")}`;

  // ---------- boot ----------
  async function boot() {
    $("#mode").textContent = DB.mode === "local" ? "Демо · данные только в этом браузере" : "Сервер подключён";
    if (DB.mode === "supabase") {
      const u = AUTH.user();
      if (!u) return gate();
      if (!isAdmin(u)) return denied(u);
      $("#who").innerHTML = `${esc(u.email)} · <button class="linkbtn" id="logout">Выйти</button>`;
      $("#logout").onclick = async () => { await AUTH.signOut(); location.reload(); };
    }
    await load();
  }

  function gate(msg) {
    root.innerHTML = `<form class="gate f" id="gform" novalidate><h1>ВХОД ДЛЯ АДМИНИСТРАТОРА</h1>
      <label>E-mail<input type="email" name="email" autocomplete="email"></label>
      <label>Пароль<input type="password" name="password" autocomplete="current-password"></label>
      <p class="err" id="gerr">${esc(msg || "")}</p><button class="btn" type="submit">Войти</button></form>`;
    $("#gform").onsubmit = async e => {
      e.preventDefault(); const f = e.target; $("#gerr").textContent = "";
      try { await AUTH.signIn({ email: f.email.value, password: f.password.value }); location.reload(); }
      catch (er) { $("#gerr").textContent = { badEmail: "Введите корректную почту.", wrong: "Неверная почта или пароль.", net: ERR.net }[er.code] || "Не удалось войти."; }
    };
  }
  function denied(u) {
    root.innerHTML = `<div class="gate"><h1>НЕТ ДОСТУПА</h1><p class="muted">Аккаунт ${esc(u.email)} не указан администратором. Добавьте почту в <b>config.js → admins</b> и в supabase.sql.</p>
      <button class="btn light" id="lo">Выйти</button></div>`;
    $("#lo").onclick = async () => { await AUTH.signOut(); location.reload(); };
  }

  async function load() {
    try { products = await DB.list({ all: true }); }
    catch (e) { if (e.code === "auth") { await AUTH.signOut(); return gate(ERR.auth); } root.innerHTML = `<p class="err">${esc(errText(e))}</p>`; return; }
    render();
  }

  // ---------- list ----------
  function render() {
    const demo = DB.mode === "local";
    root.innerHTML = `
      <div class="bar"><h1>ТОВАРЫ · ${products.length}</h1>
        <div class="btns">
          <button class="btn light sm" id="copy">Копировать JSON</button>
          ${demo ? `<button class="btn light sm" id="reset">Сбросить к демо-товарам</button>` : ""}
          <button class="btn sm" id="new">+ Добавить товар</button></div></div>
      ${demo ? `<div class="notice"><b>Демо-режим.</b> Изменения сохраняются только в этом браузере и сразу видны в магазине, который открыт в нём же. На других устройствах и для покупателей их не будет, пока не подключён сервер (Supabase).</div>` : ""}
      ${products.length ? `<div class="list">${products.map(rowHtml).join("")}</div>` :
        `<div class="empty"><span>Пока нет товаров.</span><button class="btn" id="new2">+ Добавить товар</button>${demo ? "" : `<button class="btn light" id="seed">Загрузить демо-товары</button>`}</div>`}`;
    $("#new") && ($("#new").onclick = () => openForm());
    $("#new2") && ($("#new2").onclick = () => openForm());
    $("#copy") && ($("#copy").onclick = copyJson);
    $("#reset") && armed($("#reset"), "Точно сбросить?", async () => { await DB.seed(); await load(); toast("СПИСОК СБРОШЕН К ДЕМО-ТОВАРАМ"); });
    $("#seed") && ($("#seed").onclick = async () => { try { await DB.seed(); await load(); toast("ДЕМО-ТОВАРЫ ЗАГРУЖЕНЫ"); } catch (e) { toast(errText(e)); } });
    $$(".row").forEach(r => {
      const id = r.dataset.id;
      $('[data-act="edit"]', r).onclick = () => openForm(products.find(p => p.id == id));
      $('[data-act="vis"]', r).onclick = async () => {
        const p = products.find(x => x.id == id);
        try { await DB.save({ ...p, visible: p.visible === false }); await load(); toast(p.visible === false ? "ТОВАР ПОКАЗАН" : "ТОВАР СКРЫТ"); } catch (e) { toast(errText(e)); }
      };
      armed($('[data-act="del"]', r), "Точно удалить?", async () => { try { await DB.remove(id); await load(); toast("ТОВАР УДАЛЁН"); } catch (e) { toast(errText(e)); } });
    });
  }
  function rowHtml(p) {
    const off = p.visible === false;
    return `<div class="row ${off ? "off" : ""}" data-id="${esc(p.id)}">
      <div class="thumb" style="${thumb(p)}"></div>
      <div class="info"><b>${esc(p.name)}</b><span>${esc(CAT_NAME[p.cat] || p.cat)} · ${esc((p.sizes || []).join(", "))}</span></div>
      <div class="price">${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span><span class="sale">${money(p.price)}</span>` : money(p.price)}</div>
      <div class="tags">${p.isNew ? '<span class="tag">Новинка</span>' : ""}${p.oldPrice ? '<span class="tag">Скидка</span>' : ""}${off ? '<span class="tag hide">Скрыт</span>' : ""}</div>
      <div class="actions"><button data-act="edit">Изменить</button><button data-act="vis">${off ? "Показать" : "Скрыть"}</button><button class="del" data-act="del">Удалить</button></div></div>`;
  }
  // двухшаговое подтверждение: первый клик меняет подпись, второй выполняет
  function armed(btn, label, fn) {
    if (!btn) return; const orig = btn.textContent; let t;
    btn.onclick = () => {
      if (btn.classList.contains("armed")) { clearTimeout(t); btn.classList.remove("armed"); btn.textContent = orig; fn(); return; }
      btn.classList.add("armed"); btn.textContent = label;
      t = setTimeout(() => { btn.classList.remove("armed"); btn.textContent = orig; }, 3000);
    };
  }
  async function copyJson() {
    const txt = JSON.stringify(products, null, 2);
    try { await navigator.clipboard.writeText(txt); toast("JSON СКОПИРОВАН"); }
    catch { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("JSON СКОПИРОВАН"); } catch { toast("НЕ УДАЛОСЬ СКОПИРОВАТЬ"); } ta.remove(); }
  }

  // ---------- form ----------
  function closePanel() { panel.classList.remove("on"); shade.classList.remove("on"); panel.setAttribute("aria-hidden", "true"); }
  shade.onclick = closePanel;
  addEventListener("keydown", e => e.key === "Escape" && closePanel());

  async function toJpeg(file) {
    const bmp = await createImageBitmap(file);
    const s = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("x")), "image/jpeg", 0.82));
  }

  function openForm(src) {
    const p = src ? JSON.parse(JSON.stringify(src)) : { name: "", price: "", cat: "woman", isNew: true, visible: true, tone: "#d8d4cc", colors: [], sizes: [], desc: "", images: [] };
    p.uk = p.uk || { name: "", desc: "", colors: [] };
    p.images = p.images || [];
    const v = x => esc(x ?? "");
    panel.innerHTML = `
      <div class="panel-head"><span>${src ? "ИЗМЕНИТЬ ТОВАР" : "НОВЫЙ ТОВАР"}</span><button id="x" aria-label="Закрыть">✕</button></div>
      <div class="panel-body"><form class="f" id="pf" novalidate>
        <h3>Фото</h3>
        <button type="button" class="btn photo-btn" id="pick">+ Добавить фото</button>
        <input type="file" id="file" class="vh" accept="image/*" multiple>
        <div class="imgs" id="imgs"></div>
        <p class="hint">Нажмите кнопку и выберите фото из галереи или снимите на камеру. Первое фото главное. Фото сжимаются до 1200 px. Без фото в магазине будет цветная заглушка.</p>
        <h3>Название и описание</h3>
        <label>Название (English) *<input type="text" name="name" value="${v(p.name)}" placeholder="OVERSIZED LINEN BLAZER"></label>
        <label>Название (Українською)<input type="text" name="uname" value="${v(p.uk.name)}"></label>
        <label>Описание (English)<textarea name="desc">${v(p.desc)}</textarea></label>
        <label>Описание (Українською)<textarea name="udesc">${v(p.uk.desc)}</textarea></label>
        <h3>Цена и категория</h3>
        <div class="two"><label>Цена, ${esc(C.currency)} *<input type="number" name="price" min="0" step="0.01" inputmode="decimal" value="${v(p.price)}"></label>
          <label>Старая цена (если скидка)<input type="number" name="oldPrice" min="0" step="0.01" inputmode="decimal" value="${v(p.oldPrice)}"></label></div>
        <label>Категория<select name="cat">${CATS.map(([id, n]) => `<option value="${id}" ${p.cat === id ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="check"><input type="checkbox" name="isNew" ${p.isNew ? "checked" : ""}> Показывать в «Новинки»</label>
        <label class="check"><input type="checkbox" name="visible" ${p.visible !== false ? "checked" : ""}> Показывать в магазине</label>
        <h3>Размеры и цвета</h3>
        <label>Размеры, через запятую *<input type="text" name="sizes" value="${v((p.sizes || []).join(", "))}" placeholder="S, M, L"></label>
        <div class="chips">${SIZES.map(([n, val]) => `<button type="button" class="chip" data-sz="${esc(val)}">${esc(n)}</button>`).join("")}</div>
        <label>Цвета (English), через запятую<input type="text" name="colors" value="${v((p.colors || []).join(", "))}" placeholder="Black, Sand"></label>
        <label>Цвета (Українською), через запятую<input type="text" name="ucolors" value="${v((p.uk.colors || []).join(", "))}" placeholder="Чорний, Пісочний"></label>
        <p class="err" id="ferr"></p>
      </form></div>
      <div class="panel-foot"><button class="btn light" id="cancel" type="button">Отмена</button><button class="btn" id="save" type="button">Сохранить</button></div>`;
    panel.classList.add("on"); shade.classList.add("on"); panel.setAttribute("aria-hidden", "false");
    $("#x").onclick = $("#cancel").onclick = closePanel;
    const f = $("#pf");
    $$(".chip", f).forEach(b => b.onclick = () => { f.sizes.value = b.dataset.sz.split(",").join(", "); });

    // photos
    const imgsEl = $("#imgs");
    function drawImgs() {
      imgsEl.innerHTML = p.images.map((u, i) => `<div class="img" style="background-image:url('${esc(u)}')">${i === 0 ? '<span class="main">ГЛАВНОЕ</span>' : ""}
        <div class="ctl"><button type="button" data-m="-1" data-i="${i}" aria-label="Левее">←</button><button type="button" data-d="${i}" aria-label="Удалить">✕</button><button type="button" data-m="1" data-i="${i}" aria-label="Правее">→</button></div></div>`).join("");
      $$("[data-m]", imgsEl).forEach(b => b.onclick = () => { const i = +b.dataset.i, j = i + +b.dataset.m; if (j < 0 || j >= p.images.length) return; [p.images[i], p.images[j]] = [p.images[j], p.images[i]]; drawImgs(); });
      $$("[data-d]", imgsEl).forEach(b => b.onclick = () => { p.images.splice(+b.dataset.d, 1); drawImgs(); });
    }
    drawImgs();
    const pick = $("#pick"), fileEl = $("#file");
    pick.onclick = () => fileEl.click();
    fileEl.onchange = async e => {
      const files = [...e.target.files]; if (!files.length) return;
      pick.disabled = true; pick.textContent = "Загрузка…";
      for (const file of files) {
        try { p.images.push(await DB.uploadImage(await toJpeg(file))); drawImgs(); }
        catch (er) { toast(er.code ? errText(er) : "НЕ УДАЛОСЬ ПРОЧИТАТЬ ФОТО"); if (er.code === "auth") break; }
      }
      fileEl.value = ""; pick.disabled = false; pick.textContent = "+ Добавить фото";
    };

    $("#save").onclick = async () => {
      const g = n => f.elements[n], err = $("#ferr"); err.textContent = "";
      const name = g("name").value.trim(), price = parseFloat(g("price").value), old = g("oldPrice").value.trim() === "" ? null : parseFloat(g("oldPrice").value), sizes = csv(g("sizes").value);
      if (!name) { err.textContent = "Введите название (English)."; return g("name").focus(); }
      if (!(price > 0)) { err.textContent = "Укажите цену больше нуля."; return g("price").focus(); }
      if (old !== null && !(old > price)) { err.textContent = "Старая цена должна быть больше текущей."; return g("oldPrice").focus(); }
      if (!sizes.length) { err.textContent = "Укажите хотя бы один размер."; return g("sizes").focus(); }
      const uk = { name: g("uname").value.trim(), desc: g("udesc").value.trim(), colors: csv(g("ucolors").value) };
      const out = { ...p, name, price, cat: g("cat").value, isNew: g("isNew").checked, visible: g("visible").checked,
        desc: g("desc").value.trim(), colors: csv(g("colors").value), sizes, images: p.images, uk: (uk.name || uk.desc || uk.colors.length) ? uk : undefined };
      if (old !== null) out.oldPrice = old; else delete out.oldPrice;
      const btn = $("#save"); btn.disabled = true;
      try { await DB.save(out); closePanel(); await load(); toast("СОХРАНЕНО"); }
      catch (e) { err.textContent = errText(e); if (e.code === "auth") { await AUTH.signOut(); location.reload(); } }
      finally { btn.disabled = false; }
    };
    $(".panel-body").scrollTop = 0;
  }

  boot();
})();
