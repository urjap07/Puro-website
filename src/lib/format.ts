export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Certifications we show customers. "FDA Approved" is held back until it is
 * confirmed — the US FDA does not approve cosmetics, so the claim is a risk.
 */
const HIDDEN_CLAIMS = ["FDA Approved"];

export function displayCertifications(certifications: string[]) {
  return certifications.filter((claim) => !HIDDEN_CLAIMS.includes(claim));
}
