import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Smartphone, Bell } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

const METHODS = ["mpesa", "card", "cash", "bank"];
const STATUSES = ["paid", "pending", "failed", "refunded"];

function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [stkOpen, setStkOpen] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const [p, b] = await Promise.all([
      supabase.from("payments").select("*, bookings(reference, guest_name)").order("created_at", { ascending: false }),
      supabase.from("bookings").select("id, reference, guest_name, guest_phone, guest_email, total_amount").order("created_at", { ascending: false }).limit(100),
    ]);
    setPayments(p.data ?? []);
    setBookings(b.data ?? []);
  }

  async function sendNotification(bookingId: string, type: "confirmation" | "payment_receipt") {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return toast.error("Not signed in");
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ bookingId, type }),
    });
    const json = await res.json();
    if (!res.ok) return toast.error(json.error ?? "Failed to send");
    toast.success("Notification sent");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track all transactions, send M-Pesa STK push and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStkOpen(true)}>
            <Smartphone className="h-4 w-4 mr-2" />Send M-Pesa STK
          </Button>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" />Record payment</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Booking</TableHead><TableHead>Amount</TableHead>
              <TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Reference</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments yet.</TableCell></TableRow>
              ) : payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono text-xs">{p.bookings?.reference}<div className="text-xs">{p.bookings?.guest_name}</div></TableCell>
                  <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{p.method}</TableCell>
                  <TableCell><span className="px-2 py-1 rounded text-xs bg-secondary capitalize">{p.status}</span></TableCell>
                  <TableCell className="font-mono text-xs">{p.transaction_ref ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "paid" && p.booking_id && (
                      <Button size="sm" variant="ghost" onClick={() => sendNotification(p.booking_id, "payment_receipt")}>
                        <Bell className="h-3 w-3 mr-1" />Receipt
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaymentDialog open={open} onOpenChange={setOpen} bookings={bookings} onSaved={() => { setOpen(false); load(); }} />
      <StkDialog open={stkOpen} onOpenChange={setStkOpen} bookings={bookings} onDone={() => { setStkOpen(false); load(); }} />
    </div>
  );
}

function StkDialog({ open, onOpenChange, bookings, onDone }: any) {
  const [bookingId, setBookingId] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setBookingId(""); setPhone(""); setAmount(""); }
  }, [open]);

  async function send() {
    if (!bookingId || !phone || !amount) return toast.error("Booking, phone and amount required");
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Not signed in"); return; }
      const res = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ bookingId, phone, amount: Number(amount) }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "STK push failed"); return; }
      toast.success(json.customerMessage ?? "STK push sent — guest should approve on their phone");
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "STK push failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Send M-Pesa STK Push</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Booking</Label>
            <Select value={bookingId} onValueChange={(v) => {
              setBookingId(v);
              const b = bookings.find((x: any) => x.id === v);
              if (b) {
                setPhone(b.guest_phone ?? "");
                setAmount(String(b.total_amount ?? ""));
              }
            }}>
              <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
              <SelectContent>
                {bookings.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.reference} — {b.guest_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Guest phone</Label>
              <Input placeholder="07XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Guest will receive an M-Pesa prompt on their phone. Payment is auto-recorded once they approve.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send} disabled={loading}>
            <Smartphone className="h-4 w-4 mr-2" />
            {loading ? "Sending…" : "Send STK push"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ open, onOpenChange, bookings, onSaved }: any) {
  const [form, setForm] = useState<any>({ method: "mpesa", status: "paid" });
  useEffect(() => { if (open) setForm({ method: "mpesa", status: "paid", paid_at: new Date().toISOString().slice(0, 10) }); }, [open]);

  async function save() {
    if (!form.booking_id || !form.amount) return toast.error("Booking and amount required");
    const { error } = await supabase.from("payments").insert({
      booking_id: form.booking_id,
      amount: Number(form.amount),
      method: form.method,
      status: form.status,
      transaction_ref: form.transaction_ref || null,
      paid_at: form.status === "paid" ? new Date().toISOString() : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment recorded");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Booking</Label>
            <Select value={form.booking_id} onValueChange={(v) => {
              const b = bookings.find((x: any) => x.id === v);
              setForm({ ...form, booking_id: v, amount: b?.total_amount });
            }}>
              <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
              <SelectContent>{bookings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.reference} — {b.guest_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Amount</Label><Input type="number" value={form.amount ?? ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div>
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Transaction ref</Label><Input value={form.transaction_ref ?? ""} onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })} /></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
