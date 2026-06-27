import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function AdminTeamPage() {
  const teamMembers = [
    { name: "Amina K.", role: "Directrice administrative", email: "amina@emploiplus.group", label: "Leadership" },
    { name: "David L.", role: "Chef de produit", email: "david@emploiplus.group", label: "Stratégie" },
    { name: "Salima T.", role: "Responsable contenu", email: "salima@emploiplus.group", label: "Editorial" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">Équipe Admin</h1>
        <p className="mt-3 text-sm text-muted-foreground">Gérez les profils d'équipe, les accès et les responsabilités métier.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <div key={member.email} className="rounded-[2rem] border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Email :</span> {member.email}
              </div>
              <div>
                <span className="font-semibold text-foreground">Spécialité :</span> {member.label}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="mt-5 w-full justify-center">
              Voir le profil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
