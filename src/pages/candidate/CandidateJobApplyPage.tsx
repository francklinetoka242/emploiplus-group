import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  MapPin,
  BadgeDollarSign,
  CalendarDays,
  FileText,
  Eye,
  Trash2,
  Upload,
  X,
  Sparkles,
  Home,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { usePageSEO } from "@/features/seo";
import { useJobOfferBySlug } from "@/features/jobs/hooks";
import { useCandidate } from "@/hooks/useCandidate";
import { getCandidateSession } from "@/features/authentication/api/authApi";
import { applyToJob } from "@/features/candidates/api/applicationsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/services/storageService";
import {
  getCandidateDocumentsList,
  loadCandidateDocuments,
  type CandidateDocument,
} from "@/lib/candidate-documents";

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

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Breadcrumb Component
function Breadcrumb({ jobTitle }: { jobTitle: string }) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
      <span className="flex items-center gap-1 text-foreground/80">
        <Home className="h-4 w-4" />
        <span>Accueil</span>
      </span>
      <span className="text-border/60">/</span>
      <span className="text-foreground/80">Dashboard</span>
      <span className="text-border/60">/</span>
      <span className="text-foreground/80">Offres</span>
      <span className="text-border/60">/</span>
      <span className="text-foreground font-medium">{jobTitle}</span>
      <span className="text-border/60">/</span>
      <span className="text-foreground font-semibold">Postuler</span>
    </nav>
  );
}

// Skeleton Loaders
function HeroSkeleton() {
  return (
    <div className="mb-8 rounded-3xl border border-border/80 bg-card p-8 shadow-soft">
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
    <Card className="rounded-3xl border border-border/80 shadow-soft mb-4">
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
  tags?: string[] | null;
  publish_at?: string | null;
  deadline?: string | null;
  company_logo?: string | null;
  company?: string | null;
  title?: string | null;
  salary?: string | null;
};

type JobApplyHeroProfile = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  email?: string | null;
};

