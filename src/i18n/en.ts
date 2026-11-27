/** English UI text. am.ts and om.ts must provide the same keys (enforced by the Dict type). */
export const en = {
  meta: {
    siteTitle: "Tufte General Trading — Metal pipes, fittings & sanitary materials importer in Addis Ababa",
    titleTemplate: "%s | Tufte General Trading, Addis Ababa",
    description:
      "Importer and wholesaler of metal pipes, pipe fittings, valves and sanitary materials from China and Turkey. Warehouse in Ashewa Meda, Addis Ababa, Ethiopia. Wholesale & retail — order by Telegram, WhatsApp or phone.",
    productsTitle: "Metal pipes, fittings & sanitary materials in stock",
    productsDescription:
      "Browse what's in stock at our Ashewa Meda warehouse: metal pipes, pipe fittings, valves, shower and bathroom supplies. Wholesale and retail in Addis Ababa.",
    aboutTitle: "About us — importer of metals & sanitary materials",
    aboutDescription:
      "Tufte General Trading Works PLC imports metals and sanitary materials directly from manufacturers and keeps them in stock at its warehouse in Ashewa Meda, Addis Ababa.",
    contactTitle: "Contact & warehouse location in Ashewa Meda",
    contactDescription:
      "Message us on Telegram or WhatsApp, call, or visit our warehouse in Ashewa Meda, Addis Ababa. Address, map and opening hours.",
    categoryTitle: (name: string) => `${name} — wholesale & retail`,
    categoryDescription: (name: string) =>
      `${name} in stock at our warehouse in Ashewa Meda, Addis Ababa. Message us on Telegram, WhatsApp or call to check stock and prices.`,
    productTitle: (name: string, category?: string | null) => (category ? `${name} — ${category}` : name),
    productDescription: (name: string, category?: string | null) =>
      `${name}${category ? ` (${category})` : ""} available at Tufte General Trading, Ashewa Meda, Addis Ababa. Wholesale & retail. Order by Telegram, WhatsApp or phone.`,
    searchTitle: (q: string) => `Search: ${q}`,
  },
  nav: { home: "Home", products: "Products", about: "About", contact: "Contact", language: "Language" },
  hero: {
    badge: "Direct importers · Warehouse in Ashewa Meda",
    browse: "Browse products",
    visit: "Visit the warehouse",
    imageAlt: "Warehouse aisle with shelves full of stock",
  },
  home: {
    introTitle: "Metal pipes, fittings & sanitary materials in Addis Ababa",
    intro:
      "We import metal pipes, pipe fittings, valves and sanitary materials directly from manufacturers in China and Turkey, and keep them in stock at our warehouse in Ashewa Meda. Contractors, shops and individual buyers can buy wholesale or retail.",
    metals: "Metals",
    metalsBody: "Pipes, tubes and metal fittings",
    sanitary: "Sanitary materials",
    sanitaryBody: "Taps, sinks and bathroom supplies",
    shopByCategory: "Shop by category",
    featured: "Featured products",
    seeAll: "See all",
    whyBuy: "Why buy from us",
    valueProps: [
      { title: "Imported directly", body: "We import from manufacturers abroad, so you skip the middlemen." },
      { title: "Wholesale & retail", body: "Buy by the piece or in bulk. Ask us about large orders." },
      { title: "See it in person", body: "Visit our warehouse in Ashewa Meda to check goods before you buy." },
    ],
    findUs: "Find our warehouse",
    findUsBody: "Come see the goods, or message us and we'll confirm availability before you travel.",
  },
  route: {
    title: "From the factory to Ashewa Meda",
    steps: [
      { title: "Sourced from manufacturers", body: "We buy directly from factories in China and Turkey." },
      { title: "Shipped to Djibouti", body: "Goods travel by sea to the port of Djibouti." },
      { title: "Stocked in Ashewa Meda", body: "Then by road to our warehouse, ready for you to collect." },
    ],
    places: { china: "China", turkey: "Turkey", djibouti: "Djibouti", ashewa: "Ashewa Meda" },
  },
  products: {
    title: "Products",
    subtitle: "Metals and sanitary materials in stock at our warehouse.",
    searchPlaceholder: "Search products…",
    search: "Search",
    all: "All",
    count: (n: number) => `${n} product${n === 1 ? "" : "s"}`,
    none: "No products found.",
    noneFor: (q: string) => `No products found for “${q}”.`,
  },
  product: {
    noPhoto: "No photo yet",
    soldBy: "Sold by",
    minOrder: "Minimum order",
    interested: "Interested? Message us to order:",
  },
  category: {
    intro: (name: string) =>
      `${name} in stock at our warehouse in Ashewa Meda, Addis Ababa. Message or call us to check availability or to order.`,
    empty: "No products in this category yet.",
  },
  about: {
    title: (name: string) => `About ${name}`,
    fallback:
      "We import metals and sanitary materials directly from manufacturers and keep them in stock at our warehouse in Ashewa Meda. Contractors, shops and individual buyers can browse what we have, message us to confirm availability, and pick up from the warehouse.",
    gallery: ["Metal pipes and tubes", "Fittings and valves", "Sanitary materials"],
    browse: "Browse products",
    contactLink: "Contact & location",
  },
  contact: {
    title: "Contact & location",
    subtitle: "Message us to check stock, or come see the goods at the warehouse.",
    messageUs: "Message or call us",
    phone: "Phone",
    email: "Email",
    hours: "Opening hours",
  },
  footer: { warehouse: "Warehouse", getInTouch: "Get in touch", follow: "Follow us" },
  stock: {
    in: "In stock",
    limited: "Limited stock",
    out: "Out of stock",
    exact: (qty: string, unit: string) => `${qty} ${unit} in stock`,
  },
  price: { perUnit: (price: string, unit: string) => `ETB ${price} / ${unit}` },
  /** Translations for the common units in the admin's unit list; anything else shows as typed. */
  units: {} as Record<string, string>,
  contactLinks: {
    orderTelegram: "Order on Telegram",
    orderWhatsapp: "Order on WhatsApp",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    call: (phone: string) => `Call ${phone}`,
    contactOn: (label: string) => `Contact us on ${label}`,
    messageProduct: (name: string) => `Hello, I'm interested in "${name}". Is it available?`,
    messageGeneral: "Hello, I'd like to ask about your products.",
    soon: "Contact details coming soon.",
  },
  map: { show: "Show map", directions: "Get directions" },
  faq: {
    title: "Frequently asked questions",
    items: (s: { address: string; hours: string }) => [
      {
        q: "How do I order?",
        a: "Tap the Telegram, WhatsApp or call button on any product page. We'll confirm availability and the price.",
      },
      { q: "Do you sell wholesale?", a: "Yes — we sell both wholesale and retail. Contact us directly for large orders." },
      { q: "Where is your warehouse?", a: `Our warehouse is in ${s.address}. Opening hours: ${s.hours}.` },
      {
        q: "What do you import?",
        a: "Metal pipes, pipe fittings, valves and sanitary materials, from manufacturers in China and Turkey.",
      },
      {
        q: "Is the stock on the website up to date?",
        a: "We update stock as goods arrive and sell. Message us before you travel and we'll confirm.",
      },
    ],
  },
};

export type Dict = typeof en;
