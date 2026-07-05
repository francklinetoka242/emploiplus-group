import React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type JobOfferPreview = Pick<
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
  | "salary"
  | "deadline"
  | "tags"
>;

export type BlogPostPreview = Pick<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "status"
  | "publish_at"
  | "image"
  | "category"
  | "is_featured"
  | "sort_order"
>;

export type JobOfferDetail = Pick<
  Database["public"]["Tables"]["job_offers"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "company"
  | "company_logo"
  | "contract_type"
  | "location_city"
  | "location_country"
  | "description"
  | "requirements"
  | "status"
  | "publish_at"
  | "expires_at"
  | "application_email"
  | "application_whatsapp"
  | "external_link"
  | "cover_image"
  | "meta_title"
  | "meta_description"
  | "og_image"
  | "updated_at"
  | "salary"
  | "deadline"
  | "tags"
>;

export type BlogPostDetail = Pick<
  Database["public"]["Tables"]["blog_posts"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "content"
  | "excerpt"
  | "status"
  | "publish_at"
  | "meta_title"
  | "meta_description"
  | "og_image"
  | "image"
  | "video_url"
  | "external_link"
  | "category"
  | "tags"
  | "is_featured"
  | "sort_order"
>;

export function usePublishedJobOffers(limit = 10) {
  const [offers, setOffers] = React.useState<JobOfferPreview[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    async function fetchOffers() {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("job_offers")
        .select(
          "id, slug, title, company, contract_type, location_city, location_country, description, requirements, status, publish_at, salary, deadline, tags",
        )
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      const visibleOffers = (data || []).filter((offer) => {
        if (!offer.publish_at) return true;
        return new Date(offer.publish_at) <= new Date(now);
      });
      setOffers(visibleOffers);
      setLoading(false);
    }

    fetchOffers();
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
    async function fetchPosts() {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, status, publish_at, image, category, is_featured, sort_order",
        )
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("publish_at", { ascending: false })
        .limit(limit);

      if (!mounted) return;
      const visiblePosts = (data || []).filter((post) => {
        if (!post.publish_at) return true;
        return new Date(post.publish_at) <= new Date(now);
      });
      setPosts(visiblePosts);
      setLoading(false);
    }

    fetchPosts();
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
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;
    async function fetchJob() {
      const { data } = await supabase
        .from("job_offers")
        .select("*")
        .eq("slug", slug ?? "")
        .single();

      if (!mounted) return;
      setJob(data as JobOfferDetail | null);
      setLoading(false);
    }

    fetchJob();
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
    if (!slug) {
      setLoading(false);
      return;
    }

    let mounted = true;
    async function fetchPost() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug ?? "")
        .single();

      if (!mounted) return;
      setPost(data as BlogPostDetail | null);
      setLoading(false);
    }

    fetchPost();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { post, loading };
}
