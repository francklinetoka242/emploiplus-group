import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Eye, CheckCircle2, Circle, Upload } from "lucide-react";
import type { CandidateDocument, CandidateCVState } from "@/lib/candidate-documents";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/services/storageService";
import { uploadAndProcessCandidateCV, uploadCandidateDocument } from "@/features/candidates/api/documentsApi";
import { supabase } from "@/integrations/supabase/client";
import { CANDIDATE_DOCUMENTS_BUCKET } from "@/services/storageService";
import { toast } from "sonner";

type DocumentTypeOption = CandidateDocument["type"] | "cv";

const DOCUMENT_TYPES = [
  { value: "cv" as const, label: "Mon CV" },
  { value: "motivation" as const, label: "Lettre de motivation" },
  { value: "diploma" as const, label: "Diplôme" },
  { value: "certificate" as const, label: "Certificat" },
  { value: "attestation" as const, label: "Attestation" },
  { value: "portfolio" as const, label: "Portfolio" },
  { value: "recepisse" as const, label: "Récépissé ACPE" },
  { value: "other" as const, label: "Autre" },
];

interface DocumentsSectionProps {
  cv: CandidateCVState | null;
  documents: CandidateDocument[];
  loading?: boolean;
  candidateId?: string | null;
  serverCvUrl?: string | null;
  onDeleteDocument?: (id: string) => void;
  onAddDocument?: (document: CandidateDocument | CandidateCVState, isCV?: boolean) => void;
}

