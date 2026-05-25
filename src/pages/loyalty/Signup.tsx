import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Star, Gift, TrendingUp } from "lucide-react";

export default function LoyaltySignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Signup failed");

      // Create loyalty member record
      const { error: memberErr } = await supabase.from("loyalty_members").insert({
        user_id: authData.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone || null,
        points: 0,
        tier: "Bronze",
      });
      if (memberErr) throw memberErr;

      navigate("/loyalty/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-32 pb-16 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left — benefits */}
            <div className="space-y-6">
              <div>
                <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-2">Peaks Loyalty</p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Join & Earn Rewards
                </h1>
                <p className="text-muted-foreground">
                  Every stay earns you points. Redeem them for free nights, upgrades, and exclusive perks.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Star, title: "Earn 10% back", desc: "Get 1 point for every KES 100 spent on bookings" },
                  { icon: Gift, title: "Exclusive perks", desc: "Silver & Gold members enjoy room upgrades and late checkout" },
                  { icon: TrendingUp, title: "Track your stays", desc: "Full dashboard showing your booking history and points balance" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-4 bg-card rounded-xl border border-border">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { tier: "Bronze", range: "0 – 999 pts", color: "bg-amber-100 text-amber-800" },
                  { tier: "Silver", range: "1,000 – 4,999 pts", color: "bg-slate-100 text-slate-700" },
                  { tier: "Gold",   range: "5,000+ pts", color: "bg-yellow-100 text-yellow-700" },
                ].map(t => (
                  <div key={t.tier} className={`${t.color} rounded-xl p-3`}>
                    <p className="font-bold text-sm">{t.tier}</p>
                    <p className="text-xs mt-0.5 opacity-80">{t.range}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-elegant">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Create your account</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input required value={form.fullName} onChange={set("fullName")} placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                  <input value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <input required type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <input required type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating account…" : "Join Peaks Loyalty"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already a member?{" "}
                <Link to="/loyalty/login" className="text-accent hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
