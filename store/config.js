// ====== НАСТРОЙКИ МАГАЗИНА — меняйте здесь ======
window.CONFIG = {
  storeName: "MAISON",            // название / логотип
  currency: "RON",                // валюта
  freeShippingFrom: 250,          // бесплатная доставка от этой суммы
  email: "hello@example.com",
  categories: [                   // пункты меню
    { id: "new",   label: "NEW IN" },
    { id: "woman", label: "WOMAN" },
    { id: "man",   label: "MAN" },
    { id: "kids",  label: "KIDS" },
    { id: "sale",  label: "SALE" }
  ],
  // Картинки главной. Положите файлы в store/img/ и укажите путь, например "img/hero1.jpg".
  // Пустая строка = цветной плейсхолдер.
  hero: [
    { img: "", tone: "#cfc7bb", title: "NEW COLLECTION", sub: "WOMAN",  link: "#/c/woman" },
    { img: "", tone: "#2f3236", title: "ESSENTIALS",     sub: "MAN",    link: "#/c/man" }
  ],
  banners: [
    { img: "", tone: "#b9b2a6", title: "KIDS",  sub: "SPRING EDIT", link: "#/c/kids" },
    { img: "", tone: "#8f8a80", title: "SALE",  sub: "UP TO 50% OFF", link: "#/c/sale" }
  ]
};
