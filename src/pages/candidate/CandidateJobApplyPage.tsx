import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon as ArrowLeft,
  BuildingsIcon as Building2,
  IdentificationBadgeIcon as BriefcaseBusiness,
  MapPinIcon as MapPin,
  CurrencyCircleDollarIcon as BadgeDollarSign,
  CalendarDotsIcon as CalendarDays,
  FileTextIcon as FileText,
  EyeIcon as Eye,
  TrashIcon as Trash2,
  UploadSimpleIcon as Upload,
  XIcon as X,
  PaperPlaneTiltIcon as Send,
  WarningCircleIcon as AlertCircle,
  CheckCircleIcon as CheckCircle2,
  CaretDownIcon as ChevronDown,
} from "@phosphor-icons/react";
import { useI18n } from "@/i18n";
import { usePageSEO } from "@/features/seo";
import { useJobOfferBySlug } from "@/features/jobs/hooks";
import { useCandidate } from "@/hooks/useCandidate";
import { useCandidateDocuments } from "@/features/candidates/hooks/useCandidateDocuments";
import { getCandidateSession } from "@/features/authentication/api/authApi";
import { applyToJob } from "@/features/candidates/api/applicationsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/services/storageService";
import {
  getCandidateDocumentsList,
  type CandidateDocument,
} from "@/features/candidates/api/documentsApi";

interface TemporaryDocument {
  id: string;
  file: File;
  size: string;
}

const documentTypeLabels = {
  motivation: "Lettre de motivation",
  diploma: "Diplôme",
  certificate: "Certificat",
  attestation: "Attestation",
  portfolio: "Portfolio",
  other: "Autre",
  recepisse: "Récépissé ACPE",
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} octets`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

// Breadcrumb Component
function Breadcrumb({ jobTitle }: { jobTitle: string }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span className="text-foreground/80">Offres</span>
      <span className="text-border/60">/</span>
      <span className="font-medium text-foreground">{jobTitle}</span>
      <span className="text-border/60">/</span>
      <span className="font-semibold text-foreground">Postuler</span>
    </nav>
  );
}

// Skeleton Loaders
function HeroSkeleton() {
  return (
    <div className="mb-8 border border-border/80 bg-card p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full max-w-lg" />
          <div className="flex flex-wrap gap-2 mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  );
}

function FormSectionSkeleton() {
  return (
    <Card className="rounded-none border border-border/80 mb-4">
      <CardHeader className="pb-3 px-6 pt-6">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-4">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg mt-4" />
      </CardContent>
    </Card>
  );
}

type JobApplyHeroJob = {
  id?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  contract_type?: string | null;
  deadline?: string | null;
  company_logo?: string | null;
  company?: string | null;
  title?: string | null;
  salary?: string | null;
};

// Hero Section
function HeroSection({ job }: { job: JobApplyHeroJob }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const jobLocation =
    [job.location_city, job.location_country].filter(Boolean).join(", ") || "Télétravail";

  const getContractLabel = (contractType?: string | null) => {
    if (!contractType) return null;
    const fallbackMap: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Stage",
      freelance: "Freelance",
      prestation_de_services: "Prestation de services",
      consultance: "Consultance",
      temps_partiel: "Temps partiel",
      interim: "Intérim",
    };
    return fallbackMap[contractType] || contractType;
  };

  const contractLabel = getContractLabel(job.contract_type);
  const formatJobDate = (date?: string | null) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return date;
    }
  };

  const jobDeadline = formatJobDate(job.deadline);

  return (
    <div className="mb-8 sm:mb-12 border border-border/80">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:px-8"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Détails de l’offre
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-foreground">
            {job.title}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="border-t border-border/60 p-4 sm:p-8">
          {/* Single row header with all elements */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Logo */}
            {job.company_logo && (
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl border border-border/60 bg-background/80 flex items-center justify-center p-2">
                <img
                  src={job.company_logo}
                  alt={job.company ?? "Entreprise"}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            {/* Company & Title */}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Entreprise
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-foreground break-words">
                {job.title}
              </h1>
              <p className="text-sm font-medium text-foreground/80 break-words">{job.company}</p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-nowrap shrink-0">
              {/* Contract Type */}
              {contractLabel && (
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand shrink-0">
                  <BriefcaseBusiness className="h-3 w-3" />
                  {contractLabel}
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-sm shrink-0">
                <MapPin className="h-4 w-4 text-brand shrink-0" />
                <span className="font-medium text-foreground">{jobLocation}</span>
              </div>

              {/* Deadline */}
              {jobDeadline && (
                <div className="flex items-center gap-2 text-sm shrink-0">
                  <CalendarDays className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium text-foreground">{jobDeadline}</span>
                </div>
              )}
            </div>

            {/* Salary */}
            {job.salary && (
              <div className="flex items-center gap-2 text-sm shrink-0">
                <BadgeDollarSign className="h-4 w-4 text-brand shrink-0" />
                <span className="font-medium text-foreground">{job.salary}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Document Card
function DocumentCard({
  document,
  selected,
  onSelect,
  isTemporary = false,
}: {
  document: CandidateDocument | TemporaryDocument;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  isTemporary?: boolean;
}) {
  const isDoc = "type" in document;
  const isCv = isDoc && document.type === "cv";
  const displayName = isDoc ? document.displayName : document.file.name;
  const size = isDoc ? document.size : document.size;
  const docType = isDoc ? documentTypeLabels[document.type] : "Document";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(!selected);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(!selected)}
      onKeyDown={handleKeyDown}
      className={`text-left w-full min-w-0 p-4 rounded-none border-2 transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 cursor-pointer ${
        selected
          ? "border-brand bg-brand/5"
          : "border-border/60 bg-background/70 hover:border-brand/30 hover:bg-background"
      }`}
    >
      {/* Checkbox */}
      <div className="mt-1 shrink-0">
        <div
          className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
            selected ? "border-brand bg-brand" : "border-border/60 bg-background"
          }`}
        >
          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
        </div>
      </div>

      {/* Icon & Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
          <FileText
            className={`h-5 w-5 ${isCv ? "text-foreground" : "text-red-600"} shrink-0 mt-0.5`}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground break-words">{displayName}</h4>
            <p className="text-xs text-muted-foreground mt-1 break-words">
              {docType}
              {size && ` • ${size}`}
            </p>
          </div>
        </div>
      </div>

      {/* View Button */}
      {isDoc && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.open((document as CandidateDocument).url, "_blank", "noopener,noreferrer");
          }}
          className="shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Eye className="h-4 w-4 text-brand" />
        </button>
      )}
    </div>
  );
}

