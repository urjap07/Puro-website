/**
 * The business side of PURO — hotel amenities and spa products — carried over
 * from purobodysoul.com (/hotel and /spa). Both are sold in bulk, on request.
 */

export interface AmenityRange {
  slug: string;
  name: string;
  scent: string;
  description: string;
  image: string;
  /** Product · packing · size, as listed on the live site. */
  items: { product: string; packing: string; size: string }[];
}

const tubes = (ml: number, soap: number) => [
  { product: "Shower gel", packing: "Tube", size: `${ml} ml` },
  { product: "Lotion", packing: "Tube", size: `${ml} ml` },
  { product: "Shampoo", packing: "Tube", size: `${ml} ml` },
  { product: "Conditioner", packing: "Tube", size: `${ml} ml` },
  { product: "Glycerin soap", packing: "Box carton", size: `${soap} g` },
];

export const HOTEL_INTRO = [
  "Puro Body & Soul is a leading manufacturer of luxury hotel toiletries and amenities. Our products provide a pleasant and relaxing experience for your guests, blending luxury and serenity to deliver a distinguished hospitality experience every time.",
  "Our premium guest toiletries are meticulously crafted with natural formulations, featuring natural actives, pure essential oils, exquisite natural fragrances and 100% paraben-free preservatives.",
];

/** Hotels named on the live site. */
export const HOTEL_CLIENTS = ["Clark Shiraz, Agra", "Rhythm Lonavala", "Sonar Bangla", "Adamo Hotels", "Upperdeck Lonavala", "Ramoji Film City"];

/** Logos shown under "Our clients" on the live homepage. */
export const CLIENT_LOGOS = [
  { name: "Jean-Claude Biguine", src: "/media/clients/jean-claude-biguine.webp", width: 272, height: 185 },
  { name: "Taj Group", src: "/media/clients/taj-group.webp", width: 290, height: 170 },
  { name: "Rhythm Lonavala", src: "/media/clients/rhythm-lonavala.webp", width: 224, height: 224 },
  { name: "Hyatt Regency", src: "/media/clients/hyatt-regency.webp", width: 400, height: 392 },
  { name: "Tanishq", src: "/media/clients/tanishq.webp", width: 500, height: 317 },
  { name: "Myrah", src: "/media/clients/myrah.webp", width: 225, height: 225 },
];

export const AMENITY_RANGES: AmenityRange[] = [
  {
    slug: "southern-kiwi",
    name: "Southern Kiwi",
    scent: "Kiwi",
    description: "Tart, fruity and floral, this scent is sure to refresh and rejuvenate your guests, and intoxicate their senses.",
    image: "/media/hotel/southern-kiwi.webp",
    items: tubes(30, 25),
  },
  {
    slug: "aromatherapy-naturelles",
    name: "Aromatherapy Naturelles",
    scent: "Saffron & Sandalwood",
    description:
      "A touch of native Indian opulence — this luxurious scent blends precious saffron and exotic sandalwood with skin and hair conditioning ingredients that deliver a superior sensorial experience to your guests.",
    image: "/media/hotel/aromatherapy-naturelles.webp",
    items: [
      { product: "Shower gel", packing: "Bottle", size: "30 ml" },
      { product: "Lotion", packing: "Bottle", size: "30 ml" },
      { product: "Shampoo", packing: "Bottle", size: "30 ml" },
      { product: "Conditioner", packing: "Bottle", size: "30 ml" },
      { product: "Glycerin soap", packing: "Box carton", size: "30 g" },
    ],
  },
  {
    slug: "brazilian-naturelles",
    name: "Brazilian Naturelles",
    scent: "Citrus & Basil",
    description: "Our energising citrus blend is tailored to keep your guests refreshed and revitalised.",
    image: "/media/hotel/brazilian-naturelles.webp",
    items: tubes(30, 25),
  },
  {
    slug: "moroccan-oasis",
    name: "Moroccan Oasis",
    scent: "Aloe & Cucumber",
    description: "A cooling blend designed to keep your guests relaxed, refreshed and rejuvenated.",
    image: "/media/hotel/moroccan-oasis.webp",
    items: [...tubes(20, 20), { product: "Soap", packing: "Wrapper with label", size: "15 g" }],
  },
];

export interface SpaCategory {
  id: string;
  title: string;
  intro: string;
  items: { name: string; text: string }[];
}

