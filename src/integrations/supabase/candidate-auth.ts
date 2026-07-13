// LEGACY COMPATIBILITY ONLY
// New code must use `src/features/authentication` for auth flows
// and `src/features/candidates/api` for candidate business logic.
import { supabase } from "./client";
import type { User } from "@supabase/supabase-js";
import {
  getCandidateSession,
  loginCandidate,
  logoutCandidate,
  signupCandidate,
} from "@/features/authentication/api/authApi";
import { resendConfirmationEmail as resendConfirmationEmailRequest } from "@/features/authentication/api/emailApi";
import { parseAuthErrorMessage } from "@/features/authentication/utils/authErrorParser";
import { clearAuthStorage } from "@/features/authentication/utils/authStorage";
import { assertEmailConfirmed } from "@/features/authentication/utils/emailValidation";
import { createCandidateProfile, getCandidateProfileByUserId } from "@/features/candidates/api/profileApi";
import type { CandidateProfile } from "@/features/candidates/types";
// NOTE: candidate CRUD and domain APIs were moved to `src/features/candidates/api`.
// Keep direct imports there; avoid re-exporting domain APIs from this legacy file.

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
  form: SignUpFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    await performCandidateSignup({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      location_city: form.location_city,
      location_country: form.location_country,
      date_of_birth: form.date_of_birth,
    });

    return { success: true };
  } catch (error) {
    console.error("[registerCandidate] unexpected error", error);
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

export type {
  CandidateProfile,
  CandidateExperience,
  CandidateExperienceInsert,
  CandidateEducation,
  CandidateEducationInsert,
  CandidateSkill,
  CandidateSkillInsert,
  CandidateLanguage,
  CandidateLanguageInsert,
  CandidatePreferences,
  CandidatePreferencesInsert,
} from "@/features/candidates/types";

type CandidateSignupFlowParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  redirectTo?: string;
  location_city?: string | null;
  location_country?: string | null;
  date_of_birth?: string | null;
};

async function performCandidateSignup(params: CandidateSignupFlowParams): Promise<{
  user: User;
  profile: CandidateProfile;
}> {
  const authData = await signupCandidate(params.email, params.password, {
    redirectTo: params.redirectTo,
    data: {
      first_name: params.firstName,
      last_name: params.lastName,
    },
  });

  const user = authData.user || authData.session?.user;
  if (!user) {
    throw new Error("User creation failed");
  }

  const profile = await createCandidateProfile(user.id, {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    location_city: params.location_city,
    location_country: params.location_country,
    date_of_birth: params.date_of_birth,
  });

  if (authData.session) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.warn("Signup cleanup signOut failed", signOutError);
    }
  }

  clearAuthStorage();

  return {
    user,
    profile,
  };
}

export class CandidateAuthService {
  private static clearAuthStorage() {
    clearAuthStorage();
  }

  private static async assertEmailConfirmed(user: User | null | undefined) {
    await assertEmailConfirmed(
      user,
      async () => {
        await supabase.auth.signOut();
      },
      () => {
        this.clearAuthStorage();
      },
    );
  }

  /**
   * Sign up a new candidate
   */
  static async signup(data: CandidateSignupData) {
    try {
      return await performCandidateSignup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        redirectTo: `${window.location.origin}/candidate/login`,
      });
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  /**
   * Login a candidate
   */
  static async login(data: CandidateLoginData) {
    try {
      const authData = await loginCandidate(data.email, data.password);
      const user = authData.user || authData.session?.user;
      if (!user) {
        throw new Error("Login failed");
      }

      const profile = await getCandidateProfileByUserId(user.id);

      return {
        user: authData.user,
        profile,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  static async logout() {
    try {
      await logoutCandidate();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const session = await getCandidateSession();
      if (!session) {
        clearAuthStorage();
        return null;
      }

      return session;
    } catch (error) {
      console.error("Get session error:", error);
      clearAuthStorage();
      return null;
    }
  }
  /**
   * Resend confirmation email to user
   */
  static async resendConfirmationEmail(email: string) {
    try {
      return await resendConfirmationEmailRequest(email);
    } catch (error) {
      console.error("Resend confirmation email error:", error);
      throw error;
    }
  }

  /**
   * Parse auth error message in French
   */
  static parseErrorMessage(error: unknown): string {
    return parseAuthErrorMessage(error);
  }
}
