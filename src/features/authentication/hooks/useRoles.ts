import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DatabaseAppRole } from "@/features/authentication/permissions/roles";
import { useAuth } from "./useAuth";

interface UserRoleRow {
  role: string | null;
}

export function useRoles() {
  const { session, loading: authLoading, error: authError } = useAuth();
  const [roles, setRoles] = useState<DatabaseAppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      if (!session?.user.id) {
        if (!cancelled) {
          setRoles([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_roles")
          .select("id,user_id,role,created_at,is_active")
          .eq("user_id", session.user.id);

        console.info("[useRoles] session.user.id:", session.user.id);
        console.info("[useRoles] user_roles query result:", { data, error });

        if (cancelled) {
          return;
        }

        if (error) {
          console.error("[useRoles] Error fetching roles:", error);
          throw error;
        }

        // Extract roles and validate
        const allRoles = (data ?? []).map((row: any) => row.role).filter(Boolean);
        console.info("[useRoles] All roles from DB:", allRoles);

        const nextRoles = allRoles.filter((role): role is DatabaseAppRole =>
          ["super_admin", "admin", "editor"].includes(role),
        );

        console.info("[useRoles] Filtered roles:", nextRoles);
        // Avoid updating state when roles array is identical to previous to prevent
        // unnecessary re-renders that may cause tight render loops in some envs.
        setRoles((prev) => {
          if (prev.length === nextRoles.length && prev.every((r, i) => r === nextRoles[i])) {
            return prev;
          }
          return nextRoles;
        });
        setError(null);
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : "Impossible de charger les rôles";
          console.error("[useRoles] Exception:", errorMsg);
          setError(errorMsg);
          setRoles([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRoles();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  const hasRole = useMemo(
    () => (role: string) => roles.includes(role as DatabaseAppRole),
    [roles],
  );

  return {
    roles,
    loading: authLoading || loading,
    error: authError || error,
    hasRole,
    isStaff: roles.length > 0,
  };
}
