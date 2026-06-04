import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface LipaMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  id_number: string | null;
  employer: string | null;
  monthly_income: number | null;
  credit_limit: number;
  balance_used: number;
  balance_available: number;
  status: "pending" | "approved" | "suspended";
  member_since: string;
  updated_at: string;
}

interface LipaCtx {
  user: User | null;
  session: Session | null;
  member: LipaMember | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const Ctx = createContext<LipaCtx>({
  user: null, session: null, member: null, loading: true,
  signOut: async () => {}, refreshMember: async () => {},
});

export function LipaAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<LipaMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchMember(data.session.user.id);
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchMember(s.user.id);
      else { setMember(null); setLoading(false); }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchMember(uid: string) {
    const { data } = await supabase
      .from("lipa_members")
      .select("*")
      .eq("user_id", uid)
      .single();
    setMember(data ?? null);
    setLoading(false);
  }

  async function refreshMember() {
    if (user) await fetchMember(user.id);
  }

  return (
    <Ctx.Provider value={{
      user, session, member, loading,
      signOut: async () => { await supabase.auth.signOut(); setMember(null); },
      refreshMember,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLipaAuth = () => useContext(Ctx);

export const STATUS_COLORS = {
  pending:   "text-amber-700 bg-amber-100",
  approved:  "text-green-700 bg-green-100",
  suspended: "text-red-700 bg-red-100",
};
