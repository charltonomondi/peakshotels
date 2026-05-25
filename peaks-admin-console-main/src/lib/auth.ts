import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "manager" | "receptionist";

export interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  hasRole: (r: AppRole) => boolean;
  isStaff: boolean;
} {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  // loading stays true until BOTH session AND roles are resolved
  const [loading, setLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    // Get initial session first
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadRoles(s.user.id);
      } else {
        // No session — done loading
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    // Listen for auth changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setRolesLoaded(false);
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(uid: string) {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      setRoles((data ?? []).map((r) => r.role as AppRole));
    } catch (_) {
      setRoles([]);
    } finally {
      setRolesLoaded(true);
      setLoading(false);
    }
  }

  return {
    user,
    session,
    roles,
    // Only report "not loading" once roles are resolved too
    loading: loading || !rolesLoaded,
    isStaff: roles.length > 0,
    hasRole: (r) => roles.includes(r),
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}
