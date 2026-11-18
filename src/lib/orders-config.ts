/**
 * Can customers place orders yet?
 *
 * Off until the payment gateway (Razorpay, Release 2) is in place. While it's
 * off, the checkout's payment step is locked, /api/orders refuses orders, and
 * nothing on the site mentions order numbers (nobody has one yet).
 *
 * Turn it on and everything built for orders comes back: the payment step's
 * "Place order", the order confirmation page with its order number, "Your
 * orders" on the account page, and the order-number field on the contact form.
 */
export const ORDERS_ENABLED = false;
