import React from "react";
import { Eye, EyeOff, ExternalLink, PencilLine, Plus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { uploadFileToStorage } from "@/lib/supabase-storage";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { centralAfricaCityGroups } from "@/lib/centralAfricaCities";
import type { Database } from "@/integrations/supabase/types";

type JobOffer = Database["public"]["Tables"]["job_offers"]["Row"];

function createEmptyForm() {
  return {
    title: "",
    company: "",
    location_city: "",
    contract_type: "cdi",
    description: "",
    salary: "",
    company_logo: "",
    cover_image: "",
    keywords: "",
    auto_share: false,
    deadline: "",
    seo_description: "",
    application_email: "",
    application_whatsapp: "",
    external_link: "",
    status: "draft" as Database["public"]["Enums"]["job_status"],
  };
}

function formatDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function AdminJobsPage() {
  const { t } = useI18n();
  const [form, setForm] = React.useState(createEmptyForm());
  const [jobs, setJobs] = React.useState<JobOffer[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const loadJobs = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("job_offers").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (!error) {
      setJobs(data ?? []);
      return;
    }
    setMessage({ type: "error", text: error.message });
  }, []);

  React.useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  function createSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const publicUrl = await uploadFileToStorage(file, "job-offers", import.meta.env.VITE_SUPABASE_OFFRES_BUCKET || undefined);
      setForm((prev) => ({ ...prev, cover_image: publicUrl }));
      setMessage({ type: "success", text: "Image téléchargée dans Supabase Storage." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Échec du téléchargement de l’image.";
      setMessage({ type: "error", text: message });
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setMessage(null);
  };

  const startEdit = (job: JobOffer) => {
    setEditingId(job.id);
    setForm({
      title: job.title ?? "",
      company: job.company ?? "",
      location_city: job.location_city ?? "",
      contract_type: job.contract_type ?? "cdi",
      description: job.description ?? "",
      salary: job.salary ?? "",
      company_logo: job.company_logo ?? "",
      cover_image: job.cover_image ?? "",
      keywords: (job.tags ?? []).join(", "),
      auto_share: job.auto_share ?? false,
      deadline: formatDateInput(job.deadline),
      seo_description: job.meta_description ?? "",
      application_email: job.application_email ?? "",
      application_whatsapp: job.application_whatsapp ?? "",
      external_link: job.external_link ?? "",
      status: job.status ?? "draft",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const slug = createSlug(`${form.title}-${form.company}`);
    const payload = {
      slug: editingId ? `${slug}-${editingId.slice(0, 6)}` : slug,
      title: form.title.trim(),
      company: form.company.trim(),
      location_city: form.location_city || null,
      contract_type: form.contract_type || null,
      description: form.description,
      salary: form.salary || null,
      company_logo: form.company_logo || null,
      cover_image: form.cover_image || null,
      tags: form.keywords ? form.keywords.split(",").map((s) => s.trim()).filter(Boolean) : [],
      status: form.status,
      publish_at: form.status === "published" ? new Date().toISOString() : null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      expires_at: form.deadline ? new Date(form.deadline).toISOString() : null,
      application_email: form.application_email || null,
      application_whatsapp: form.application_whatsapp || null,
      external_link: form.external_link || null,
      meta_description: form.seo_description || null,
      auto_share: form.auto_share,
      updated_at: new Date().toISOString(),
    };

    try {
      const query = editingId
        ? supabase.from("job_offers").update(payload).eq("id", editingId)
        : supabase.from("job_offers").insert([payload]).select("id").single();

      const { error } = await query;

      if (error) {
        setMessage({ type: "error", text: error.message });
        console.error("Job save error", error);
        return;
      }

      setMessage({ type: "success", text: editingId ? "Offre mise à jour avec succès." : t("admin.jobs.create.publishedMessage") });
      resetForm();
      await loadJobs();
    } catch (err) {
      console.error("Job save error", err);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Une erreur inattendue est survenue." });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (job: JobOffer, nextStatus: Database["public"]["Enums"]["job_status"]) => {
    setActionLoadingId(job.id);
    const { error } = await supabase
      .from("job_offers")
      .update({
        status: nextStatus,
        publish_at: nextStatus === "published" ? (job.publish_at ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: nextStatus === "published" ? "Offre publiée." : "Visibilité masquée." });
    await loadJobs();
  };

  const deleteJob = async (job: JobOffer) => {
    if (!window.confirm(`Supprimer définitivement l'offre « ${job.title} » ?`)) return;
    setActionLoadingId(job.id);
    const { error } = await supabase.from("job_offers").delete().eq("id", job.id);
    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Offre supprimée." });
    await loadJobs();
  };

  const statusMeta = {
    published: { label: "Publié", badge: "default" as const },
    draft: { label: "Brouillon", badge: "secondary" as const },
    archived: { label: "Archivé", badge: "outline" as const },
    scheduled: { label: "Planifié", badge: "secondary" as const },
    expired: { label: "Expiré", badge: "destructive" as const },
  };

  return (
    <>
      <SEO
        title="Administration - Offres d'emploi"
        description="Créez et gérez les offres d'emploi depuis l'administration EmploiPlus Group."
        canonical={`${BASE_URL}/admin/jobs`}
        robots="noindex,nofollow"
      />
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">{t("admin.jobs.title")}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{t("admin.jobs.description")}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                <Plus className="mr-2 size-4" />{editingId ? "Annuler l'édition" : "Nouvelle offre"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void loadJobs()}>
                <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
              </Button>
            </div>
          </div>
        </div>

        {message ? (
          <div className={`rounded-3xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{editingId ? "Modifier l'offre" : "Créer une offre"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Renseignez les informations essentielles pour la publication.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.title")}</label>
                <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.jobs.field.titlePlaceholder")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.company")}</label>
                <Input name="company" value={form.company} onChange={handleChange} required placeholder={t("admin.jobs.field.companyPlaceholder")} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.city")}</label>
                <Select value={form.location_city} onValueChange={(value) => setForm((prev) => ({ ...prev, location_city: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("admin.jobs.field.cityPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {centralAfricaCityGroups.map((group) => (
                      <SelectGroup key={group.country}>
                        <SelectLabel>{group.country}</SelectLabel>
                        {group.cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <SelectSeparator />
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.contractType")}</label>
                <Select value={form.contract_type} onValueChange={(value) => setForm((prev) => ({ ...prev, contract_type: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("admin.jobs.field.contractTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">{t("admin.jobs.field.contractTypeOption.cdi")}</SelectItem>
                    <SelectItem value="cdd">{t("admin.jobs.field.contractTypeOption.cdd")}</SelectItem>
                    <SelectItem value="stage">{t("admin.jobs.field.contractTypeOption.stage")}</SelectItem>
                    <SelectItem value="freelance">{t("admin.jobs.field.contractTypeOption.freelance")}</SelectItem>
                    <SelectItem value="temps_partiel">{t("admin.jobs.field.contractTypeOption.temps_partiel")}</SelectItem>
                    <SelectItem value="interim">{t("admin.jobs.field.contractTypeOption.interim")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.salary")}</label>
                <Input name="salary" value={form.salary} onChange={handleChange} placeholder={t("admin.jobs.field.salaryPlaceholder")} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.description")}</label>
                <Textarea name="description" value={form.description} onChange={handleChange} rows={6} required placeholder={t("admin.jobs.field.descriptionPlaceholder")} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.seoDescription")}</label>
                <Textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={6} placeholder={t("admin.jobs.field.seoDescriptionPlaceholder")} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Email de réception</label>
                <Input name="application_email" value={form.application_email} onChange={handleChange} placeholder="contact@entreprise.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">WhatsApp</label>
                <Input name="application_whatsapp" value={form.application_whatsapp} onChange={handleChange} placeholder="+242..." />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Lien externe</label>
                <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.keywords")}</label>
                <Input name="keywords" value={form.keywords} onChange={handleChange} placeholder={t("admin.jobs.field.keywordsPlaceholder")} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 items-end">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.deadline")}</label>
                <Input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
              </div>
              <div className="rounded-3xl border border-border bg-secondary/10 p-4">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                  <input type="checkbox" name="auto_share" checked={form.auto_share} onChange={handleChange} className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary" />
                  {t("admin.jobs.field.autoShare")}
                </label>
                <p className="mt-2 text-xs text-muted-foreground">{t("admin.jobs.field.autoShareHelp")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Statut</label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as Database["public"]["Enums"]["job_status"] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Image de l’offre (Supabase)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary/10">
                  <UploadCloud className="size-4" />
                  <span>{uploadingImage ? "Téléchargement..." : "Choisir une image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event)} />
                </label>
                {form.cover_image ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background/70 p-2">
                    <img src={form.cover_image} alt="Aperçu de l’offre" className="h-32 w-full rounded-xl object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
              {submitting ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : t("admin.jobs.field.submit")}
            </Button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Liste des offres</h2>
              <p className="mt-1 text-sm text-muted-foreground">Publiez, masquez, modifiez ou supprimez une offre en quelques clics.</p>
            </div>
            <div className="text-sm text-muted-foreground">{jobs.length} élément(s)</div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-border bg-background/70 p-6 text-sm text-muted-foreground">Chargement...</div>
          ) : jobs.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-border bg-background/70 p-6 text-sm text-muted-foreground">Aucune offre pour le moment.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Offre</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Statut</th>
                    <th className="px-3 py-3 font-medium">Ville</th>
                    <th className="px-3 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const meta = statusMeta[job.status as keyof typeof statusMeta] ?? statusMeta.draft;
                    return (
                      <tr key={job.id} className="border-b border-border/60 align-top">
                        <td className="px-3 py-4">
                          <div className="font-semibold text-foreground">{job.title}</div>
                          <div className="mt-1 text-muted-foreground">{job.company}</div>
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {job.publish_at ? new Date(job.publish_at).toLocaleDateString("fr-FR") : new Date(job.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 py-4"><Badge variant={meta.badge}>{meta.label}</Badge></td>
                        <td className="px-3 py-4 text-muted-foreground">{job.location_city || "—"}</td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => startEdit(job)}>
                              <PencilLine className="mr-2 size-4" /> Modifier
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => void updateStatus(job, job.status === "published" ? "archived" : "published")} disabled={actionLoadingId === job.id}>
                              {job.status === "published" ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                              {job.status === "published" ? "Masquer" : "Publier"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" asChild>
                              <a href={`/jobs/${job.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 size-4" /> Voir
                              </a>
                            </Button>
                            <Button type="button" size="sm" variant="destructive" onClick={() => void deleteJob(job)} disabled={actionLoadingId === job.id}>
                              <Trash2 className="mr-2 size-4" /> Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
