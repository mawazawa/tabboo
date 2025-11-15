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

/**
 * Form data schema for PDF form fields
 * All fields are optional as forms can be partially filled
 */
export const formDataSchema = z.object({
  partyName: z.string().trim().max(200, "Name must be less than 200 characters").optional(),
  streetAddress: z.string().trim().max(300, "Address must be less than 300 characters").optional(),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional(),
  state: z.string().trim().max(50, "State must be less than 50 characters").optional(),
  zipCode: z.string().trim().regex(/^\d{5}(-\d{4})?$|^$/, "ZIP code must be 5 or 9 digits").optional().or(z.literal("")),
  telephoneNo: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  faxNo: z.string().trim().max(20, "Fax number must be less than 20 characters").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters").optional().or(z.literal("")),
  attorneyFor: z.string().trim().max(200, "Attorney field must be less than 200 characters").optional(),
  county: z.string().trim().max(100, "County must be less than 100 characters").optional(),
  petitioner: z.string().trim().max(200, "Petitioner must be less than 200 characters").optional(),
  respondent: z.string().trim().max(200, "Respondent must be less than 200 characters").optional(),
  caseNumber: z.string().trim().max(100, "Case number must be less than 100 characters").optional(),
  facts: z.string().trim().max(10000, "Facts must be less than 10000 characters").optional(),
  signatureDate: z.string().trim().max(50, "Date must be less than 50 characters").optional(),
  signatureName: z.string().trim().max(200, "Name must be less than 200 characters").optional(),
  noOrders: z.boolean().optional(),
  agreeOrders: z.boolean().optional(),
  consentCustody: z.boolean().optional(),
  consentVisitation: z.boolean().optional(),
}).passthrough(); // Allow additional fields not in schema

export type FormDataValidation = z.infer<typeof formDataSchema>;

/**
 * Field position schema
 */
export const fieldPositionSchema = z.object({
  top: z.number().min(0).max(100),
  left: z.number().min(0).max(100),
});

/**
 * Field positions schema - record of field positions
 */
export const fieldPositionsSchema = z.record(z.string(), fieldPositionSchema);

export type FieldPositionsValidation = z.infer<typeof fieldPositionsSchema>;
