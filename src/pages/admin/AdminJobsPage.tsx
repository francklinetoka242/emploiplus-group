import React from "react";
import { useI18n } from "@/lib/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminJobsPage() {
  const [form, setForm] = React.useState({
    title: "",
    company: "",
    city: "",
    contract_type: "cdi",
    description: "",
    salary: "",
    company_logo: "",
    keywords: "",
    auto_share: false,
    deadline: "",
    seo_description: "",
  });
  const [success, setSuccess] = React.useState<string | null>(null);
  const { t } = useI18n();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  function createSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);

    const slug = createSlug(`${form.title}-${form.company}`);
    const payload = {
      slug,
      title: form.title,
      company: form.company,
      location_city: form.city || null,
      contract_type: form.contract_type || null,
      description: form.description,
      salary: form.salary || null,
      company_logo: form.company_logo || null,
      tags: form.keywords ? form.keywords.split(",").map((s) => s.trim()).filter(Boolean) : [],
      status: "published",
      publish_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("job_offers").insert([payload]).select("id").single();
    if (error) {
      setSuccess(error.message);
      console.error("Job insert error", error);
      return;
    }

    setSuccess(t("admin.jobs.create.publishedMessage"));
    console.log("Offre publiée", data);
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
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.jobs.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.jobs.description")}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
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

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.city")}</label>
              <Select value={form.city} onValueChange={(value) => setForm((prev) => ({ ...prev, city: value }))}>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.description")}</label>
              <Textarea name="description" value={form.description} onChange={handleChange} rows={6} required placeholder={t("admin.jobs.field.descriptionPlaceholder")} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.jobs.field.seoDescription")}</label>
              <Textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows={6} placeholder={t("admin.jobs.field.seoDescriptionPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.companyLogo")}</label>
              <Input
                name="company_logo"
                type="file"
                onChange={(event) => setForm((prev) => ({ ...prev, company_logo: event.target.files?.[0]?.name || "" }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.jobs.field.keywords")}</label>
              <Input name="keywords" value={form.keywords} onChange={handleChange} placeholder={t("admin.jobs.field.keywordsPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 items-end">
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

          <div className="mt-4 rounded-3xl border border-border bg-slate-950/95 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">{t("admin.jobs.field.requiredFieldsTitle")}</p>
            <p className="mt-2">{t("admin.jobs.field.requiredFieldsDescription")}</p>
          </div>

          {success ? <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500 px-4 py-3 text-sm text-emerald-500">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t("admin.jobs.field.submit")}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
}
