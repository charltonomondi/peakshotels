import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, FileDown } from "lucide-react";
import { generateInvoicePdf } from "@/lib/invoice";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

const STATUSES = ["pending","confirmed","cancelled","completed"];

function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [b, r] = await Promise.all([
      supabase.from("bookings").select("*, rooms(name, room_number, price_per_night)").order("check_in", { ascending: false }),
      supabase.from("rooms").select("id, name, room_number, price_per_night").order("room_number"),
    ]);
    if (b.error) toast.error(b.error.message);
    setBookings(b.data ?? []);
    setRooms(r.data ?? []);
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("bookings").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage all reservations</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New booking
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Config / Meal</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No bookings.</TableCell></TableRow>
              ) : filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.reference}</TableCell>
                  <TableCell>
                    {b.guest_name}
                    <div className="text-xs text-muted-foreground">{b.guest_phone || b.guest_email}</div>
                  </TableCell>
                  <TableCell>
                    <div>{b.rooms?.name || b.room_type || "—"}</div>
                    <div className="text-xs text-muted-foreground">#{b.rooms?.room_number || b.room_number || "—"}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="capitalize">{b.room_config || "—"}</div>
                    <div className="text-muted-foreground">{(b.meal_plan || "").replace(/_/g, " ") || "—"}</div>
                  </TableCell>
                  <TableCell>{b.check_in}</TableCell>
                  <TableCell>{b.check_out}</TableCell>
                  <TableCell>KES {Number(b.total_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-xs capitalize">
                    <div>{b.payment_method || "—"}</div>
                    <div className={`font-medium ${b.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                      {b.payment_status || "pending"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => generateInvoicePdf(b)}><FileDown className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BookingDialog open={open} onOpenChange={setOpen} booking={editing} rooms={rooms} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function BookingDialog({ open, onOpenChange, booking, rooms, onSaved }: any) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    setForm(booking ?? { status: "pending", num_guests: 1, total_amount: 0 });
  }, [booking, open]);

  function pickRoom(room_id: string) {
    const room = rooms.find((r: any) => r.id === room_id);
    const nights = form.check_in && form.check_out
      ? Math.max(1, Math.ceil((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
      : 1;
    setForm({ ...form, room_id, total_amount: room ? Number(room.price_per_night) * nights : form.total_amount });
  }

  async function save() {
    if (!form.guest_name || !form.room_id || !form.check_in || !form.check_out) {
      return toast.error("Guest name, room, and dates are required");
    }
    const payload = {
      guest_name: form.guest_name,
      guest_email: form.guest_email || null,
      guest_phone: form.guest_phone || null,
      room_id: form.room_id,
      check_in: form.check_in,
      check_out: form.check_out,
      num_guests: Number(form.num_guests || 1),
      total_amount: Number(form.total_amount || 0),
      status: form.status,
      notes: form.notes || null,
    };
    const { error } = booking
      ? await supabase.from("bookings").update(payload).eq("id", booking.id)
      : await supabase.from("bookings").insert(payload);
    if (error) {
      if (error.message.includes("exclusion")) return toast.error("Room is already booked for these dates.");
      return toast.error(error.message);
    }
    toast.success("Saved");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{booking ? "Edit booking" : "New booking"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Guest name</Label><Input value={form.guest_name ?? ""} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.guest_phone ?? ""} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} /></div>
          <div><Label>Email</Label><Input type="email" value={form.guest_email ?? ""} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} /></div>
          <div><Label># Guests</Label><Input type="number" min={1} value={form.num_guests ?? 1} onChange={(e) => setForm({ ...form, num_guests: Number(e.target.value) })} /></div>
          <div>
            <Label>Room</Label>
            <Select value={form.room_id} onValueChange={pickRoom}>
              <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>{rooms.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name} #{r.room_number} — KES {r.price_per_night}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Check-in</Label><Input type="date" value={form.check_in ?? ""} onChange={(e) => setForm({ ...form, check_in: e.target.value })} /></div>
          <div><Label>Check-out</Label><Input type="date" value={form.check_out ?? ""} onChange={(e) => setForm({ ...form, check_out: e.target.value })} /></div>
          <div><Label>Total amount (KES)</Label><Input type="number" value={form.total_amount ?? 0} onChange={(e) => setForm({ ...form, total_amount: Number(e.target.value) })} /></div>
          <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
