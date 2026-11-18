import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/delivery-rules";
import { SITE } from "@/lib/site";
import { ORDERS_ENABLED } from "@/lib/orders-config";

/**
 * Content for the Contact and FAQ pages, in one place so the team can edit
 * it without touching the pages.
 *
 * Anything marked PLACEHOLDER is dummy text written for now — the real
 * policy or detail hasn't been confirmed yet. Search for "PLACEHOLDER" to
 * find every one before launch.
 */

/**
 * Ask customers for their order number on the contact form and in the FAQs —
 * only once orders can be placed on the site (lib/orders-config.ts). Every
 * order then gets one (e.g. PURO-261117-7K3Q), shown on its confirmation page
 * and under "Your orders" on the account page.
 */
export const ASK_ORDER_NUMBER = ORDERS_ENABLED;

/** How we ask customers to identify their order. */
const ORDER_REF = ASK_ORDER_NUMBER
  ? "your order number (or, for phone orders, the name and phone number you ordered with)"
  : "the name and phone number or email you ordered with";

const FREE_DELIVERY = FREE_DELIVERY_THRESHOLD;
const { maharashtra, india, international } = DELIVERY_ZONES;

export const CONTACT = {
  /** PLACEHOLDER — confirm the hours the team answers calls. */
  hours: "Monday to Saturday, 10 am – 6 pm IST",
  /** PLACEHOLDER — confirm how quickly the team replies. */
  replyTime: "We reply within 1–2 working days.",
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address.slice(1).join(", "))}`,
};

/** Topics for the contact form; each one routes the message for the team. */
export const CONTACT_TOPICS = [
  "An order I've placed",
  "A product or ingredient question",
  "Corporate gifting or wholesale",
  "Press or collaborations",
  "Something else",
] as const;

export interface Faq {
  q: string;
  /** Paragraphs of the answer. */
  a: string[];
  /** True when the answer is dummy text awaiting the real policy. */
  placeholder?: boolean;
}

export interface FaqSection {
  id: string;
  title: string;
  items: Faq[];
}

export const FAQ: FaqSection[] = [
  {
    id: "orders-delivery",
    title: "Orders & delivery",
    items: [
      ...(ORDERS_ENABLED
        ? [
            {
              q: "Where do I find my order number?",
              a: [
                "You'll see it as soon as you place your order — it looks like PURO-261117-7K3Q — on your order confirmation page. It's also saved under \"Your orders\" on your account page on the device you ordered from.",
              ],
            },
          ]
        : []),
      {
        q: "How long will my order take to arrive?",
        a: [
          `Orders within Maharashtra arrive in ${maharashtra.min}–${maharashtra.max} days, and across the rest of India in ${india.min}–${india.max} days. Add your pincode on any product page or in your bag to see exact dates for your address.`,
        ],
      },
      {
        q: "Is delivery free?",
        a: [`Delivery is free on orders over ₹${FREE_DELIVERY} anywhere in India.`],
      },
      {
        q: "How much does delivery cost on smaller orders?",
        a: [`Orders under ₹${FREE_DELIVERY} have a delivery charge of ₹${STANDARD_DELIVERY_FEE}, shown at checkout.`],
        placeholder: true, // PLACEHOLDER — the fee (STANDARD_DELIVERY_FEE in lib/delivery-rules.ts) hasn't been decided.
      },
      {
        q: "Do you ship outside India?",
        a: [
          `Yes. International orders usually arrive in ${international.min}–${international.max} days. Shipping is charged at checkout and depends on the destination.`,
        ],
      },
      {
        q: "How do I track my order?",
        a: [`Once your order ships, we'll email you a tracking link. You can also write to us with ${ORDER_REF} and we'll check for you.`],
        placeholder: true, // PLACEHOLDER — tracking arrives with the shipping partner in Release 2.
      },
      {
        q: "Can I change or cancel my order?",
        a: [`To cancel, email ${SITE.ordersEmail} with ${ORDER_REF}. To change an order, contact us as soon as you can and we'll do our best to help.`],
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        q: "How do I pay?",
        a: [
          ORDERS_ENABLED
            ? "Right now you pay on delivery: place your order at checkout, and pay the delivery partner in cash or by UPI when it arrives. Online payment by UPI, cards and net banking is opening soon."
            : "Secure payment is opening soon. Until then you can fill your bag, add your address and check delivery dates at checkout — your bag stays saved on this device.",
        ],
      },
      {
        q: "Which online payment methods will you accept?",
        a: ["UPI, credit and debit cards, net banking and popular wallets, all through a secure payment partner."],
        placeholder: true, // PLACEHOLDER — confirm once Razorpay and COD are set up.
      },
      {
        q: "Are the prices inclusive of tax?",
        a: ["Yes. Every price on the site includes all taxes."],
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & refunds",
    items: [
      {
        q: "Can I return a product?",
        a: [
          "As our products are used for personal hygiene and opened products can't be reused, we can't accept returns or refund requests.",
        ],
      },
      {
        q: "My order arrived damaged or something is wrong. What do I do?",
        a: [
          `We're sorry! Please call us on ${SITE.phone} or email ${SITE.ordersEmail} within 24 hours of receiving your order, ideally with a photo of the parcel and product, and we'll put it right.`,
        ],
      },
      {
        q: "How do I cancel an order?",
        a: [`Email ${SITE.ordersEmail} with ${ORDER_REF} and we'll take care of it.`],
      },
    ],
  },
  {
    id: "products",
    title: "Products & ingredients",
    items: [
      {
        q: "Are your products cruelty-free?",
        a: ["Yes. PURO is cruelty-free and PETA certified, and our products are dermatologically tested and made in a GMP-certified facility."],
      },
      {
        q: "Which product is right for my skin?",
        a: [
          "Take our skincare finder — four quick questions and it suggests formulas, or a full ritual, for your face, body or hair. You can also browse by concern, such as dry skin or tan removal.",
        ],
      },
      {
        q: "Where can I see the full ingredient list?",
        a: [
          "Every product page lists its key ingredients and full ingredient list. Our ingredient library explains the role each key botanical plays and which formulas it's in.",
        ],
      },
      {
        q: "How long do the products last?",
        a: [
          "Our formulas have a shelf life of 18 to 24 months from the date of manufacture — the exact figure is on each product page and on the pack. Store them in a cool, dry place away from direct sunlight.",
        ],
      },
      {
        q: "I have sensitive skin. Can I use PURO?",
        a: [
          "Our products are dermatologically tested, but every skin is different. We recommend a patch test on your inner arm 24 hours before first use. If you have a skin condition, please check with your dermatologist.",
        ],
      },
    ],
  },
  {
    id: "face-care",
    title: "Face care",
    items: [
      { q: "How do I get rid of blackheads?", a: ["Exfoliate 2 times a week with a gentle walnut and rice scrub."] },
      { q: "What is the best way to remove makeup?", a: ["For a thorough makeup removal routine, start with double cleansing. First, use a face wash lotion on dry skin to dissolve makeup, then rinse with lukewarm water. Follow with a mild face cleanser to remove any remaining residue. After cleansing, gently exfoliate with a scrub suitable for your skin type, using circular motions to clear away dead skin cells. Finish by applying a toner to balance your skin’s pH and remove any lingering impurities. This process ensures a clean, refreshed complexion."] },
      { q: "How can I minimize pores?", a: ["To minimize pores using natural products, incorporate clay masks with aloe vera, and licorice extract into your routine. Clay masks, such as those made with bentonite or kaolin, help absorb excess oil and impurities, reducing pore appearance. Apply a clay mask once a week for best results. Aloe vera has soothing and astringent properties that can tighten pores; apply fresh aloe vera gel to your face, leave it on for 10-15 minutes, and rinse with lukewarm water. Additionally, licorice extract can brighten skin and diminish pore size; use products containing licorice extract or mix a few drops with your moisturizer. These natural remedies can help refine your skin and reduce pore visibility."] },
      { q: "What is double cleansing?", a: ["Double cleansing involves using an oil-based cleanser to remove makeup and sunscreen, followed by a water-based cleanser to clean the skin."] },
      { q: "How can I get glowing skin?", a: ["Maintain a consistent skincare routine, exfoliate regularly, use products with vitamin C, and stay hydrated."] },
      { q: "What causes dark circles under the eyes?", a: ["Factors include genetics, lack of sleep, allergies, and aging."] },
      { q: "How do I choose the right moisturizer for my skin type?", a: ["Oily skin: lightweight, soothing, hydrating gel. Dry skin: rich, hydrating cream. Combination skin: balancing moisturizer."] },
      { q: "What is the best treatment for wrinkles?", a: ["For treating wrinkles with natural products, consider using aloe vera, essential oils with vitamin C, and vitamin E. Aloe vera is excellent for hydrating and improving skin elasticity, which helps reduce the appearance of wrinkles. Essential oils, such as those derived from citrus fruits, provide a natural source of vitamin C, which supports collagen production and brightens the skin. Also protect your skin from sun damage with SPF."] },
      { q: "How can I naturally reduce redness on my face?", a: ["Use products with calming ingredients witch hazel and aloe vera. Avoid harsh skincare products and excessive sun exposure, which can worsen redness."] },
      { q: "What natural ingredients help with oily skin?", a: ["Natural Clays, witch hazel, and aloe vera can help control oil production and soothe the skin. Use a clay mask with ingredients like bentonite or kaolin clay to absorb excess oil. Choose lightweight, non-comedogenic moisturizers or gels to keep skin hydrated without clogging pores."] },
    ],
  },
  {
    id: "skin-care",
    title: "Skin care",
    items: [
      { q: "How can I reduce acne?", a: ["To reduce acne, start by using a gentle cleanser like our [Good Cleanse Face Wash](/products/good-cleanse-face-wash) and maintaining a consistent skincare routine. Keep your routine simple: in the morning, cleanse your face, apply a moisturiser or hydrator such as [Aquench Soothing Hydrogel](/products/aquench-soothing-hydrogel), and finish with sunscreen. In the evening, cleanse again, then use a toner and follow up with a gel or gel cream like [Aqua Riche Night Repair Gel Cream](/products/aqua-riche-night-repair-gel-cream). Avoid touching your face, as this can transfer germs from your hands or mobile phone, leading to breakouts. If you have oily or combination skin that’s prone to acne, use a shower cap and keep oiled hair away from your face. For persistent acne, especially if it's related to hormones or digestion, consult a doctor for further advice."] },
      { q: "What is the best skincare routine for oily skin?", a: ["For oily skin, cleanse daily with a foaming cleanser such as [HydrO'Clock Foaming Facewash](/products/hydroclock-foaming-facewash), followed by a toner. Incorporate a clay mask like [Vita Clay Ubtan Pack](/products/vita-clay-ubtan-pack) and a gentle scrub like [Scrubulush Exfoliator](/products/scrubulush-exfoliator) into your routine once a week to help control excess oil and keep your skin clear."] },
      { q: "How do I get rid of dark spots?", a: ["Incorporate a volcanic clay mask like [Vita Clay Ubtan Pack](/products/vita-clay-ubtan-pack) and natural scrubs with liquorice into your routine once a week, and always apply sunscreen daily to prevent further darkening."] },
      { q: "How often should I exfoliate?", a: ["Exfoliate 2-3 times a week for most skin types, but adjust the frequency based on your skin's sensitivity."] },
      { q: "What is a good anti-aging routine?", a: ["Incorporate a weekly home facial into your routine, using a cleanser, toner, scrub, mask, and a gel or moisturizer suited to your skin type. Never skip applying sunscreen daily to protect your skin from premature aging. For an extra boost, consider incorporating natural ingredients aloe vera. Aloe vera hydrates, boosts collagen production, and provides antioxidant protection, reducing fine lines and wrinkles while soothing and repairing skin for a more youthful appearance."] },
      { q: "What are the benefits of using a toner?", a: ["Toners help balance the skin’s pH, remove residual impurities, and prep the skin for other skin care products."] },
      { q: "How can I treat dry skin?", a: ["For your face, use a gentle, hydrating cleanser, followed by a rich moisturizer. Incorporate products with Aquaxyl and hydrating ingredients like aloe vera gel and glycerin, as well as moisturizers containing natural vegetable oils and butters. For extremely dry or damaged areas on your face and body, apply a natural balm that's free of beeswax and paraffin, formulated with nourishing oils and waxes."] },
      { q: "How do I choose the right sunscreen?", a: ["Look for broad-spectrum protection with at least SPF 30, and choose a formula that suits your skin type (e.g., oil-free for oily skin)."] },
      { q: "What causes sensitive skin?", a: ["Factors include genetic predisposition, environmental stressors, overuse of harsh skincare products, use of skin care products not for your skin type, diet and certain medical conditions."] },
    ],
  },
  {
    id: "body-care",
    title: "Body care",
    items: [
      { q: "What are the benefits of using Epsom salts in a bath?", a: ["Epsom salts can help soothe sore muscles, reduce inflammation, and promote relaxation."] },
      { q: "What are the benefits of taking a bath?", a: ["Baths can help relax muscles, improve circulation, relieve stress, and hydrate the skin."] },
      { q: "How often should I exfoliate my body?", a: ["1-2 times a week, depending on your skin type and sensitivity."] },
      { q: "What is the best way to moisturize after a bath?", a: ["Apply a rich body lotion or oil while your skin is still damp to lock in moisture."] },
      { q: "How do I prevent dry skin on my body?", a: ["Incorporate a gentle, hydrating body wash, avoid hot showers, and apply moisturizer immediately after bathing. For extremely dry or damaged areas on your face and body, apply a natural balm that's free of beeswax and paraffin, formulated with nourishing oils and waxes."] },
      { q: "What is the best way to treat razor burn?", a: ["Use a soothing gel with aloe vera, like [Aquench Soothing Hydrogel](/products/aquench-soothing-hydrogel), avoid shaving over irritated skin, and use a sharp razor."] },
      { q: "How do I choose the right body wash?", a: ["Look for body washes free of harsh sodium lauryl sulphate, silicones and choose one that suits your skin type (e.g., moisturizing for dry skin)."] },
      { q: "How can I naturally improve skin elasticity?", a: ["Use products containing collagen-boosting ingredients like citrus essential oils with natural vitamin C, aquaxyl and apply natural oils to nourish the skin."] },
      { q: "How can I naturally treat cracked heels?", a: ["Soak your feet in warm water with Epsom salt to soften the skin. Exfoliate with a pumice stone and apply a thick moisturizing balm or salve. Wear cotton socks overnight to lock in moisture and heal cracked heels."] },
      { q: "What natural ingredients help with dark elbows and knees?", a: ["Use a natural clay with natural lemon essential oil. Use gentle exfoliants like rice or walnut based scrubs. Hydrate with aloe vera to keep the skin soft and prevent further darkening."] },
    ],
  },
  {
    id: "hair-care",
    title: "Hair care",
    items: [
      { q: "How can I avoid hair fall and breakage?", a: ["To prevent hair fall and breakage, it’s important to maintain a healthy diet and use gentle scalp massages. Avoid excessive heat styling, coloring, and chemical treatments, as these can weaken hair. Shampoo your hair 2-3 times a week based on your hair type, and steer clear of products with silicones that can cause buildup. Additionally, refrain from over-brushing your hair; instead, use a wide-tooth comb to detangle it and regularly trim split ends to keep your hair healthy."] },
      { q: "How often should I wash my hair?", a: ["It depends on your hair type: oily hair may need daily washing, while dry hair might be fine with washing 2-3 times a week."] },
      { q: "What are the benefits of using conditioners?", a: ["Conditioner helps detangle hair, adds moisture, reduces frizz, and improves overall hair texture."] },
      { q: "What causes hair loss?", a: ["Factors include genetics, hormonal changes, stress, poor diet, tying your hair too tightly and certain medical conditions."] },
      { q: "What are the best natural oils for hair?", a: ["Coconut oil, castor oil, Rosemary Essential Oil, Lavender Essential Oil, Ylang Ylang Essential Oil are all excellent for nourishing and strengthening hair."] },
      { q: "How do I treat frizzy hair?", a: ["Use a gentle sulphate-free, silicone-free moisturizing shampoo and conditioner, and avoid washing hair with hot water. Incorporate a natural hair spa or natural oiling routine once or twice a week."] },
      { q: "What is co-washing?", a: ["Co-washing involves washing your hair with conditioner instead of shampoo to retain natural oils and moisture."] },
      { q: "How can I naturally prevent hair breakage?", a: ["Use a leave-in conditioner with natural ingredients like shea butter or argan oil to keep hair hydrated and strong. Avoid excessive heat styling and use a wide-tooth comb to detangle wet hair. Regularly trim split ends and protect hair from environmental damage with a silk scarf or hat."] },
      { q: "What natural ingredients can I use to condition my hair?", a: ["Castor oil, coconut oil and pea proteins are excellent natural conditioners. Apply these ingredients as a hair mask and leave them on for 30 minutes before rinsing. These natural conditioners provide deep hydration, nourishment, and shine to the hair."] },
      { q: "How can I reduce scalp dryness naturally?", a: ["Massage your scalp with oils like virgin coconut oil to moisturize and reduce dryness. Use a shampoo and conditioners with silicone free, soothing ingredients like aloe vera. Avoid using hot water to wash your hair, as it can strip natural oils and worsen dryness."] },
      { q: "What’s the best natural remedy for frizzy hair?", a: ["Apply a natural hair masque or oils to the length of your hair with ingredients such as virgin coconut oil or ylang ylang essential oil. These natural ingredients help to smooth the hair cuticle, reduce frizz, and provide moisture. Use silicone free, sulphate free shampoos and avoid using harsh shampoos that can strip hair of its natural oils."] },
    ],
  },
  {
    id: "puro",
    title: "PURO & Sa-Ni-Sa",
    items: [
      {
        q: "Who makes PURO?",
        a: [
          `PURO Body & Soul is a division of ${SITE.organisation}, based in Sudhagad, Maharashtra. Every purchase helps a rural woman live a life of dignity.`,
        ],
      },
      {
        q: "Do you offer corporate gifting or bulk orders?",
        a: [
          "Yes. Our gift sets make thoughtful corporate and festive gifts, and we can put together custom hampers. Choose \"Corporate gifting or wholesale\" on our contact form and tell us what you have in mind.",
        ],
      },
    ],
  },
  {
    id: "account",
    title: "Your account & the Puro Letter",
    items: [
      {
        q: "Do I need an account to shop?",
        a: [
          "No. Your bag, wishlist, profile and addresses are saved in this browser on this device. To clear your details and addresses, use \"Forget my details on this device\" on your account page.",
        ],
      },
      {
        q: "Can I share my wishlist?",
        a: ["Yes. On your wishlist page, choose \"Share list\" to send a link anyone can open."],
      },
      {
        q: "How do I unsubscribe from the Puro Letter?",
        a: [`Write to ${SITE.email} from the address you signed up with, and we'll remove you.`],
      },
    ],
  },
];
