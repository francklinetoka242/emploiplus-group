import { z } from "zod";

export const languageSchema = z.object({
  name: z.string().min(1, "La langue est requise"),
  level: z.string().min(1, "Le niveau est requis"),
});

export const skillSchema = z.object({
  skill_name: z.string().min(1, "La compétence est requise"),
});

export type LanguageFormValues = z.infer<typeof languageSchema>;
export type SkillFormValues = z.infer<typeof skillSchema>;
