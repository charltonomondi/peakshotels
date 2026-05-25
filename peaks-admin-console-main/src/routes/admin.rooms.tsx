import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/rooms")({
  component: RoomsPage,
});

type Room = {
  id: string;
  name: string;
  room_number: string;
  category: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  status: string;
  amenities: string[];
  images: string[];
};

const CATS = ["single","double","deluxe","suite","family"];
const STATUSES = ["available","booked","maintenance"];

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase.from("rooms").select("*").order("room_number");
    if (error) return toast.error(error.message);
    setRooms((data ?? []) as Room[]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this room?")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-muted-foreground">Manage room inventory</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add room
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/night</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No rooms yet. Add one to get started.</TableCell></TableRow>
              ) : rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.room_number}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="capitalize">{r.category}</TableCell>
                  <TableCell>KES {Number(r.price_per_night).toLocaleString()}</TableCell>
                  <TableCell>{r.capacity}</TableCell>
                  <TableCell><span className="px-2 py-1 rounded text-xs bg-secondary capitalize">{r.status}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoomDialog open={open} onOpenChange={setOpen} room={editing} onSaved={() => { setOpen(false); load(); }} />
    </div>
  );
}

function RoomDialog({ open, onOpenChange, room, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; room: Room | null; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<Room>>({});
  const [amenInput, setAmenInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(room ?? { category: "single", status: "available", capacity: 2, price_per_night: 0, amenities: [], images: [] });
    setAmenInput((room?.amenities ?? []).join(", "));
  }, [room, open]);

  async function save() {
    const payload: any = {
      name: form.name?.trim(),
      room_number: form.room_number?.trim(),
      category: form.category,
      description: form.description ?? null,
      price_per_night: Number(form.price_per_night ?? 0),
      capacity: Number(form.capacity ?? 1),
      status: form.status,
      amenities: amenInput.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images ?? [],
    };
    if (!payload.name || !payload.room_number) return toast.error("Name and room number are required");

    const { error } = room
      ? await supabase.from("rooms").update(payload).eq("id", room.id)
      : await supabase.from("rooms").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(room ? "Updated" : "Created");
    onSaved();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const path = `rooms/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("rooms").upload(path, file);
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("rooms").getPublicUrl(path);
    setForm((f) => ({ ...f, images: [...(f.images ?? []), data.publicUrl] }));
    setUploading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{room ? "Edit room" : "Add room"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div><Label>Name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Room number</Label><Input value={form.room_number ?? ""} onChange={(e) => setForm({ ...form, room_number: e.target.value })} /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Price per night (KES)</Label><Input type="number" value={form.price_per_night ?? 0} onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} /></div>
          <div><Label>Capacity</Label><Input type="number" min={1} value={form.capacity ?? 1} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="md:col-span-2"><Label>Amenities (comma separated)</Label><Input value={amenInput} onChange={(e) => setAmenInput(e.target.value)} placeholder="WiFi, TV, Breakfast, Pool" /></div>
          <div className="md:col-span-2">
            <Label>Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(form.images ?? []).map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="h-20 w-20 object-cover rounded" />
                  <button type="button" onClick={() => setForm({ ...form, images: form.images?.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs">×</button>
                </div>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            </label>
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
