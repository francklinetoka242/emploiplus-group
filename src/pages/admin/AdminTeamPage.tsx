import React from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function AdminTeamPage() {
  const { t } = useI18n();

  const teamMembers = [
    { id: "member1", email: "amina@emploiplus.group" },
    { id: "member2", email: "david@emploiplus.group" },
    { id: "member3", email: "salima@emploiplus.group" },
  ];

  const team = teamMembers.map((member) => ({
    ...member,
    name: t(`admin.team.${member.id}.name`),
    role: t(`admin.team.${member.id}.role`),
    specialty: t(`admin.team.${member.id}.specialty`),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.team.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.team.description")}</p>
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
                <span className="font-semibold text-foreground">{t("admin.team.emailLabel")} :</span> {member.email}
              </div>
              <div>
                <span className="font-semibold text-foreground">{t("admin.team.specialtyLabel")} :</span> {member.specialty}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="mt-5 w-full justify-center">
              {t("admin.team.viewProfile")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
