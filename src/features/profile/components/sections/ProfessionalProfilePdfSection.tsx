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

  const generateCvT1 = async () => {
    if (!profile) return;
    setGenerating(true);
    setError(null);

    try {
      const document = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = 210;
      const margin = 13;
      const contentWidth = pageWidth - margin * 2;
      const leftColumnWidth = 112;
      const rightColumnX = 138;
      const rightColumnWidth = 59;
      const darkText: [number, number, number] = [30, 35, 38];
      const mutedText: [number, number, number] = [88, 94, 98];
      const blueHeader: [number, number, number] = [225, 245, 252];
      const blueAccent: [number, number, number] = [21, 112, 139];
      let leftY = 91;
      let rightY = 91;

      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        width: number,
        fontSize: number,
        color: [number, number, number],
        lineHeight = 5,
      ) => {
        if (!text) return y;
        document.setFont("helvetica", "normal");
        document.setFontSize(fontSize);
        document.setTextColor(...color);
        const lines = document.splitTextToSize(text, width) as string[];
        document.text(lines, x, y, { lineHeightFactor: lineHeight / fontSize });
        return y + lines.length * lineHeight;
      };

      const addSectionTitle = (title: string, x: number, y: number) => {
        document.setFont("helvetica", "bold");
        document.setFontSize(11);
        document.setTextColor(...darkText);
        document.text(title.toUpperCase(), x, y);
        return y + 8;
      };

      const addBulletList = (items: string[], x: number, y: number, width: number) => {
        items.filter(Boolean).forEach((item) => {
          const lines = document.splitTextToSize(item, width - 5) as string[];
          document.setFont("helvetica", "normal");
          document.setFontSize(9);
          document.setTextColor(...darkText);
          document.text("•", x, y);
          document.text(lines, x + 4, y, { lineHeightFactor: 1.35 });
          y += Math.max(5, lines.length * 4.5) + 1;
        });
        return y;
      };

      document.setFillColor(...blueHeader);
      document.rect(0, 0, pageWidth, 56, "F");

      const name = [clean(profile.first_name), clean(profile.last_name)].filter(Boolean).join(" ") || "Candidat";
      document.setFont("helvetica", "bold");
      document.setFontSize(22);
      document.setTextColor(...darkText);
      document.text(name.toUpperCase(), margin, 18);
      document.setFont("helvetica", "normal");
      document.setFontSize(12);
      document.text(clean(profile.headline) || "Professionnel", margin, 27);

      const contactLeft = [clean(profile.phone), clean(profile.email)].filter(Boolean);
      const contactRight = [
        [clean(profile.location_city), clean(profile.location_country)].filter(Boolean).join(", "),
        clean(profile.linkedin_url),
      ].filter(Boolean);
      let contactY = 37;
      contactLeft.forEach((contact) => {
        contactY = addWrappedText(contact, margin, contactY, 68, 8.5, mutedText, 4);
      });
      contactY = 37;
      contactRight.forEach((contact) => {
        contactY = addWrappedText(contact, 84, contactY, 72, 8.5, mutedText, 4);
      });

      if (profile.avatar_url) {
        try {
          const avatarResponse = await fetch(profile.avatar_url);
          const avatarBlob = await avatarResponse.blob();
          const avatarData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(avatarBlob);
          });
          document.addImage(avatarData, "JPEG", 169, 9, 28, 28);
        } catch (avatarError) {
          void avatarError;
        }
      }

      let profileY = 68;
      profileY = addSectionTitle("Profil", margin, profileY);
      profileY = addWrappedText(clean(profile.bio), margin, profileY, contentWidth, 9.5, darkText, 4.8);
      document.setDrawColor(120, 128, 132);
      document.line(margin, profileY + 4, pageWidth - margin, profileY + 4);
      leftY = profileY + 17;
      rightY = leftY;

      leftY = addSectionTitle("Expérience professionnelle", margin, leftY);
      experiences.forEach((experience) => {
        const period = [formatDate(experience.start_date), experience.is_current ? "Présent" : formatDate(experience.end_date)]
          .filter(Boolean)
          .join(" - ");
        const companyLine = [clean(experience.company), period ? `| ${period}` : ""].filter(Boolean).join(" ");
        leftY = addWrappedText(companyLine, margin, leftY, leftColumnWidth, 8.5, mutedText, 4);
        leftY = addWrappedText(clean(experience.job_title), margin, leftY + 1, leftColumnWidth, 10, darkText, 4.5);
        const descriptionLines = clean(experience.description)
          .split(/[.!?]\s+/)
          .map((line) => line.trim())
          .filter(Boolean);
        leftY = addBulletList(descriptionLines, margin, leftY + 1, leftColumnWidth) + 7;
      });

      if (educations.length) {
        leftY = addSectionTitle("Formation", margin, leftY);
        educations.forEach((education) => {
          leftY = addWrappedText(clean(education.school), margin, leftY, leftColumnWidth, 8.5, mutedText, 4);
          leftY = addWrappedText(
            [clean(education.degree), clean(education.field_of_study)].filter(Boolean).join(" - "),
            margin,
            leftY + 1,
            leftColumnWidth,
            9.5,
            darkText,
            4.5,
          ) + 7;
        });
      }

      const skillNames = skills.map((skill) => clean(skill.skill_name)).filter(Boolean);
      if (skillNames.length) {
        rightY = addSectionTitle("Savoir-être", rightColumnX, rightY);
        rightY = addBulletList(skillNames, rightColumnX, rightY, rightColumnWidth) + 7;
        rightY = addSectionTitle("Logiciels", rightColumnX, rightY);
        rightY = addBulletList(skillNames.slice(0, 5), rightColumnX, rightY, rightColumnWidth) + 7;
      }

      const languageNames = languages
        .map((language) => [clean(language.language_name), clean(language.proficiency_level)].filter(Boolean).join(" - "))
        .filter(Boolean);
      if (languageNames.length) {
        rightY = addSectionTitle("Langues", rightColumnX, rightY);
        rightY = addBulletList(languageNames, rightColumnX, rightY, rightColumnWidth);
      }

      document.save(`cv-t1-${clean(profile.last_name) || "candidat"}.pdf`);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Impossible de générer le CV T1.");
    } finally {
      setGenerating(false);
    }
  };

  const generatePdf = async (filePrefix = "profil-professionnel") => {
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

      document.save(`${filePrefix}-${clean(profile.last_name) || "candidat"}.pdf`);
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
          <div className="mb-2 flex items-center gap-2 text-primary"><FileText className="h-5 w-5" /><h2 className="text-lg font-semibold">CV T1</h2></div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Générez votre CV T1 à partir des informations renseignées dans votre profil.</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void generatePdf()} disabled={!profile || generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {generating ? "Génération..." : "Télécharger le PDF"}
          </Button>
          <Button type="button" onClick={() => void generateCvT1()} disabled={!profile || generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {generating ? "Génération..." : "Télécharger CV T1"}
          </Button>
        </div>
      </div>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Aperçu des sections disponibles</p>
        {sections.length ? <div className="grid gap-2 sm:grid-cols-2">{sections.map((section) => <div key={section.title} className="border border-border/70 px-3 py-2 text-sm text-foreground">{section.title}</div>)}</div> : <p className="text-sm text-muted-foreground">Ajoutez des informations à votre profil pour enrichir le document.</p>}
      </div>
    </section>
  );
}
