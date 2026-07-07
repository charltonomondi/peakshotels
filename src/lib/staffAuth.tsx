import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type StaffRole = "super_admin" | "manager" | "receptionist" | "housekeeping" | "restaurant" | "maintenance";

export interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  department: string | null;
  status: "pending" | "active" | "suspended";
  approved_at: string | null;
  created_at: string;
}

interface StaffCtx {
  user: User | null;
  session: Session | null;
  staff: StaffMember | null;
  loading: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
  refreshStaff: () => Promise<void>;
}

const Ctx = createContext<StaffCtx>({
  user: null, session: null, staff: null, loading: true, isApproved: false,
  signOut: async () => {}, refreshStaff: async () => {},
});

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchStaff(data.session.user.id);
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchStaff(s.user.id);
      else { setStaff(null); setLoading(false); }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchStaff(uid: string) {
    const { data } = await supabase
      .from("staff_members")
      .select("*")
      .eq("user_id", uid)
      .single();
    setStaff(data ?? null);
    setLoading(false);
  }

  async function refreshStaff() {
    if (user) await fetchStaff(user.id);
  }

  return (
    <Ctx.Provider value={{
      user, session, staff, loading,
      isApproved: staff?.status === "active",
      signOut: async () => { await supabase.auth.signOut(); setStaff(null); },
      refreshStaff,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStaffAuth = () => useContext(Ctx);

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  receptionist: "Receptionist",
  housekeeping: "Housekeeping",
  restaurant: "Restaurant",
  maintenance: "Maintenance",
};

export const STATUS_COLORS = {
  pending:   "text-amber-700 bg-amber-100",
  active:    "text-green-700 bg-green-100",
  suspended: "text-red-700 bg-red-100",
};
