/** Brand contact details, as published on purobodysoul.com. */
export const SITE = {
  name: "Puro Body & Soul",
  /** Public origin used for canonical URLs, the sitemap and structured data. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://purobodysoul.com").replace(/\/$/, ""),
  organisation: "Shramik Naari Sangh (Sa-Ni-Sa)",
  email: "puro@sanisa.co.in",
  ordersEmail: "puro.orders@sanisa.co.in",
  phone: "+91 90226 99993",
  phoneHref: "tel:+919022699993",
  whatsapp: "https://api.whatsapp.com/send?phone=916374496486&text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Puro.",
  address: [
    "Shramik Naari Sangh, Division: Puro Body & Soul",
    "99/2 Jambhulpada, Sudhagad Taluka",
    "Maharashtra 410205, India",
  ],
  social: {
    instagram: "https://www.instagram.com/purobodyandsoul/",
    facebook: "https://www.facebook.com/purobodyandsoul",
  },
} as const;
