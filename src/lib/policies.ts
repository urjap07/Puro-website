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
  /** True when the wording is the brand's real policy (no "being finalised" notice). */
  final?: boolean;
  sections: PolicySection[];
}

const { maharashtra, india, international } = DELIVERY_ZONES;

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
          `If your parcel arrives damaged or something is missing, call ${SITE.phone} or email ${SITE.ordersEmail} within 24 hours of receiving it, with photos of the parcel and products. See our Return & Refund Policy for details.`,
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "returns",
    title: "Return & Refund Policy",
    short: "Returns & refunds",
    description: "Refunds, damaged or faulty products, and cancelling an order with Puro Body & Soul.",
    intro: "Puro Body & Soul deeply cares about customer experience and continuously strives to improve customer support.",
    final: true,
    sections: [
      {
        id: "refunds",
        heading: "Refunds",
        body: [
          "Given the nature of the products, which are used for personal hygiene, and considering that opened products cannot be reused, we cannot accept any refund requests.",
        ],
      },
      {
        id: "damaged",
        heading: "Damaged, faulty or quality issues",
        body: [
          `In case of any problem, damage or quality issue, give us a call or email us within 24 hours of receiving the product. You can reach us on ${SITE.phone} or ${SITE.ordersEmail}.`,
          "Please keep the product and its packaging, and share photos of the parcel and product if you can — it helps us put things right quickly.",
        ],
      },
      {
        id: "cancel",
        heading: "Cancellation policy",
        body: [`For cancellation of your order, please contact us by email at ${SITE.ordersEmail}.`],
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
    intro: "This website is operated by SHRAMIK NAARI SANGH – PURO. Throughout the site, the terms “we”, “us” and “our” refer to Puro Body & Soul. By using this website or placing an order, you agree to these terms.",
    final: true,
    sections: [
      {
        id: "online-store-terms",
        heading: "Online Store Terms",
        body: [
          "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are above the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.",
          "You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).",
          "You must not transmit any worms or viruses or any code of a destructive nature.",
          "A breach or violation of any of the Terms will result in an immediate termination of your Services",
        ],
      },
      {
        id: "general-conditions",
        heading: "General Conditions",
        body: [
          "We reserve the right to refuse service to anyone for any reason at any time.",
          "You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.",
          "You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.",
          "The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms",
        ],
      },
      {
        id: "accuracy-and-completeness",
        heading: "Accuracy and Completeness",
        body: [
          "We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information. Any reliance on the material on this site is at your own risk.",
          "This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site",
        ],
      },
      {
        id: "services-and-prices",
        heading: "Services and Prices",
        body: [
          "Prices for our products are subject to change without notice.",
          "We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.",
          "We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service",
        ],
      },
      {
        id: "products-or-services",
        heading: "Products or Services",
        body: [
          "Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.",
          "We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor’s display of any color will be accurate.",
          "We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time. Any offer for any product or service made on this site is void where prohibited.",
          "We take utmost care to ensure that the products and services are premium quality, however, we do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected",
        ],
      },
      {
        id: "billing-and-account-information",
        heading: "Billing and Account Information",
        body: [
          "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e-mail and/or billing address/phone number provided at the time the order was made. We do accept bulk orders but we reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers or distributors that are fake or fraudulent.",
          "You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.",
          "For more detail, please see our Return & Refund Policy",
        ],
      },
      {
        id: "optional-tools",
        heading: "Optional Tools",
        body: [
          "We may provide you with access to third-party tools over which we neither monitor nor have any control nor input.",
          "You acknowledge and agree that we provide access to such tools ”as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.",
          "Any use by you of optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).",
          "We may also, in the future, offer new services and/or features through the website (including, the release of new tools and resources). Such new features and/or services shall also be subject to these Terms of Service",
        ],
      },
      {
        id: "third-party-links",
        heading: "Third-Party Links",
        body: [
          "Certain content, products and services available via our Service may include materials from third-parties.",
          "Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or for any other materials, products, or services of third-parties.",
          "We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party’s policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products should be directed to the third-party",
        ],
      },
      {
        id: "errors-inaccuracies-and-omissions",
        heading: "Errors, Inaccuracies and Omissions",
        body: [
          "Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice (including after you have submitted your order).",
          "We undertake no obligation to update, amend or clarify information in the Service or on any related website, including without limitation, pricing information, except as required by law. No specified update or refresh date applied in the Service or on any related website, should be taken to indicate that all information in the Service or on any related website has been modified or updated",
        ],
      },
      {
        id: "prohibited-uses",
        heading: "Prohibited Uses",
        body: [
          "All intellectual property on the website and the material or information it contains including without limitation copyright, designs, database rights and trademarks (registered or unregistered) are and shall remain the property of Puro Body & Soul or its third party licensors.",
          "Commercial use or publication of all or any item displayed on the site without authorization from Puro Body & Soul is strictly prohibited. Nothing contained in these Terms and Conditions shall be construed as conferring any licensee the right by Puro Body & Soul to use any item displayed.",
          "In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Service or of any related website, other websites, or the Internet; (h) to collect or track the personal information of others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral purpose; or (k) to interfere with or circumvent the security features of the Service or any related website, other websites, or the Internet. We reserve the right to terminate your use of the Service or any related website for violating any of the prohibited uses",
        ],
      },
      {
        id: "disclaimer-of-warranties",
        heading: "Disclaimer of Warranties",
        body: [
          "We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free.",
          "We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable.",
          "You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you.",
          "You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided ‘as is’ and ‘as available’ for your use, without any representation, warranties or conditions of any kind, either express or implied, including all implied warranties or conditions of merchantability, merchantable quality, fitness for a particular purpose, durability, title, and non-infringement",
        ],
      },
      {
        id: "limitation-of-liability",
        heading: "Limitation of Liability",
        body: [
          "In no case shall Puro Body & Soul, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind, including, without limitation lost profits, lost revenue, lost savings, loss of data, replacement costs, or any similar damages, whether based in contract, tort (including negligence), strict liability or otherwise, arising from your use of any of the service or any products procured using the service, or for any other claim related in any way to your use of the service or any product, including, but not limited to, any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of the service or any content (or product) posted, transmitted, or otherwise made available via the service, even if advised of their possibility. Because some states or jurisdictions do not allow the exclusion or the limitation of liability for consequential or incidental damages, in such states or jurisdictions, our liability shall be limited to the maximum extent permitted by law.",
        ],
      },
      {
        id: "severability",
        heading: "Severability",
        body: [
          "In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.",
        ],
      },
      {
        id: "termination",
        heading: "Termination",
        body: [
          "The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes.",
          "These Terms of Service are effective unless and until terminated by either you or us. You may terminate these Terms of Service at any time by notifying us that you no longer wish to use our Services, or when you cease using our site.",
          "If in our sole judgment you fail, or we suspect that you have failed, to comply with any term or provision of these Terms of Service, we also may terminate this agreement at any time without notice and you will remain liable for all amounts due up to and including the date of termination; and/or accordingly may deny you access to our Services (or any part thereof).",
        ],
      },
      {
        id: "entire-agreement",
        heading: "Entire Agreement",
        body: [
          "The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.",
          "These Terms of Service and any policies or operating rules posted by us on this site or in respect to The Service constitutes the entire agreement and understanding between you and us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).",
          "Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party",
        ],
      },
      {
        id: "governing-law",
        heading: "Governing Law",
        body: [
          "These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India and jurisdiction of Mumbai, Maharashtra",
        ],
      },
      {
        id: "changes-to-terms-of-service",
        heading: "Changes to Terms of Service",
        body: [
          "You can review the most current version of the Terms of Service at any time at this page.",
          "We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. Your continued use of or access to our website or the Service following the posting of any changes to these Terms of Service constitutes acceptance of those changes",
        ],
      },
      {
        id: "personal-information",
        heading: "Personal Information",
        body: [
          "Your submission of personal information through the store is governed by our Privacy Policy",
        ],
      },
      {
        id: "contact-information",
        heading: "Contact Information",
        body: [
          "Questions about the Terms of Service should be sent to us at puro@sanisa.co.in.",
        ],
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
        body: ["This website links to other sites, such as Instagram, Facebook and Google Maps. We aren't responsible for their content or how they handle your information."],
      },
    ],
  },
];

export const getPolicy = (slug: string) => POLICIES.find((policy) => policy.slug === slug);
