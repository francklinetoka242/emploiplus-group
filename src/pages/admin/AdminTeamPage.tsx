import React from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type AdminMember = {
  id: string;
  email: string;
  name: string;
  role: string;
  specialty: string;
};

export function AdminTeamPage() {
  const { t } = useI18n();
  const [teamMembers, setTeamMembers] = React.useState<AdminMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadTeam() {
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          role,
          user:user_id (
            email,
            user_metadata
          )
        `)
        .order("role", { ascending: true });

      if (!mounted) return;
      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      const members = (data ?? []).map((row) => {
        const user = (row as any).user;
        const email = user?.email ?? row.user_id ?? "";
        const name = user?.user_metadata?.full_name ?? user?.email ?? email;
        const specialty = user?.user_metadata?.specialty ?? "";

        return {
          id: row.id,
          email,
          name,
          role: row.role ?? t("admin.team.roleLabel"),
          specialty,
        } as AdminMember;
      });

      setTeamMembers(members);
    }

    loadTeam();
    return () => {
      mounted = false;
    };
  }, [t]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.team.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.team.description")}</p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-border bg-background p-6 text-center text-sm text-muted-foreground">
          {t("admin.team.loading")}
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="rounded-[2rem] border border-border bg-background p-6 text-sm text-muted-foreground">
          {t("admin.team.empty")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-[2rem] border border-border bg-background p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
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
                  <span className="font-semibold text-foreground">{t("admin.team.specialtyLabel")} :</span> {member.specialty || "-"}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="mt-5 w-full justify-center">
                {t("admin.team.viewProfile")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
