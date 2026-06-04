import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export default function LipaLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        if (authErr.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials.");
        } else if (authErr.message.includes("Email not confirmed")) {
          throw new Error("Please confirm your email before signing in.");
        }
        throw authErr;
      }
      if (!data.session) throw new Error("Login failed. Please try again.");
      navigate("/lipa/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-32 pb-16 bg-gradient-to-b from-secondary to-background flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-card rounded-2xl border border-border p-6 md:p-8 shadow-elegant">

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6 text-accent" />
              </div>
              <p className="text-accent font-medium tracking-[0.2em] uppercase text-xs mb-1">Lipa Mdogo Mdogo</p>
              <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in to manage your instalments</p>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-lg text-sm border ${
                error.startsWith("✅")
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) { setError("Enter your email first"); return; }
                      await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin + "/lipa/login",
                      });
                      setError("✅ Password reset link sent! Check your inbox.");
                    }}
                    className="text-xs text-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <Button type="submit" variant="gold" className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Not enrolled yet?{" "}
              <Link to="/lipa/signup" className="text-accent hover:underline font-medium">Apply now</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
