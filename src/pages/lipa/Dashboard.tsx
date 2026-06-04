import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLipaAuth, STATUS_COLORS } from "@/lib/lipaAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, LogOut, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

interface Instalment {
  id: string;
  booking_id: string;
  booking_reference: string;
  room_number: string;
  total_amount: number;
  deposit_paid: number;
  amount_remaining: number;
  instalment_plan: number; // 2 or 3 months
  instalments_paid: number;
  next_due_date: string | null;
  status: "active" | "completed" | "overdue" | "cancelled";
  created_at: string;
}

export default function LipaDashboard() {
  const { user, member, loading, signOut, refreshMember } = useLipaAuth();
  const navigate = useNavigate();
  const [instalments, setInstalments] = useState<Instalment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/lipa/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (member) loadData();
  }, [member]);

  async function loadData() {
    setDataLoading(true);
    const { data } = await supabase
      .from("lipa_instalments")
      .select("*")
      .eq("member_id", member!.id)
      .order("created_at", { ascending: false });
    setInstalments(data ?? []);
    setDataLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!member) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 text-center">
          <p className="text-muted-foreground mb-4">You're not enrolled in Lipa Mdogo Mdogo yet.</p>
          <Button variant="gold" asChild><Link to="/lipa/signup">Apply Now</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusColor = STATUS_COLORS[member.status];
  const usedPercent = Math.min(100, member.credit_limit > 0 ? (member.balance_used / member.credit_limit) * 100 : 0);
  const activeInstalments = instalments.filter(i => i.status === "active" || i.status === "overdue");
  const completedInstalments = instalments.filter(i => i.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 md:pt-28">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Lipa Mdogo Mdogo</p>
                <h1 className="font-heading text-2xl md:text-3xl font-bold">Welcome, {member.full_name.split(" ")[0]}!</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">
                  Member since {new Date(member.member_since).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold capitalize ${statusColor}`}>
                  {member.status === "approved" ? "✓" : member.status === "pending" ? "⏳" : "⚠"} {member.status}
                </span>
                <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-1" />Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">

          {/* Pending approval notice */}
          {member.status === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Application under review</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Our team will review your application and notify you within 24 hours. Once approved, you can start booking with instalments.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Credit Limit",      value: `KES ${member.credit_limit.toLocaleString()}`,       sub: "Total approved limit",         icon: CreditCard,   color: "text-accent" },
              { label: "Balance Used",       value: `KES ${member.balance_used.toLocaleString()}`,       sub: "Currently in use",             icon: AlertCircle,  color: "text-amber-500" },
              { label: "Available",          value: `KES ${member.balance_available.toLocaleString()}`,  sub: "Ready to use",                 icon: CheckCircle,  color: "text-green-500" },
              { label: "Active Plans",       value: activeInstalments.length,                            sub: `${completedInstalments.length} completed`,icon: Calendar, color: "text-blue-500" },
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

          {/* Credit utilisation */}
          {member.credit_limit > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground text-sm">Credit Utilisation</p>
                <span className="text-xs text-muted-foreground">{Math.round(usedPercent)}% used</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${usedPercent > 80 ? "bg-red-500" : usedPercent > 50 ? "bg-amber-400" : "bg-green-500"}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>KES {member.balance_used.toLocaleString()} used</span>
                <span>KES {member.credit_limit.toLocaleString()} limit</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Active instalments */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Active Plans</h2>
                {member.status === "approved" && (
                  <Button variant="gold" size="sm" asChild><Link to="/booking">Book a Stay</Link></Button>
                )}
              </div>
              {dataLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
              ) : activeInstalments.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No active instalment plans.</p>
                  {member.status === "approved" && (
                    <Button variant="gold" size="sm" className="mt-3" asChild>
                      <Link to="/booking">Book with Lipa Mdogo Mdogo</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeInstalments.map(inst => (
                    <div key={inst.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">Room {inst.room_number}</p>
                          <p className="text-xs font-mono text-muted-foreground">{inst.booking_reference}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          inst.status === "overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}>{inst.status}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                        <div
                          className="bg-accent h-1.5 rounded-full"
                          style={{ width: `${Math.round((inst.instalments_paid / inst.instalment_plan) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{inst.instalments_paid}/{inst.instalment_plan} instalments paid</span>
                        <span className="font-medium text-foreground">KES {inst.amount_remaining.toLocaleString()} remaining</span>
                      </div>
                      {inst.next_due_date && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Next payment due: {new Date(inst.next_due_date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed plans */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Completed Plans</h2>
              </div>
              {dataLoading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
              ) : completedInstalments.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No completed plans yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {completedInstalments.map(inst => (
                    <div key={inst.id} className="p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground text-sm">Room {inst.room_number}</p>
                        <p className="text-xs font-mono text-muted-foreground">{inst.booking_reference}</p>
                        <p className="text-xs text-muted-foreground">{inst.instalment_plan}-month plan</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">KES {inst.total_amount.toLocaleString()}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid in full</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plan options */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <h2 className="font-semibold text-foreground mb-4">Available Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "2-Month Plan",
                  desc: "Pay 30% upfront, then 2 equal monthly payments",
                  example: "E.g. KES 8,400 stay → KES 2,520 deposit + 2 × KES 2,940",
                  highlight: false,
                },
                {
                  title: "3-Month Plan",
                  desc: "Pay 30% upfront, then 3 equal monthly payments",
                  example: "E.g. KES 8,400 stay → KES 2,520 deposit + 3 × KES 1,960",
                  highlight: true,
                },
                {
                  title: "Full Payment",
                  desc: "Pay everything upfront with no additional charges",
                  example: "Standard booking — available to everyone",
                  highlight: false,
                },
              ].map(({ title, desc, example, highlight }) => (
                <div key={title} className={`border rounded-xl p-4 ${highlight ? "border-accent bg-accent/5 ring-2 ring-accent" : "border-border"}`}>
                  {highlight && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-accent text-background mb-2 inline-block">Popular</span>}
                  <p className="font-semibold text-foreground text-sm mt-1">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{desc}</p>
                  <p className="text-xs text-accent font-medium flex items-start gap-1">
                    <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />{example}
                  </p>
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
