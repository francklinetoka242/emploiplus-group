import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Download, Eye, FileText, Plus, Trash2, Award, ClipboardList, Briefcase } from "lucide-react";
import type { CandidateCVState, CandidateDocument } from "@/features/candidates/api/documentsApi";

const documentTypes = {
  motivation: { label: "Lettre de motivation", icon: FileText, color: "text-blue-600" },
  diploma: { label: "Diplôme", icon: Award, color: "text-purple-600" },
  certificate: { label: "Certificat", icon: ClipboardList, color: "text-green-600" },
  attestation: { label: "Attestation", icon: Briefcase, color: "text-orange-600" },
  portfolio: { label: "Portfolio", icon: FileText, color: "text-cyan-600" },
  other: { label: "Autre", icon: FileText, color: "text-slate-600" },
  recepisse: { label: "Récépissé ACPE", icon: ClipboardList, color: "text-emerald-600" },
};

interface CandidateDocumentsPanelProps {
  cv: CandidateCVState | null;
  documents: CandidateDocument[];
  feedbackMessage?: string;
  feedbackError?: string;
  isUploadingCv?: boolean;
  isUploadingDocument?: boolean;
  selectedType: keyof typeof documentTypes;
  otherLabel: string;
  onSelectType: (type: keyof typeof documentTypes) => void;
  onChangeOtherLabel: (value: string) => void;
  onCvUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onOpenAddDialog: () => void;
  onSelectDocumentFile: (file: File | null) => void;
  selectedDocumentFile: File | null;
  onResetDialog: () => void;
  cvInputRef?: React.RefObject<HTMLInputElement | null>;
  documentInputRef?: React.RefObject<HTMLInputElement | null>;
  addDialogOpen: boolean;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return value;
  }
};

export function CandidateDocumentsPanel(props: CandidateDocumentsPanelProps) {
  const {
    cv,
    documents,
    feedbackMessage,
    feedbackError,
    isUploadingCv,
    isUploadingDocument,
    selectedType,
    otherLabel,
    onSelectType,
    onChangeOtherLabel,
    onCvUpload,
    onAddDocument,
    onDeleteDocument,
    onOpenAddDialog,
    onSelectDocumentFile,
    selectedDocumentFile,
    onResetDialog,
    cvInputRef,
    documentInputRef,
    addDialogOpen,
  } = props;

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

      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
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
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{cv.name}</p>
                    <p className="mt-1 text-sm text-slate-600">Taille: {cv.size || "—"}</p>
                    <p className="text-sm text-slate-600">Ajouté le: {formatDate(cv.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(cv.url, "_blank", "noopener,noreferrer")}>
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(cv.url, "_blank", "noopener,noreferrer")}>
                      <Download className="w-4 h-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-cyan-300 bg-white p-4 text-sm text-slate-600">
                Aucun CV téléchargé pour le moment.
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" onClick={() => cvInputRef?.current?.click()} disabled={isUploadingCv}>
                <Plus className="w-4 h-4" />
                {isUploadingCv ? "Téléchargement..." : "Remplacer le CV"}
              </Button>
              <input ref={cvInputRef} type="file" accept="application/pdf" className="hidden" onChange={onCvUpload} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents complémentaires</CardTitle>
          <CardDescription>Ajoutez des pièces justificatives ou documents utiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog open={addDialogOpen} onOpenChange={(open) => { if (!open) onResetDialog(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-brand text-brand-foreground hover:bg-brand/90" onClick={onOpenAddDialog}>
                <Plus className="w-4 h-4" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
                <DialogDescription>Sélectionnez le type et le fichier à joindre.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Type de document</Label>
                  <select id="documentType" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={selectedType} onChange={(event) => onSelectType(event.target.value as keyof typeof documentTypes)}>
                    {Object.entries(documentTypes).map(([value, config]) => (
                      <option key={value} value={value}>{config.label}</option>
                    ))}
                  </select>
                </div>
                {selectedType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="otherLabel">Nom du document</Label>
                    <Input id="otherLabel" value={otherLabel} onChange={(event) => onChangeOtherLabel(event.target.value)} placeholder="Ex: Certificat d'expérience" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="documentFile">Fichier PDF</Label>
                  <Input id="documentFile" type="file" accept="application/pdf" onChange={(event) => onSelectDocumentFile(event.target.files?.[0] ?? null)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onResetDialog}>Annuler</Button>
                  <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={onAddDocument} disabled={isUploadingDocument || !selectedDocumentFile}>
                    {isUploadingDocument ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-600">Aucun document complémentaire ajouté.</div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
                  <div>
                    <p className="font-medium text-slate-900">{document.displayName}</p>
                    <p className="mt-1 text-sm text-slate-600">{documentTypes[document.type]?.label ?? document.type} • {formatDate(document.date)}</p>
                    {document.size && <p className="text-sm text-slate-500">Taille: {document.size}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(document.url, "_blank", "noopener,noreferrer")}>
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDeleteDocument(document.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
