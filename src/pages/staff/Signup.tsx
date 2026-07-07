import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ROLE_LABELS, type StaffRole } from "@/lib/staffAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ROLES: StaffRole[] = ["receptionist", "housekeeping", "restaurant", "maintenance", "manager"];

export default function StaffSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", password: "", role: "receptionist" as StaffRole, department: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    // 2. Insert staff record with pending status
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
      toast({ title: "Profile creation failed", description: staffErr.message, variant: "destructive" });
      return;
    }

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
            <CardDescription>Submit your details — an admin will approve your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input required value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Work Email</Label>
                <Input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@peakshotels.co.ke" />
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
                <Label>Password</Label>
                <Input type="password" required minLength={8} value={form.password}
                  onChange={e => set("password", e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
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
