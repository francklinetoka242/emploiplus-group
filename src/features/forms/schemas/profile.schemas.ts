import { z } from "zod";

export const candidateProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  headline: z.string(),
  dateOfBirth: z.string(),
  nationality: z.string(),
  city: z.string(),
  about: z.string(),
  avatar: z.string().nullable(),
});

export type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;
