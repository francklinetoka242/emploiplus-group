import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCandidateProfile } from "../hooks/useCandidateProfile";
import { useCandidateExperiences } from "../hooks/useCandidateExperiences";
import { useCandidateEducation } from "../hooks/useCandidateEducation";
import { useCandidateSkills } from "../hooks/useCandidateSkills";
import { useCandidateLanguages } from "../hooks/useCandidateLanguages";
import { useCandidatePreferences } from "../hooks/useCandidatePreferences";
import { useCandidateDocuments } from "../hooks/useCandidateDocuments";
import { useProfileCompletion } from "../hooks/useProfileCompletion";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileSection } from "./sections/ProfileSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { PreferencesSection } from "./sections/PreferencesSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { CompletionSection } from "./sections/CompletionSection";
import ProfessionalPresentationSection from "./sections/ProfessionalPresentationSection";
import type { ProfileTabValue } from "../types";

export function CandidateProfileCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as ProfileTabValue | null) ?? "profile";
  const { profile, loading: profileLoading, error: profileError, updateProfile } = useCandidateProfile();
  const { experiences, loading: experiencesLoading, createExperience, updateExperience, deleteExperience } = useCandidateExperiences(profile?.id);
  const { educations, loading: educationsLoading, createEducation, updateEducation, deleteEducation } = useCandidateEducation(profile?.id);
  const { skills, loading: skillsLoading, createSkill, deleteSkill } = useCandidateSkills(profile?.id);
  const { languages, loading: languagesLoading, createLanguage, updateLanguage, deleteLanguage } = useCandidateLanguages(profile?.id);
  const { preferences, loading: preferencesLoading, savePreferences } = useCandidatePreferences(profile?.id);
  const { cv, documents, loading: documentsLoading, deleteDocument, addDocument } = useCandidateDocuments(profile?.id);

  const [currentTab, setCurrentTab] = useState<ProfileTabValue>(activeTab);

  const completion = useProfileCompletion({
    profile,
    experiences,
    educations,
    skills,
    languages,
    preferences,
  });

  const tabContent = useMemo(() => {
    switch (currentTab) {
      case "experience":
        return <ExperienceSection experiences={experiences} loading={experiencesLoading} onCreateExperience={createExperience} onUpdateExperience={updateExperience} onDeleteExperience={deleteExperience} />;
      case "education":
        return <EducationSection educations={educations} loading={educationsLoading} onCreateEducation={createEducation} onUpdateEducation={updateEducation} onDeleteEducation={deleteEducation} />;
      case "skills":
        return <SkillsSection skills={skills} loading={skillsLoading} onCreateSkill={createSkill} onDeleteSkill={deleteSkill} />;
      case "languages":
        return <LanguagesSection languages={languages} loading={languagesLoading} onCreateLanguage={createLanguage} onUpdateLanguage={updateLanguage} onDeleteLanguage={deleteLanguage} />;
      case "preferences":
        return <PreferencesSection preferences={preferences} loading={preferencesLoading} onSavePreferences={savePreferences} />;
      case "completion":
        return <CompletionSection completion={completion} />;
      case "documents":
        return <DocumentsSection cv={cv} documents={documents} loading={documentsLoading} candidateId={profile?.id} onDeleteDocument={deleteDocument} onAddDocument={addDocument} />;
        case "presentation":
          return <ProfessionalPresentationSection />;
      case "profile":
      default:
        return <ProfileSection profile={profile} onSave={updateProfile} loading={profileLoading} error={profileError} />;
    }
  }, [currentTab, profile, updateProfile, profileLoading, profileError, experiences, experiencesLoading, createExperience, updateExperience, deleteExperience, educations, educationsLoading, createEducation, updateEducation, deleteEducation, skills, skillsLoading, createSkill, deleteSkill, languages, languagesLoading, createLanguage, updateLanguage, deleteLanguage, preferences, preferencesLoading, savePreferences, cv, documents, documentsLoading, deleteDocument, addDocument, completion]);

  const handleTabChange = (tab: ProfileTabValue) => {
    setCurrentTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <ProfileHeader
        name={profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "Profil candidat"}
        title={profile?.headline ?? ""}
        location={[profile?.location_city, profile?.location_country].filter(Boolean).join(", ")}
        summary={profile?.bio ?? ""}
        completionPercentage={completion.completionPercentage}
        avatarUrl={profile?.avatar_url}
      />

      <ProfileTabs value={currentTab} onValueChange={handleTabChange} />

      {tabContent}
    </div>
  );
}