/** The spa range, by category, from purobodysoul.com/spa. */
export const SPA_CATEGORIES: SpaCategory[] = [
  {
    "id": "massage-oils",
    "title": "Massage Oils",
    "intro": "Our Light Aroma Massage Oils are made from a base containing pure Sweet Almond Oil, Grapeseed Oil and Rice Bran Oil. Our oils provide excellent nourishment to the skin and are a perfect base to carry the aroma of the natural essential oil blends. Our Light Massage Oils are non-comedogenic and are easily absorbed into the skin and do not leave a greasy feel. We DO NOT use mineral oil, as they coat the skin like plastic,clogging the pores.",
    "items": [
      {
        "name": "Balancing Massage Oil",
        "text": "A blend of Basil, Peppermint and Rosemary. This blend balances the mind, body and emotions promotes clarity of thought."
      },
      {
        "name": "Calming Massage Oil",
        "text": "A blend of Bergamot, Geranium and Frankincense. This blend has a soothing & calming effect on the mind, emotions and thoughts"
      },
      {
        "name": "Floral Romance Massage Oil",
        "text": "A blend of Lavender and Rose. Balance hormones & relieves anxiety."
      },
      {
        "name": "Relaxing Massage Oil",
        "text": "A blend of Lavender and Sandalwood. This blend calms & soothes frazzled nerves and eases stress"
      },
      {
        "name": "Cold Pressed Sweet Almond Oil",
        "text": "Almond oil soaks in quickly and is a powerful moisturizer, so it can be used on the face or body. You can apply it straight, or mix it with essential oils to get its benefits."
      },
      {
        "name": "Cold Pressed Virgin Coconut Oil",
        "text": "Virgin Coconut Oil hydrates skin, shields from sun exposure and treats skin disorders. It boosts lipid levels and reverses the impact of dry, damaged skin, especially during the winter season."
      },
      {
        "name": "Olive Oil",
        "text": "Ideal for a light massage as it is absorbed very slowly into the skin. This oil is perfect for relaxing your muscles and locking in moisture. It also increases blood circulation, ease aches, muscle spasms, and any pain or inflammation."
      },
      {
        "name": "Citrus Blast Massage Oil",
        "text": "Contains citrus essential oils. This blend boosts mood, removes toxins and is rich in Vitamin C & Antioxidants"
      },
      {
        "name": "Destressing Massage Oil",
        "text": "Blend of Geranium & Mandarin. Helps you feel happy and positive"
      },
      {
        "name": "Energize Massage Oil",
        "text": "Revitalising energy infusion: a blend of Ginger & Grapefruit. Uplifting and Stimulating massage oil"
      },
      {
        "name": "Invigorating Massage Oil",
        "text": "Blend of Lemongrass & Lavender. This blend supports skin and muscles, helps with energetic clearing as well as easing fear and anxiety."
      },
      {
        "name": "Minty Zest Massage Oil",
        "text": "Blend of Lemon & Peppermint. This blend provides a great energy boost and helps clear sinuses."
      },
      {
        "name": "Uplift Massage Oil",
        "text": "Blend of Bergamot, Ylang Ylang & Grapefruit. Helps with stress and promotes peace, happiness and positive energy."
      },
      {
        "name": "Cold Pressed Grapeseed Oil",
        "text": "Grape seed oil has the ability to improve blood circulation, decreases swelling, speeds up the process of wound healing and repairs damaged capillaries and blood vessels"
      },
      {
        "name": "Chocolate Massage Oil",
        "text": "Made with real chocolate and natural oils this decadent massage oil is rich with anti oxidants. Perfect for special chocolate therapies, valentine's day special or couple massage"
      },
      {
        "name": "Healing Massage Oil",
        "text": "Blend of Ylang Ylang, Rosemary & Peppermint. Supports the circulatory system necessary for the transport toxins out of the body. Supports the nervous system and contributes to mental upliftment and much improved temperament"
      },
      {
        "name": "Detoxifying Massage Oil",
        "text": "Blend of Juniper Berry, Cypress & Geranium. Great for a number of skin issues including detoxifying and clarifying the skin, cellulite etc."
      },
      {
        "name": "Lymphatic Drainage Massage Oil",
        "text": "Blend of Bergamot & Juniper Berry. This blend helps clear lymph glands, reduce water retention, inflammation and cellulite"
      },
      {
        "name": "Happiness Massage Oil",
        "text": "Blend of Sandalwood & Orange essential oils. This unique blend will make you feel uplifted and yet grounded"
      },
      {
        "name": "Lemongrass Massage Oil",
        "text": "An excellent anti-depressant, Lemongrass tones and fortifies the nervous system and can be used for soothing muscular nerves and pain"
      },
      {
        "name": "Mandarin Grapefruit Massage Oil",
        "text": "Best selling blend formulated to lift your mood and stimulate positive energy. Rich in Antioxidants, Vitamin C & Glutathione"
      },
      {
        "name": "Balinese Massage Oil",
        "text": "Lavender helps sedate your nervous system and induces relaxation"
      },
      {
        "name": "Deep Tissue Massage Oil",
        "text": "Blend of Sandalwood & Ylang Ylang. Makes skin supple, aids circulation and induces peacefulness"
      },
      {
        "name": "Swedish Massage Oil",
        "text": "Ylang Ylang. Helps relax, maintains skin moisture, relaxes tightened muscles."
      },
      {
        "name": "Warming Massage Oil",
        "text": "Blend of Rosemary, Ginger & Juniper Berry. This warming oil brings comfort when overtired or after over exertion. This skin conditioning blend of oils is easily spread and absorbed across larger areas of skin, making it perfect for a warming, comforting massage."
      }
    ]
  },
  {
    "title": "Body Scrubs & Polishes",
    "intro": "Body scrubs and polishes are products designed to exfoliate and rejuvenate the skin. They typically come in the form of a creamy, gel-like, or grainy substance that you massage onto damp skin. It is a harmonious blend of luxurious exfoliants. Our Luxurious body scrubs nourish the skin while gently exfoliating dead skin cells and impurities to reveal brighter complexion and smoother skin. Polishes typically have finer grains or particles compared to scrubs. They provide a gentler exfoliation and are often formulated with additional nourishing ingredients such as essential oils, vitamins, and botanical extracts.",
    "items": [
      {
        "name": "Rich African Cocoa Butter Scrub",
        "text": "Cocoa is high in antioxidants, it is anti-inflammatory and supports anti-ageing as well. A cream base scrub that is rich in every sense, touch, smell and feel."
      },
      {
        "name": "Divine Chocolate Scrub",
        "text": "Cocoa is high in antioxidants, it is anti-inflammatory and supports anti-ageing as well. A chocolaty treat for the skin."
      },
      {
        "name": "Wine Scrub",
        "text": "Luxurious and decadent scent that will captivate the senses and relax the mind."
      },
      {
        "name": "Indian Spice Scrub",
        "text": "Contains Cinnamon, Ginger and Grapefruit a combination that is a great lymphatic stimulant with a strong detoxifying effect."
      },
      {
        "name": "Lemongrass Glow Salt Polish",
        "text": "Contains Natural Vitamin E, Phytosterol, Organic Squalene Salt can naturally cleanse the skin and help rebalance oil production."
      },
      {
        "name": "Southern Kiwi Scrub",
        "text": "Imparts a delightful kiwi fragrance that freshens the body and mind."
      },
      {
        "name": "Rose Scrub",
        "text": "Rose is known for its mood lifting and aphrodisiac fragrance."
      }
    ],
    "id": "scrubs-polishes"
  },
  {
    "title": "Foot Care",
    "intro": "We will take you for Journey of relaxation of your FOOT. Our collection includes various products like Foot Creams,Foot Wash/Scrub,Foot Salts,Cuticle cream, Foot Polishes etc. They are essential for REJUVENATING, DETOXIFYING, MOISTURIZING,Refreshing CLEANSING RITUALS all aimed at improving the health, appearance, and overall well-being of the feet. Our products are made with high-quality, natural ingredients and avoid harsh chemicals.",
    "items": [
      {
        "name": "Thai Foot Cream",
        "text": "Blend of Olive oil, Sunflower Oil and natural waxes that nourish, repair and soften dry and damaged feet. This special formulation also contains wintergreen, eucalyptus and menthol that rejuvenate and refresh the feet."
      },
      {
        "name": "Peppermint Foot Cream",
        "text": "This Potent combination Natural fresh tender virgin coconut oil, natural waxes, Peppermint oil & Natural Vitamin E Natural cools & soothes the skin. It also improves blood circulation & re- energizes feet."
      },
      {
        "name": "Lavender Ylang Ylang Massage Cream",
        "text": "This nature-derived, silicone-free, natural oil, natural vitamin E, phytosterol and organic squalene enriched cream is ultra softening and nourishing for even the most hardened skin."
      },
      {
        "name": "Thai Foot Balm",
        "text": "Formulated with Sunflower Oil, natural humectants, natural essential oils and natural waxes that repair dry damaged feet by locking in moisture whilst relieving muscle fatigue."
      },
      {
        "name": "Peppermint Walnut Foot Wash/Scrub",
        "text": "This formulation helps to exfoliate dry patches and flaky skin softening hardened heels to make them silky and supple. It also cleanses and nourishes the skin while promoting blood circulation. Moreover, the natural peppermint essential oil gives a slight cooling sensation truly providing a refreshing experience."
      },
      {
        "name": "Foot Salts",
        "text": "Natural Salt based soaks that help soften cuticles and loosen dead skin available in various fragrances including Rose, Rose Milk, Lemongrass, Gojiberry, Chocolate etc."
      },
      {
        "name": "Brazilian Orange Cuticle Cream",
        "text": "Silicone-free plant derived cream that directly soaks in the skin to effectively moisturize and strengthen nails by treating dry damaged cuticles."
      },
      {
        "name": "Mocha Foot Polish",
        "text": "100% natural luxurious scrub enriched with natural oils, waxes, sugar. Will leave feet velvety soft and moist"
      }
    ],
    "id": "foot-care"
  },
  {
    "title": "Face Care",
    "intro": "Our Revitalizing FACE PACKS. Face packs are skincare products formulated to target specific skin concerns and provide various benefits for the skin. Face packs typically contain a combination of active ingredients tailored to address specific skin issues and improve the overall health and appearance of the skin.are an essential part of a comprehensive skincare routine, Incorporating face masques into your weekly skincare regimen can help improve the health, appearance, and overall well-being of your skin, leaving it looking and feeling its best.",
    "items": [
      {
        "name": "Brightening Sandalwood Saffron Face Masque",
        "text": "This face pack is infused with pure saffron extract for radiant skin and home-grown organic turmeric for its healing qualities. The natural volcanic clays penetrate your skin to remove toxins, dirt leaving the skin rejuvenated. We use Licorice to brighten your complexion, while Aloe Vera soothes & adds the much needed moisture to your skin."
      },
      {
        "name": "Citrus Blast Ubtan Normal to Oily Skin",
        "text": "The Ubtan face pack contains natural clays, Licorice, Natural vitamin C from plant extracts that absorb oil & dirt from pores to minimize, detoxify & purify your skin, fight blemishes brighten and remove tan. It is a traditional recipe with modern twist, that your skin thirst for."
      },
      {
        "name": "Moroccan Facial Cream",
        "text": "This is a silicone-free, synthetic polymer-free face massage cream that contains aloe vera, vitamin E and natural oils. It is an extremely effective massage cream which helps in cell renewal process and improves skin's firmness, leaving skin radiant and luminous. Contains natural vitamin E, phytosterol and organic squalene that restores a smooth radiance and collagen elasticity to the skin."
      },
      {
        "name": "Red Wine Facial Scrub",
        "text": "This natural scrub will brighten and clear dull skin while softening the skin. Will leave skin velvety soft and smooth."
      },
      {
        "name": "Rose Vanilla Whitening Facial Scrub",
        "text": "This creamy body scrub contains natural exfoliants that remove dead skin build - up with time without drying the skin. It repairs & protects skin cells against environmental damage, enhances blood circulation and skin-cell turnover making skin healthy and glowing from within."
      },
      {
        "name": "Rose Facial Scrub",
        "text": "This nature-derived scrub contains natural exfoliants and Rose oil which can minimize the appearance of wrinkles, fine lines and age spots, also helps to even out skin tone and texture."
      },
      {
        "name": "Southern Kiwi Facial Scrub",
        "text": "This fresh nutri-scrub contains licorice & homegrown turmeric that helps revive the natural glow, removes excess oil & dirt without drying the skin."
      }
    ],
    "id": "face-care"
  },
  {
    "title": "Body & Foot Wraps",
    "intro": "Our Body & Foot Wraps offer a luxurious and indulgent experience that can improve the health and appearance of your skin while providing relaxation and stress relief. Whether you're looking to detoxify, hydrate, or rejuvenate your body or feet. It is a natural therapy for Eliminating Body Toxins. In Addition Our body wraps are made of natural materials such as mud, clay or other organic ingredients.",
    "items": [
      {
        "name": "Detox Mandarin Grapefruit Wrap",
        "text": "Combination of Vitamin C rich Mandarin and Grapefruit oil that brightens the skin, smoothes out fine lines and wrinkles. It includes powerful nutrients such as vitamins C and E, as well as antioxidants which strip away dead skin cells to leave your complexion smooth and even."
      },
      {
        "name": "Orange Wrap",
        "text": "This orange oil based wrap softens the skin, prevents drying of the skin, and normalizes fat metabolism. It perfectly helps to get rid of cellulite, its active acids that remove toxins and excess liquid from skin cells. A great tonic and source of Vitamin C."
      },
      {
        "name": "Divine Chocolate Wrap",
        "text": "This Divine and Sin-less chocolate body wrap rich in antioxidants which keeps your looking supple and young. The combined benefits detoxify, tone, soften the skin and uplift you with the aromatic characteristics of high-quality chocolate."
      },
      {
        "name": "Wine Body Wrap",
        "text": "The tantalizing smell of wine makes this an ultra luxurious treatment. This wrap removes dead skin cells, deeply hydrates, firms and soothes skin."
      },
      {
        "name": "Rose Body Wrap",
        "text": "This body wrap contains Rose oil is often referred to as the \"queen of all oils\" because of its lovely aroma and powerful topical properties. Rose is packed with vitamins, minerals and antioxidants that tone, tighten, boost collagen, hydrate skin and help improve the health and appearance."
      },
      {
        "name": "Rose Vanilla Whitening Body Wrap",
        "text": "This creamy scrub is our best seller. The healing, hydrating properties of Rose, antibacterial power of Vanilla and cellular repair property of Vitamin E essential oils gently scrub while enhance your skin complexion."
      },
      {
        "name": "Lavender Ylang Ylang Wrap",
        "text": "Lavender calms and soothes skin and mind while Ylang Ylang helps maintains skin moisture, relaxes tightened muscles. Use this with a combination of heat therapy with the lavender body wrap can relieve menstrual cramps."
      },
      {
        "name": "Kiwi Wrap",
        "text": "This wrap ensures your skin stays hydrated and fresh all day long. It prevents degeneration, premature aging, brightens & moisturizes the skin."
      },
      {
        "name": "Whitening Sandalwood Saffron Wrap",
        "text": "Infused with saffron extract for radiant skin and home-grown organic turmeric for its healing qualities. This wrap will leave your skin radiant, smooth, shiny and soft. (One of our bestsellers)."
      },
      {
        "name": "Gojiberry Vanilla Body & Foot Masque",
        "text": "Ultimate care for the feet! Will brighten, dull, tanned and damaged feet whilst removing impurities from the skin. Will detan and detox feet."
      }
    ],
    "id": "body-foot-wraps"
  },
  {
    "title": "Essential Oil Blends",
    "intro": "Our essential oil blends are carefully crafted combinations of pure essential oils designed to create a relaxing, rejuvenating, and spa-like atmosphere. These blends are often used in anti-ageing,aromatherapy diffusers, massage oils, bath salts, or room sprays to enhance the spa experience and promote physical and mental well-being.",
    "items": [
      {
        "name": "Floral Romance",
        "text": "Blend of Lavender and Rose oil. This blend can help introduce a sense of calm and serenity."
      },
      {
        "name": "Lemongrass",
        "text": "Lemongrass is known for its beauty benefits and as a skin detoxifier it has a high concentration of key vitamins such as A, B1, B2, B3, B5, B6, folate, and vitamin C, minerals such as magnesium, phosphorus, potassium, calcium, zinc, and iron."
      },
      {
        "name": "Rosemary",
        "text": "Rosemary Oil helps clear 'brain fog'. It also has great antioxidant and anti-inflammatory properties. It is great to use few drops in the jacuzzi or warm bath to improve blood circulation and reduce muscle fatigue"
      },
      {
        "name": "Ylang Ylang",
        "text": "Ylang Ylang is anti-inflammatory, anti-ageing, heals wounds and also can be added to a hair oil base to improve hair shine and split ends."
      },
      {
        "name": "Citrus Bliss",
        "text": "Blend of Orange, Mandarin, Lemon & Rose Oil. This blend helps positively affect mood and bring freshness. This blend can also be used in massage oil base or a base or as bath to infuse some Vitamin C in the skin and improve blood circulation."
      },
      {
        "name": "Anti Mosquito",
        "text": "Blend of Lemongrass and Citronella. Few drops of this blend in closed spaces can help keep mosquitoes at bay."
      }
    ],
    "id": "essential-oil-blends"
  }
];
