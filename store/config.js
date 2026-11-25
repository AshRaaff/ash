// ====== НАСТРОЙКИ МАГАЗИНА — меняйте здесь ======
window.CONFIG = {
  languages: ["en", "uk"],        // доступные языки
  storeName: "POI Shopping",      // название (логотип в шапке рисуется в index.html)
  currency: "RON",                // валюта
  freeShippingFrom: 250,          // бесплатная доставка от этой суммы
  email: "hello@example.com",
  categories: [                   // пункты меню
    { id: "new",   label: { en: "NEW IN", uk: "НОВИНКИ" } },
    { id: "woman", label: { en: "WOMAN",  uk: "ЖІНКАМ" } },
    { id: "man",   label: { en: "MAN",    uk: "ЧОЛОВІКАМ" } },
    { id: "kids",  label: { en: "KIDS",   uk: "ДІТЯМ" } },
    { id: "sale",  label: { en: "SALE",   uk: "ЗНИЖКИ" } }
  ],
  // Картинки главной. Положите файлы в store/img/ и укажите путь, например "img/hero1.jpg".
  // Пустая строка = цветной плейсхолдер.
  hero: [
    { img: "", tone: "#cfc7bb", title: { en: "NEW COLLECTION", uk: "НОВА КОЛЕКЦІЯ" }, sub: { en: "WOMAN", uk: "ЖІНКАМ" },  link: "#c-woman" },
    { img: "", tone: "#2f3236", title: { en: "ESSENTIALS", uk: "БАЗОВИЙ ГАРДЕРОБ" }, sub: { en: "MAN", uk: "ЧОЛОВІКАМ" },    link: "#c-man" }
  ],
  banners: [
    { img: "", tone: "#b9b2a6", title: { en: "KIDS", uk: "ДІТЯМ" }, sub: { en: "SPRING EDIT", uk: "ВЕСНЯНА ПІДБІРКА" }, link: "#c-kids" },
    { img: "", tone: "#8f8a80", title: { en: "SALE", uk: "ЗНИЖКИ" }, sub: { en: "UP TO 50% OFF", uk: "ДО -50%" }, link: "#c-sale" }
  ]
};
