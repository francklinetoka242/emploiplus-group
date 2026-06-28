import React from "react";
import { useI18n } from "@/lib/i18n";
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

export function AdminBlogPage() {
  const { t } = useI18n();
  const [form, setForm] = React.useState({
    title: "",
    category: "",
    content: "",
    status: "draft",
    image: "",
    excerpt: "",
    author: "",
    slug: "",
    seo_title: "",
    seo_description: "",
  });
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const slug = form.slug || createSlug(form.title || `post-${Date.now()}`);
    const payload = {
      slug,
      title: form.title,
      category: form.category || null,
      content: form.content,
      excerpt: form.excerpt || null,
      image: form.image || null,
      author: form.author || null,
      status: "published",
      publish_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("blog_posts").insert([payload]).select("id").single();
    if (error) {
      setSuccess(error.message);
      console.error("Blog insert error", error);
      return;
    }

    setSuccess(t("admin.blog.publishedMessage"));
    console.log("Article publié", data);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-foreground">{t("admin.blog.pageTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("admin.blog.pageDescription")}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.title")}</label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder={t("admin.blog.field.titlePlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.category")}</label>
              <Input name="category" value={form.category} onChange={handleChange} required placeholder={t("admin.blog.field.categoryPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">{t("admin.blog.field.excerpt")}</label>
              <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={4} placeholder={t("admin.blog.field.excerptPlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.author")}</label>
              <Input name="author" value={form.author} onChange={handleChange} placeholder={t("admin.blog.field.authorPlaceholder")} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.content")}</label>
            <Textarea name="content" value={form.content} onChange={handleChange} required rows={8} placeholder={t("admin.blog.field.contentPlaceholder")} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.image")}</label>
              <Input
                name="image"
                type="file"
                onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0]?.name || "" }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.slug")}</label>
              <Input name="slug" value={form.slug} onChange={handleChange} placeholder={t("admin.blog.field.slugPlaceholder")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.seoTitle")}</label>
              <Input name="seo_title" value={form.seo_title} onChange={handleChange} placeholder={t("admin.blog.field.seoTitlePlaceholder")} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.status")}</label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("admin.blog.field.statusPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("admin.blog.field.statusOption.draft")}</SelectItem>
                  <SelectItem value="published">{t("admin.blog.field.statusOption.published")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-slate-950/95 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">{t("admin.blog.field.requiredFieldsTitle")}</p>
            <p className="mt-2">{t("admin.blog.field.requiredFieldsDescription")}</p>
          </div>

          {success ? <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500 px-4 py-3 text-sm text-emerald-500">{success}</div> : null}
          <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {t("admin.blog.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
