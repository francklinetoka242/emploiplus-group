// Main pages barrel export
// This file re-exports all pages from their individual locations

// Public pages
export {
  HomePage,
  AboutPage,
  AuthPage,
  BlogPage,
  BlogPostDetailPage,
  ContactPage,
  JobOfferDetailPage,
  JobsPage,
  NotFoundPage,
  ServiceDetailPage,
  ServicesPage,
} from "@/pages/public";

// Admin pages
export {
  AdminPage,
  AdminHomePage,
  AdminJobsPage,
  AdminBlogPage,
  AdminTeamPage,
  AdminJobCreatePage,
  AdminBlogCreatePage,
  AdminSEOPage,
} from "@/pages/admin";

// Candidate pages
export {
  CandidateLoginPage,
  CandidateSignupPage,
  CandidateForgotPasswordPage,
  CandidateLayout,
  CandidateDashboardPage,
  CandidateProfilePage,
} from "@/pages/candidate";
