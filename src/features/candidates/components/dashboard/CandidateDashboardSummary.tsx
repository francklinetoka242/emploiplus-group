import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Sparkles } from "lucide-react";

interface CandidateDashboardSummaryProps {
  profileComplete: boolean;
  applicationsCount: number;
  documentsCount: number;
}

export function CandidateDashboardSummary({ profileComplete, applicationsCount, documentsCount }: CandidateDashboardSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profil</CardTitle>
          <FileText className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{profileComplete ? "Complet" : "À compléter"}</div>
          <CardDescription>Votre profil est {profileComplete ? "complet" : "à finaliser"}</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Candidatures</CardTitle>
          <Briefcase className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{applicationsCount}</div>
          <CardDescription>Offres postulées</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Documents</CardTitle>
          <Sparkles className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{documentsCount}</div>
          <CardDescription>Pièces jointes disponibles</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
