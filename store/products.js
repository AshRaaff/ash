// ====== ТОВАРЫ — меняйте/добавляйте здесь ======
// cat: woman | man | kids ; flags: isNew, oldPrice (для sale)
// images: массив путей к фото, например ["img/p1-a.jpg","img/p1-b.jpg"]. Пусто = плейсхолдер.
const CLOTHES = ["XS","S","M","L","XL"];
window.PRODUCTS = [
  { id:1,  name:"OVERSIZED LINEN BLAZER",   price:279, cat:"woman", isNew:true,  tone:"#d8cfc0", colors:["Sand","Black"],  sizes:CLOTHES, desc:"Relaxed-fit blazer in linen blend with lapel collar, long sleeves and flap pockets." },
  { id:2,  name:"FLOWING MIDI DRESS",       price:229, cat:"woman", isNew:true,  tone:"#b8c0b4", colors:["Sage"],          sizes:CLOTHES, desc:"Midi dress with V-neckline, thin straps and a flowing skirt." },
  { id:3,  name:"HIGH-WAIST WIDE JEANS",    price:199, cat:"woman",               tone:"#9fb0c4", colors:["Blue"],          sizes:["34","36","38","40","42"], desc:"Full-length jeans with a high waist and wide leg. Front zip and button closure." },
  { id:4,  name:"KNIT RIBBED TOP",          price:79,  oldPrice:119, cat:"woman",  tone:"#e6dfd6", colors:["Ecru","Black"],  sizes:CLOTHES, desc:"Fitted ribbed top with round neckline and short sleeves." },
  { id:5,  name:"LEATHER EFFECT TRENCH",    price:399, cat:"woman", isNew:true,  tone:"#7a6a5a", colors:["Brown"],         sizes:CLOTHES, desc:"Belted trench coat with lapel collar, buttoned cuffs and front pockets." },
  { id:6,  name:"STRUCTURED WOOL COAT",     price:459, cat:"man",   isNew:true,  tone:"#4a4d52", colors:["Grey"],          sizes:["S","M","L","XL","XXL"], desc:"Straight-fit coat in wool blend with notched lapel and welt pockets." },
  { id:7,  name:"HEAVYWEIGHT T-SHIRT",      price:69,  cat:"man",                tone:"#e8e8e4", colors:["White","Black"], sizes:["S","M","L","XL","XXL"], desc:"Boxy-fit cotton T-shirt with ribbed round neck and short sleeves." },
  { id:8,  name:"STRAIGHT FIT CHINOS",      price:159, oldPrice:219, cat:"man",    tone:"#b9a98d", colors:["Stone"],         sizes:["38","40","42","44","46"], desc:"Straight-fit chinos with a front zip and button closure." },
  { id:9,  name:"TEXTURED KNIT SWEATER",    price:179, cat:"man",   isNew:true,  tone:"#6d7568", colors:["Green"],         sizes:["S","M","L","XL","XXL"], desc:"Textured knit sweater with ribbed round neck and long sleeves." },
  { id:10, name:"WASHED DENIM JACKET",      price:219, cat:"man",                tone:"#8aa0ba", colors:["Blue"],          sizes:["S","M","L","XL","XXL"], desc:"Denim jacket with a collar, long sleeves, chest and side pockets." },
  { id:11, name:"PRINTED COTTON DRESS",     price:99,  cat:"kids",  isNew:true,  tone:"#e4cdb8", colors:["Rose"],          sizes:["2-3","4-5","6-7","8-9"], desc:"Soft cotton dress with a floral print and short sleeves." },
  { id:12, name:"HOODED SWEATSHIRT",        price:89,  oldPrice:129, cat:"kids",   tone:"#9aa6b0", colors:["Grey"],          sizes:["2-3","4-5","6-7","8-9"], desc:"Hooded sweatshirt with kangaroo pocket and ribbed trims." },
  { id:13, name:"PLEATED MINI SKIRT",       price:109, oldPrice:159, cat:"woman",  tone:"#3a3a3c", colors:["Black"],         sizes:CLOTHES, desc:"Mini skirt with a high waist and pleated detail." },
  { id:14, name:"RELAXED CARGO TROUSERS",   price:189, cat:"man",                tone:"#8b8570", colors:["Khaki"],         sizes:["38","40","42","44","46"], desc:"Relaxed-fit trousers with side pockets and an elastic waist with drawstring." },
  { id:15, name:"BOMBER JACKET",            price:249, oldPrice:349, cat:"man",    tone:"#2e3a32", colors:["Dark green"],    sizes:["S","M","L","XL","XXL"], desc:"Bomber jacket with a ribbed collar, zip closure and side pockets." },
  { id:16, name:"CROPPED CARDIGAN",         price:139, cat:"woman",              tone:"#d9c9c4", colors:["Pink"],          sizes:CLOTHES, desc:"Cropped knit cardigan with a V-neckline and button closure." }
];
