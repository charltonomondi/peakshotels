import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Clock, Banknote } from "lucide-react";

export default function LipaSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", idNumber: "",
    employer: "", monthlyIncome: "", password: "", confirm: "",
  });
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
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.fullName },
          emailRedirectTo: window.location.origin + "/lipa/dashboard",
        },
      });
      if (authErr) throw authErr;
      if (!authData.user) throw new Error("Signup failed");

      // Wait for trigger to create base record, then patch extra fields
      await new Promise(r => setTimeout(r, 1500));
      await supabase.from("lipa_members").upsert({
        user_id: authData.user.id,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone || null,
        id_number: form.idNumber || null,
        employer: form.employer || null,
        monthly_income: form.monthlyIncome ? parseFloat(form.monthlyIncome) : null,
      }, { onConflict: "user_id" });

      if (authData.session) {
        navigate("/lipa/dashboard");
      } else {
        setError("✅ Application submitted! Please check your email to confirm your account, then sign in.");
      }
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
                <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-2">Peaks Hotel</p>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Lipa Mdogo Mdogo
                </h1>
                <p className="text-muted-foreground">
                  Enjoy luxury now, pay in easy instalments. Book your stay today with as little as 30% deposit and spread the rest over time.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: CreditCard,  title: "Pay in instalments",    desc: "Split your booking cost into manageable monthly payments" },
                  { icon: ShieldCheck, title: "Secure & trusted",       desc: "Your data is protected and your account is fully secure" },
                  { icon: Clock,       title: "Quick approval",          desc: "Get approved in minutes and start booking right away" },
                  { icon: Banknote,    title: "No hidden charges",       desc: "Transparent pricing — what you see is what you pay" },
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

              {/* How it works */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
                <p className="font-semibold text-foreground text-sm mb-3">How it works</p>
                {[
                  "Apply and get approved in minutes",
                  "Book any room — pay 30% deposit upfront",
                  "Pay the balance in 2 or 3 monthly instalments",
                  "Enjoy your stay while completing payments",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                    <span className="w-5 h-5 bg-accent text-background rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-elegant">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Apply now</h2>
              <p className="text-muted-foreground text-sm mb-6">Takes less than 2 minutes</p>

              {error && (
                <div className={`mb-4 p-3 rounded-lg text-sm border ${
                  error.startsWith("✅")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>{error}</div>
              )}

              {/* Step indicators */}
              <div className="flex gap-2 mb-6">
                {[1, 2].map(s => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-muted"}`} />
                ))}
              </div>

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                      <input required value={form.fullName} onChange={set("fullName")} placeholder="As per your ID"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                      <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                      <input required value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">National ID Number</label>
                      <input required value={form.idNumber} onChange={set("idNumber")} placeholder="e.g. 12345678"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <Button type="submit" variant="gold" className="w-full" size="lg">
                      Next →
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Employer / Business Name</label>
                      <input value={form.employer} onChange={set("employer")} placeholder="Optional"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Monthly Income (KES)</label>
                      <input type="number" min="0" value={form.monthlyIncome} onChange={set("monthlyIncome")} placeholder="Optional"
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
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
                      <Button type="submit" variant="gold" className="flex-1" disabled={loading}>
                        {loading ? "Submitting…" : "Submit Application"}
                      </Button>
                    </div>
                  </>
                )}
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link to="/lipa/login" className="text-accent hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