export function CandidateJobApplyPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { job, loading: jobLoading } = useJobOfferBySlug(slug);
  const {
    profile,
    loading: profileLoading,
    updateProfile,
    refetch: refetchCandidateProfile,
  } = useCandidate();

  const {
    cv: savedCv,
    documents: savedDocumentRecords,
    loading: documentsLoading,
  } = useCandidateDocuments(profile?.id, profile?.cv_url);
  const savedDocuments = React.useMemo(
    () => getCandidateDocumentsList({ cv: savedCv, documents: savedDocumentRecords }),
    [savedCv, savedDocumentRecords],
  );
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [temporaryDocuments, setTemporaryDocuments] = useState<TemporaryDocument[]>([]);
  const [temporaryDocumentsExpanded, setTemporaryDocumentsExpanded] = useState(false);
  const [recruiterMessageExpanded, setRecruiterMessageExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    headline: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coverLetter = (location.state as { coverLetter?: string } | null)?.coverLetter;
    if (coverLetter) {
      setMessage(coverLetter);
    }
  }, [location.state]);

  usePageSEO({
    title: "Postuler à une offre - EmploiPlus Group",
    description: "Postulez à cette offre d'emploi",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!profile) return;

    setProfileForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone: profile.phone || "",
      headline: profile.headline || "",
    });
  }, [profile]);

  const handleDocumentSelect = (docId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedDocuments);
    if (isSelected) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleFileInput = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
        toast.error("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        toast.error("Le fichier dépasse la limite de 2 Mo.");
        return;
      }
      const tempDoc: TemporaryDocument = {
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        size: formatFileSize(file.size),
      };
      setTemporaryDocuments((prev) => [...prev, tempDoc]);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileInput(e.dataTransfer.files);
  };

  const removeTemporaryDocument = (docId: string) => {
    setTemporaryDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    if (!profile) return;

    setProfileSaving(true);
    setProfileFeedback(null);

    try {
      const updatedProfile = await updateProfile({
        first_name: profileForm.first_name || null,
        last_name: profileForm.last_name || null,
        phone: profileForm.phone || null,
        headline: profileForm.headline || null,
      });

      const refreshedProfile = await refetchCandidateProfile();
      const profileData = refreshedProfile ?? updatedProfile;

      if (profileData) {
        setProfileForm({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone: profileData.phone || "",
          headline: profileData.headline || "",
        });
      }

      setProfileFeedback("Vos informations ont été mises à jour.");
      setIsEditingProfile(false);
    } catch (error) {
      setProfileFeedback(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSubmit = async () => {
    const recipientEmail = job?.application_email?.trim();

    if (!recipientEmail) {
      setSubmitFeedback({
        type: "error",
        message: "Veuillez rechercher l'adresse mail dans la description de l'offre",
      });
      return;
    }

    if (selectedDocuments.size === 0 && temporaryDocuments.length === 0) {
      setSubmitFeedback({
        type: "error",
        message: "Veuillez sélectionner ou ajouter au moins un document.",
      });
      return;
    }

    if (!consent) {
      setSubmitFeedback({
        type: "error",
        message: "Veuillez accepter les conditions de confidentialité.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const session = await getCandidateSession();
      const candidateEmail = session?.user?.email?.trim() || profile?.email?.trim();

      if (!candidateEmail) {
        throw new Error("Impossible de récupérer votre adresse email de candidature.");
      }

      const escapeHtml = (value: string) =>
        value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const buildAttachmentName = (name: string) => {
        if (!name) return "document.pdf";
        return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
      };

      const readFileAsBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              const commaIndex = reader.result.indexOf(",");
              resolve(commaIndex >= 0 ? reader.result.slice(commaIndex + 1) : reader.result);
            } else {
              reject(new Error("Impossible de lire le fichier joint."));
            }
          };
          reader.onerror = () => reject(new Error("Échec de lecture du fichier joint."));
          reader.readAsDataURL(file);
        });

      const selectedAttachments = await Promise.all([
        ...savedDocuments
          .filter((doc) => selectedDocuments.has(doc.id))
          .map(async (doc) => ({
            filename: buildAttachmentName(doc.displayName || doc.name || "document"),
            path: doc.url || undefined,
            contentType: "application/pdf",
          })),
        ...temporaryDocuments.map(async (doc) => ({
          filename: buildAttachmentName(doc.file.name || "document"),
          content: await readFileAsBase64(doc.file),
          encoding: "base64",
          contentType: doc.file.type || "application/pdf",
        })),
      ]);

      const candidateMessage = (message || "").replace(/\r\n/g, "\n");
      const outgoingSubject =
        emailSubject.trim() || `Nouvelle candidature - ${job?.title ?? "Offre"}`;
      const documentsList = [
        ...savedDocuments
          .filter((doc) => selectedDocuments.has(doc.id))
          .map((doc) => doc.displayName || doc.name || "Document joint"),
        ...temporaryDocuments.map((doc) => doc.file.name || "Document joint"),
      ];

      const applicationHtml = `
        <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
          <p style="margin: 0 0 12px;"><strong>Objet :</strong> ${escapeHtml(outgoingSubject)}</p>
          <div style="white-space: pre-wrap; margin: 0 0 16px;">${escapeHtml(candidateMessage || "Aucun message fourni.").replace(/\n/g, "<br />")}</div>
          <p style="margin: 0 0 12px;"><strong>Ci-joints</strong></p>
          ${
            documentsList.length > 0
              ? `<ul style="margin: 0 0 0 20px; padding: 0;">${documentsList.map((name) => `<li>${escapeHtml(name)}</li>`).join("")}</ul>`
              : '<p style="margin: 0;">Aucun document sélectionné.</p>'
          }
        </div>
      `;
      const applicationText = [
        `Objet : ${outgoingSubject}`,
        "",
        candidateMessage || "Aucun message fourni.",
        "",
        "Ci-joints",
        documentsList.length > 0 ? documentsList.join("\n- ") : "Aucun document sélectionné.",
      ].join("\n");

      if (!profile?.id) {
        throw new Error("Impossible d'identifier votre profil candidat.");
      }

      if (!job?.id) {
        throw new Error("Impossible d'identifier l'offre sélectionnée.");
      }

      await applyToJob(profile.id, job.id, candidateMessage || undefined, outgoingSubject);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: recipientEmail,
          replyTo: candidateEmail,
          subject: outgoingSubject,
          html: applicationHtml,
          text: applicationText,
          template: "simple-application",
          attachments: selectedAttachments,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Email dispatch failed", data);
      }

      setSubmitFeedback({
        type: "success",
        message: response.ok
          ? `Votre candidature a bien été envoyée à ${recipientEmail}.`
          : `Votre candidature a bien été enregistrée. L'envoi du mail au recruteur a échoué, mais votre demande est bien prise en compte.`,
      });
      // Redirect candidate to applications recap page so they can see the submitted offer
      navigate("/candidate/applications");
    } catch (error) {
      setSubmitFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'envoi de la candidature.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (jobLoading || profileLoading) {
    return (
      <div className="container-page py-8 md:py-12">
        <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <HeroSkeleton />
        <div className="space-y-4">
          <FormSectionSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
        </div>
      </div>
    );
  }

  // Not found
  if (!job) {
    return (
      <div className="container-page py-20 md:py-28">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4 md:text-3xl">Offre non trouvée</h1>
          <p className="text-muted-foreground mb-8">
            L'offre que vous cherchez n'existe pas ou a été supprimée.
          </p>
          <Button onClick={handleCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-page py-20 md:py-28">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4 md:text-3xl">Non authentifié</h1>
          <p className="text-muted-foreground mb-8">
            Veuillez vous connecter pour postuler à cette offre.
          </p>
          <Button onClick={() => navigate("/candidate/login")} className="gap-2">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  const totalDocuments = selectedDocuments.size + temporaryDocuments.length;
  const hasDocuments = savedDocuments.length > 0;
  const submissionChannelAvailable = Boolean(job.application_email?.trim());
  const isFormValid = submissionChannelAvailable && totalDocuments > 0 && consent;
  const displayedDocuments = savedDocuments;

  return (
    <div className="container-page pt-2 pb-8 md:pt-4 md:pb-12 min-h-screen overflow-x-hidden w-full max-w-full">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-2 hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb jobTitle={job.title} />

      {/* Hero Section */}
      <HeroSection job={job} />

      {/* Main Form Layout */}
      <div className="space-y-6 w-full">
        {/* Block 3: Saved Documents */}
        <Card
          className="border border-border/80 rounded-none overflow-hidden transition-all duration-300 animate-fade-in w-full max-w-full"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-4 px-6 pt-6 border-b border-border/60 bg-secondary/20">
            <CardTitle className="text-base">Documents enregistrés</CardTitle>
            <CardDescription className="text-xs mt-1">
              Sélectionnez les documents à transmettre
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {documentsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement de vos documents...</p>
            ) : !hasDocuments ? (
              <Alert className="border-yellow-200/60 bg-yellow-50/80">
                <AlertCircle className="h-4 w-4 text-yellow-700" />
                <AlertDescription className="text-sm text-foreground/80 ml-2">
                  Vous n'avez pas encore enregistré de documents.
                  <br />
                  <button
                    onClick={() => navigate("/candidate/documents")}
                    className="font-semibold text-brand hover:underline mt-1 inline-block"
                  >
                    Ajouter des documents →
                  </button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {savedDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    selected={selectedDocuments.has(doc.id)}
                    onSelect={(isSelected) => handleDocumentSelect(doc.id, isSelected)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Block 4: Temporary Documents */}
        <Card
          className="border border-border/80 rounded-none overflow-hidden transition-all duration-300 animate-fade-in w-full max-w-full"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="p-0 border-b border-border/60 bg-secondary/20">
            <button
              type="button"
              aria-expanded={temporaryDocumentsExpanded}
              onClick={() => setTemporaryDocumentsExpanded((expanded) => !expanded)}
              className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
            >
              <span>
                <CardTitle className="text-base">Ajouter des documents</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Pour cette candidature uniquement
                </CardDescription>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${temporaryDocumentsExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </CardHeader>
          {temporaryDocumentsExpanded && (
            <CardContent className="p-6 space-y-4">
            {/* Drag & Drop Zone */}
            <div
              ref={dragZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full min-w-0 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                isDragging ? "border-brand/60 bg-brand/5" : "border-border/40 bg-background/60"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                    isDragging ? "bg-brand/20 text-brand" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDragging ? "Déposez vos fichiers ici" : "Glissez-déposez vos fichiers PDF"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFileInput(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="relative gap-2 mt-4 w-full sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                Parcourir les fichiers
              </Button>
            </div>

            {/* Temporary Files List */}
            {temporaryDocuments.length > 0 && (
              <div className="space-y-3 border-t border-border/60 pt-4">
                {temporaryDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-none border border-border/60 bg-background/70 hover:bg-background transition-colors"
                  >
                    <FileText className="h-5 w-5 text-red-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground break-words">
                        {doc.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground break-words">{doc.size}</p>
                    </div>
                    <button
                      onClick={() => removeTemporaryDocument(doc.id)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/60">
              Ces documents seront utilisés uniquement pour cette candidature.
              <br />
              Ils ne seront pas ajoutés à votre espace documentaire.
            </p>
            </CardContent>
          )}
        </Card>

        {/* Block 4: Message */}
        <Card
          className="border border-border/80 rounded-none overflow-hidden transition-all duration-300 animate-fade-in w-full max-w-full"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="p-0 border-b border-border/60 bg-secondary/20">
            <button
              type="button"
              aria-expanded={recruiterMessageExpanded}
              onClick={() => setRecruiterMessageExpanded((expanded) => !expanded)}
              className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
            >
              <span>
                <CardTitle className="text-base">Message au recruteur</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Présentez votre motivation (optionnel)
                </CardDescription>
              </span>
              <ChevronDown
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${recruiterMessageExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </CardHeader>
          {recruiterMessageExpanded && (
            <CardContent className="p-6">
              <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="application-subject" className="text-sm font-medium">
                  Objet
                </Label>
                <Input
                  id="application-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value.slice(0, 200))}
                  placeholder="Objet de votre candidature"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="application-message" className="text-sm font-medium">
                  Message au recruteur
                </Label>
                <textarea
                  id="application-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                  placeholder="Dites-nous ce qui vous motive à postuler pour cette offre..."
                  className="w-full h-32 p-4 rounded-2xl border border-border/60 bg-background text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-transparent resize-none transition-all"
                />
              </div>
              <div className="flex justify-end text-xs text-muted-foreground">
                {message.length} / 2000 caractères
              </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Block 5: Summary */}
        <Card
          className="border border-brand/30 rounded-none overflow-hidden animate-fade-in w-full max-w-full"
          style={{ animationDelay: "0.4s" }}
        >
          <CardHeader className="pb-4 px-6 pt-6 border-b border-brand/20">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              Résumé de votre candidature
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm">
            <div className="border-t border-border/60 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Documents sélectionnés ({totalDocuments})
              </p>
              {totalDocuments === 0 ? (
                <p className="text-foreground/60 italic">Aucun document sélectionné</p>
              ) : (
                <ul className="space-y-1">
                  {savedDocuments
                    .filter((doc) => selectedDocuments.has(doc.id))
                    .map((doc) => (
                      <li key={doc.id} className="text-foreground break-words">
                        ✓ {doc.displayName}
                      </li>
                    ))}
                  {temporaryDocuments.map((doc) => (
                    <li key={doc.id} className="text-foreground">
                      ✓ {doc.file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {message && (
              <div className="border-t border-border/60 pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Votre message
                </p>
                <p className="text-foreground/80 italic">
                  {message.length > 120 ? `${message.slice(0, 120)}...` : message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Block 6: Consent */}
        <Card
          className="border-0 bg-transparent shadow-none rounded-3xl animate-fade-in w-full max-w-full"
          style={{ animationDelay: "0.5s" }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                className="mt-1"
              />
              <label
                htmlFor="consent"
                className="text-sm text-foreground/80 leading-relaxed cursor-pointer break-words"
              >
                J'accepte que mes informations personnelles ainsi que les documents sélectionnés
                soient transmis à l'entreprise dans le cadre de cette candidature.
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!submissionChannelAvailable && (
            <Alert className="border-amber-200/70 bg-amber-50/80 text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="ml-2">
                <p className="font-semibold text-amber-950">
                  Candidature momentanément indisponible
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  Cette offre ne possède actuellement aucune adresse de réception des candidatures.
                  Le recrutement n'est donc pas disponible pour le moment. Nous vous invitons à
                  consulter d'autres offres ou à revenir ultérieurement.
                </p>
              </AlertDescription>
            </Alert>
          )}
          {submitFeedback && (
            <Alert
              className={`border ${submitFeedback.type === "success" ? "border-primary/40 bg-primary/10" : "border-rose-200 bg-rose-50"}`}
            >
              <AlertDescription
                className={submitFeedback.type === "success" ? "text-primary" : "text-rose-800"}
              >
                {submitFeedback.message}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:sticky sm:bottom-0 bg-background/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-border/60 z-10 w-full max-w-full">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full sm:flex-1 gap-2 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
