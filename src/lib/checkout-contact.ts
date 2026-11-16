import { z } from "zod";

/** Contact details at checkout; shared by the checkout form and the server. */
export const ContactSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email for order updates.").email("That email doesn't look right.").max(120),
});
