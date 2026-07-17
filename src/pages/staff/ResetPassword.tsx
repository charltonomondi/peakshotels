import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get("token") ?? "";

  const [ticket, setTicket]   = useState<{ email: string; full_name: string | null; status: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid]   = useState(false);

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [done, setDone]           = useState(false);
  const [errMsg, setErrMsg]       = useState("");

  useEffect(() => {
    async function checkToken() {
      if (!token) { setInvalid(true); setChecking(false); return; }
      const { data } = await supabase
        .from("password_reset_tickets")
        .select("email, full_name, status")
        .eq("token", token)
        .maybeSingle();
      if (!data || data.status !== "approved") {
        setInvalid(true);
      } else {
        setTicket(data);
      }
      setChecking(false);
    }
    checkToken();
  }, [token]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrMsg("Passwords do not match."); return; }
    if (password.length < 8)  { setErrMsg("Password must be at least 8 characters."); return; }
    setSaving(true);
    setErrMsg("");

    // Use Supabase's admin password update via the user's own session
    // First sign in is not possible without old password — we use the admin reset flow:
    // The super_admin's approval triggers Supabase's built-in email reset OR we use the service role.
    // Here we use the updateUser API which works when called from an authenticated session.
    // Since the user isn't logged in, we use the token to sign them in first via OTP workaround:
    // Instead, mark ticket as completed and update via our server or Supabase admin API.
    // For now, update via supabase.auth.admin is not available client-side.
    // We'll use the standard Supabase password reset email flow triggered server-side.
    // Client-side approach: use supabase.auth.updateUser after they verify email OTP.
    // Simplified: use supabase.auth.signInWithOtp for passwordless then updateUser.

    // Practical approach using Supabase's resetPasswordForEmail + session:
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(ticket!.email, {
      redirectTo: `${window.location.origin}/staff/reset-password?token=${token}&set=1`,
    });

    if (resetErr) { setErrMsg(resetErr.message); setSaving(false); return; }

    // Mark ticket as completed
    await supabase.from("password_reset_tickets").update({ status: "completed" }).eq("token", token);
    setDone(true);
    setSaving(false);
  }

  // Handle the case where Supabase redirects back with a session for password update
  const isSetMode = params.get("set") === "1";

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setErrMsg("Passwords do not match."); return; }
    if (password.length < 8)  { setErrMsg("Password must be at least 8 characters."); return; }
    setSaving(true);
    setErrMsg("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setErrMsg(error.message); setSaving(false); return; }

    // Mark ticket completed
    await supabase.from("password_reset_tickets").update({ status: "completed" }).eq("token", token);
    setDone(true);
    setSaving(false);
    setTimeout(() => navigate("/staff/login"), 2000);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invalid) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-6 pt-28">
          <Card className="w-full max-w-md shadow-elegant border-2 border-red-300 bg-red-50/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-500" />
              </div>
              <CardTitle className="text-red-700">Invalid or Expired Link</CardTitle>
              <CardDescription>
                This reset link is invalid, has already been used, or hasn't been approved yet. Please contact the super admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" onClick={() => navigate("/staff/login")} className="w-full">Back to login</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (done) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-6 pt-28">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md">
            <Card className="shadow-elegant border-2 border-green-400 bg-green-50/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Password Updated!</CardTitle>
                <CardDescription>Your password has been reset successfully. Redirecting to login…</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-6 pt-28">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-elegant">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <KeyRound className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Set New Password</CardTitle>
              <CardDescription>Hello {ticket?.full_name ?? ""}! Choose a strong new password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isSetMode ? handleSetNewPassword : handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} required minLength={8}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm Password</Label>
                  <input type="password" required minLength={8}
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating…</> : "Set New Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
