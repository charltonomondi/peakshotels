import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface LoyaltyMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  points: number;
  tier: "Bronze" | "Silver" | "Gold";
  member_since: string;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  member: LoyaltyMember | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, member: null, loading: true,
  signOut: async () => {}, refreshMember: async () => {},
});

export function LoyaltyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<LoyaltyMember | null>(null);
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
      .from("loyalty_members")
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

export const useLoyaltyAuth = () => useContext(Ctx);

// Points calculation: 10% of booking amount, 1 point = KES 100
export function calcPoints(amount: number): number {
  return Math.floor((amount * 0.1) / 100);
}

export const TIER_THRESHOLDS = { Bronze: 0, Silver: 1000, Gold: 5000 };
export const TIER_COLORS = {
  Bronze: "text-amber-700 bg-amber-100",
  Silver: "text-slate-600 bg-slate-100",
  Gold:   "text-yellow-600 bg-yellow-100",
};
