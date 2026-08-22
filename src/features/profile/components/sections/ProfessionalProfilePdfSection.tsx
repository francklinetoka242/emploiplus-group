import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jsPDF } from "jspdf";
import type {
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateProfile,
  CandidateSkill,
} from "@/features/candidates/api/types";

interface ProfessionalProfilePdfSectionProps {
  profile: CandidateProfile | null;
  experiences: CandidateExperience[];
  educations: CandidateEducation[];
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
}

type PdfSection = { title: string; lines: string[] };

const clean = (value: string | null | undefined) => value?.replace(/\s+/g, " ").trim() ?? "";
const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
};

export function ProfessionalProfilePdfSection({
  profile,
  experiences,
  educations,
  skills,
  languages,
}: ProfessionalProfilePdfSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo<PdfSection[]>(() => {
    if (!profile) return [];
    const result: PdfSection[] = [];
    const contact = [clean(profile.email), clean(profile.phone), clean(profile.location_city), clean(profile.location_country)]
      .filter(Boolean)
      .join(" | ");

    if (contact) result.push({ title: "Coordonnées", lines: [contact] });
    if (clean(profile.bio)) result.push({ title: "Profil professionnel", lines: [clean(profile.bio)] });
    if (experiences.length) {
      result.push({
        title: "Expériences professionnelles",
        lines: experiences.flatMap((experience) => {
          const period = [formatDate(experience.start_date), experience.is_current ? "aujourd'hui" : formatDate(experience.end_date)]
            .filter(Boolean)
            .join(" - ");
          return [
            [clean(experience.job_title), clean(experience.company), period ? `(${period})` : ""].filter(Boolean).join(" | "),
            clean(experience.description),
          ].filter(Boolean);
        }),
      });
    }
    if (educations.length) {
      result.push({
        title: "Formations",
        lines: educations.flatMap((education) => {
          const detail = [clean(education.degree), clean(education.field_of_study)].filter(Boolean).join(" - ");
          const period = [formatDate(education.start_date), education.is_current ? "aujourd'hui" : formatDate(education.end_date)]
            .filter(Boolean)
            .join(" - ");
          return [[detail, clean(education.school), period ? `(${period})` : ""].filter(Boolean).join(" | "), clean(education.description)].filter(Boolean);
        }),
      });
    }
    if (skills.length) {
      result.push({
        title: "Compétences",
        lines: [skills.map((skill) => [clean(skill.skill_name), clean(skill.proficiency_level)].filter(Boolean).join(" - ")).filter(Boolean).join(" | ")],
      });
    }
    if (languages.length) {
      result.push({
        title: "Langues",
        lines: [languages.map((language) => [clean(language.language_name), clean(language.proficiency_level)].filter(Boolean).join(" - ")).filter(Boolean).join(" | ")],
      });
    }
    return result.filter((section) => section.lines.length > 0);
  }, [educations, experiences, languages, profile, skills]);

  const generatePdf = async () => {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const document = new jsPDF({ unit: "mm", format: "a4" });
      const left = 18;
      const width = 174;
      let y = 20;
      const addPageIfNeeded = (height: number) => {
        if (y + height > 277) {
          document.addPage();
          y = 20;
        }
      };
      const name = [clean(profile.first_name), clean(profile.last_name)].filter(Boolean).join(" ") || "Profil professionnel";
      document.setTextColor(28, 58, 84);
      document.setFont("helvetica", "bold");
      document.setFontSize(22);
      document.text(name, left, y);
      y += 9;
      if (clean(profile.headline)) {
        document.setTextColor(70, 70, 70);
        document.setFont("helvetica", "normal");
        document.setFontSize(12);
        document.text(clean(profile.headline), left, y);
        y += 7;
      }
      document.setDrawColor(214, 222, 229);
      document.line(left, y, left + width, y);
      y += 9;

      sections.forEach((section) => {
        const wrapped = section.lines.flatMap((line) => document.splitTextToSize(line, width) as string[]);
        addPageIfNeeded(14 + wrapped.length * 5);
        document.setTextColor(28, 58, 84);
        document.setFont("helvetica", "bold");
        document.setFontSize(11);
        document.text(section.title, left, y);
        y += 6;
        document.setTextColor(55, 55, 55);
        document.setFont("helvetica", "normal");
        document.setFontSize(10);
        wrapped.forEach((line) => {
          addPageIfNeeded(6);
          document.text(line, left, y);
          y += 5;
        });
        y += 5;
      });

      document.setFontSize(8);
      document.setTextColor(120, 120, 120);
      document.text("Profil professionnel généré depuis les informations de votre compte", left, 287);
      document.save(`profil-professionnel-${clean(profile.last_name) || "candidat"}.pdf`);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Impossible de générer le PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="space-y-5 border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary"><FileText className="h-5 w-5" /><h2 className="text-lg font-semibold">Profil professionnel PDF</h2></div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Générez un document de candidature à partir des informations réellement renseignées dans votre profil.</p>
        </div>
        <Button type="button" onClick={() => void generatePdf()} disabled={!profile || generating} className="shrink-0">
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {generating ? "Génération..." : "Télécharger le PDF"}
        </Button>
      </div>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Aperçu des sections disponibles</p>
        {sections.length ? <div className="grid gap-2 sm:grid-cols-2">{sections.map((section) => <div key={section.title} className="border border-border/70 px-3 py-2 text-sm text-foreground">{section.title}</div>)}</div> : <p className="text-sm text-muted-foreground">Ajoutez des informations à votre profil pour enrichir le document.</p>}
      </div>
    </section>
  );
}
