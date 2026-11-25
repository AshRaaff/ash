// ====== АВТОРИЗАЦИЯ ======
// provider "local"    — демо: аккаунты хранятся только в этом браузере (для макета, НЕ для реальных клиентов).
// provider "supabase" — настоящие аккаунты: укажите supabaseUrl и supabaseAnonKey в config.js (auth).
(() => {
  const cfg = window.CONFIG.auth || { provider: "local" };
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const fail = code => Object.assign(new Error(code), { code });
  const clean = e => String(e || "").trim().toLowerCase();
  function check(email, password, needPass = true) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw fail("badEmail");
    if (needPass && String(password || "").length < 8) throw fail("shortPass");
  }
  const hex = bytes => [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, "0")).join("");
  async function sha(s) {
    if (!(window.crypto && crypto.subtle)) throw fail("net");
    return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
  }
  const salt = () => hex(crypto.getRandomValues(new Uint8Array(16)));

  const local = {
    demo: true,
    user() {
      const s = store.get("poi_session", null); if (!s) return null;
      const u = store.get("poi_users", {})[s]; return u ? { email: s, name: u.name } : null;
    },
    async signUp({ email, password, name }) {
      email = clean(email); check(email, password);
      const users = store.get("poi_users", {});
      if (users[email]) throw fail("exists");
      const s = salt();
      users[email] = { salt: s, hash: await sha(s + password), name: String(name || "").trim(), created: Date.now() };
      store.set("poi_users", users); store.set("poi_session", email);
      return this.user();
    },
    async signIn({ email, password }) {
      email = clean(email); check(email, password, false);
      const u = store.get("poi_users", {})[email];
      if (!u || (await sha(u.salt + password)) !== u.hash) throw fail("wrong");
      store.set("poi_session", email); return this.user();
    },
    token() { return null; },
    async signOut() { store.del("poi_session"); },
    async reset({ email }) { check(clean(email), "", false); throw fail("resetDemo"); }
  };

  const sb = {
    demo: false,
    base: (cfg.supabaseUrl || "").replace(/\/$/, "") + "/auth/v1",
    async call(path, body, token) {
      let r;
      try {
        r = await fetch(this.base + path, { method: "POST", body: JSON.stringify(body || {}),
          headers: { apikey: cfg.supabaseAnonKey, "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) } });
      } catch { throw fail("net"); }
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const c = j.error_code || j.error || "", m = String(j.msg || j.message || j.error_description || "").toLowerCase();
        if (c === "user_already_exists" || m.includes("already registered")) throw fail("exists");
        if (c === "weak_password" || m.includes("password should be")) throw fail("shortPass");
        if (c === "invalid_credentials" || m.includes("invalid login")) throw fail("wrong");
        if (c === "email_not_confirmed" || m.includes("not confirmed")) throw fail("confirmEmail");
        throw fail("net");
      }
      return j;
    },
    user() {
      const s = store.get("poi_sb", null);
      return s && s.user ? { email: s.user.email, name: (s.user.user_metadata || {}).name || "" } : null;
    },
    async signUp({ email, password, name }) {
      email = clean(email); check(email, password);
      const j = await this.call("/signup", { email, password, data: { name: String(name || "").trim() } });
      if (!j.access_token) throw fail("confirmEmail");   // включено подтверждение почты
      store.set("poi_sb", { token: j.access_token, user: j.user }); return this.user();
    },
    async signIn({ email, password }) {
      email = clean(email); check(email, password, false);
      const j = await this.call("/token?grant_type=password", { email, password });
      store.set("poi_sb", { token: j.access_token, user: j.user }); return this.user();
    },
    token() { const s = store.get("poi_sb", null); return s && s.token || null; },
    async signOut() {
      const s = store.get("poi_sb", null);
      if (s && s.token) { try { await this.call("/logout", {}, s.token); } catch {} }
      store.del("poi_sb");
    },
    async reset({ email }) { email = clean(email); check(email, "", false); await this.call("/recover", { email }); }
  };

  window.AUTH = cfg.provider === "supabase" && cfg.supabaseUrl && cfg.supabaseAnonKey ? sb : local;
})();
