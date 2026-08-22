import React from "react";
import {
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  PencilLine,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useI18n } from "@/i18n";
import SEO from "@/components/SEO";
import { BASE_URL } from "@/features/seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { uploadImageToStorage } from "@/services/storageService";
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

const PAGE_SIZE = 10;

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
    is_featured: false,
    sort_order: 0,
  };
}

export function AdminBlogPage() {
  const { t } = useI18n();
  const [form, setForm] = React.useState(createEmptyForm());
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPosts, setTotalPosts] = React.useState(0);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setMessage(null);
    setForm((prev) => ({
      ...prev,
      [name]: name === "sort_order" ? Number(value) : value,
    }));
  };

  const loadPosts = React.useCallback(
    async (nextPage = page) => {
      setLoading(true);
      const offset = (nextPage - 1) * PAGE_SIZE;

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .order("is_featured", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("publish_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);

      setLoading(false);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }

      if (countError) {
        setMessage({ type: "error", text: countError.message });
        return;
      }

      setPosts(data ?? []);
      setTotalPosts(count ?? 0);
    },
    [page],
  );

  React.useEffect(() => {
    void loadPosts(page);
  }, [loadPosts, page]);

  function createSlug(value: string) {
    return (
      value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "") || `item-${Date.now()}`
    );
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const { url: publicUrl } = await uploadImageToStorage(
        file,
        "blog",
        import.meta.env.VITE_SUPABASE_BLOG_BUCKET || undefined,
      );
      setForm((prev) => ({ ...prev, image: publicUrl }));
      setMessage({ type: "success", text: "Image téléchargée dans Supabase Storage." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Échec du téléchargement de l’image.";
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
    setShowForm(false);
  };

  const handlePageChange = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safePage);
  };

  const toggleForm = () => {
    if (editingId) {
      resetForm();
      return;
    }
    setShowForm((prev) => !prev);
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
      is_featured: post.is_featured ?? false,
      sort_order: post.sort_order ?? 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const slug = form.slug || createSlug(form.title || `post-${Date.now()}`);
    const updatePayload: Database["public"]["Tables"]["blog_posts"]["Update"] = {
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
      sort_order: Number(form.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    const insertPayload: Database["public"]["Tables"]["blog_posts"]["Insert"] = {
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
      sort_order: Number(form.sort_order || 0),
      updated_at: new Date().toISOString(),
    };

    const query = editingId
      ? supabase.from("blog_posts").update(updatePayload).eq("id", editingId)
      : supabase.from("blog_posts").insert([insertPayload]).select("id").single();

    const { error } = await query;
    setSubmitting(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      console.error("Blog save error", error);
      return;
    }

    setMessage({
      type: "success",
      text: editingId ? "Article mis à jour avec succès." : t("admin.blog.publishedMessage"),
    });
    resetForm();
    await loadPosts();
  };

  const updateStatus = async (
    post: BlogPost,
    nextStatus: Database["public"]["Enums"]["post_status"],
  ) => {
    setActionLoadingId(post.id);
    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: nextStatus,
        publish_at:
          nextStatus === "published" ? (post.publish_at ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);
    setActionLoadingId(null);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "success",
      text: nextStatus === "published" ? "Article publié." : "Visibilité masquée.",
    });
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
      <div className="space-y-3">
        <div className="rounded-[1.25rem] border border-slate-200 bg-white/90 p-3 shadow-sm md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Administration
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
                {t("admin.blog.pageTitle")}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("admin.blog.pageDescription")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleForm}
                className="h-10 w-10 rounded-full border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                aria-label={editingId ? "Annuler l'édition" : "Nouvel article"}
                title={editingId ? "Annuler l'édition" : "Nouvel article"}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => void loadPosts(page)}
                className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                aria-label="Actualiser"
                title="Actualiser"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-3xl border px-4 py-3 text-sm ${message.type === "success" ? "border-secondary/40 bg-secondary/10 text-secondary-foreground" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
          >
            {message.text}
          </div>
        ) : null}

        {showForm ? (
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="rounded-[2rem] border border-border bg-background p-8 shadow-soft">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {editingId ? "Modifier l'article" : "Créer un article"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Conservez un contenu clair et gérable depuis un tableau de bord unique.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.title")}
                  </label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder={t("admin.blog.field.titlePlaceholder")}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.category")}
                  </label>
                  <Input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    placeholder={t("admin.blog.field.categoryPlaceholder")}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.excerpt")}
                  </label>
                  <Textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={4}
                    placeholder={t("admin.blog.field.excerptPlaceholder")}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.author")}
                  </label>
                  <Input
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder={t("admin.blog.field.authorPlaceholder")}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  {t("admin.blog.field.content")}
                </label>
                <Textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  rows={8}
                  placeholder={t("admin.blog.field.contentPlaceholder")}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.image")}
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary/10">
                    <UploadCloud className="size-4" />
                    <span>{uploadingImage ? "Téléchargement..." : "Choisir une image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => void handleImageUpload(event)}
                    />
                  </label>
                  {form.image ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background/70 p-2">
                      <img
                        src={form.image}
                        alt="Aperçu de l’article"
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    </div>
                  ) : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.slug")}
                  </label>
                  <Input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder={t("admin.blog.field.slugPlaceholder")}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Titre SEO
                  </label>
                  <Input
                    name="seo_title"
                    value={form.seo_title}
                    onChange={handleChange}
                    placeholder="Titre SEO"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Description SEO
                  </label>
                  <Input
                    name="seo_description"
                    value={form.seo_description}
                    onChange={handleChange}
                    placeholder="Description SEO"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/70 p-4">
                  <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, is_featured: event.target.checked }))
                      }
                      className="size-4 rounded border-border"
                    />
                    Mettre à la une
                  </label>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Ordre d’affichage
                  </label>
                  <Input
                    name="sort_order"
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    {t("admin.blog.field.status")}
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        status: value as Database["public"]["Enums"]["post_status"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("admin.blog.field.statusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        {t("admin.blog.field.statusOption.draft")}
                      </SelectItem>
                      <SelectItem value="published">
                        {t("admin.blog.field.statusOption.published")}
                      </SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Enregistrer les modifications"
                    : t("admin.blog.submit")}
              </Button>
            </div>
          </form>
        ) : null}

        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Liste des articles</h2>
              <p className="mt-1 text-sm text-slate-500">
                Consultez chaque contenu, suivez son statut et pilotez sa visibilité.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
              {totalPosts} élément(s)
            </div>
          </div>

          {loading ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Chargement...
            </div>
          ) : posts.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Aucun article pour le moment.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {posts.map((post) => {
                  const meta =
                    statusMeta[post.status as keyof typeof statusMeta] ?? statusMeta.draft;

                  return (
                    <div
                      key={post.id}
                      className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50/60 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="truncate text-base font-semibold text-slate-900">
                              {post.title}
                            </p>
                            <Badge variant={meta.badge}>{meta.label}</Badge>
                          </div>
                          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="truncate">{post.category || "—"}</span>
                            <span>•</span>
                            <span>{post.publish_at ? new Date(post.publish_at).toLocaleDateString("fr-FR") : new Date(post.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {post.author || "Équipe"}
                            {post.is_featured ? " • À la une" : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => startEdit(post)}
                          className="h-9 w-9 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          aria-label="Modifier l'article"
                          title="Modifier l'article"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant={post.status === "published" ? "secondary" : "outline"}
                          onClick={() =>
                            void updateStatus(
                              post,
                              post.status === "published" ? "archived" : "published",
                            )
                          }
                          disabled={actionLoadingId === post.id}
                          className="h-9 w-9 rounded-full"
                          aria-label={post.status === "published" ? "Masquer l'article" : "Publier l'article"}
                          title={post.status === "published" ? "Masquer l'article" : "Publier l'article"}
                        >
                          {post.status === "published" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 rounded-full text-slate-700 hover:bg-slate-100"
                          aria-label="Voir l'article"
                          title="Voir l'article"
                          asChild
                        >
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => void deletePost(post)}
                          disabled={actionLoadingId === post.id}
                          className="h-9 w-9 rounded-full"
                          aria-label="Supprimer l'article"
                          title="Supprimer l'article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="h-9 w-9 rounded-full"
                  aria-label="Page précédente"
                  title="Page précédente"
                >
                  <span className="text-base">‹</span>
                </Button>

                <div className="text-xs font-medium text-slate-500">
                  Page {page}/{totalPages}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                  className="h-9 w-9 rounded-full"
                  aria-label="Page suivante"
                  title="Page suivante"
                >
                  <span className="text-base">›</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
