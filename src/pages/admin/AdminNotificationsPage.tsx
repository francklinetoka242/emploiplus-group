import React from "react";
import { useI18n } from "@/i18n";
import { BASE_URL } from "@/features/seo";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  createNotification,
  deleteNotification,
  fetchNotifications,
  NotificationRecord,
  NotificationStatus,
  NotificationType,
  toggleNotificationVisibility,
  updateNotification,
} from "@/integrations/supabase/notifications";
import { supabase } from "@/integrations/supabase/client";

type NotificationForm = {
  title: string;
  content: string;
  type: NotificationType;
  target: "all" | "user";
  userId: string;
  status: NotificationStatus;
};

const defaultForm: NotificationForm = {
  title: "",
  content: "",
  type: "admin",
  target: "all",
  userId: "",
  status: "active",
};

const notificationTypes: { value: NotificationType; label: string }[] = [
  { value: "candidature", label: "Candidature" },
  { value: "admin", label: "Admin" },
  { value: "evenement", label: "Événement" },
  { value: "offre", label: "Offre" },
];

const notificationStatusLabels: Record<NotificationStatus, string> = {
  active: "Actif",
  masked: "Masqué",
};

export function AdminNotificationsPage() {
  const { t } = useI18n();
  const [allNotifications, setAllNotifications] = React.useState<NotificationRecord[]>([]);
  const [form, setForm] = React.useState<NotificationForm>(defaultForm);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [users, setUsers] = React.useState<
    Array<{ id: string; first_name: string | null; last_name: string | null; email: string | null }>
  >([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState<"all" | NotificationType>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | NotificationStatus>("all");
  const [showSystemNotifications, setShowSystemNotifications] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchNotifications();
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    if (Array.isArray(data)) {
      setAllNotifications(data);
      return;
    }
    // Keep all notifications in memory, then split them into manual admin notifications
    // versus system-generated offer notifications.
    setAllNotifications(data ?? []);
  }, []);

  React.useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  React.useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const { data, error } = await supabase
          .from("candidates")
          .select("id, first_name, last_name, email")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setUsers(
            data.map((u) => ({
              id: u.id,
              first_name: u.first_name ?? null,
              last_name: u.last_name ?? null,
              email: u.email ?? null,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load candidates for admin notification target", err);
      } finally {
        setUsersLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setMessage(null);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "userId" ? value.trim() : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      user_id: form.target === "user" && form.userId ? form.userId : null,
      status: form.status,
      is_read: false,
    };

    try {
      const response = editingId
        ? await updateNotification(editingId, payload)
        : await createNotification(payload);

      if (response.error) {
        setMessage({ type: "error", text: response.error.message });
        return;
      }
      setMessage({
        type: "success",
        text: editingId ? "Notification mise à jour." : "Notification créée avec succès.",
      });
      resetForm();
      await loadNotifications();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notification: NotificationRecord) => {
    setEditingId(notification.id);
    setForm({
      title: notification.title,
      content: notification.content ?? "",
      type: notification.type,
      target: notification.user_id ? "user" : "all",
      userId: notification.user_id ?? "",
      status: notification.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleToggle = async (notification: NotificationRecord) => {
    const nextStatus: NotificationStatus = notification.status === "active" ? "masked" : "active";
    const { error } = await toggleNotificationVisibility(notification.id, nextStatus);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: `Notification ${nextStatus === "masked" ? "masquée" : "réactivée"}.`,
    });
    await loadNotifications();
  };

  const handleDelete = async (notification: NotificationRecord) => {
    if (!window.confirm(`Supprimer définitivement la notification « ${notification.title} » ?`)) {
      return;
    }
    const { error } = await deleteNotification(notification.id);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Notification supprimée." });
    await loadNotifications();
  };

  const notifications = React.useMemo(
    () =>
      allNotifications.filter((notification) => {
        const type = String(notification.type ?? "").toLowerCase();
        return type === "admin";
      }),
    [allNotifications],
  );

  const systemOfferNotifications = React.useMemo(
    () =>
      allNotifications.filter((notification) => {
        const type = String(notification.type ?? "").toLowerCase();
        return type === "job" || type === "offre";
      }),
    [allNotifications],
  );

  const activeCount = React.useMemo(
    () => notifications.filter((notification) => notification.status === "active").length,
    [notifications],
  );

  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((notification) => {
      const matchesType = typeFilter === "all" || notification.type === typeFilter;
      const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [notifications, typeFilter, statusFilter]);

  return (
    <>
      <SEO
        title="Administration - Gestion des notifications"
        description="Gérez les notifications candidate depuis l'espace administrateur EmploiPlus."
        canonical={`${BASE_URL}/admin/notifications`}
        robots="noindex,nofollow"
      />

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Administration</p>
              <h1 className="text-3xl font-semibold text-slate-900">Gestion des notifications</h1>
              <p className="mt-2 text-sm text-slate-600">
                Envoyez, modifiez et masquez des notifications candidates depuis le back-office.
              </p>
            </div>
            <div className="grid gap-3 sm:auto-cols-min sm:grid-flow-col">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {activeCount} notification{activeCount > 1 ? "s" : ""} active
                {activeCount > 1 ? "s" : ""}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {notifications.length} total
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-3xl border px-4 py-4 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-border bg-background p-6 shadow-soft">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Créer ou modifier une notification
                </h2>
                <p className="text-sm text-slate-500">
                  Le statut "Masqué" permet de conserver l'enregistrement sans le rendre visible aux
                  candidats.
                </p>
              </div>
              {editingId && (
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Annuler la modification
                </Button>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                    Titre
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="block text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {notificationTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="target" className="block text-sm font-medium text-slate-700">
                    Cible
                  </label>
                  <select
                    id="target"
                    name="target"
                    value={form.target}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="all">Tous les candidats</option>
                    <option value="user">Utilisateur spécifique</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium text-slate-700">
                    Statut
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="active">Actif</option>
                    <option value="masked">Masqué</option>
                  </select>
                </div>
              </div>

              {form.target === "user" && (
                <div className="space-y-2">
                  <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                    Utilisateur cible
                  </label>
                  {usersLoading ? (
                    <div className="text-sm text-slate-500">Chargement des utilisateurs…</div>
                  ) : users.length > 0 ? (
                    <select
                      id="userId"
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Sélectionnez un utilisateur</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {`${u.first_name ?? ""} ${u.last_name ?? ""} — ${u.email ?? u.id}`.trim()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id="userId"
                      name="userId"
                      value={form.userId}
                      onChange={handleChange}
                      placeholder="UUID utilisateur"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {editingId ? "Mettre à jour" : "Créer la notification"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  Réinitialiser
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-border bg-background p-6 shadow-soft">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Aide rapide</h2>
                <p className="text-sm text-slate-500">
                  Utilisez "Cible" pour envoyer des notifications globales ou à un candidat précis.
                  Les notifications masquées restent en base sans être visibles dans les listes
                  publiques.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <p className="font-semibold">Bonnes pratiques</p>
                <ul className="mt-3 space-y-2 list-disc pl-5 text-slate-600">
                  <li>Choisir un titre clair et bref.</li>
                  <li>Masquer plutôt que supprimer si vous souhaitez conserver l'historique.</li>
                  <li>Limiter l'envoi ciblé aux utilisateurs nécessaires.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/70 p-4 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications système des offres d'emploi
              </h2>
              <p className="text-sm text-slate-500">
                Affichez ici les notifications automatiques générées lors de la publication
                d'offres.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSystemNotifications((value) => !value)}
            >
              {showSystemNotifications ? "Masquer" : "Afficher les notifications d'offres d'emploi"}
            </Button>
          </div>

          {showSystemNotifications && (
            <div className="mt-4 space-y-3">
              {systemOfferNotifications.length > 0 ? (
                systemOfferNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{notification.title}</div>
                        <div className="text-sm text-slate-600">{notification.content}</div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(notification.created_at).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Aucune notification système d'offre pour le moment.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-border bg-background p-6 shadow-soft">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Notifications enregistrées</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as "all" | NotificationType)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="all">Toutes les catégories</option>
                {notificationTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | NotificationStatus)
                }
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="masked">Masqué</option>
              </select>
            </div>
          </div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Titre</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Cible</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Statut</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Créée le</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  className={notification.status === "masked" ? "bg-slate-50/70" : ""}
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-slate-900">{notification.title}</div>
                    <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {notification.content}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary">{notification.type}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{notification.user_id ?? "Tous"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={notification.status === "active" ? "success" : "outline"}>
                      {notificationStatusLabels[notification.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {new Date(notification.created_at).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(notification)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggle(notification)}>
                        {notification.status === "active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(notification)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Aucune notification créée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
