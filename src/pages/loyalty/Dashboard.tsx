import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLoyaltyAuth, TIER_COLORS, calcPoints } from "@/lib/loyaltyAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, Calendar, TrendingUp, LogOut, Gift, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  room_number: string;
  room_type: string;
  total_amount: number;
  status: string;
  loyalty_points_earned: number;
  created_at: string;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

export default function LoyaltyDashboard() {
  const { user, member, loading, signOut, refreshMember } = useLoyaltyAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/loyalty/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (member) loadData();
  }, [member]);

  async function loadData() {
    setDataLoading(true);
    const [bRes, tRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, reference, check_in, check_out, room_number, room_type, total_amount, status, loyalty_points_earned, created_at")
        .eq("loyalty_member_id", member!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("member_id", member!.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setBookings(bRes.data ?? []);
    setTransactions(tRes.data ?? []);
    setDataLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <p className="text-muted-foreground mb-4">You're not enrolled in the loyalty program yet.</p>
          <Button variant="gold" asChild><Link to="/loyalty/signup">Join Now</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const tierColor = TIER_COLORS[member.tier];
  const nextTier = member.tier === "Bronze" ? "Silver" : member.tier === "Silver" ? "Gold" : null;
  const nextThreshold = member.tier === "Bronze" ? 1000 : member.tier === "Silver" ? 5000 : 5000;
  const progress = Math.min(100, (member.points / nextThreshold) * 100);
  const pointsValue = member.points * 100; // 1 point = KES 100

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-28">

        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Peaks Loyalty Program</p>
                <h1 className="font-heading text-2xl md:text-3xl font-bold">Welcome, {member.full_name.split(" ")[0]}!</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">Member since {new Date(member.member_since).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${tierColor}`}>
                  ★ {member.tier} Member
                </span>
                <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-1" />Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Points Balance", value: member.points.toLocaleString(), sub: `≈ KES ${pointsValue.toLocaleString()} value`, icon: Star, color: "text-accent" },
              { label: "Total Bookings", value: bookings.length, sub: "Stays at Peaks Hotel", icon: Calendar, color: "text-blue-500" },
              { label: "Points Earned", value: transactions.filter(t => t.type === "earned").reduce((s, t) => s + t.points, 0).toLocaleString(), sub: "All time", icon: TrendingUp, color: "text-green-500" },
              { label: "Tier Status", value: member.tier, sub: nextTier ? `${nextThreshold - member.points} pts to ${nextTier}` : "Maximum tier!", icon: Gift, color: "text-yellow-500" },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Tier progress */}
          {nextTier && (
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground text-sm">Progress to {nextTier}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor}`}>{member.tier}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div className="bg-accent h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{member.points.toLocaleString()} pts</span>
                <span>{nextThreshold.toLocaleString()} pts</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Booking history */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Booking History</h2>
                <Button variant="gold" size="sm" asChild><Link to="/booking">Book Again</Link></Button>
              </div>
              {dataLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No bookings yet.</p>
                  <Button variant="gold" size="sm" className="mt-3" asChild><Link to="/booking">Book your first stay</Link></Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {bookings.map(b => (
                    <div key={b.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">Room {b.room_number} — {b.room_type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{b.check_in} → {b.check_out}</p>
                        <p className="text-xs text-muted-foreground font-mono">{b.reference}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">KES {Number(b.total_amount).toLocaleString()}</p>
                        {b.loyalty_points_earned > 0 && (
                          <p className="text-xs text-accent font-medium">+{b.loyalty_points_earned} pts</p>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                          b.status === "confirmed" ? "bg-green-100 text-green-700" :
                          b.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        }`}>{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Points transactions */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Points Activity</h2>
              </div>
              {dataLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No points activity yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Points are awarded after each confirmed booking.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{t.description || t.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("en-KE")}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${t.points > 0 ? "text-green-600" : "text-red-500"}`}>
                        {t.points > 0 ? "+" : ""}{t.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Perks by tier */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <h2 className="font-semibold text-foreground mb-4">Member Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { tier: "Bronze", color: "border-amber-200 bg-amber-50", badge: "text-amber-800 bg-amber-100", perks: ["10% points on every stay", "Member-only rates", "Birthday bonus points"] },
                { tier: "Silver", color: "border-slate-200 bg-slate-50", badge: "text-slate-700 bg-slate-100", perks: ["All Bronze perks", "Free room upgrade (subject to availability)", "Late checkout (1 PM)", "Priority reservations"] },
                { tier: "Gold",   color: "border-yellow-200 bg-yellow-50", badge: "text-yellow-700 bg-yellow-100", perks: ["All Silver perks",  "Airport transfer discount", "Dedicated concierge"] },
              ].map(({ tier, color, badge, perks }) => (
                <div key={tier} className={`border rounded-xl p-4 ${color} ${member.tier === tier ? "ring-2 ring-accent" : ""}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>★ {tier}</span>
                  <ul className="mt-3 space-y-1.5">
                    {perks.map(p => (
                      <li key={p} className="text-xs text-foreground flex items-start gap-1.5">
                        <ChevronRight className="h-3 w-3 text-accent shrink-0 mt-0.5" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
