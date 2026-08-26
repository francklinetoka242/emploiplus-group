import React from "react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, Ban, CheckCircle2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { buildAdminCreateUserPayload } from "@/features/authentication/utils/adminCreateUserPayload";
import { AdminSearchToolbar } from "./components/AdminSearchToolbar";

type AdminRole = "super_admin" | "admin" | "editor";

type AdminMember = {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: AdminRole;
  specialty: string;
  isActive: boolean;
  isCurrentUser: boolean;
};

type AdminFormState = {
  email: string;
  password: string;
  name: string;
  specialty: string;
  role: AdminRole;
};

const emptyForm = (): AdminFormState => ({
  email: "",
  password: "",
  name: "",
  specialty: "",
  role: "admin",
});

export function AdminTeamPage() {
  const { t } = useI18n();
  const [teamMembers, setTeamMembers] = React.useState<AdminMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [canManageAdmins, setCanManageAdmins] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [currentMemberId, setCurrentMemberId] = React.useState<string | null>(null);
  const [formState, setFormState] = React.useState<AdminFormState>(emptyForm());
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const loadTeam = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    setCanManageAdmins(false);

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    if (!currentUser) {
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    const { data: myRolesData, error: myRolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (myRolesError) {
      setError(myRolesError.message);
      setLoading(false);
      return;
    }

    const isSuperAdmin = (myRolesData ?? []).some((row) => row.role === "super_admin");
    setCanManageAdmins(isSuperAdmin);

    if (!isSuperAdmin) {
      setTeamMembers([]);
      setLoading(false);
      setError(t("admin.team.accessDenied"));
      return;
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("id, role, user_id, email, full_name, specialty, is_active, created_at")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (rolesError) {
      setError(rolesError.message);
      return;
    }

    const members = (rolesData ?? []).map(
      (row: {
        id: string;
        role: string | null;
        user_id: string;
        email: string | null;
        full_name: string | null;
        specialty: string | null;
        is_active: boolean | null;
      }) => {
        const isCurrentUser = row.user_id === currentUser.id;
        const displayName =
          row.full_name ||
          row.email ||
          currentUser.user_metadata?.full_name ||
          currentUser.email ||
          t("admin.team.defaultName");
        const displayEmail =
          row.email ||
          (isCurrentUser ? currentUser.email : `user-${row.user_id.slice(0, 8)}@local`);
        const displayRole = row.role ?? "admin";

        return {
          id: row.id,
          user_id: row.user_id,
          email: displayEmail,
          name: displayName,
          role: displayRole,
          specialty:
            row.specialty ||
            (isCurrentUser
              ? currentUser.user_metadata?.specialty || t("admin.team.defaultSpecialty")
              : t("admin.team.defaultSpecialty")),
          isActive: row.is_active ?? true,
          isCurrentUser,
        } as AdminMember;
      },
    );

    setTeamMembers(members);
  }, [t]);

  React.useEffect(() => {
    let mounted = true;

    async function run() {
      await loadTeam();
      return mounted;
    }

    run();

    return () => {
      mounted = false;
    };
  }, [loadTeam]);

  const resetDialog = () => {
    setFormState(emptyForm());
    setIsEditing(false);
    setCurrentMemberId(null);
    setDialogOpen(false);
  };

  const openCreateDialog = () => {
    setFormState(emptyForm());
    setIsEditing(false);
    setCurrentMemberId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (member: AdminMember) => {
    setFormState({
      email: member.email,
      password: "",
      name: member.name,
      specialty: member.specialty,
      role: member.role,
    });
    setIsEditing(true);
    setCurrentMemberId(member.id);
    setDialogOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (!isEditing) {
        if (!formState.email || !formState.password) {
          throw new Error(t("admin.team.form.required"));
        }

        const signUpPayload = buildAdminCreateUserPayload(formState.email.trim(), formState.password, {
          full_name: formState.name.trim(),
          specialty: formState.specialty.trim(),
          source: "admin-team",
        });

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: signUpPayload.email,
            password: signUpPayload.password,
            firstName: formState.name.trim().split(" ")[0] || "",
            lastName: formState.name.trim().split(/\s+/).slice(1).join(" ") || "",
          }),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(typeof body?.error === "string" ? body.error : t("admin.team.form.userCreateError"));
        }

        const userId = typeof body?.user?.id === "string" ? body.user.id : null;
        if (!userId) {
          throw new Error(t("admin.team.form.userCreateError"));
        }

        const { error: roleInsertError } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: formState.role,
          email: formState.email.trim(),
          full_name: formState.name.trim(),
          specialty: formState.specialty.trim(),
          is_active: true,
        });

        if (roleInsertError) {
          throw roleInsertError;
        }

        setTeamMembers((prev) => [
          {
            id: `${userId}-new`,
            user_id: userId,
            email: formState.email.trim(),
            name: formState.name.trim() || formState.email.trim(),
            role: formState.role,
            specialty: formState.specialty.trim() || t("admin.team.defaultSpecialty"),
            isActive: true,
            isCurrentUser: false,
          },
          ...prev,
        ]);
        toast.success(t("admin.team.toast.created"));
      } else if (currentMemberId) {
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({
            role: formState.role,
            email: formState.email.trim(),
            full_name: formState.name.trim(),
            specialty: formState.specialty.trim(),
          })
          .eq("id", currentMemberId);

        if (updateError) {
          throw updateError;
        }

        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === currentMemberId
              ? {
                  ...member,
                  email: formState.email.trim(),
                  name: formState.name.trim() || formState.email.trim(),
                  role: formState.role,
                  specialty: formState.specialty.trim() || t("admin.team.defaultSpecialty"),
                }
              : member,
          ),
        );
        toast.success(t("admin.team.toast.updated"));
      }

      resetDialog();
      await loadTeam();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("admin.team.toast.error");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (member: AdminMember) => {
    if (member.isCurrentUser) {
      toast.error(t("admin.team.toast.selfAction"));
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_active: !member.isActive })
        .eq("id", member.id);
      if (error) {
        throw error;
      }

      setTeamMembers((prev) =>
        prev.map((row) => (row.id === member.id ? { ...row, isActive: !member.isActive } : row)),
      );
      toast.success(
        member.isActive ? t("admin.team.toast.blocked") : t("admin.team.toast.unblocked"),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("admin.team.toast.error");
      toast.error(message);
    }
  };

  const handleDelete = async (member: AdminMember) => {
    if (member.isCurrentUser) {
      toast.error(t("admin.team.toast.selfAction"));
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", member.id);
      if (error) {
        throw error;
      }

      setTeamMembers((prev) => prev.filter((row) => row.id !== member.id));
      toast.success(t("admin.team.toast.deleted"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("admin.team.toast.error");
      toast.error(message);
    }
  };

  const filteredTeamMembers = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return teamMembers.filter((member) => {
      const matchesQuery = !query || [member.name, member.email, member.specialty, member.role].join(" ").toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? member.isActive : !member.isActive);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchQuery, roleFilter, statusFilter]);

  return (
    <>
      <SEO
        title="Administration - Équipe"
        description="Gérez les membres de l'équipe depuis l'administration EmploiPlus Group."
        canonical={`${BASE_URL}/admin/team`}
        robots="noindex,nofollow"
      />
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Administration
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                {t("admin.team.title")}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">{t("admin.team.description")}</p>
            </div>
            {canManageAdmins && (
              <Button
                onClick={openCreateDialog}
                size="icon"
                className="h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-slate-800"
                aria-label={t("admin.team.createAdmin")}
                title={t("admin.team.createAdmin")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <AdminSearchToolbar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher un membre, un email ou une spécialité"
          filters={
            <>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                <option value="all">Tous les rôles</option>
                <option value="super_admin">Super admin</option>
                <option value="admin">Admin</option>
                <option value="editor">Éditeur</option>
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </>
          }
          filtersActive={roleFilter !== "all" || statusFilter !== "all"}
        />

        {loading ? (
          <div className="rounded-[2rem] border border-border bg-background p-6 text-center text-sm text-muted-foreground">
            {t("admin.team.loading")}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        ) : filteredTeamMembers.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-background p-6 text-sm text-muted-foreground">
            {t("admin.team.empty")}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Users className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-slate-900">{member.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                        {member.role}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="truncate">{member.email}</span>
                      <span>•</span>
                      <span>{member.specialty || "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                  >
                    {member.isActive ? t("admin.team.status.active") : t("admin.team.status.blocked")}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => openEditDialog(member)}
                      className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      aria-label={t("admin.team.actions.edit")}
                      title={t("admin.team.actions.edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => handleToggleStatus(member)}
                      className="h-9 w-9 rounded-full"
                      aria-label={member.isActive ? t("admin.team.actions.block") : t("admin.team.actions.unblock")}
                      title={member.isActive ? t("admin.team.actions.block") : t("admin.team.actions.unblock")}
                    >
                      {member.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(member)}
                      className="h-9 w-9 rounded-full"
                      aria-label={t("admin.team.actions.delete")}
                      title={t("admin.team.actions.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? setDialogOpen(true) : resetDialog())}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("admin.team.form.title.edit") : t("admin.team.form.title.create")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("admin.team.form.description.edit")
                : t("admin.team.form.description.create")}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t("admin.team.form.email")}</Label>
              <Input
                id="admin-email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="admin-password">{t("admin.team.form.password")}</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-name">{t("admin.team.form.name")}</Label>
              <Input
                id="admin-name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-specialty">{t("admin.team.form.specialty")}</Label>
              <Input
                id="admin-specialty"
                value={formState.specialty}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, specialty: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-role">{t("admin.team.form.role")}</Label>
              <Select
                value={formState.role}
                onValueChange={(value: AdminRole) =>
                  setFormState((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger id="admin-role">
                  <SelectValue placeholder={t("admin.team.form.role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("admin.team.role.admin")}</SelectItem>
                  <SelectItem value="editor">{t("admin.team.role.editor")}</SelectItem>
                  <SelectItem value="super_admin">{t("admin.team.role.superAdmin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetDialog}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? t("admin.team.form.saving")
                  : isEditing
                    ? t("admin.team.form.save")
                    : t("admin.team.form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
