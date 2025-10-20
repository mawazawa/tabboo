import { z } from "zod";

export const personalInfoSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  street_address: z.string().trim().max(200, "Address must be less than 200 characters").optional(),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional(),
  state: z.string().trim().length(2, "State must be 2 characters").optional(),
  zip_code: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "ZIP code must be 5 or 9 digits").optional().or(z.literal("")),
  telephone_no: z.string().trim().regex(/^[\d\s\-\(\)]+$/, "Invalid phone number format").max(20, "Phone number too long").optional().or(z.literal("")),
  fax_no: z.string().trim().regex(/^[\d\s\-\(\)]+$/, "Invalid fax number format").max(20, "Fax number too long").optional().or(z.literal("")),
  email_address: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  attorney_name: z.string().trim().max(100, "Attorney name must be less than 100 characters").optional(),
  firm_name: z.string().trim().max(200, "Firm name must be less than 200 characters").optional(),
  bar_number: z.string().trim().max(20, "Bar number must be less than 20 characters").optional(),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
