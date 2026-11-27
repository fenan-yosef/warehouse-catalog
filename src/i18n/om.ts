import type { Dict } from "./en";

/** Afaan Oromoo UI text. DRAFT — please have a native speaker review before launch. */
export const om: Dict = {
  meta: {
    siteTitle: "Tufte General Trading — Ujummoo sibiilaa, fiitingii fi meeshaalee saanitarii galchituu, Finfinnee",
    titleTemplate: "%s | Tufte General Trading, Finfinnee",
    description:
      "Ujummoo sibiilaa, fiitingii ujummoo, vaalvii fi meeshaalee saanitarii Chaayinaa fi Turkii irraa kallattiin galchina. Kuusaan keenya Ashewa Meda, Finfinnee (Addis Ababa) keessa jira. Jumlaa fi qinxaaboon — Telegram, WhatsApp ykn bilbilaan ajajaa.",
    productsTitle: "Ujummoo sibiilaa, fiitingii fi meeshaalee saanitarii kuusaa keessa jiran",
    productsDescription:
      "Meeshaalee kuusaa keenya Ashewa Meda keessa jiran ilaalaa: ujummoo sibiilaa, fiitingii ujummoo, vaalvii, meeshaalee shaawaraa fi mana dhiqannaa. Finfinnee keessatti jumlaa fi qinxaaboon.",
    aboutTitle: "Waa'ee keenya — galchituu sibiilaa fi meeshaalee saanitarii",
    aboutDescription:
      "Tufte General Trading Works PLC sibiilota fi meeshaalee saanitarii oomishtoota irraa kallattiin galchee kuusaa isaa Ashewa Meda, Finfinnee keessatti kuusa.",
    contactTitle: "Nu quunnamaa — teessoo kuusaa Ashewa Meda",
    contactDescription:
      "Telegram ykn WhatsApp irratti ergaa nuuf ergaa, bilbilaa, ykn kuusaa keenya Ashewa Meda, Finfinnee daawwadhaa. Teessoo, kaartaa fi sa'aatii hojii.",
    categoryTitle: (name) => `${name} — jumlaa fi qinxaaboon`,
    categoryDescription: (name) =>
      `${name} kuusaa keenya Ashewa Meda, Finfinnee keessa ni argama. Argamuu fi gatii beekuuf Telegram, WhatsApp ykn bilbilaan nu quunnamaa.`,
    productTitle: (name, category) => (category ? `${name} — ${category}` : name),
    productDescription: (name, category) =>
      `${name}${category ? ` (${category})` : ""} Tufte General Trading, Ashewa Meda, Finfinnee irraa ni argama. Jumlaa fi qinxaaboon. Telegram, WhatsApp ykn bilbilaan ajajaa.`,
    searchTitle: (q) => `Barbaacha: ${q}`,
  },
  nav: { home: "Fuula jalqabaa", products: "Meeshaalee", about: "Waa'ee keenya", contact: "Nu quunnamaa", language: "Afaan" },
  hero: {
    badge: "Galchituu kallattii · Kuusaa Ashewa Meda",
    browse: "Meeshaalee ilaalaa",
    visit: "Kuusaa daawwadhaa",
    imageAlt: "Kuusaa meeshaaleen guutame",
  },
  home: {
    introTitle: "Ujummoo sibiilaa, fiitingii fi meeshaalee saanitarii Finfinnee keessatti",
    intro:
      "Ujummoo sibiilaa, fiitingii ujummoo, vaalvii fi meeshaalee saanitarii oomishtoota Chaayinaa fi Turkii irraa kallattiin galchinee kuusaa keenya Ashewa Meda keessatti dhiheessina. Kontraaktaroonni, suuqiiwwan fi namoonni dhuunfaa jumlaan ykn qinxaaboon bitachuu danda'u.",
    metals: "Sibiilota",
    metalsBody: "Ujummoo, tuubii fi fiitingii sibiilaa",
    sanitary: "Meeshaalee saanitarii",
    sanitaryBody: "Meeshaalee bishaanii, siinkii fi meeshaalee mana dhiqannaa",
    shopByCategory: "Gosa meeshaatiin bitaa",
    featured: "Meeshaalee filatamoo",
    seeAll: "Hunda ilaalaa",
    whyBuy: "Maaliif nu irraa bituu qabdu",
    valueProps: [
      { title: "Kallattiin kan galu", body: "Oomishtoota alaa irraa kallattiin waan galchinuuf, giddu-galeessi hin barbaachisu." },
      { title: "Jumlaa fi qinxaaboo", body: "Tokko tokkoon ykn baay'inaan bitaa. Waa'ee ajaja guddaa nu gaafadhaa." },
      { title: "Ofii keessaniin ilaalaa", body: "Osoo hin bitin dura meeshaalee ilaaluuf kuusaa keenya Ashewa Meda daawwadhaa." },
    ],
    findUs: "Kuusaa keenya argadhaa",
    findUsBody: "Dhuftanii meeshaalee ilaalaa, ykn osoo hin dhufin dura ergaa nuuf ergaa; argamuu isaa isiniif mirkaneessina.",
  },
  route: {
    title: "Warshaa irraa hanga Ashewa Meda",
    steps: [
      { title: "Oomishtoota irraa", body: "Warshaalee Chaayinaa fi Turkii irraa kallattiin bitanna." },
      { title: "Gara Jibuutiitti", body: "Meeshaaleen galaanaan gara buufata doonii Jibuutii geejjibamu." },
      { title: "Ashewa Meda keessatti kuufama", body: "Achiis karaa lafaa gara kuusaa keenyaa dhufu; fudhachuuf qophaa'u." },
    ],
    places: { china: "Chaayinaa", turkey: "Turkii", djibouti: "Jibuutii", ashewa: "Ashewa Meda" },
  },
  products: {
    title: "Meeshaalee",
    subtitle: "Sibiilota fi meeshaalee saanitarii kuusaa keenya keessa jiran.",
    searchPlaceholder: "Meeshaalee barbaadi…",
    search: "Barbaadi",
    all: "Hunda",
    count: (n) => `Meeshaalee ${n}`,
    none: "Meeshaan hin argamne.",
    noneFor: (q) => `“${q}”f meeshaan hin argamne.`,
  },
  product: {
    noPhoto: "Suuraan hin jiru",
    soldBy: "Kan gurguramu",
    minOrder: "Ajaja xiqqaa",
    interested: "Ni barbaadduu? Ajajuuf ergaa nuuf ergaa:",
  },
  category: {
    intro: (name) =>
      `${name} kuusaa keenya Ashewa Meda, Finfinnee keessa ni argama. Argamuu mirkaneeffachuuf ykn ajajuuf ergaa nuuf ergaa ykn bilbilaa.`,
    empty: "Gosa kana keessa ammaaf meeshaan hin jiru.",
  },
  about: {
    title: (name) => `Waa'ee ${name}`,
    fallback:
      "Sibiilota fi meeshaalee saanitarii oomishtoota irraa kallattiin galchinee kuusaa keenya Ashewa Meda keessatti kuufna. Kontraaktaroonni, suuqiiwwan fi bitattoonni dhuunfaa waan qabnu ilaaluu, argamuu isaa mirkaneeffachuuf ergaa erguu fi kuusaa irraa fudhachuu ni danda'u.",
    gallery: ["Ujummoo fi tuubii sibiilaa", "Fiitingii fi vaalvii", "Meeshaalee saanitarii"],
    browse: "Meeshaalee ilaalaa",
    contactLink: "Teessoo fi quunnamtii",
  },
  contact: {
    title: "Quunnamtii fi teessoo",
    subtitle: "Argamuu meeshaa mirkaneeffachuuf ergaa nuuf ergaa, ykn dhuftanii kuusaa keessatti ilaalaa.",
    messageUs: "Ergaa ergaa ykn bilbilaa",
    phone: "Bilbila",
    email: "Imeelii",
    hours: "Sa'aatii hojii",
  },
  footer: { warehouse: "Kuusaa", getInTouch: "Nu quunnamaa", follow: "Nu hordofaa" },
  stock: {
    in: "Ni jira",
    limited: "Muraasa qofa",
    out: "Dhumateera",
    exact: (qty, unit) => `${qty} ${unit} kuusaa keessa`,
  },
  price: { perUnit: (price, unit) => `Birrii ${price} / ${unit}` },
  units: { carton: "kartoonii", box: "saanduqa", kg: "kg", meter: "meetira" },
  contactLinks: {
    orderTelegram: "Telegram-n ajajaa",
    orderWhatsapp: "WhatsApp-n ajajaa",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    call: (phone) => `Bilbilaa ${phone}`,
    contactOn: (label) => `${label}-n nu quunnamaa`,
    messageProduct: (name) => `Akkam, "${name}" nan barbaada. Ni jiraa?`,
    messageGeneral: "Akkam, waa'ee meeshaalee keessanii gaafachuun barbaada.",
    soon: "Odeeffannoon quunnamtii dhiyootti ni dabalama.",
  },
  map: { show: "Kaartaa agarsiisi", directions: "Kallattii argadhu" },
  faq: {
    title: "Gaaffilee yeroo baay'ee gaafataman",
    items: (s) => [
      {
        q: "Akkamittan ajajuu danda'a?",
        a: "Fuula meeshaa kamiyyuu irratti furtuu Telegram, WhatsApp ykn bilbilaa tuqaa. Argamuu fi gatii isaa isiniif mirkaneessina.",
      },
      { q: "Jumlaan ni gurgurtuu?", a: "Eeyyee, jumlaa fi qinxaaboon ni gurgurra. Ajaja guddaaf kallattiin nu quunnamaa." },
      { q: "Kuusaan keessan eessa jira?", a: `Kuusaan keenya ${s.address} keessa jira. Sa'aatii hojii: ${s.hours}.` },
      {
        q: "Meeshaalee akkamii galchitu?",
        a: "Ujummoo sibiilaa, fiitingii ujummoo, vaalvii fi meeshaalee saanitarii oomishtoota Chaayinaa fi Turkii irraa galchina.",
      },
      {
        q: "Kuusaan marsariitii irratti jiru yeroo isaa eegee haaromfamaa?",
        a: "Meeshaaleen yeroo galanii fi gurguraman kuusaa ni haaromsina. Osoo hin dhufin dura ergaa nuuf erguun mirkaneeffadhaa.",
      },
    ],
  },
};
