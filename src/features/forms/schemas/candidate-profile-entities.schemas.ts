import { z } from "zod";

export const experienceSchema = z.object({
  job_title: z.string().min(1, "Le poste est requis"),
  company: z.string().min(1, "L'entreprise est requise"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  school: z.string().min(1, "L'école est requise"),
  degree: z.string().min(1, "Le diplôme est requis"),
  field_of_study: z.string().optional(),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;
export type EducationFormValues = z.infer<typeof educationSchema>;
