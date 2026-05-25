import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

const ROLES = ["super_admin","manager","receptionist"];

function StaffPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("super_admin");
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    const map = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = map.get(r.user_id) ?? [];
      arr.push(r.role);
      map.set(r.user_id, arr);
    });
    setStaff((profiles ?? []).map((p: any) => ({ ...p, roles: map.get(p.id) ?? [] })));
  }

  async function addRole(userId: string, role: string) {
    if (!isAdmin) return toast.error("Only super admins can change roles");
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    if (error) return toast.error(error.message);
    toast.success("Role added");
    load();
  }

  async function removeRole(userId: string, role: string) {
    if (!isAdmin) return toast.error("Only super admins can change roles");
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) return toast.error(error.message);
    toast.success("Role removed");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff & Roles</h1>
        <p className="text-muted-foreground">Manage staff and access. New users sign up at /admin/signup.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Name</TableHead><TableHead>Roles</TableHead><TableHead>Add role</TableHead></TableRow></TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No staff yet.</TableCell></TableRow>
              ) : staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.email}</TableCell>
                  <TableCell>{s.full_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.roles.length === 0 && <span className="text-xs text-muted-foreground">No roles</span>}
                      {s.roles.map((r: string) => (
                        <button key={r} disabled={!isAdmin} onClick={() => removeRole(s.id, r)} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-destructive hover:text-destructive-foreground">
                          {r} ×
                        </button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(v) => addRole(s.id, v)} disabled={!isAdmin}>
                      <SelectTrigger className="h-8 w-40"><SelectValue placeholder="+ add role" /></SelectTrigger>
                      <SelectContent>
                        {ROLES.filter((r) => !s.roles.includes(r)).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {!isAdmin && <p className="text-xs text-muted-foreground">You need the super_admin role to modify other staff.</p>}
    </div>
  );
}
