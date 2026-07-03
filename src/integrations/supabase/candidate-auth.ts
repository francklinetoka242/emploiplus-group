import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

export interface CandidateSignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location_city: string | null;
  location_country: string | null;
  date_of_birth: string | null;
}

export async function registerCandidate(
  form: SignUpFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    });

    if (authError) {
      console.error('[registerCandidate] auth.signUp failed', authError);
      return {
        success: false,
        error: authError.message || 'Création du compte impossible.',
      };
    }

    const userId = authData.user?.id || authData.session?.user?.id;
    if (!userId) {
      const message = 'Impossible de récupérer l’UUID utilisateur après l’inscription.';
      console.error('[registerCandidate]', message, authData);
      return { success: false, error: message };
    }

    const { error: profileError } = await supabase.from('candidates').insert([
      {
        user_id: userId,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        location_city: form.location_city ?? null,
        location_country: form.location_country ?? null,
        date_of_birth: form.date_of_birth ?? null,
        status: 'active',
      },
    ]);

    if (profileError) {
      console.error('[registerCandidate] insert candidates failed', profileError);
      return {
        success: false,
        error: profileError.message || 'Insertion du profil impossible.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[registerCandidate] unexpected error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export interface CandidateLoginData {
  email: string;
  password: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  bio: string | null;
  headline: string | null;
  location_city: string | null;
  location_country: string | null;
  date_of_birth: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateExperience {
  id: string;
  candidate_id: string;
  job_title: string;
  company: string;
  city: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateExperienceInsert {
  job_title: string;
  company: string;
  city?: string | null;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
}

export interface CandidateEducation {
  id: string;
  candidate_id: string;
  school: string;
  degree: string;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateEducationInsert {
  school: string;
  degree: string;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
}

export interface CandidateSkill {
  id: string;
  candidate_id: string;
  skill_name: string;
  proficiency_level: string | null;
  created_at: string;
}

export interface CandidateSkillInsert {
  skill_name: string;
  proficiency_level?: string | null;
}

export interface CandidatePreferences {
  id: string;
  candidate_id: string;
  contract_types: string[];
  work_types: string[];
  salary_min: number;
  salary_max: number;
  seniority_level: string;
  created_at: string;
  updated_at: string;
}

export interface CandidatePreferencesInsert {
  contract_types: string[];
  work_types: string[];
  salary_min: number;
  salary_max: number;
  seniority_level: string;
}

export interface CandidateLanguage {
  id: string;
  candidate_id: string;
  language_name: string;
  proficiency_level: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateLanguageInsert {
  language_name: string;
  proficiency_level: string;
}

export class CandidateAuthService {
  private static clearAuthStorage() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      Object.keys(localStorage).forEach((key) => {
        if (typeof key !== 'string') return;
        if (key.startsWith('sb-') && (key.includes('auth-token') || key.includes('auth-session') || key.includes('auth-token-code-verifier'))) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach((key) => {
        if (typeof key !== 'string') return;
        if (key.startsWith('sb-') || key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('[CandidateAuthService] clearAuthStorage failed', error);
    }
  }

  private static async assertEmailConfirmed(user: User | null | undefined) {
    if (user && user.email_confirmed_at) {
      return;
    }

    await supabase.auth.signOut();
    this.clearAuthStorage();

    const error = new Error('EMAIL_NOT_CONFIRMED');
    (error as any).code = 'EMAIL_NOT_CONFIRMED';
    (error as any).userEmail = user?.email ?? null;
    throw error;
  }

  /**
   * Sign up a new candidate
   */
  static async signup(data: CandidateSignupData) {
    try {
      // First, sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/candidate/login`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const user = authData.user || authData.session?.user;
      if (!user) {
        throw new Error('User creation failed');
      }

      // Create candidate profile now that the account exists
      const { data: profile, error: profileError } = await supabase
        .from('candidates')
        .insert([
          {
            user_id: user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      // Prevent auto-login after signup so the candidate must confirm their email first
      // CRITICAL: Must force logout and clear session storage to prevent any session from persisting
      await supabase.auth.signOut();
      
      // Clear any cached session data to ensure email confirmation is required
      try {
        localStorage.removeItem('sb-zhldgrvmmdhtlsnsxuys-auth-token');
        localStorage.removeItem('sb-zhldgrvmmdhtlsnsxuys-auth-token-code-verifier');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear session storage:', e);
      }

      return {
        user,
        profile: profile as CandidateProfile,
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Login a candidate
   */
  static async login(data: CandidateLoginData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw authError;
      }

      const user = authData.user || authData.session?.user;
      if (!user) {
        throw new Error('Login failed');
      }

      // TEST: force login failure if email_confirmed_at is null
      await this.assertEmailConfirmed(user);

      // Get candidate profile
      const { data: profile, error: profileError } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return {
        user: authData.user,
        profile: profile as CandidateProfile,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      
      const session = data.session;
      if (!session) {
        return null;
      }

      try {
        // Enforce session invalidation when email_confirmed_at is null
        await this.assertEmailConfirmed(session.user);
      } catch (error) {
        console.warn('[getSession] Unconfirmed email session invalidated');
        await supabase.auth.signOut();
        this.clearAuthStorage();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current candidate profile
   * CRITICAL: Enforces email confirmation before allowing any access
   */
  static async getCurrentProfile() {
    try {
      const session = await this.getSession();
      if (!session) {
        return null;
      }

      // Double-check email confirmation (defensive programming)
      try {
        await this.assertEmailConfirmed(session.user);
      } catch (error) {
        return null;
      }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateProfile;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Update candidate profile
   */
  static async updateProfile(candidateId: string, updates: Partial<CandidateProfile>) {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', candidateId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Get experience entries for a candidate
   */
  static async getCandidateExperiences(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_experience')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as CandidateExperience[];
    } catch (error) {
      console.error('Get candidate experiences error:', error);
      throw error;
    }
  }

  /**
   * Create a new experience entry
   */
  static async createCandidateExperience(candidateId: string, experience: CandidateExperienceInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_experience')
        .insert([
          {
            candidate_id: candidateId,
            job_title: experience.job_title,
            company: experience.company,
            city: experience.city ?? null,
            description: experience.description ?? null,
            start_date: experience.start_date,
            end_date: experience.end_date ?? null,
            is_current: experience.is_current ?? false,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateExperience;
    } catch (error) {
      console.error('Create candidate experience error:', error);
      throw error;
    }
  }

  /**
   * Update an existing experience entry
   */
  static async updateCandidateExperience(experienceId: string, experience: CandidateExperienceInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_experience')
        .update({
          job_title: experience.job_title,
          company: experience.company,
          city: experience.city ?? null,
          description: experience.description ?? null,
          start_date: experience.start_date,
          end_date: experience.end_date ?? null,
          is_current: experience.is_current ?? false,
        })
        .eq('id', experienceId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateExperience;
    } catch (error) {
      console.error('Update candidate experience error:', error);
      throw error;
    }
  }

  /**
   * Delete an experience entry
   */
  static async deleteCandidateExperience(experienceId: string) {
    try {
      const { error } = await supabase
        .from('candidate_experience')
        .delete()
        .eq('id', experienceId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete candidate experience error:', error);
      throw error;
    }
  }

  /**
   * Get education entries for a candidate
   */
  static async getCandidateEducations(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('start_date', { ascending: false });

      if (error) {
        throw error;
      }

      return data as CandidateEducation[];
    } catch (error) {
      console.error('Get candidate educations error:', error);
      throw error;
    }
  }

  /**
   * Create a new education entry
   */
  static async createCandidateEducation(candidateId: string, education: CandidateEducationInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_education')
        .insert([
          {
            candidate_id: candidateId,
            school: education.school,
            degree: education.degree,
            field_of_study: education.field_of_study ?? null,
            start_date: education.start_date ?? null,
            end_date: education.end_date ?? null,
            is_current: education.is_current ?? false,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateEducation;
    } catch (error) {
      console.error('Create candidate education error:', error);
      throw error;
    }
  }

  /**
   * Update an existing education entry
   */
  static async updateCandidateEducation(educationId: string, education: CandidateEducationInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_education')
        .update({
          school: education.school,
          degree: education.degree,
          field_of_study: education.field_of_study ?? null,
          start_date: education.start_date ?? null,
          end_date: education.end_date ?? null,
          is_current: education.is_current ?? false,
        })
        .eq('id', educationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateEducation;
    } catch (error) {
      console.error('Update candidate education error:', error);
      throw error;
    }
  }

  /**
   * Delete an education entry
   */
  static async deleteCandidateEducation(educationId: string) {
    try {
      const { error } = await supabase
        .from('candidate_education')
        .delete()
        .eq('id', educationId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete candidate education error:', error);
      throw error;
    }
  }

  /**
   * Get skill entries for a candidate
   */
  static async getCandidateSkills(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_skills')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as CandidateSkill[];
    } catch (error) {
      console.error('Get candidate skills error:', error);
      throw error;
    }
  }

  /**
   * Create a new skill entry
   */
  static async createCandidateSkill(candidateId: string, skill: CandidateSkillInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_skills')
        .insert([
          {
            candidate_id: candidateId,
            skill_name: skill.skill_name,
            proficiency_level: skill.proficiency_level ?? null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateSkill;
    } catch (error) {
      console.error('Create candidate skill error:', error);
      throw error;
    }
  }

  /**
   * Update an existing skill entry
   */
  static async updateCandidateSkill(skillId: string, skill: CandidateSkillInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_skills')
        .update({
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency_level ?? null,
        })
        .eq('id', skillId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateSkill;
    } catch (error) {
      console.error('Update candidate skill error:', error);
      throw error;
    }
  }

  /**
   * Delete a skill entry
   */
  static async deleteCandidateSkill(skillId: string) {
    try {
      const { error } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete candidate skill error:', error);
      throw error;
    }
  }

  /**
   * Get preferences for a candidate
   */
  static async getCandidatePreferences(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_preferences')
        .select('*')
        .eq('candidate_id', candidateId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, return default
        return null;
      }

      if (error) {
        throw error;
      }

      return data as CandidatePreferences;
    } catch (error) {
      console.error('Get candidate preferences error:', error);
      throw error;
    }
  }

  /**
   * Create or update candidate preferences
   */
  static async saveCandidatePreferences(candidateId: string, preferences: CandidatePreferencesInsert) {
    try {
      // First, try to get existing preferences
      const existing = await this.getCandidatePreferences(candidateId);

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('candidate_preferences')
          .update({
            contract_types: preferences.contract_types,
            work_types: preferences.work_types,
            salary_min: preferences.salary_min,
            salary_max: preferences.salary_max,
            seniority_level: preferences.seniority_level,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as CandidatePreferences;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('candidate_preferences')
          .insert([
            {
              candidate_id: candidateId,
              contract_types: preferences.contract_types,
              work_types: preferences.work_types,
              salary_min: preferences.salary_min,
              salary_max: preferences.salary_max,
              seniority_level: preferences.seniority_level,
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data as CandidatePreferences;
      }
    } catch (error) {
      console.error('Save candidate preferences error:', error);
      throw error;
    }
  }

  /**
   * Change the password for the connected candidate
   */
  static async changePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Delete the current candidate profile and sign out
   */
  static async deleteCurrentProfile(candidateId: string) {
    try {
      const { error: profileError } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId);

      if (profileError) {
        throw profileError;
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }

      return true;
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/candidate/reset-password`,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  }

  /**
   * Get language entries for a candidate
   */
  static async getCandidateLanguages(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_languages')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as CandidateLanguage[];
    } catch (error) {
      console.error('Get candidate languages error:', error);
      throw error;
    }
  }

  /**
   * Create a new language entry
   */
  static async createCandidateLanguage(candidateId: string, language: CandidateLanguageInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_languages')
        .insert([
          {
            candidate_id: candidateId,
            language_name: language.language_name,
            proficiency_level: language.proficiency_level,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateLanguage;
    } catch (error) {
      console.error('Create candidate language error:', error);
      throw error;
    }
  }

  /**
   * Update an existing language entry
   */
  static async updateCandidateLanguage(languageId: string, language: CandidateLanguageInsert) {
    try {
      const { data, error } = await supabase
        .from('candidate_languages')
        .update({
          language_name: language.language_name,
          proficiency_level: language.proficiency_level,
        })
        .eq('id', languageId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as CandidateLanguage;
    } catch (error) {
      console.error('Update candidate language error:', error);
      throw error;
    }
  }

  /**
   * Delete a language entry
   */
  static async deleteCandidateLanguage(languageId: string) {
    try {
      const { error } = await supabase
        .from('candidate_languages')
        .delete()
        .eq('id', languageId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete candidate language error:', error);
      throw error;
    }
  }

  /**
   * Get job applications for a candidate
   */
  static async getCandidateApplications(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          cover_letter,
          applied_at,
          updated_at,
          job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)
        `)
        .eq('candidate_id', candidateId)
        .order('applied_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as any[];
    } catch (error) {
      console.error('Get candidate applications error:', error);
      throw error;
    }
  }

  /**
   * Apply to a job offer
   */
  static async applyToJob(candidateId: string, jobOfferId: string, coverLetter?: string) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([
          {
            candidate_id: candidateId,
            job_offer_id: jobOfferId,
            cover_letter: coverLetter ?? null,
            status: 'submitted',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as any;
    } catch (error) {
      console.error('Apply to job error:', error);
      throw error;
    }
  }

  /**
   * Withdraw from a job application
   */
  static async withdrawApplication(applicationId: string) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status: 'withdrawn' })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as any;
    } catch (error) {
      console.error('Withdraw application error:', error);
      throw error;
    }
  }

  /**
   * Get saved job offers for a candidate
   */
  static async getCandidateSavedOffers(candidateId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_saved_offers')
        .select(`
          id,
          saved_at,
          job_offers:job_offer_id(id, title, company, location_city, contract_type, salary)
        `)
        .eq('candidate_id', candidateId)
        .order('saved_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as any[];
    } catch (error) {
      console.error('Get candidate saved offers error:', error);
      throw error;
    }
  }

  /**
   * Save a job offer
   */
  static async saveJobOffer(candidateId: string, jobOfferId: string) {
    try {
      const { data, error } = await supabase
        .from('candidate_saved_offers')
        .insert([
          {
            candidate_id: candidateId,
            job_offer_id: jobOfferId,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as any;
    } catch (error) {
      console.error('Save job offer error:', error);
      throw error;
    }
  }

  /**
   * Unsave a job offer
   */
  static async unsaveJobOffer(savedOfferId: string) {
    try {
      const { error } = await supabase
        .from('candidate_saved_offers')
        .delete()
        .eq('id', savedOfferId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Unsave job offer error:', error);
      throw error;
    }
  }

  /**
   * Resend confirmation email to user
   */
  static async resendConfirmationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/candidate/login`,
        },
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Resend confirmation email error:', error);
      throw error;
    }
  }

  /**
   * Parse auth error message in French
   */
  static parseErrorMessage(error: any): string {
    const normalizedError = (() => {
      if (!error && error !== 0) return 'Une erreur est survenue';
      if (typeof error === 'string') return error;
      if (error instanceof Error) {
        const errorMessage = error.message?.trim();
        if (errorMessage) return errorMessage;
      }
      if (typeof error === 'object' && error !== null) {
        if (typeof error.message === 'string' && error.message.trim()) return error.message;
        if (typeof error.error_description === 'string' && error.error_description.trim()) return error.error_description;
        if (typeof error.code === 'string' && error.code.trim()) return error.code;
        if (typeof error.error === 'string' && error.error.trim()) return error.error;
        if (typeof error.name === 'string' && error.name.trim()) return error.name;
        if (typeof error.toString === 'function') {
          const stringified = error.toString();
          if (stringified && stringified !== '[object Object]' && stringified !== 'Error') {
            return stringified;
          }
        }
        try {
          const json = JSON.stringify(error);
          if (json && json !== '{}' && json !== '[]') return json;
        } catch {
          // ignored
        }
        return 'Une erreur est survenue';
      }
      const stringValue = String(error);
      if (stringValue && stringValue !== '[object Object]') return stringValue;
      return 'Une erreur est survenue';
    })();

    const normalizedErrorValue = normalizedError.trim ? normalizedError.trim() : normalizedError;
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email',
      'EMAIL_NOT_CONFIRMED': 'Veuillez confirmer votre email avant de vous connecter',
      'User already registered': 'Cet email est déjà utilisé',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'weak_password': 'Le mot de passe est trop faible',
      'invalid_credentials': 'Email ou mot de passe incorrect',
      'user_already_exists': 'Cet email est déjà utilisé',
      'email rate limit exceeded': 'Trop de tentatives d’envoi d’email. Attendez quelques minutes avant de réessayer.',
      'Email rate limit exceeded': 'Trop de tentatives d’envoi d’email. Attendez quelques minutes avant de réessayer.',
      'email_rate_limit_exceeded': 'Trop de tentatives d’envoi d’email. Attendez quelques minutes avant de réessayer.',
      '{}': 'Une erreur est survenue',
      '{ }': 'Une erreur est survenue',
      '[object Object]': 'Une erreur est survenue',
    };

    return errorMessages[normalizedErrorValue] || normalizedErrorValue || 'Une erreur est survenue';
  }
}
