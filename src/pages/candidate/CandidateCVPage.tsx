import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePageSEO } from "@/features/seo";
import { useCandidate } from "@/features/candidates/hooks/useCandidate";
import { CandidateDocumentsPanel } from "@/features/candidates/components/documents/CandidateDocumentsPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Eye, Trash2, FileText, Plus, AlertCircle } from "lucide-react";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/services/storageService";
import { deleteCandidateDocument, getCandidateDocuments, saveCandidateDocuments, uploadCandidateCV, uploadCandidateDocument, type CandidateCVState, type CandidateDocument } from "@/features/candidates/api/documentsApi";

const documentTypes = {
  motivation: { label: "Lettre de motivation" },
  diploma: { label: "Diplôme" },
  certificate: { label: "Certificat" },
  attestation: { label: "Attestation" },
  portfolio: { label: "Portfolio" },
  other: { label: "Autre" },
  recepisse: { label: "Récépissé ACPE" },
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} octets`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return value;
  }
};

export function CandidateCVPage() {
  const { profile, loading } = useCandidate();
  const location = useLocation();
  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const cvSectionRef = useRef<HTMLDivElement | null>(null);
  const [cv, setCv] = useState<CandidateCVState | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<keyof typeof documentTypes>("motivation");
  const [otherLabel, setOtherLabel] = useState("");
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);

  usePageSEO({
    title: "Mon CV - EmploiPlus Group",
    description: "Gérez votre CV et documents",
    robots: "noindex,nofollow",
  });

  useEffect(() => {
    if (!profile?.id) return;

    void getCandidateDocuments(profile.id).then((data) => {
      setCv(data.cv ?? null);
      setDocuments(data.documents ?? []);
    }).catch((error) => {
      console.error("Unable to restore candidate documents", error);
    });
  }, [profile?.id]);

  useEffect(() => {
    if (location.hash === "#cv") {
      cvSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      cvInputRef.current?.focus();
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get("type");
    if (type === "motivation") {
      setSelectedType("motivation");
      setAddDialogOpen(true);
    }
  }, [location.hash, location.search]);

  useEffect(() => {
    if (!profile?.id) return;
    void saveCandidateDocuments(profile.id, { cv, documents });
  }, [profile?.id, cv, documents]);

  const resetDocumentDialog = () => {
    setSelectedType("motivation");
    setOtherLabel("");
    setSelectedDocumentFile(null);
    setAddDialogOpen(false);
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
      setFeedbackError("Seuls les fichiers PDF sont acceptés pour le CV.");
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      setFeedbackError("Le fichier dépasse la limite de 2 Mo pour le CV.");
      return;
    }

    setIsUploadingCv(true);
    setFeedbackError("");
    setFeedbackMessage("");

    try {
      const url = await uploadCandidateCV(profile.id, file);
      setCv({
        id: `cv-${Date.now()}`,
        name: file.name,
        displayName: file.name,
        date: new Date().toISOString(),
        size: formatFileSize(file.size),
        url,
      });
      setFeedbackMessage("Votre CV a été téléchargé avec succès.");
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Impossible d’envoyer le CV.");
    } finally {
      setIsUploadingCv(false);
      event.target.value = "";
    }
  };

  const handleAddDocument = async () => {
    if (!selectedDocumentFile || !profile?.id) return;

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(selectedDocumentFile.type)) {
      setFeedbackError("Seuls les fichiers PDF sont acceptés pour les documents complémentaires.");
      return;
    }

    if (selectedDocumentFile.size > MAX_DOCUMENT_SIZE_BYTES) {
      setFeedbackError("Le fichier dépasse la limite de 2 Mo pour les documents complémentaires.");
      return;
    }

    setIsUploadingDocument(true);
    setFeedbackError("");
    setFeedbackMessage("");

    try {
      const newDocument = await uploadCandidateDocument(
        profile.id,
        selectedDocumentFile,
        selectedType as CandidateDocument["type"],
        otherLabel,
      );
      setDocuments((prev) => [newDocument, ...prev]);
      setFeedbackMessage("Le document a été ajouté avec succès.");
      resetDocumentDialog();
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : "Impossible d’ajouter le document.",
      );
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!profile?.id) return;
    try {
      await deleteCandidateDocument(profile.id, id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Impossible de supprimer le document.");
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-600">Chargement de votre espace CV...</div>;
  }

  if (!profile) {
    return (
      <div className="py-10 text-center text-slate-600">
        Veuillez vous reconnecter pour gérer vos documents.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedbackMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{feedbackMessage}</AlertDescription>
        </Alert>
      )}

      {feedbackError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{feedbackError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50" ref={cvSectionRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            CV Principal
          </CardTitle>
          <CardDescription>Votre CV actuellement utilisé pour les candidatures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cv ? (
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{cv.name}</p>
                    <p className="text-sm text-slate-600 mt-1">Taille: {cv.size || "—"}</p>
                    <p className="text-sm text-slate-600">Ajouté le: {formatDate(cv.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(cv.url, "_blank", "noopener,noreferrer")}
                    >
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.open(cv.url, "_blank", "noopener,noreferrer")}
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-cyan-300 bg-white p-4 text-sm text-slate-600">
                Aucun CV n’a encore été téléchargé.
              </div>
            )}

            <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors bg-white">
              <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <p className="font-medium text-slate-700 mb-1">Remplacer votre CV</p>
              <p className="text-sm text-slate-600 mb-4">
                Sélectionnez un PDF depuis votre appareil
              </p>
              <input
                ref={cvInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleCvUpload}
              />
              <Button
                onClick={() => cvInputRef.current?.click()}
                disabled={isUploadingCv}
                className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
              >
                {isUploadingCv ? "Chargement..." : "Parcourir"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Documents Complémentaires</CardTitle>
              <CardDescription>
                Ajoutez des documents pour renforcer votre candidature
              </CardDescription>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand text-brand-foreground hover:bg-brand/90 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter un document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un document</DialogTitle>
                  <DialogDescription>
                    Sélectionnez le type de document à télécharger ou choisissez "Autre" pour
                    préciser un nom.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(documentTypes).map(([type, info]) => {
                      const Icon = info.icon;
                      const key = type as keyof typeof documentTypes;
                      const active = selectedType === key;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(key)}
                          className={`w-full p-3 border rounded-lg transition-colors text-left flex items-center gap-3 ${active ? "border-cyan-500 bg-cyan-50" : "border-slate-200 hover:bg-slate-50"}`}
                        >
                          <Icon className={`w-5 h-5 ${info.color}`} />
                          <span className="font-medium">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedType === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="otherLabel">Nom du document</Label>
                      <Input
                        id="otherLabel"
                        placeholder="Ex: Convention de stage"
                        value={otherLabel}
                        onChange={(e) => setOtherLabel(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="documentFile">Fichier PDF</Label>
                    <Input
                      id="documentFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => setSelectedDocumentFile(event.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={resetDocumentDialog}>
                      Annuler
                    </Button>
                    <Button
                      disabled={isUploadingDocument || !selectedDocumentFile}
                      onClick={handleAddDocument}
                      className="bg-brand text-brand-foreground hover:bg-brand/90 text-white"
                    >
                      {isUploadingDocument ? "Ajout..." : "Ajouter"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => {
                const typeInfo = documentTypes[doc.type];
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{doc.displayName || doc.name}</p>
                        <p className="text-sm text-slate-600">
                          {typeInfo.label} • Ajouté le {formatDate(doc.date)}
                        </p>
                        {doc.size && <p className="text-xs text-slate-500">{doc.size}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                      >
                        <Eye className="w-4 h-4" />
                        Aperçu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun document complémentaire ajouté pour le moment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
