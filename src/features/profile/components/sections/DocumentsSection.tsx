import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, CheckCircle2, Circle, Upload } from "lucide-react";
import type { CandidateDocument, CandidateCVState } from "@/lib/candidate-documents";
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/services/storageService";
import { uploadCandidateDocument } from "@/features/candidates/api/documentsApi";

const DOCUMENT_TYPES = [
  { value: "motivation", label: "Lettre de motivation" },
  { value: "diploma", label: "Diplôme" },
  { value: "certificate", label: "Certificat" },
  { value: "attestation", label: "Attestation" },
  { value: "portfolio", label: "Portfolio" },
  { value: "recepisse", label: "Récépissé ACPE" },
  { value: "other", label: "Autre" },
];

interface DocumentsSectionProps {
  cv: CandidateCVState | null;
  documents: CandidateDocument[];
  loading?: boolean;
  candidateId?: string | null;
  onDeleteDocument?: (id: string) => void;
  onAddDocument?: (document: CandidateDocument) => void;
}

export function DocumentsSection({
  cv,
  documents,
  loading,
  candidateId,
  onDeleteDocument,
  onAddDocument,
}: DocumentsSectionProps) {
  const [selectedType, setSelectedType] = useState<CandidateDocument["type"]>("motivation");
  const [otherLabel, setOtherLabel] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const allDocuments = useMemo(() => {
    const docs: CandidateDocument[] = [];

    if (cv) {
      docs.push({
        id: cv.id,
        type: "other",
        name: cv.name,
        displayName: cv.displayName || cv.name,
        date: cv.date,
        size: cv.size,
        url: cv.url,
        customType: "CV Principal",
      });
    }

    return [...docs, ...documents];
  }, [cv, documents]);

  const documentsByType = useMemo(() => {
    const grouped = new Map<string, CandidateDocument[]>();

    allDocuments.forEach((doc) => {
      const type = doc.customType || doc.type;
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
      const newDocument = await uploadCandidateDocument(candidateId, file, selectedType, selectedType === "other" ? otherLabel : undefined);
      onAddDocument(newDocument);
      setFeedbackMessage("Le document a été ajouté avec succès.");
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
          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={!candidateId || !onAddDocument || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
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
                  disabled={!candidateId || !onAddDocument || isUploading}
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
              {["CV Principal", ...DOCUMENT_TYPES.map((t) => t.label)].map((label) => {
                const isCompleted = completedTypes.has(label);
                return (
                  <div
                    key={label}
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
                    <span className="text-sm">{label}</span>
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
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
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
              <p className="text-sm text-slate-500 mb-3">Aucun document ajouté.</p>
              <Button
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={!candidateId || !onAddDocument || isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Commencer à ajouter des documents
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
