import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/delivery-rules";
import { SITE } from "@/lib/site";

/**
 * The policy pages (/policies/…), as content the team can edit without
 * touching the page code.
 *
 * Anything marked PLACEHOLDER is dummy text written for now. These are
 * legal pages: have the final wording reviewed before launch, then set
 * POLICIES_DRAFT to false to remove the "being finalised" notice.
 */

/** Shows a "We're finalising this policy" notice on every policy page. */
export const POLICIES_DRAFT = true;

/** PLACEHOLDER — the date the final policies take effect. */
export const POLICIES_UPDATED = "18 November 2026";

export type Block = string | { list: string[] };

export interface PolicySection {
  id: string;
  heading: string;
  body: Block[];
  /** True when this section is dummy text awaiting the real policy. */
  placeholder?: boolean;
}

export interface Policy {
  slug: "shipping" | "returns" | "privacy" | "terms" | "disclaimer";
  title: string;
  /** Short name for links. */
  short: string;
  description: string;
  intro: string;
  sections: PolicySection[];
}

const { maharashtra, india, international } = DELIVERY_ZONES;
const contactLine = `email ${SITE.email}, call ${SITE.phone}, or write to ${SITE.address.join(", ")}`;

export const POLICIES: Policy[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "shipping",
    title: "Shipping Policy",
    short: "Shipping",
    description: "Where we deliver, how long it takes, delivery charges and what happens after your order ships.",
    intro: "We ship from Sudhagad, Maharashtra to addresses across India and abroad. Here's what to expect once you've ordered.",
    sections: [
      {
        id: "where",
        heading: "Where we deliver",
        body: [
          "We deliver to serviceable pincodes across India, and to selected countries abroad. Enter your pincode on any product page or in your bag to check delivery to your address.",
          "We can't deliver to Army Post Office (APO) addresses or PO boxes.",
        ],
      },
      {
        id: "times",
        heading: "Delivery times",
        body: [
          "Delivery times are counted from the day your order is placed:",
          {
            list: [
              `${maharashtra.label}: ${maharashtra.min}–${maharashtra.max} days`,
              `${india.label}: ${india.min}–${india.max} days`,
              `${international.label}: ${international.min}–${international.max} days`,
            ],
          },
          "Remote areas, public holidays, weather and courier delays can occasionally add a day or two. We'll let you know if your order is held up.",
        ],
      },
      {
        id: "charges",
        heading: "Delivery charges",
        body: [
          `Delivery is free on orders of ₹${FREE_DELIVERY_THRESHOLD} or more within India. Orders below ₹${FREE_DELIVERY_THRESHOLD} have a delivery charge of ₹${STANDARD_DELIVERY_FEE}, shown at checkout before you pay.`,
          "International shipping is charged at checkout and depends on the destination and parcel weight. Any customs duties or import taxes charged by the destination country are paid by the recipient.",
        ],
        placeholder: true, // PLACEHOLDER — the fee below ₹500 and international rates aren't decided.
      },
      {
        id: "dispatch",
        heading: "Dispatch and tracking",
        body: [
          "Orders are packed and handed to our courier partner within 1–2 working days. Once your order ships, we'll email you a tracking link.",
          "Orders placed on Sundays and public holidays are dispatched the next working day.",
        ],
        placeholder: true, // PLACEHOLDER — confirm dispatch times and the courier partner.
      },
      {
        id: "cod",
        heading: "Cash on delivery",
        body: [
          "Cash on delivery will be available on eligible pincodes. Please keep the exact amount ready, or pay the delivery partner by UPI.",
        ],
        placeholder: true, // PLACEHOLDER — confirm once payments are set up.
      },
      {
        id: "failed",
        heading: "If a delivery doesn't go through",
        body: [
          "Our courier will try to deliver up to three times. If the parcel can't be delivered — for example because the address is incomplete or nobody is available — it's returned to us and we'll contact you to arrange re-delivery. A second delivery charge may apply.",
        ],
        placeholder: true, // PLACEHOLDER — confirm the re-delivery rules.
      },
      {
        id: "damaged",
        heading: "Damaged or missing items",
        body: [
          `If your parcel arrives damaged or something is missing, email ${SITE.ordersEmail} within 48 hours of delivery with your name, the phone number you ordered with and photos of the parcel and products. See our Returns & Refunds policy for what happens next.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the reporting window.
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "returns",
    title: "Return & Refund Policy",
    short: "Returns & refunds",
    description: "Returning a product, damaged or wrong items, cancellations and how refunds are made.",
    intro: "We want you to love every ritual. If something isn't right, here's how we'll put it right.",
    sections: [
      {
        id: "hygiene",
        heading: "Opened products",
        body: [
          "For hygiene and safety, we can't accept returns of skincare, body care or hair care products that have been opened, used or had their seal broken — unless the product arrived damaged, defective or wasn't what you ordered.",
        ],
        placeholder: true, // PLACEHOLDER — confirm the returns policy.
      },
      {
        id: "unopened",
        heading: "Returning unopened products",
        body: [
          "You can return unopened products in their original packaging within 7 days of delivery.",
          `To start a return, email ${SITE.ordersEmail} with your name, the phone number you ordered with and the products you'd like to return. We'll reply with the return address or arrange a pickup. Return shipping for change-of-mind returns is paid by you.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the return window and who pays return shipping.
      },
      {
        id: "damaged",
        heading: "Damaged, defective or wrong items",
        body: [
          `If an item arrives damaged, leaking, defective or isn't what you ordered, email ${SITE.ordersEmail} within 48 hours of delivery with photos of the parcel and product. We'll send a free replacement or a full refund, whichever you prefer — you won't need to send the item back unless we ask.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the process.
      },
      {
        id: "gift-sets",
        heading: "Gift sets",
        body: ["Gift sets can be returned only as a complete, unopened set. Individual items from a set can't be returned separately unless they arrived damaged."],
        placeholder: true, // PLACEHOLDER — confirm.
      },
      {
        id: "cancel",
        heading: "Cancelling an order",
        body: [
          `You can cancel an order any time before it ships — email ${SITE.ordersEmail} or call us as soon as possible. Once an order has shipped it can't be cancelled, but you can return unopened products as described above.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the cancellation window.
      },
      {
        id: "refunds",
        heading: "How refunds are made",
        body: [
          "Once your return is received and checked, or a damaged-item claim is approved, we'll email you to confirm. Refunds go back to your original payment method within 5–7 working days. Refunds for cash-on-delivery orders are made by bank transfer or UPI to an account you nominate.",
          "Original delivery charges are refunded only when the item was damaged, defective or wrong.",
        ],
        placeholder: true, // PLACEHOLDER — confirm the refund timeline and method.
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "privacy",
    title: "Privacy Policy",
    short: "Privacy",
    description: "What personal information PURO Body & Soul collects, why, where it's kept and the choices you have.",
    intro: `This policy explains how ${SITE.name}, a division of ${SITE.organisation} ("we", "us"), handles your personal information when you use this website. We collect only what we need to serve you, and we never sell it.`,
    sections: [
      {
        id: "collect",
        heading: "What we collect",
        body: [
          "We collect information you give us:",
          {
            list: [
              "Your name, email address, phone number and delivery address when you place an order or save them to your account.",
              "Your email address when you join the Puro Letter.",
              "Your name, email, phone number and message when you write to us through the contact form.",
              "Your pincode when you check delivery to your area.",
            ],
          },
          "We don't use cookies to track you, and this website doesn't currently use advertising or analytics tools.",
        ],
      },
      {
        id: "device",
        heading: "Information kept on your device",
        body: [
          "To make shopping easy without an account, some things are saved only in your browser, on your device: your bag, wishlist, recently viewed products, delivery pincode, and the profile and addresses you choose to save. They stay on your device until you clear them — use \"Forget my details on this device\" on your account page, or clear your browser's site data.",
        ],
      },
      {
        id: "use",
        heading: "How we use it",
        body: [
          {
            list: [
              "To process, deliver and support your orders, and to contact you about them.",
              "To reply to your messages.",
              "To send the Puro Letter, if you've joined it. You can unsubscribe at any time.",
              "To check pincodes and work out delivery times.",
              "To keep the website secure and prevent fraud.",
              "To meet our legal and tax obligations.",
            ],
          },
        ],
      },
      {
        id: "share",
        heading: "Who we share it with",
        body: [
          "We share information only with the services that help us run the website and deliver your orders:",
          {
            list: [
              "Formspree, which delivers contact-form messages and newsletter sign-ups to us.",
              "India Post's public pincode service, to look up the area for a pincode you enter (only the pincode is sent).",
              "Our courier partners, who receive your name, phone number and delivery address to deliver your order.",
              "Our payment partner, once online payment opens, to process payments securely. We never see or store your card details.",
            ],
          },
          "We may also share information when the law requires it. We don't sell or rent your personal information to anyone.",
        ],
        placeholder: true, // PLACEHOLDER — add the courier and payment partners by name once chosen.
      },
      {
        id: "keep",
        heading: "How long we keep it",
        body: [
          "We keep order records for as long as the law requires for tax and accounting (usually 8 years). We keep messages and newsletter sign-ups until you ask us to delete them or unsubscribe.",
        ],
        placeholder: true, // PLACEHOLDER — confirm retention periods.
      },
      {
        id: "rights",
        heading: "Your choices and rights",
        body: [
          `You can ask us to see, correct or delete the personal information we hold about you, or withdraw your consent to the Puro Letter, at any time. Write to ${SITE.email} and we'll respond within 30 days.`,
        ],
      },
      {
        id: "children",
        heading: "Children",
        body: ["This website is meant for adults. We don't knowingly collect personal information from anyone under 18."],
      },
      {
        id: "grievance",
        heading: "Grievance officer",
        body: [
          "If you have a concern about how your information is handled, please contact our Grievance Officer:",
          { list: ["Name: [Grievance Officer's name]", `Email: ${SITE.email}`, `Phone: ${SITE.phone}`, `Address: ${SITE.address.join(", ")}`] },
          "We'll acknowledge your complaint within 48 hours and aim to resolve it within 30 days.",
        ],
        placeholder: true, // PLACEHOLDER — name the Grievance Officer.
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        body: ["We may update this policy from time to time. The latest version is always on this page, with the date it was last updated."],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "terms",
    title: "Terms and Conditions",
    short: "Terms",
    description: "The terms that apply when you use the PURO Body & Soul website and buy from us.",
    intro: `These terms apply to your use of this website and to any order you place with ${SITE.name}, a division of ${SITE.organisation}. By using the website or placing an order, you agree to them.`,
    sections: [
      {
        id: "about",
        heading: "About us",
        body: [`${SITE.name} is a division of ${SITE.organisation}, ${SITE.address.slice(1).join(", ")}. You can reach us by ${contactLine}.`],
      },
      {
        id: "products",
        heading: "Products and descriptions",
        body: [
          "We describe our products, ingredients and sizes as accurately as we can. Colours and textures may look slightly different on screen, and packaging may change from time to time.",
          "Our products are for external use only. Please read the ingredients and directions on each product page and pack, and do a patch test before first use. They aren't intended to diagnose, treat or cure any medical condition.",
        ],
      },
      {
        id: "prices",
        heading: "Prices",
        body: [
          "All prices are in Indian rupees (₹) and include applicable taxes. Delivery charges, if any, are shown at checkout before you pay.",
          "Prices and availability can change without notice. The price you pay is the one confirmed at checkout. If a product is listed at a clearly wrong price because of an error, we may cancel the order and refund you in full.",
        ],
      },
      {
        id: "orders",
        heading: "Orders",
        body: [
          "Placing an order is an offer to buy. We'll confirm your order by email; the contract between us is formed when we dispatch it. We may decline or cancel an order — for example if a product is out of stock, the address can't be served, or we suspect fraud — and we'll refund anything you've paid.",
          "Online ordering is being set up and will open soon.",
        ],
        placeholder: true, // PLACEHOLDER — update once payments are live.
      },
      {
        id: "payment",
        heading: "Payment",
        body: [
          "Online payments will be processed securely by our payment partner. We don't see or store your card details. Cash on delivery will be available on eligible pincodes.",
        ],
        placeholder: true, // PLACEHOLDER — name the payment partner once set up.
      },
      {
        id: "delivery-returns",
        heading: "Delivery, returns and refunds",
        body: ["Delivery is covered by our Shipping Policy, and returns, cancellations and refunds by our Return & Refund Policy. Both form part of these terms."],
      },
      {
        id: "use",
        heading: "Using the website",
        body: [
          "Please don't misuse the website — for example by trying to break into it, interfering with how it works, or using it for anything unlawful. Text, photographs, logos and designs on this website belong to PURO Body & Soul and may not be copied or used without our permission.",
        ],
      },
      {
        id: "liability",
        heading: "Our responsibility to you",
        body: [
          "We're responsible for losses you suffer that are a foreseeable result of us breaking these terms. To the extent the law allows, our total liability for any order is limited to the amount you paid for it. Nothing in these terms limits your rights under the Consumer Protection Act, 2019.",
        ],
        placeholder: true, // PLACEHOLDER — have this reviewed by a lawyer.
      },
      {
        id: "law",
        heading: "Governing law",
        body: ["These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of the courts at [city], Maharashtra."],
        placeholder: true, // PLACEHOLDER — choose the jurisdiction.
      },
      {
        id: "contact",
        heading: "Questions and complaints",
        body: [`If you have a question or complaint, ${contactLine}. Our Grievance Officer's details are in our Privacy Policy.`],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "disclaimer",
    title: "Disclaimer",
    short: "Disclaimer",
    description: "Important information about product use, ingredient descriptions and the skincare finder.",
    intro: "Please read this before using our products or the information on this website.",
    sections: [
      {
        id: "advice",
        heading: "Not medical advice",
        body: [
          "The information on this website — including product descriptions, ingredient explanations, concern pages and the skincare finder — is for general information only. It isn't medical advice and isn't a substitute for advice from a dermatologist or doctor. Our products aren't intended to diagnose, treat, cure or prevent any disease.",
        ],
      },
      {
        id: "patch-test",
        heading: "Patch test and sensitive skin",
        body: [
          "Every skin is different. Before using a product for the first time, apply a small amount to your inner arm and wait 24 hours. Stop using any product that causes redness, itching or irritation, and seek medical advice if it doesn't settle. If you're pregnant, breastfeeding, have a skin condition or allergies, please check with your doctor first.",
          "Our products are for external use only. Avoid contact with the eyes, and keep them out of the reach of children.",
        ],
      },
      {
        id: "results",
        heading: "Results",
        body: [
          "Results vary from person to person and depend on skin type, routine and other factors. Customer reviews reflect individual experiences and aren't a guarantee of results.",
        ],
      },
      {
        id: "finder",
        heading: "The skincare finder",
        body: [
          "The skincare finder suggests products based on the concerns each formula was designed for and the answers you give. It's a guide to discovery — not a diagnosis or a personalised treatment plan.",
        ],
      },
      {
        id: "accuracy",
        heading: "Accuracy of information",
        body: [
          "We work hard to keep the information on this website accurate and up to date, but occasional errors can happen. Always read the label on the product you receive, which is the final reference for ingredients and directions.",
        ],
      },
      {
        id: "links",
        heading: "Links to other websites",
        body: ["This website links to other sites, such as Instagram, Facebook, WhatsApp and Google Maps. We aren't responsible for their content or how they handle your information."],
      },
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((policy) => policy.slug === slug);
