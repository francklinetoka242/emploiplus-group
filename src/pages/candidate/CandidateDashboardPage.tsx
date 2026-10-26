import { usePageSEO } from "@/features/seo";
import { CandidateAccountPageSkeleton } from "@/components/candidate/CandidateAccountPageSkeleton";
import { DashboardWelcome } from "@/components/candidate/dashboard/DashboardWelcome";
import { NextBestAction } from "@/components/candidate/dashboard/NextBestAction";
import { DashboardIndicators } from "@/components/candidate/dashboard/DashboardIndicators";
import { ApplicationProgress } from "@/components/candidate/dashboard/ApplicationProgress";
import { UpcomingDeadlines } from "@/components/candidate/dashboard/UpcomingDeadlines";
import { RecommendedJobsSection } from "@/components/candidate/dashboard/RecommendedJobsSection";
import { DashboardAdvice } from "@/components/candidate/dashboard/DashboardAdvice";
import { DashboardDataError } from "@/components/candidate/dashboard/DashboardDataError";
import { DashboardEntrance } from "@/components/candidate/dashboard/DashboardEntrance";
import { useCandidateDashboardData } from "@/features/candidates/hooks/useCandidateDashboardData";
import { useCandidateDashboardEffects } from "@/features/candidates/hooks/useCandidateDashboardEffects";
import { useCandidateDashboardViewModel } from "@/features/candidates/hooks/useCandidateDashboardViewModel";
import { isMobileApp } from "@/lib/isMobileApp";

export function CandidateDashboardPage() {
  const mobileApp = isMobileApp();
  const dashboard = useCandidateDashboardData();
  const viewModel = useCandidateDashboardViewModel(dashboard);
  const recommendations = dashboard.recommendations;

  usePageSEO({
    title: "Tableau de bord - EmploiPlus Group",
    description: "Accédez à votre tableau de bord candidat",
    robots: "noindex,nofollow",
  });
  useCandidateDashboardEffects({
    profile: dashboard.profile,
    profileLoading: dashboard.isLoading,
    profileReady: dashboard.isReady,
    profileCompletion: viewModel.profileCompletion,
    completion: viewModel.completion,
    preferences: dashboard.preferences,
    refetchProfile: dashboard.refetch,
    retryRecommendations: recommendations.retry,
  });

  if (dashboard.isLoading) {
    return <CandidateAccountPageSkeleton page="dashboard" />;
  }

  return (
    <div className={mobileApp ? "space-y-4 pt-0" : "space-y-5"}>
      {dashboard.error && (
        <DashboardDataError message={dashboard.error} onRetry={() => void dashboard.refetch()} />
      )}
      <DashboardWelcome
        profile={dashboard.profile}
        completion={viewModel.completion}
        deadlineDays={viewModel.deadlineDays}
        inProgressApplications={viewModel.inProgressApplications}
        applicationCount={viewModel.applicationCount.data ?? 0}
        recommendedCount={recommendations.jobs.length}
      />
      <NextBestAction action={viewModel.action} />
      <DashboardEntrance delay={0.08}>
        <DashboardIndicators
          applicationCount={viewModel.applicationCount}
          savedOfferCount={viewModel.savedOfferMetric}
          unreadNotifications={{
            data: dashboard.notifications.count,
            loading: dashboard.notifications.loading,
            error: dashboard.notifications.error,
          }}
          recommendationCount={viewModel.recommendationMetric}
          onRetryApplications={() => void dashboard.reloadApplicationCount()}
          onRetrySavedOffers={() => void dashboard.reloadSavedOffers()}
          onRetryNotifications={() => void dashboard.reloadNotifications()}
          onRetryRecommendations={recommendations.retry}
        />
      </DashboardEntrance>
      <DashboardEntrance delay={0.12}>
        <div className="grid gap-5 xl:grid-cols-2">
          <ApplicationProgress
            activity={dashboard.applications}
            statusCounts={viewModel.applicationStatusCounts}
            onRetry={() => void dashboard.reloadApplications()}
            onRetryStatuses={() => void dashboard.reloadAllApplications()}
          />
          <UpcomingDeadlines
            savedOffers={dashboard.savedOffers}
            onRetry={() => void dashboard.reloadSavedOffers()}
          />
        </div>
      </DashboardEntrance>
      <DashboardEntrance delay={0.16}>
        <RecommendedJobsSection
          jobs={recommendations.jobs}
          candidateId={dashboard.candidateId ?? null}
          savedOfferIds={new Set(dashboard.savedOffers.data.map((offer) => offer.job_offer_id))}
          loading={recommendations.loading}
          status={recommendations.status}
          error={recommendations.error}
          page={recommendations.page}
          hasMore={recommendations.hasMore}
          onPageChange={recommendations.changePage}
          onRetry={recommendations.retry}
          onSaved={dashboard.reloadSavedOffers}
        />
      </DashboardEntrance>
      <DashboardEntrance delay={0.2}>
        <DashboardAdvice guides={dashboard.guides} onRetry={() => void dashboard.reloadGuides()} />
      </DashboardEntrance>
    </div>
  );
}
