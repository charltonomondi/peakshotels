import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useStaffAuth } from "@/lib/staffAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, Eye, EyeOff, CheckCircle2, XCircle, KeyRound, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LoginState = "idle" | "loading" | "success" | "error";
type View = "login" | "forgot" | "forgot_sent";

export default function StaffLogin() {
  const navigate = useNavigate();
  const { staff, loading } = useStaffAuth();

  // Login state
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [errMsg, setErrMsg]   = useState("");

  // Forgot password state
  const [view, setView]           = useState<View>("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetName, setResetName]   = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetErr, setResetErr]     = useState("");

  if (!loading && staff?.status === "active") {
    navigate("/staff/dashboard");
    return null;
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginState("loading");
    setErrMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginState("error");
      setErrMsg(error.message);
      setTimeout(() => setLoginState("idle"), 2000);
      return;
    }
    setLoginState("success");
    setTimeout(() => navigate("/staff/dashboard"), 1200);
  }

  // ── Forgot password — raise ticket ─────────────────────────────────────────
  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetSending(true);
    setResetErr("");

    const emailNorm = resetEmail.trim().toLowerCase();

    // Validate against the allowlist (no DB lookup needed — avoids RLS issues)
    const ALLOWED = new Set([
      "charltonomondi@gmail.com","benstephr@gmail.com","ict@peakshotels.co.ke",
      "amisacco@peakshotels.co.ke","vmwarania@peakshotels.co.ke",
      "outdoorfitnesscenter@peakshotels.co.ke","indoorfitnesscenter@peakshotels.co.ke",
      "marketing@peakshotels.co.ke","housekeeping@peakshotels.co.ke",
      "reservation@peakshotels.co.ke","kitchen@peakshotels.co.ke",
      "fnb@peakshotels.co.ke","operations@peakshotels.co.ke",
      "frontoffice@peakshotels.co.ke","kcaucatering@peakshotels.co.ke",
      "bmwarania@peakshotels.co.ke","procurement@peakshotels.co.ke",
      "hr@peakshotels.co.ke","accounts@peakshotels.co.ke",
      "info@peakshotels.co.ke","admin@peakshotels.co.ke","security@peakshotels.co.ke",
    ]);

    if (!ALLOWED.has(emailNorm)) {
      setResetErr("This email is not registered. Please use your official Peaks Hotel email.");
      setResetSending(false);
      return;
    }

    // Insert reset ticket — works with the permissive INSERT policy (no auth needed)
    const { error } = await supabase.from("password_reset_tickets").insert({
      email: emailNorm,
      full_name: resetName.trim() || null,
      status: "pending",
    });

    if (error) {
      setResetErr("Could not submit request: " + error.message);
      setResetSending(false);
      return;
    }

    setResetSending(false);
    setView("forgot_sent");
  }

  const isLoading = loginState === "loading";
  const isError   = loginState === "error";
  const isSuccess = loginState === "success";

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-28">

        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <motion.div
            className="w-full max-w-md"
            animate={
              isError   ? { x: [0, -14, 14, -10, 10, -6, 6, 0] } :
              isSuccess ? { scale: [1, 1.04, 0.97, 1.02, 1] } : {}
            }
            transition={{ duration: isError ? 0.5 : 0.6 }}
          >
            <Card className={`shadow-elegant border-2 transition-colors duration-300 ${
              isError   ? "border-red-400 bg-red-50/30" :
              isSuccess ? "border-green-400 bg-green-50/30" : "border-transparent"
            }`}>
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-3 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isError ? "bg-red-100" : isSuccess ? "bg-green-100" : "bg-primary/10"
                }`}>
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div key="s" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </motion.div>
                    ) : isError ? (
                      <motion.div key="e" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.3 }}>
                        <XCircle className="h-8 w-8 text-red-500" />
                      </motion.div>
                    ) : (
                      <motion.div key="i" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <Shield className="h-8 w-8 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <CardTitle className={`text-2xl ${isError ? "text-red-700" : isSuccess ? "text-green-700" : ""}`}>
                  {isSuccess ? "Welcome back! 🎉" : isError ? "Login failed" : "Staff Portal"}
                </CardTitle>
                <CardDescription>
                  {isSuccess ? "Redirecting to your dashboard…" : isError ? errMsg : "Peaks Hotel Nanyuki — Staff login"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Work Email</Label>
                    <input id="email" type="email" required value={email}
                      onChange={e => setEmail(e.target.value)} placeholder="you@peakshotels.co.ke"
                      disabled={isLoading || isSuccess}
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => { setResetEmail(email); setView("forgot"); }}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input id="password" type={showPw ? "text" : "password"} required
                        value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" disabled={isLoading || isSuccess}
                        className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      />
                      <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className={`w-full transition-all duration-300 ${isSuccess ? "bg-green-600 hover:bg-green-700" : isError ? "bg-red-600 hover:bg-red-700" : ""}`}
                    disabled={isLoading || isSuccess}>
                    {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> :
                     isSuccess ? <><CheckCircle2 className="h-4 w-4 mr-2" />Signed in!</> :
                     isError   ? "Try again" : "Sign in"}
                  </Button>

                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex justify-center gap-1 text-lg">
                        {["🎉","✨","🏆","✅","🎊"].map((e, i) => (
                          <motion.span key={i} initial={{ y: 0, opacity: 0 }} animate={{ y: -20, opacity: [0, 1, 0] }}
                            transition={{ delay: i * 0.08, duration: 0.7 }}>{e}</motion.span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/staff/signup" className="text-primary hover:underline font-medium">Request access</Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── FORGOT PASSWORD VIEW ── */}
        {view === "forgot" && (
          <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-elegant">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <KeyRound className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription>Enter your work email to raise a reset request. The super admin will approve it.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Your Name</Label>
                    <input type="text" required value={resetName}
                      onChange={e => setResetName(e.target.value)} placeholder="Full name"
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Work Email</Label>
                    <input type="email" required value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)} placeholder="you@peakshotels.co.ke"
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  {resetErr && <p className="text-sm text-red-600">{resetErr}</p>}
                  <Button type="submit" className="w-full" disabled={resetSending}>
                    {resetSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit Reset Request"}
                  </Button>
                  <button type="button" onClick={() => setView("login")}
                    className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 mt-1">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                  </button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── RESET REQUEST SENT VIEW ── */}
        {view === "forgot_sent" && (
          <motion.div className="w-full max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="shadow-elegant border-2 border-green-400 bg-green-50/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800">Request Submitted</CardTitle>
                <CardDescription>
                  Your password reset request has been raised. The super admin will review it and send you a reset link once approved.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Check back or contact <strong>charltonomondi@gmail.com</strong> if urgent.</p>
                <Button variant="outline" onClick={() => setView("login")} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
      <Footer />
    </>
  );
}
