import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/jobs-tick")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const [a, b, c] = await Promise.all([
            supabaseAdmin.rpc("expire_jobs" as any),
            supabaseAdmin.rpc("publish_scheduled_jobs" as any),
            supabaseAdmin.rpc("publish_scheduled_posts" as any),
          ]);
          return Response.json({
            ok: true,
            expired_jobs: a.data ?? 0,
            published_jobs: b.data ?? 0,
            published_posts: c.data ?? 0,
            at: new Date().toISOString(),
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
      GET: async () => Response.json({ ok: true, hint: "POST to run tick" }),
    },
  },
});
