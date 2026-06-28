import React from "react";
import { Eye, EyeOff, ExternalLink, PencilLine, Plus, RefreshCw, Trash2 } from "lucide-react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

function createEmptyForm() {
  return {
    title: "",
    category: "",
    content: "",
    status: "draft" as Database["public"]["Enums"]["post_status"],
    image: "",
    excerpt: "",
    author: "",
    slug: "",
    seo_title: "",
    seo_description: "",
  };
}

export function AdminBlogPage() {
  const { t } = useI18n();
  const [form, setForm] = React.useState(createEmptyForm());
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setMessage(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setLoading(false);
    if (!error) {
      setPosts(data ?? []);
      return;
    }
    setMessage({ type: "error", text: error.message });
  }, []);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function createSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
  }

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setMessage(null);
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title ?? "",
      category: post.category ?? "",
      content: post.content ?? "",
      status: post.status ?? "draft",
      image: post.image ?? "",
      excerpt: post.excerpt ?? "",
      author: post.author ?? "",
      slug: post.slug ?? "",
      seo_title: post.meta_title ?? "",
      seo_description: post.meta_description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const slug = form.slug || createSlug(form.title || `post-${Date.now()}`);
    const payload = {
      slug,
      title: form.title.trim(),
      category: form.category || null,
      content: form.content,
      excerpt: form.excerpt || null,
      image: form.image || null,
      author: form.author || null,
      status: form.status as Database["public"]["Enums"]["post_status"],
      publish_at: form.status === "published" ? new Date().toISOString() : null,
      meta_title: form.seo_title || null,
      meta_description: form.seo_description || null,
      updated_at: new Date().toISOString(),
    };

    const query = editingId
      ? supabase.from("blog_posts").update(payload).eq("id", editingId)
      : supabase.from("blog_posts").insert([payload]).select("id").single();

    const { error } = await query;
    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      console.error("Blog save error", error);
      return;
    }

    setMessage({ type: "success", text: editingId ? "Article mis à jour avec succès." : t("admin.blog.publishedMessage") });
    resetForm();
    await loadPosts();
  };

  const updateStatus = async (post: BlogPost, nextStatus: Database["public"]["Enums"]["post_status"]) => {
    setActionLoadingId(post.id);
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: nextStatus,
        publish_at: nextStatus === "published" ? (post.publish_at ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);
    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: nextStatus === "published" ? "Article publié." : "Visibilité masquée." });
    await loadPosts();
  };

  const deletePost = async (post: BlogPost) => {
    if (!window.confirm(`Supprimer définitivement l'article « ${post.title} » ?`)) return;
    setActionLoadingId(post.id);
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Article supprimé." });
    await loadPosts();
  };

  const statusMeta = {
    published: { label: "Publié", badge: "default" as const },
    draft: { label: "Brouillon", badge: "secondary" as const },
    archived: { label: "Archivé", badge: "outline" as const },
  };

  return (
    <>
      <SEO
        title="Administration - Blog"
        description="Gérez les articles de blog depuis l'administration EmploiPlus Group."
        canonical={`${BASE_URL}/admin/blog`}
        robots="noindex,nofollow"
      />
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">{t("admin.blog.pageTitle")}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{t("admin.blog.pageDescription")}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                <Plus className="mr-2 size-4" />{editingId ? "Annuler l'édition" : "Nouvel article"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void loadPosts()}>
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{editingId ? "Modifier l'article" : "Créer un article"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Conservez un contenu clair et gérable depuis un tableau de bord unique.</p>
            </div>
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

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">{t("admin.blog.field.excerpt")}</label>
                <Textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={4} placeholder={t("admin.blog.field.excerptPlaceholder")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.author")}</label>
                <Input name="author" value={form.author} onChange={handleChange} placeholder={t("admin.blog.field.authorPlaceholder")} />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.content")}</label>
              <Textarea name="content" value={form.content} onChange={handleChange} required rows={8} placeholder={t("admin.blog.field.contentPlaceholder")} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.image")}</label>
                <Input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.slug")}</label>
                <Input name="slug" value={form.slug} onChange={handleChange} placeholder={t("admin.blog.field.slugPlaceholder")} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Titre SEO</label>
                <Input name="seo_title" value={form.seo_title} onChange={handleChange} placeholder="Titre SEO" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Description SEO</label>
                <Input name="seo_description" value={form.seo_description} onChange={handleChange} placeholder="Description SEO" />
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">{t("admin.blog.field.status")}</label>
                <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as Database["public"]["Enums"]["post_status"] }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("admin.blog.field.statusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("admin.blog.field.statusOption.draft")}</SelectItem>
                    <SelectItem value="published">{t("admin.blog.field.statusOption.published")}</SelectItem>
                    <SelectItem value="archived">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
              {submitting ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : t("admin.blog.submit")}
            </Button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Liste des articles</h2>
              <p className="mt-1 text-sm text-muted-foreground">Consultez chaque contenu, suivez son statut et pilotez sa visibilité.</p>
            </div>
            <div className="text-sm text-muted-foreground">{posts.length} élément(s)</div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-3xl border border-border bg-background/70 p-6 text-sm text-muted-foreground">Chargement...</div>
          ) : posts.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-border bg-background/70 p-6 text-sm text-muted-foreground">Aucun article pour le moment.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Article</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Statut</th>
                    <th className="px-3 py-3 font-medium">Catégorie</th>
                    <th className="px-3 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const meta = statusMeta[post.status as keyof typeof statusMeta] ?? statusMeta.draft;
                    return (
                      <tr key={post.id} className="border-b border-border/60 align-top">
                        <td className="px-3 py-4">
                          <div className="font-semibold text-foreground">{post.title}</div>
                          <div className="mt-1 text-muted-foreground">{post.author || "Équipe"}</div>
                        </td>
                        <td className="px-3 py-4 text-muted-foreground">
                          {post.publish_at ? new Date(post.publish_at).toLocaleDateString("fr-FR") : new Date(post.created_at).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-3 py-4"><Badge variant={meta.badge}>{meta.label}</Badge></td>
                        <td className="px-3 py-4 text-muted-foreground">{post.category || "—"}</td>
                        <td className="px-3 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => startEdit(post)}>
                              <PencilLine className="mr-2 size-4" /> Modifier
                            </Button>
                            <Button type="button" size="sm" variant="secondary" onClick={() => void updateStatus(post, post.status === "published" ? "archived" : "published")} disabled={actionLoadingId === post.id}>
                              {post.status === "published" ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                              {post.status === "published" ? "Masquer" : "Publier"}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" asChild>
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 size-4" /> Voir
                              </a>
                            </Button>
                            <Button type="button" size="sm" variant="destructive" onClick={() => void deletePost(post)} disabled={actionLoadingId === post.id}>
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
