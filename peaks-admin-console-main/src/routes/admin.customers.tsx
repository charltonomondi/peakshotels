import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data ?? []);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Guest profiles</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add customer</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>ID</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No customers yet.</TableCell></TableRow>
              ) : customers.map((c) => (
                <TableRow key={c.id} onClick={() => { setEditing(c); setOpen(true); }} className="cursor-pointer">
                  <TableCell className="font-medium">{c.full_name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.id_number}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CustomerDialog open={open} onOpenChange={setOpen} customer={editing} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function CustomerDialog({ open, onOpenChange, customer, onSaved }: any) {
  const [form, setForm] = useState<any>({});
  useEffect(() => { setForm(customer ?? {}); }, [customer, open]);

  async function save() {
    if (!form.full_name) return toast.error("Name required");
    const payload = {
      full_name: form.full_name, email: form.email || null, phone: form.phone || null,
      id_number: form.id_number || null, notes: form.notes || null,
    };
    const { error } = customer
      ? await supabase.from("customers").update(payload).eq("id", customer.id)
      : await supabase.from("customers").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{customer ? "Edit" : "Add"} customer</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Full name</Label><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><Label>ID / Passport</Label><Input value={form.id_number ?? ""} onChange={(e) => setForm({ ...form, id_number: e.target.value })} /></div>
          <div><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
