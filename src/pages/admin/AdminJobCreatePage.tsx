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
    location_country: "",
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
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const slug = createSlug(form.title || `${form.company}-${Date.now()}`);
    const payload = {
      slug,
      title: form.title,
      company: form.company,
      company_logo: form.company_logo || null,
      location_city: form.location_city || null,
      location_country: form.location_country || null,
      contract_type: form.contract_type as Database["public"]["Enums"]["contract_type"],
      description: form.description,
      requirements: form.requirements || null,
      application_email: form.application_email || null,
      application_whatsapp: form.application_whatsapp || null,
      external_link: form.external_link || null,
      cover_image: form.cover_image || null,
      status: form.status as Database["public"]["Enums"]["job_status"],
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const { error } = await supabase.from("job_offers").insert([payload]);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(t("admin.jobs.create.successMessage"));
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
              <Input name="location_city" value={form.location_city} onChange={handleChange} placeholder={t("admin.jobs.field.cityPlaceholder")} />
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
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.applicationEmail")}</label>
              <Input name="application_email" value={form.application_email} onChange={handleChange} placeholder={t("admin.jobs.create.field.applicationEmailPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.externalLink")}</label>
              <Input name="external_link" value={form.external_link} onChange={handleChange} placeholder={t("admin.jobs.create.field.externalLinkPlaceholder")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.publishAt")}</label>
              <Input name="publish_at" type="datetime-local" value={form.publish_at} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{t("admin.jobs.create.field.expiresAt")}</label>
              <Input name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange} />
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
            {saving ? t("admin.jobs.create.saving") : t("admin.jobs.create.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
