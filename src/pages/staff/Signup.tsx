import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type StaffRole } from "@/lib/staffAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// super_admin and manager are not self-registerable
const ROLES: StaffRole[] = [
  "receptionist", "housekeeping", "maintenance",
  "ict", "food_beverage", "administration", "ceo",
  "wellness_centre", "kitchen", "security", "accounts",
  "outdoor_centre", "marketing", "procurement", "stock_control",
  "hr", "kcau", "mothers_choice",
];

// Authorised emails — only these may register
const ALLOWED_EMAILS = new Set([
  "charltonomondi@gmail.com",
  "benstephr@gmail.com",
  "ict@peakshotels.co.ke",
  "amisacco@peakshotels.co.ke",
  "vmwarania@peakshotels.co.ke",
  "outdoorfitnesscenter@peakshotels.co.ke",
  "indoorfitnesscenter@peakshotels.co.ke",
  "marketing@peakshotels.co.ke",
  "housekeeping@peakshotels.co.ke",
  "reservation@peakshotels.co.ke",
  "kitchen@peakshotels.co.ke",
  "fnb@peakshotels.co.ke",
  "operations@peakshotels.co.ke",
  "frontoffice@peakshotels.co.ke",
  "kcaucatering@peakshotels.co.ke",
  "bmwarania@peakshotels.co.ke",
  "procurement@peakshotels.co.ke",
  "hr@peakshotels.co.ke",
  "accounts@peakshotels.co.ke",
  "info@peakshotels.co.ke",
  "admin@peakshotels.co.ke",
  "security@peakshotels.co.ke",
]);

export default function StaffSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", role: "receptionist" as StaffRole, department: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Validate email against allowlist as user types
  const emailLower = form.email.trim().toLowerCase();
  const emailTouched = form.email.length > 0;
  const emailAllowed = ALLOWED_EMAILS.has(emailLower);
  const emailIsComplete = form.email.includes("@");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!emailAllowed) {
      toast({
        title: "Email not recognised",
        description: "This email is not authorised. Please use your official Peaks Hotel email address.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authErr || !authData.user) {
      toast({ title: "Sign up failed", description: authErr?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 2. If signUp didn't return a session (email confirmation required),
    //    sign in immediately so auth.uid() is available for RLS
    if (!authData.session) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInErr) {
        // Email confirmation may be required — insert via upsert with user id from signup
        // Fall through and try insert anyway; if it fails tell user to confirm email first
      }
    }

    // 3. Insert staff record with pending status
    const { error: staffErr } = await supabase.from("staff_members").insert({
      user_id: authData.user.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      role: form.role,
      department: form.department || null,
      status: "pending",
    });

    setSubmitting(false);

    if (staffErr) {
      if (staffErr.message.includes("row level security") || staffErr.code === "42501") {
        toast({
          title: "Email confirmation required",
          description: "Please check your email and confirm your account, then sign in again to complete registration.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Profile creation failed", description: staffErr.message, variant: "destructive" });
      }
      return;
    }

    // Sign out after registration — they need admin approval before logging in
    await supabase.auth.signOut();
    setDone(true);
  }

  if (done) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-28">
          <Card className="w-full max-w-md text-center shadow-elegant">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Request Submitted</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your account is pending approval by an admin. You'll be able to log in once access is granted.
              </p>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-28">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Request Staff Access</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input required value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Work Email</Label>
                <div className="relative">
                  <Input
                    type="email" required value={form.email}
                    onChange={e => set("email", e.target.value)}
                    placeholder="you@peakshotels.co.ke"
                    className={emailTouched && emailIsComplete
                      ? emailAllowed
                        ? "border-green-500 focus-visible:ring-green-400 pr-9"
                        : "border-red-400 focus-visible:ring-red-400 pr-9"
                      : ""
                    }
                  />
                  {emailTouched && emailIsComplete && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailAllowed
                        ? <CheckCircle className="h-4 w-4 text-green-500" />
                        : <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </span>
                  )}
                </div>
                {emailTouched && emailIsComplete && !emailAllowed && (
                  <p className="text-xs text-red-600 mt-1">
                    ✗ Email not recognised. Use your official Peaks Hotel email address.
                  </p>
                )}
                {emailTouched && emailIsComplete && emailAllowed && (
                  <p className="text-xs text-green-600 mt-1">✓ Email found — you may proceed.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+254 700 000 000" />
              </div>
              <div className="space-y-1.5">
                <Label>Department / Role</Label>
                <select
                  value={form.role}
                  onChange={e => set("role", e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    required minLength={8}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || (emailIsComplete && !emailAllowed)}
              >
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Request Access"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/staff/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
