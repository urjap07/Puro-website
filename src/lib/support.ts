import { DELIVERY_ZONES, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from "@/lib/delivery-rules";
import { SITE } from "@/lib/site";

/**
 * Content for the Contact and FAQ pages, in one place so the team can edit
 * it without touching the pages.
 *
 * Anything marked PLACEHOLDER is dummy text written for now — the real
 * policy or detail hasn't been confirmed yet. Search for "PLACEHOLDER" to
 * find every one before launch.
 */

/**
 * Ask customers for their order number on the contact form and in the FAQs.
 * Every order placed on the site gets one (e.g. PURO-261117-7K3Q), shown on
 * its confirmation page and under "Your orders" on the account page. The
 * wording keeps a fallback for orders placed by phone or WhatsApp.
 */
export const ASK_ORDER_NUMBER = true;

/** How we ask customers to identify their order. */
const ORDER_REF = ASK_ORDER_NUMBER
  ? "your order number (or, for phone and WhatsApp orders, the name and phone number you ordered with)"
  : "the name and phone number or email you ordered with";

const FREE_DELIVERY = FREE_DELIVERY_THRESHOLD;
const { maharashtra, india, international } = DELIVERY_ZONES;

export const CONTACT = {
  /** PLACEHOLDER — confirm the hours the team answers calls and WhatsApp. */
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
      {
        q: "Where do I find my order number?",
        a: [
          "You'll see it as soon as you place your order — it looks like PURO-261117-7K3Q — on your order confirmation page. It's also saved under \"Your orders\" on your account page on the device you ordered from.",
        ],
      },
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
        a: [`Orders under ₹${FREE_DELIVERY} have a delivery charge of ₹${STANDARD_DELIVERY_FEE}, shown at checkout before you place your order.`],
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
        a: [
          `Yes, as long as it hasn't shipped yet. Write to ${SITE.ordersEmail} or call us with ${ORDER_REF} as soon as you can, and we'll do our best to help.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the cancellation window.
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
          "Right now you pay on delivery: place your order at checkout, and pay the delivery partner in cash or by UPI when it arrives. Online payment by UPI, cards and net banking is opening soon.",
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
          "For hygiene reasons we can't accept opened skincare. Unopened products in their original packaging can be returned within 7 days of delivery.",
          `To start a return, write to ${SITE.ordersEmail} with ${ORDER_REF}.`,
        ],
        placeholder: true, // PLACEHOLDER — the real return policy is still to be confirmed.
      },
      {
        q: "My order arrived damaged or something is missing. What do I do?",
        a: [
          `We're sorry! Please email ${SITE.ordersEmail} within 48 hours of delivery with ${ORDER_REF}, and a photo of the parcel and product, and we'll send a replacement or refund.`,
        ],
        placeholder: true, // PLACEHOLDER — confirm the damaged-item process.
      },
      {
        q: "How long do refunds take?",
        a: ["Refunds go back to your original payment method within 5–7 working days of the return being approved."],
        placeholder: true, // PLACEHOLDER — confirm the refund timeline.
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
