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
import { Star, Pencil, Search } from "lucide-react";

export const Route = createFileRoute("/admin/loyalty")({
  component: LoyaltyPage,
});

const TIER_COLORS: Record<string, string> = {
  Bronze: "text-amber-700 bg-amber-100",
  Silver: "text-slate-600 bg-slate-100",
  Gold:   "text-yellow-600 bg-yellow-100",
};

function LoyaltyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"members"|"transactions">("members");

  useEffect(() => { load(); }, []);

  async function load() {
    const [m, t] = await Promise.all([
      supabase.from("loyalty_members").select("*").order("member_since", { ascending: false }),
      supabase.from("loyalty_transactions").select("*, loyalty_members(full_name, email)").order("created_at", { ascending: false }).limit(100),
    ]);
    if (m.error) toast.error(m.error.message);
    setMembers(m.data ?? []);
    setTransactions(t.data ?? []);
  }

  const filteredMembers = members.filter(m =>
    !search || m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: members.length,
    bronze: members.filter(m => m.tier === "Bronze").length,
    silver: members.filter(m => m.tier === "Silver").length,
    gold:   members.filter(m => m.tier === "Gold").length,
    totalPoints: members.reduce((s, m) => s + (m.points || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="h-7 w-7 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">Members, points, and transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Members", value: stats.total },
          { label: "Bronze", value: stats.bronze },
          { label: "Silver", value: stats.silver },
          { label: "Gold",   value: stats.gold },
          { label: "Total Points Issued", value: stats.totalPoints.toLocaleString() },
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
        <Button size="sm" variant={tab === "transactions" ? "default" : "outline"} onClick={() => setTab("transactions")}>Transactions</Button>
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
                  <TableHead>Points</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No members.</TableCell></TableRow>
                ) : filteredMembers.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.full_name}</div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{m.phone || "—"}</TableCell>
                    <TableCell className="font-bold text-accent">{m.points.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_COLORS[m.tier]}`}>{m.tier}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.member_since).toLocaleDateString("en-KE")}
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
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No transactions.</TableCell></TableRow>
                ) : transactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="font-medium">{t.loyalty_members?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{t.loyalty_members?.email}</div>
                    </TableCell>
                    <TableCell><span className="capitalize text-xs bg-secondary px-2 py-0.5 rounded">{t.type}</span></TableCell>
                    <TableCell className={`font-bold ${t.points > 0 ? "text-green-600" : "text-red-500"}`}>
                      {t.points > 0 ? "+" : ""}{t.points}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.description || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("en-KE")}</TableCell>
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
            <DialogHeader><DialogTitle>Edit Member — {editing.full_name}</DialogTitle></DialogHeader>
            <MemberEditForm member={editing} onSaved={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MemberEditForm({ member, onSaved }: { member: any; onSaved: () => void }) {
  const [points, setPoints] = useState(String(member.points));
  const [tier, setTier] = useState(member.tier);
  const [adjDesc, setAdjDesc] = useState("");
  const [adjPoints, setAdjPoints] = useState("0");

  async function save() {
    const { error } = await supabase.from("loyalty_members").update({ points: Number(points), tier }).eq("id", member.id);
    if (error) return toast.error(error.message);
    toast.success("Member updated");
    onSaved();
  }

  async function addTransaction() {
    const pts = Number(adjPoints);
    if (!pts) return toast.error("Enter a point amount");
    const { error } = await supabase.from("loyalty_transactions").insert({
      member_id: member.id,
      type: pts > 0 ? "bonus" : "redeemed",
      points: pts,
      description: adjDesc || (pts > 0 ? "Admin bonus" : "Admin adjustment"),
    });
    if (error) return toast.error(error.message);
    await supabase.from("loyalty_members").update({ points: Number(points) + pts }).eq("id", member.id);
    setPoints(String(Number(points) + pts));
    toast.success("Transaction added");
    onSaved();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Points Balance</Label><Input type="number" value={points} onChange={e => setPoints(e.target.value)} /></div>
        <div><Label>Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Bronze","Silver","Gold"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={save} className="w-full">Save Member</Button>
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Add Points Adjustment</p>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Points (+/-)</Label><Input type="number" value={adjPoints} onChange={e => setAdjPoints(e.target.value)} /></div>
          <div><Label>Description</Label><Input value={adjDesc} onChange={e => setAdjDesc(e.target.value)} placeholder="Reason" /></div>
        </div>
        <Button variant="outline" className="w-full mt-2" onClick={addTransaction}>Add Transaction</Button>
      </div>
    </div>
  );
}
