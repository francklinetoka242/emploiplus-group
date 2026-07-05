import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type JobOfferPreview = Pick<
  Database["public"]["Tables"]["job_offers"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "company"
  | "contract_type"
  | "location_city"
  | "location_country"
  | "description"
  | "requirements"
  | "status"
  | "publish_at"
>;

type BlogPostPreview = Pick<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  "id" | "slug" | "title" | "excerpt" | "status" | "publish_at"
>;

type JobOfferDetail = Pick<
  Database["public"]["Tables"]["job_offers"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "company"
  | "contract_type"
  | "location_city"
  | "location_country"
  | "description"
  | "requirements"
  | "status"
  | "publish_at"
  | "updated_at"
  | "expires_at"
  | "cover_image"
  | "og_image"
  | "meta_title"
  | "meta_description"
  | "application_email"
  | "application_whatsapp"
  | "external_link"
>;

type BlogPostDetail = Pick<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "content"
  | "status"
  | "publish_at"
  | "updated_at"
  | "image"
  | "og_image"
  | "meta_title"
  | "meta_description"
>;

export function usePublishedJobOffers(limit = 10) {
  const [offers, setOffers] = React.useState<JobOfferPreview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select(
          "id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at",
        )
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        console.error("Failed to load job offers:", error.message);
        setOffers([]);
      } else {
        setOffers((data ?? []) as JobOfferPreview[]);
      }
      setLoading(false);
    }

    loadOffers();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { offers, loading };
}

export function usePublishedBlogPosts(limit = 9) {
  const [posts, setPosts] = React.useState<BlogPostPreview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, status, publish_at")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      if (error) {
        console.error("Failed to load blog posts:", error.message);
        setPosts([]);
      } else {
        setPosts((data ?? []) as BlogPostPreview[]);
      }
      setLoading(false);
    }

    loadPosts();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { posts, loading };
}

export function useJobOfferBySlug(slug?: string) {
  const [job, setJob] = React.useState<JobOfferDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function loadJob() {
      setLoading(true);
      const { data, error } = await supabase
        .from("job_offers")
        .select(
          "id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at, updated_at, expires_at, cover_image, og_image, meta_title, meta_description, application_email, application_whatsapp, external_link",
        )
        .eq("slug", slug ?? "")
        .single();

      if (!mounted) return;
      if (error) {
        console.error("Failed to load job offer:", error.message);
        setJob(null);
      } else {
        setJob(data as JobOfferDetail);
      }
      setLoading(false);
    }

    loadJob();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { job, loading };
}

export function useBlogPostBySlug(slug?: string) {
  const [post, setPost] = React.useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!slug) return;
    let mounted = true;

    async function loadPost() {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, content, status, publish_at, updated_at, image, og_image, meta_title, meta_description",
        )
        .eq("slug", slug ?? "")
        .single();

      if (!mounted) return;
      if (error) {
        console.error("Failed to load blog post:", error.message);
        setPost(null);
      } else {
        setPost(data as BlogPostDetail);
      }
      setLoading(false);
    }

    loadPost();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { post, loading };
}
