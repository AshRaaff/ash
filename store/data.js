// ====== ДАННЫЕ ТОВАРОВ ======
// Магазин и админка читают/пишут товары через window.DB.
//   local     — товары в браузере (localStorage), стартовые берутся из products.js (демо).
//   supabase  — товары в таблице products на сервере (см. supabase.sql). Включается в config.js → auth.
(() => {
  const C = window.CONFIG, cfg = C.auth || {};
  const useSb = cfg.provider === "supabase" && cfg.supabaseUrl && cfg.supabaseAnonKey;
  const base = (cfg.supabaseUrl || "").replace(/\/$/, "");
  const ls = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const err = (code, extra) => Object.assign(new Error(code), { code, ...extra });
  const defaults = () => (window.PRODUCTS || []).map(p => {
    const t = (window.PRODUCTS_UK || {})[p.id];
    return { ...p, uk: t ? { ...t } : undefined, visible: true };
  });
  const fromRow = r => ({ ...r.data, id: r.id, visible: r.visible });

  async function rest(path, { method = "GET", body, headers = {} } = {}) {
    const token = window.AUTH && AUTH.token ? AUTH.token() : null;
    let r;
    try {
      r = await fetch(base + path, { method, body, headers: { apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + (token || cfg.supabaseAnonKey), ...headers } });
    } catch { throw err("net"); }
    if (r.status === 401 || r.status === 403) throw err("auth");
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw err("server", { detail: j.message || j.error || r.status }); }
    return r.status === 204 ? null : r.json().catch(() => null);
  }
  const jsonH = { "Content-Type": "application/json", Prefer: "return=representation" };

  window.DB = {
    mode: useSb ? "supabase" : "local",

    async list({ all = false } = {}) {
      if (!useSb) { const arr = ls.get("poi_products", null) || defaults(); return all ? arr : arr.filter(p => p.visible !== false); }
      const rows = await rest("/rest/v1/products?select=id,data,visible,sort&order=sort.asc,id.asc" + (all ? "" : "&visible=eq.true"));
      return (rows || []).map(fromRow);
    },

    async save(p) {
      if (!useSb) {
        const arr = ls.get("poi_products", null) || defaults(), q = { ...p };
        if (q.id == null) { q.id = Math.max(0, ...arr.map(x => Number(x.id) || 0)) + 1; arr.push(q); }
        else { const i = arr.findIndex(x => x.id == q.id); i < 0 ? arr.push(q) : (arr[i] = q); }
        if (!ls.set("poi_products", arr)) throw err("quota");
        return q;
      }
      const { id, visible, ...data } = p, body = JSON.stringify({ data, visible: visible !== false });
      const rows = id == null
        ? await rest("/rest/v1/products", { method: "POST", body, headers: jsonH })
        : await rest("/rest/v1/products?id=eq." + encodeURIComponent(id), { method: "PATCH", body, headers: jsonH });
      return rows && rows[0] ? fromRow(rows[0]) : p;
    },

    async remove(id) {
      if (!useSb) {
        const arr = (ls.get("poi_products", null) || defaults()).filter(x => x.id != id);
        if (!ls.set("poi_products", arr)) throw err("quota");
        return;
      }
      await rest("/rest/v1/products?id=eq." + encodeURIComponent(id), { method: "DELETE" });
    },

    // blob (jpeg) -> url. local: data-URL внутри товара; supabase: файл в Storage, публичная ссылка
    async uploadImage(blob) {
      if (!useSb) return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(err("read")); fr.readAsDataURL(blob); });
      const name = Date.now().toString(36) + Math.random().toString(36).slice(2, 8) + ".jpg";
      let r;
      try {
        const token = AUTH.token();
        r = await fetch(base + "/storage/v1/object/products/" + name, { method: "POST", body: blob,
          headers: { apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + (token || cfg.supabaseAnonKey), "Content-Type": "image/jpeg" } });
      } catch { throw err("net"); }
      if (r.status === 401 || r.status === 403) throw err("auth");
      if (!r.ok) throw err("server");
      return base + "/storage/v1/object/public/products/" + name;
    },

    // стартовые товары: local — сброс к products.js; supabase — загрузить демо-товары в пустую таблицу
    async seed() {
      if (!useSb) { ls.del("poi_products"); return; }
      const rows = defaults().map(({ id, visible, ...data }) => ({ data, visible: true }));
      await rest("/rest/v1/products", { method: "POST", body: JSON.stringify(rows), headers: jsonH });
    }
  };
})();