// Hero Section
function HeroSection({ job, profile }: { job: JobApplyHeroJob; profile: JobApplyHeroProfile }) {
  const jobLocation =
    [job.location_city, job.location_country].filter(Boolean).join(", ") || "Télétravail";

  const getContractLabel = (contractType?: string | null) => {
    if (!contractType) return null;
    const fallbackMap: Record<string, string> = {
      cdi: "CDI",
      cdd: "CDD",
      stage: "Stage",
      freelance: "Freelance",
      consultance: "Consultance",
      temps_partiel: "Temps partiel",
      interim: "Intérim",
    };
    return fallbackMap[contractType] || contractType;
  };

  const contractLabel = getContractLabel(job.contract_type);
  const jobTags = (job.tags || []).filter(Boolean);

  const formatJobDate = (date?: string | null) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return date;
    }
  };

  const jobPublished = formatJobDate(job.publish_at);
  const jobDeadline = formatJobDate(job.deadline);

  return (
    <div className="mb-8 sm:mb-12 rounded-3xl border border-border/80 bg-gradient-to-br from-brand/5 via-card to-secondary/5 p-4 sm:p-8 shadow-soft">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
        {/* Logo & Main Info */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 w-full min-w-0">
          {job.company_logo && (
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl border border-border/60 bg-background/80 flex items-center justify-center p-2 self-start">
              <img
                src={job.company_logo}
                alt={job.company}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Entreprise
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight break-words whitespace-normal">
              {job.title}
            </h1>
            <p className="text-base font-medium text-foreground/80 mb-4 break-words whitespace-normal">
              {job.company}
            </p>
            {contractLabel && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                {contractLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/60">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Localisation
          </p>
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground break-words">{jobLocation}</p>
          </div>
        </div>
        {job.salary && (
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Salaire
            </p>
            <div className="flex items-start gap-2 min-w-0">
              <BadgeDollarSign className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground break-words">{job.salary}</p>
            </div>
          </div>
        )}
        {jobPublished && (
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Publié le
            </p>
            <div className="flex items-start gap-2 min-w-0">
              <CalendarDays className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground break-words">{jobPublished}</p>
            </div>
          </div>
        )}
        {jobDeadline && (
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Date limite
            </p>
            <div className="flex items-start gap-2 min-w-0">
              <CalendarDays className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-foreground break-words">{jobDeadline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {jobTags.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {jobTags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground break-words"
              >
                <Sparkles className="h-3 w-3 text-brand" />
                {tag}
              </span>
            ))}
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
      className={`text-left w-full min-w-0 p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 hover:shadow-md cursor-pointer ${
        selected
          ? "border-brand bg-brand/5 shadow-md"
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
          <FileText className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground break-words">{displayName}</h4>
            <p className="text-xs text-muted-foreground mt-1 break-words">
              {docType}
              {size && ` • ${size}`}
              {isDoc && document.date && ` • ${formatDate(document.date)}`}
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
  const { slug } = useParams<{ slug: string }>();
  const { job, loading: jobLoading } = useJobOfferBySlug(slug);
  const { profile, loading: profileLoading, updateProfile, refetch: refetchCandidateProfile } = useCandidate();

  const [savedDocuments, setSavedDocuments] = useState<CandidateDocument[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [temporaryDocuments, setTemporaryDocuments] = useState<TemporaryDocument[]>([]);
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
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
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

  usePageSEO({
    title: "Postuler à une offre - EmploiPlus Group",
    description: "Postulez à cette offre d'emploi",
    robots: "noindex,nofollow",
  });

  // Load saved documents
  useEffect(() => {
    if (!profile?.id) return;

    const storedDocuments = loadCandidateDocuments(profile.id);
    setSavedDocuments(getCandidateDocumentsList(storedDocuments));
  }, [profile?.id]);

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
        alert("Seuls les fichiers PDF sont acceptés.");
        return;
      }
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        alert("Le fichier dépasse la limite de 2 Mo.");
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
      const htmlMessage = escapeHtml(candidateMessage).replace(/\n/g, "<br />");
      const outgoingSubject = emailSubject.trim() || `Nouvelle candidature - ${job?.title ?? "Offre"}`;

      if (!profile?.id) {
        throw new Error("Impossible d'identifier votre profil candidat.");
      }

      if (!job?.id) {
        throw new Error("Impossible d'identifier l'offre sélectionnée.");
      }

      await applyToJob(profile.id, job.id, candidateMessage || null, outgoingSubject);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: recipientEmail,
          replyTo: candidateEmail,
          subject: outgoingSubject,
          html: htmlMessage,
          text: candidateMessage,
          attachments: selectedAttachments.filter((attachment) => attachment.path || attachment.content),
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
          <h1 className="text-3xl font-bold text-foreground mb-4">Offre non trouvée</h1>
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
          <h1 className="text-3xl font-bold text-foreground mb-4">Non authentifié</h1>
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
  const submissionChannelStatusLabel = submissionChannelAvailable
    ? "Canal de candidature disponible"
    : "Veuillez rechercher l'adresse mail dans la description de l'offre";

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
      <HeroSection job={job} profile={profile} />

      {/* Main Form Layout */}
      <div className="grid gap-8 lg:grid-cols-3 w-full">
        {/* Left column - Job Description */}
        <div className="lg:col-span-1 w-full">
          <Card className="border border-border/80 shadow-soft rounded-3xl lg:sticky lg:top-8 w-full max-w-full">
            <CardHeader className="pb-3 px-4 pt-4 sm:px-6 sm:pt-6 border-b border-border/60">
              <CardTitle className="text-lg">Aperçu du poste</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 space-y-4 w-full max-w-full lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
              {job.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Description
                  </p>
                  <p
                    className={`text-sm text-foreground/80 leading-relaxed whitespace-pre-line ${isPreviewExpanded ? "" : "max-h-48 overflow-hidden line-clamp-8"}`}
                  >
                    {job.description}
                  </p>
                </div>
              )}

              {job.requirements && (
                <div className="border-t border-border/60 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Profil recherché
                  </p>
                  <div
                    className={`space-y-1.5 ${isPreviewExpanded ? "" : "max-h-36 overflow-hidden"}`}
                  >
                    {job.requirements
                      .split(/\n+/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .slice(0, isPreviewExpanded ? undefined : 6)
                      .map((item, idx) => (
                        <p key={idx} className="text-sm text-foreground/80">
                          • {item}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {(job.description || job.requirements) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewExpanded((prev) => !prev)}
                  className="px-0 h-auto text-brand hover:text-brand/90"
                >
                  {isPreviewExpanded ? "Voir moins" : "Voir plus"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Form */}
        <div className="lg:col-span-2 space-y-6 w-full">
          {/* Block 1: Your Information */}
          <Card className="border border-border/80 shadow-soft rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in w-full max-w-full">
            <CardHeader className="pb-4 px-6 pt-6 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-base">Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 mb-6 w-full max-w-full">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt={profile.first_name ?? undefined}
                    className="h-16 w-16 rounded-full border border-border/60 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Prénom
                    </p>
                    <p className="text-foreground font-medium">{profile.first_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Nom
                    </p>
                    <p className="text-foreground font-medium">{profile.last_name || "-"}</p>
                  </div>
                </div>
              </div>
              {profileFeedback && (
                <Alert
                  className={`mt-4 ${profileFeedback.includes("mis à jour") ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
                >
                  <AlertDescription
                    className={
                      profileFeedback.includes("mis à jour") ? "text-emerald-800" : "text-rose-800"
                    }
                  >
                    {profileFeedback}
                  </AlertDescription>
                </Alert>
              )}

              {isEditingProfile ? (
                <div className="space-y-4 mt-6 border-t border-border/60 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-first-name">Prénom</Label>
                      <Input
                        id="profile-first-name"
                        value={profileForm.first_name}
                        onChange={(e) => handleProfileChange("first_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-last-name">Nom</Label>
                      <Input
                        id="profile-last-name"
                        value={profileForm.last_name}
                        onChange={(e) => handleProfileChange("last_name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">Téléphone</Label>
                      <Input
                        id="profile-phone"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-headline">Titre professionnel</Label>
                      <Input
                        id="profile-headline"
                        value={profileForm.headline}
                        onChange={(e) => handleProfileChange("headline", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-border/60 pt-4 text-sm">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-foreground">{profile.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          first_name: profile.first_name || "",
                          last_name: profile.last_name || "",
                          phone: profile.phone || "",
                          headline: profile.headline || "",
                        });
                      }}
                      className="sm:flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      className="sm:flex-1"
                    >
                      {profileSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 border-t border-border/60 pt-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Email
                      </p>
                      <p className="text-foreground">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Téléphone
                      </p>
                      <p className="text-foreground">{profile.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Titre professionnel
                      </p>
                      <p className="text-foreground">{profile.headline || "-"}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingProfile(true);
                      setProfileFeedback(null);
                    }}
                    className="w-full gap-2 mt-6"
                  >
                    Modifier mon profil
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Block 2: Message */}
          <Card
            className="border border-border/80 shadow-soft rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in w-full max-w-full"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="pb-4 px-6 pt-6 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-base">Message au recruteur</CardTitle>
              <CardDescription className="text-xs mt-1">
                Présentez votre motivation (optionnel)
              </CardDescription>
            </CardHeader>
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
          </Card>

          {/* Block 3: Saved Documents */}
          <Card
            className="border border-border/80 shadow-soft rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in w-full max-w-full"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="pb-4 px-6 pt-6 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-base">Documents enregistrés</CardTitle>
              <CardDescription className="text-xs mt-1">
                Sélectionnez les documents à transmettre
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {!hasDocuments ? (
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
            className="border border-border/80 shadow-soft rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in w-full max-w-full"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="pb-4 px-6 pt-6 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-base">Ajouter des documents</CardTitle>
              <CardDescription className="text-xs mt-1">
                Pour cette candidature uniquement
              </CardDescription>
            </CardHeader>
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
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-background/70 hover:bg-background transition-colors"
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
          </Card>

          {/* Block 5: Summary */}
          <Card
            className="border border-brand/30 shadow-soft rounded-3xl overflow-hidden bg-gradient-to-br from-brand/5 to-secondary/5 animate-fade-in w-full max-w-full"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="pb-4 px-6 pt-6 border-b border-brand/20 bg-brand/10">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                Résumé de votre candidature
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Entreprise & Offre
                </p>
                <p className="font-medium text-foreground break-words">{job.company}</p>
                <p className="text-foreground/80 break-words">{job.title}</p>
              </div>

              <div className="border-t border-border/60 pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Candidat
                </p>
                <p className="font-medium text-foreground break-words">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-foreground/80 break-words">{profile.email}</p>
              </div>

              <div className="border-t border-border/60 pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  État du canal de candidature
                </p>
                <div
                  className={`inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${submissionChannelAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                >
                  {submissionChannelAvailable ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {submissionChannelStatusLabel}
                </div>
                <p className="mt-2 text-sm text-foreground/70">
                  {submissionChannelAvailable
                    ? "Cette offre est correctement configurée pour recevoir les candidatures."
                    : "Cette offre ne possède pas d'adresse email de réception des candidatures. L'envoi est actuellement impossible."}
                </p>
              </div>

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
            className="border border-border/80 shadow-soft rounded-3xl animate-fade-in w-full max-w-full"
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
                    Cette offre ne possède actuellement aucune adresse de réception des
                    candidatures. Le recrutement n'est donc pas disponible pour le moment. Nous vous
                    invitons à consulter d'autres offres ou à revenir ultérieurement.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            {submitFeedback && (
              <Alert
                className={`border ${submitFeedback.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}
              >
                <AlertDescription
                  className={
                    submitFeedback.type === "success" ? "text-emerald-800" : "text-rose-800"
                  }
                >
                  {submitFeedback.message}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:sticky sm:bottom-0 bg-background/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-border/60 shadow-lg z-10 w-full max-w-full">
              <Button variant="outline" onClick={handleCancel} className="w-full sm:flex-1">
                Annuler
              </Button>
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
    </div>
  );
}
