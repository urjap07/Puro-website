import { z } from "zod";

/**
 * Validation for account details and delivery addresses, shared by the
 * browser (forms) and the server (checkout), so both apply the same rules.
 */

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").replace(/^\+?91(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."));

export const ProfileSchema = z.object({
  name: z.string().trim().max(80, "That name is a little long.").optional().or(z.literal("")),
  email: z.string().trim().email("That email doesn't look right.").max(120).optional().or(z.literal("")),
  phone: phone.optional().or(z.literal("")),
});
export type Profile = { name: string; email: string; phone: string };

export const AddressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  fullName: z.string().trim().min(2, "Please enter the recipient's name.").max(80),
  phone,
  line1: z.string().trim().min(5, "Please enter the house, flat or street.").max(160),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter the city.").max(80),
  state: z.enum(INDIAN_STATES, { message: "Please choose a state." }),
  pincode: z.string().trim().regex(/^[1-8]\d{5}$/, "Enter a valid 6-digit pincode."),
});
export type AddressInput = z.infer<typeof AddressSchema>;
export type Address = AddressInput & { id: string; isDefault: boolean };

