import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CreditCard, Pencil, Search } from "lucide-react";

export const Route = createFileRoute("/admin/lipa")({
  component: LipaPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800",
  approved:  "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

function LipaPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [instalments, setInstalments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"members"|"instalments">("members");

  useEffect(() => { load(); }, []);

  async function load() {
    const [m, i] = await Promise.all([
      supabase.from("lipa_members").select("*").order("member_since", { ascending: false }),
      supabase.from("lipa_instalments").select("*, lipa_members(full_name, email)").order("created_at", { ascending: false }),
    ]);
    if (m.error) toast.error(m.error.message);
    setMembers(m.data ?? []);
    setInstalments(i.data ?? []);
  }

  const filteredMembers = members.filter(m =>
    !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: members.length,
    pending: members.filter(m => m.status === "pending").length,
    approved: members.filter(m => m.status === "approved").length,
    activeInstalments: instalments.filter(i => i.status === "active" || i.status === "overdue").length,
    totalCredit: members.reduce((s, m) => s + Number(m.credit_limit || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-7 w-7 text-amber-600" />
        <div>
          <h1 className="text-3xl font-bold">Lipa Mdogo Mdogo</h1>
          <p className="text-muted-foreground">Instalment plan members and payment tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Members", value: stats.total },
          { label: "Pending Approval", value: stats.pending },
          { label: "Approved", value: stats.approved },
          { label: "Active Plans", value: stats.activeInstalments },
          { label: "Total Credit Issued", value: `KES ${stats.totalCredit.toLocaleString()}` },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <Button size="sm" variant={tab === "members" ? "default" : "outline"} onClick={() => setTab("members")}>Members</Button>
        <Button size="sm" variant={tab === "instalments" ? "default" : "outline"} onClick={() => setTab("instalments")}>Instalment Plans</Button>
        {tab === "members" && (
          <div className="relative ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-8 w-56" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
      </div>

      {tab === "members" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Employer</TableHead>
                  <TableHead>Credit Limit</TableHead>
                  <TableHead>Balance Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No members.</TableCell></TableRow>
                ) : filteredMembers.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.full_name}</div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{m.phone || "—"}</TableCell>
                    <TableCell className="text-sm">{m.id_number || "—"}</TableCell>
                    <TableCell className="text-sm">{m.employer || "—"}</TableCell>
                    <TableCell className="font-medium">KES {Number(m.credit_limit || 0).toLocaleString()}</TableCell>
                    <TableCell>KES {Number(m.balance_used || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[m.status]}`}>{m.status}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(m); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Room / Booking</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Deposit Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instalments.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No instalment plans.</TableCell></TableRow>
                ) : instalments.map(i => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="font-medium">{i.lipa_members?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{i.lipa_members?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Room {i.room_number || "—"}</div>
                      <div className="text-xs text-muted-foreground font-mono">{i.booking_reference || "—"}</div>
                    </TableCell>
                    <TableCell>KES {Number(i.total_amount).toLocaleString()}</TableCell>
                    <TableCell>KES {Number(i.deposit_paid).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-amber-600">KES {Number(i.amount_remaining).toLocaleString()}</TableCell>
                    <TableCell>{i.instalments_paid}/{i.instalment_plan} months</TableCell>
                    <TableCell className="text-xs">{i.next_due_date || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                        i.status === "completed" ? "bg-green-100 text-green-700" :
                        i.status === "overdue"   ? "bg-red-100 text-red-700" :
                        i.status === "active"    ? "bg-blue-100 text-blue-700" :
                        "bg-secondary text-muted-foreground"
                      }`}>{i.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Manage Member — {editing.full_name}</DialogTitle></DialogHeader>
            <LipaEditForm member={editing} onSaved={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function LipaEditForm({ member, onSaved }: { member: any; onSaved: () => void }) {
  const [status, setStatus] = useState(member.status);
  const [creditLimit, setCreditLimit] = useState(String(member.credit_limit || 0));
  const [balanceUsed, setBalanceUsed] = useState(String(member.balance_used || 0));

  async function save() {
    const { error } = await supabase.from("lipa_members").update({
      status,
      credit_limit: Number(creditLimit),
      balance_used: Number(balanceUsed),
    }).eq("id", member.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["pending","approved","suspended"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Credit Limit (KES)</Label><Input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} /></div>
        <div><Label>Balance Used (KES)</Label><Input type="number" value={balanceUsed} onChange={e => setBalanceUsed(e.target.value)} /></div>
      </div>
      <p className="text-xs text-muted-foreground">Available = Credit Limit − Balance Used (computed by DB)</p>
      <Button onClick={save} className="w-full">Save Changes</Button>
    </div>
  );
}
