import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mountain, Pencil, Search } from "lucide-react";

export const Route = createFileRoute("/admin/mountain")({
  component: MountainPage,
});

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];
const PAY_STATUSES = ["unpaid", "partial", "paid", "refunded"];

const pkgPrices: Record<string, number> = {
  "Day Trek": 8500,
  "Weekend Summit": 32000,
  "Full Expedition": 55000,
};

function MountainPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from("mountain_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
  }

  const filtered = rows
    .filter(r => filter === "all" || r.status === filter)
    .filter(r => !search || r.full_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search));

  async function updateStatus(id: string, field: string, value: string) {
    const { error } = await supabase.from("mountain_bookings").update({ [field]: value }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  }

  const stats = {
    total: rows.length,
    pending: rows.filter(r => r.status === "pending").length,
    confirmed: rows.filter(r => r.status === "confirmed").length,
    revenue: rows.filter(r => r.payment_status === "paid").reduce((s, r) => s + Number(r.amount_paid || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mountain className="h-7 w-7 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Mountain Bookings</h1>
          <p className="text-muted-foreground">Mount Kenya climbing reservations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Revenue (paid)", value: `KES ${stats.revenue.toLocaleString()}` },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {["all", ...STATUSES].map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name / email / phone…" className="pl-8 w-60" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Climb Date</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No bookings found.</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                    <div className="text-xs text-muted-foreground">{r.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.package}</div>
                    <div className="text-xs text-muted-foreground">KES {(pkgPrices[r.package] || 0).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>{r.climb_date}</TableCell>
                  <TableCell>{r.group_size}</TableCell>
                  <TableCell className="capitalize text-xs">{r.experience}</TableCell>
                  <TableCell>
                    <Select value={r.payment_status} onValueChange={v => updateStatus(r.id, "payment_status", v)}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{PAY_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>KES {Number(r.amount_paid || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={v => updateStatus(r.id, "status", v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editing && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Mountain Booking</DialogTitle></DialogHeader>
            <EditForm booking={editing} onSaved={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EditForm({ booking, onSaved }: { booking: any; onSaved: () => void }) {
  const [form, setForm] = useState({ ...booking });
  const set = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target?.value ?? e }));

  async function save() {
    const { error } = await supabase.from("mountain_bookings").update({
      status: form.status,
      payment_status: form.payment_status,
      amount_paid: Number(form.amount_paid || 0),
      transaction_ref: form.transaction_ref || null,
      notes: form.notes || null,
    }).eq("id", form.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["pending","confirmed","cancelled","completed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Payment Status</Label>
          <Select value={form.payment_status} onValueChange={v => setForm((f: any) => ({ ...f, payment_status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["unpaid","partial","paid","refunded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Amount Paid (KES)</Label><Input type="number" value={form.amount_paid ?? 0} onChange={set("amount_paid")} /></div>
        <div><Label>Transaction Ref</Label><Input value={form.transaction_ref ?? ""} onChange={set("transaction_ref")} /></div>
      </div>
      <div><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={set("notes")} /></div>
      <div className="flex justify-end gap-2">
        <Button onClick={save}>Save Changes</Button>
      </div>
    </div>
  );
}
