import {
  createCandidateEducation,
  deleteCandidateEducation,
  getCandidateEducations,
  updateCandidateEducation,
} from "@/features/candidates/api/educationApi";
import {
  createCandidateExperience,
  deleteCandidateExperience,
  getCandidateExperiences,
  updateCandidateExperience,
} from "@/features/candidates/api/experiencesApi";
import {
  createCandidateLanguage,
  deleteCandidateLanguage,
  getCandidateLanguages,
  updateCandidateLanguage,
} from "@/features/candidates/api/languagesApi";
import {
  getCandidatePreferences,
  saveCandidatePreferences,
} from "@/features/candidates/api/preferencesApi";
import {
  getCandidateProfile,
  updateCandidateProfile,
} from "@/features/candidates/api/profileApi";
import {
  createCandidateSkill,
  deleteCandidateSkill,
  getCandidateSkills,
  updateCandidateSkill,
} from "@/features/candidates/api/skillsApi";
import type {
  CandidateEducation,
  CandidateEducationInsert,
  CandidateExperience,
  CandidateExperienceInsert,
  CandidateLanguage,
  CandidateLanguageInsert,
  CandidatePreferences,
  CandidatePreferencesInsert,
  CandidateProfile,
  CandidateSkill,
  CandidateSkillInsert,
} from "@/features/candidates/api/types";

export const profileService = {
  async getProfile(candidateId: string) {
    return getCandidateProfile(candidateId);
  },

  async updateProfile(candidateId: string, updates: Partial<CandidateProfile>) {
    return updateCandidateProfile(candidateId, updates);
  },

  async getExperiences(candidateId: string): Promise<CandidateExperience[]> {
    return getCandidateExperiences(candidateId);
  },

  async createExperience(candidateId: string, experience: CandidateExperienceInsert) {
    return createCandidateExperience(candidateId, experience);
  },

  async updateExperience(experienceId: string, experience: CandidateExperienceInsert) {
    return updateCandidateExperience(experienceId, experience);
  },

  async deleteExperience(experienceId: string) {
    return deleteCandidateExperience(experienceId);
  },

  async getEducations(candidateId: string): Promise<CandidateEducation[]> {
    return getCandidateEducations(candidateId);
  },

  async createEducation(candidateId: string, education: CandidateEducationInsert) {
    return createCandidateEducation(candidateId, education);
  },

  async updateEducation(educationId: string, education: CandidateEducationInsert) {
    return updateCandidateEducation(educationId, education);
  },

  async deleteEducation(educationId: string) {
    return deleteCandidateEducation(educationId);
  },

  async getSkills(candidateId: string): Promise<CandidateSkill[]> {
    return getCandidateSkills(candidateId);
  },

  async createSkill(candidateId: string, skill: CandidateSkillInsert) {
    return createCandidateSkill(candidateId, skill);
  },

  async deleteSkill(skillId: string) {
    return deleteCandidateSkill(skillId);
  },

  async getLanguages(candidateId: string) {
    return getCandidateLanguages(candidateId);
  },

  async createLanguage(candidateId: string, language: CandidateLanguageInsert) {
    return createCandidateLanguage(candidateId, language);
  },

  async updateLanguage(languageId: string, language: CandidateLanguageInsert) {
    return updateCandidateLanguage(languageId, language);
  },

  async deleteLanguage(languageId: string) {
    return deleteCandidateLanguage(languageId);
  },

  async getPreferences(candidateId: string) {
    return getCandidatePreferences(candidateId);
  },

  async savePreferences(candidateId: string, preferences: CandidatePreferencesInsert): Promise<CandidatePreferences> {
    return saveCandidatePreferences(candidateId, preferences);
  },
};