export function DocumentsSection({
  cv,
  documents,
  loading,
  candidateId,
  serverCvUrl,
  onDeleteDocument,
  onAddDocument,
}: DocumentsSectionProps) {
  const [selectedType, setSelectedType] = useState<DocumentTypeOption>("motivation");
  const [otherLabel, setOtherLabel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [resolvedServerCvUrl, setResolvedServerCvUrl] = useState<string | null>(null);
  const [serverCvUrlError, setServerCvUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveCv = useMemo(() => {
    if (cv) {
      return cv;
    }
    if (!resolvedServerCvUrl) {
      return null;
    }
    return {
      id: "cv-server",
      name: "CV",
      displayName: "Mon CV",
      date: new Date().toISOString(),
      size: "",
      url: resolvedServerCvUrl,
    } satisfies CandidateCVState;
  }, [cv, resolvedServerCvUrl]);

  const allDocuments = useMemo(() => {
    const docs: CandidateDocument[] = [];

    if (effectiveCv) {
      docs.push({
        id: effectiveCv.id,
        type: "cv",
        name: effectiveCv.name,
        displayName: effectiveCv.displayName || effectiveCv.name,
        date: effectiveCv.date,
        size: effectiveCv.size,
        url: effectiveCv.url,
        customType: "Mon CV",
      });
    }

    return [...docs, ...documents];
  }, [effectiveCv, documents]);

  const documentsByType = useMemo(() => {
    const grouped = new Map<string, CandidateDocument[]>();

    allDocuments.forEach((doc) => {
      const type = doc.type || doc.customType || "other";
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(doc);
    });

    return grouped;
  }, [allDocuments]);

  const completedTypes = useMemo(() => {
    return new Set(Array.from(documentsByType.keys()));
  }, [documentsByType]);

  const canUploadDocument =
    Boolean(candidateId) &&
    Boolean(onAddDocument) &&
    !isUploading &&
    (selectedType !== "other" || otherLabel.trim().length > 0);

  const handleDelete = useCallback(
    (id: string) => {
      if (!onDeleteDocument) return;
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
        onDeleteDocument(id);
      }
    },
    [onDeleteDocument],
  );

  const handleFileSelection = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !candidateId || !onAddDocument) {
      return;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
      setFeedbackError("Seuls les fichiers PDF sont acceptés pour les documents complémentaires.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setFeedbackError("Le fichier dépasse la limite de 2 Mo pour les documents complémentaires.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setFeedbackError("");
    setFeedbackMessage("");

    try {
      if (selectedType === "cv") {
        const result = await uploadAndProcessCandidateCV(candidateId, file);
        const newCv = result.cv;
        onAddDocument(newCv, true);

            // Notify user and fallback to local feedback messages
            if ((result as any).extraction) {
              setFeedbackMessage("Le CV a été ajouté et son contenu a été extrait pour l’IA.");
              toast.success("Votre CV a été mis à jour avec succès. Vos scores de compatibilité avec les offres sont en cours de recalcul.");
            } else if ((result as any).error) {
              setFeedbackMessage("Votre CV a été ajouté, mais l’extraction du contenu a échoué.");
              setFeedbackError((result as any).error);
              toast.error("Votre CV a été ajouté mais l’extraction a échoué.");
            } else {
              setFeedbackMessage("Votre CV a été ajouté.");
              toast.success("Votre CV a été mis à jour avec succès. Vos scores de compatibilité avec les offres sont en cours de recalcul.");
            }
      } else {
        const newDocument = await uploadCandidateDocument(candidateId, file, selectedType as any, selectedType === "other" ? otherLabel : undefined);
        onAddDocument(newDocument);
        setFeedbackMessage("Le document a été ajouté avec succès.");
      }

      setOtherLabel("");
      setSelectedType("motivation");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Impossible d’ajouter le document.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }, [candidateId, onAddDocument, otherLabel, selectedType]);

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "";
    const num = parseFloat(bytes);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    if (!serverCvUrl) {
      setResolvedServerCvUrl(null);
      setServerCvUrlError(null);
      return;
    }

    let isMounted = true;
    const resolveUrl = async () => {
      if (serverCvUrl.startsWith("http")) {
        if (isMounted) {
          setResolvedServerCvUrl(serverCvUrl);
          setServerCvUrlError(null);
        }
        return;
      }

      try {
        const { data: signed, error } = await supabase.storage.from(CANDIDATE_DOCUMENTS_BUCKET).createSignedUrl(serverCvUrl, 60 * 60);
        if (!isMounted) {
          return;
        }
        if (error || !signed?.signedUrl) {
          throw error ?? new Error("Unable to create signed URL for candidate CV");
        }
        setResolvedServerCvUrl(signed.signedUrl);
        setServerCvUrlError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.debug("[DocumentsSection] failed to resolve profile.cv_url", {
          serverCvUrl,
          error,
        });
        setResolvedServerCvUrl(null);
        setServerCvUrlError(error instanceof Error ? error.message : String(error));
      }
    };

    void resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [serverCvUrl]);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  useEffect(() => {
    console.debug("[DocumentsSection] effective CV state", {
      hasLocalCv: Boolean(cv),
      serverCvUrl,
      resolvedServerCvUrl,
      effectiveCv: effectiveCv ? { id: effectiveCv.id, url: effectiveCv.url } : null,
    });
  }, [cv, serverCvUrl, resolvedServerCvUrl, effectiveCv]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-600" />
            Documents
          </CardTitle>
          <CardDescription>Gérez vos documents importants pour votre candidature.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Chargement…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-600" />
              Documents
            </CardTitle>
            <CardDescription>Gérez vos documents importants pour votre candidature.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-slate-700">Type de document</label>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value as CandidateDocument["type"])}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedType === "other" && (
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom personnalisé</label>
                  <input
                    value={otherLabel}
                    onChange={(event) => setOtherLabel(event.target.value)}
                    placeholder="Ex. : Certificat de stage"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!canUploadDocument}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Envoi…" : "Choisir un PDF"}
                </Button>
                <p className="text-xs text-slate-500">PDF jusqu’à 2 Mo</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_DOCUMENT_MIME_TYPES.join(",")}
              className="hidden"
              onChange={handleFileSelection}
            />
            {feedbackMessage && <p className="mt-2 text-sm text-emerald-600">{feedbackMessage}</p>}
            {feedbackError && <p className="mt-2 text-sm text-rose-600">{feedbackError}</p>}
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">État des documents</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {DOCUMENT_TYPES.map((type) => {
                const isCompleted = completedTypes.has(type.value);
                return (
                  <div
                    key={type.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-sm">{type.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {allDocuments.length > 0 ? (
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Documents ajoutés</p>
              <div className="space-y-2">
                {allDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">
                          {doc.customType || DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-xs text-slate-500">{formatDate(doc.date)}</p>
                          {doc.size && (
                            <>
                              <span className="text-xs text-slate-400">•</span>
                              <p className="text-xs text-slate-500">{formatFileSize(doc.size)}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Aperçu"
                        onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Télécharger"
                        onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc.id)}
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Aucun document ajouté.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
