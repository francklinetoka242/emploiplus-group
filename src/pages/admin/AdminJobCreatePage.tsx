import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { usePageSEO, BASE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

export function AdminJobCreatePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    company: "",
    company_logo: "",
    location_city: "",
    location_country: "Congo",
    contract_type: "cdi",
    description: "",
    requirements: "",
    application_email: "",
    application_whatsapp: "",
    external_link: "",
    cover_image: "",
    status: "draft",
    publish_at: "",
    expires_at: "",
    salary: "",
    seo_description: "",
    keywords: "",
    deadline: "",
    auto_share: false,
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [savedOfferId, setSavedOfferId] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const slug = createSlug(form.title || `${form.company}-${Date.now()}`);
    const requirementParts = [
      form.requirements,
      form.salary ? `Salaire : ${form.salary}` : "",
      form.keywords ? `Mots-clés : ${form.keywords}` : "",
    ].filter(Boolean);

    const nextStatus: Database["public"]["Enums"]["job_status"] = savedOfferId ? "published" : "draft";
    const payload = {
      slug,
      title: form.title.trim(),
      company: form.company.trim(),
      company_logo: form.company_logo || null,
      location_city: form.location_city || null,
      location_country: form.location_country || null,
      contract_type: form.contract_type as Database["public"]["Enums"]["contract_type"],
      description: form.description,
      requirements: requirementParts.length > 0 ? requirementParts.join("\n\n") : null,
      application_email: form.application_email || null,
      application_whatsapp: form.application_whatsapp || null,
      external_link: form.external_link || null,
      cover_image: form.cover_image || null,
      status: nextStatus,
      publish_at: nextStatus === "published"
        ? (form.publish_at ? new Date(form.publish_at).toISOString() : new Date().toISOString())
        : null,
      expires_at: form.deadline
        ? new Date(form.deadline).toISOString()
        : form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      meta_description: form.seo_description || null,
      salary: form.salary || null,
      auto_share: form.auto_share,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      tags: form.keywords
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const { data, error } = savedOfferId
      ? await supabase.from("job_offers").update(payload).eq("id", savedOfferId)
      : await supabase.from("job_offers").insert([payload]).select("id").single();

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    if (!savedOfferId) {
      setSavedOfferId(data?.id || null);
      setSuccess(t("admin.jobs.successMessage"));
      return;
    }

    setSuccess(t("admin.jobs.create.publishedMessage"));
    navigate("/admin/jobs");
  };

  return (
    <div className="space-y-6">
      {usePageSEO({
        title: t("admin.jobs.create.title"),
        description: t("admin.jobs.create.description"),
        canonical: `${BASE_URL}/admin/jobs/new`,
        robots: "noindex,nofollow",
      })}
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{t("admin.jobs.create.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("admin.jobs.create.description")}</p>
          </div>
          <Button size="lg" variant="outline" onClick={() => navigate("/admin/jobs")}>{t("admin.jobs.create.button.back")}</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.title")}</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.jobs.field.titlePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.company")}</label>
              <Input name="company" value={form.company} onChange={handleChange} required placeholder={t("admin.jobs.field.companyPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.city")}</label>
              <Select value={form.location_city} onValueChange={(value) => setForm((prev) => ({ ...prev, location_city: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.cityPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brazzaville">{t("admin.jobs.field.cityOption.brazzaville")}</SelectItem>
                  <SelectItem value="Pointe-Noire">{t("admin.jobs.field.cityOption.pointenoire")}</SelectItem>
                  <SelectItem value="Remote">{t("admin.jobs.field.cityOption.remote")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.country")}</label>
              <Input name="location_country" value={form.location_country} onChange={handleChange} placeholder={t("admin.jobs.create.field.countryPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.contractType")}</label>
              <Select value={form.contract_type} onValueChange={(value) => setForm((prev) => ({ ...prev, contract_type: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.choosePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">{t("admin.jobs.field.contractTypeOption.cdi")}</SelectItem>
                  <SelectItem value="cdd">{t("admin.jobs.field.contractTypeOption.cdd")}</SelectItem>
                  <SelectItem value="stage">{t("admin.jobs.field.contractTypeOption.stage")}</SelectItem>
                  <SelectItem value="freelance">{t("admin.jobs.field.contractTypeOption.freelance")}</SelectItem>
                  <SelectItem value="consultance">{t("admin.jobs.field.contractTypeOption.consultance")}</SelectItem>
                  <SelectItem value="temps_partiel">{t("admin.jobs.field.contractTypeOption.temps_partiel")}</SelectItem>
                  <SelectItem value="interim">{t("admin.jobs.field.contractTypeOption.interim")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.status")}</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.jobs.field.choosePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("admin.jobs.create.field.statusOption.draft")}</SelectItem>
                  <SelectItem value="published">{t("admin.jobs.create.field.statusOption.published")}</SelectItem>
                  <SelectItem value="archived">{t("admin.jobs.create.field.statusOption.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.salary")}</label>
              <Input name="salary" value={form.salary} onChange={handleChange} placeholder={t("admin.jobs.field.salaryPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.applicationEmail")}</label>
              <Input name="application_email" value={form.application_email} onChange={handleChange} placeholder={t("admin.jobs.create.field.applicationEmailPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.externalLink")}</label>
              <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder={t("admin.jobs.create.field.externalLinkPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.keywords")}</label>
              <Input name="keywords" value={form.keywords} onChange={handleChange} placeholder={t("admin.jobs.field.keywordsPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.publishAt")}</label>
              <Input name="publish_at" type="datetime-local" value={form.publish_at} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.deadline")}</label>
              <Input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.field.seoDescription")}</label>
              <Textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={4} placeholder={t("admin.jobs.field.seoDescriptionPlaceholder")} />
            </div>
            <div className="rounded-2xl border border-border bg-secondary/10 p-4">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                <input type="checkbox" name="auto_share" checked={form.auto_share} onChange={handleChange} className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary" />
                {t("admin.jobs.field.autoShare")}
              </label>
              <p className="mt-2 text-xs text-muted-foreground">{t("admin.jobs.field.autoShareHelp")}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.description")}</label>
            <Textarea name="description" value={form.description} onChange={handleChange} required rows={6} placeholder={t("admin.jobs.create.field.requirementsPlaceholder")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.requirements")}</label>
            <Textarea name="requirements" value={form.requirements} onChange={handleChange} rows={5} placeholder={t("admin.jobs.create.field.requirementsPlaceholder")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.companyLogo")}</label>
              <Input name="company_logo" value={form.company_logo} onChange={handleChange} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.coverImage")}</label>
              <Input name="cover_image" value={form.cover_image} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          {error ? <div className="rounded-2xl bg-destructive/10 border border-destructive px-4 py-3 text-sm text-destructive">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-success/10 border border-success px-4 py-3 text-sm text-success">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
            {saving ? t("admin.jobs.create.saving") : savedOfferId ? t("admin.jobs.create.validate") : t("admin.jobs.field.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
