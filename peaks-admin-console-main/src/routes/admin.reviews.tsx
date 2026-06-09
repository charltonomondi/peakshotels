import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Star, MessageSquare, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await supabase
      .from("guest_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
  }

  const filtered = filter === "all" ? rows : rows.filter(r => r.status === filter);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("guest_reviews").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("guest_reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const avg = rows.length ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-7 w-7 text-accent" />
        <div>
          <h1 className="text-3xl font-bold">Guest Reviews</h1>
          <p className="text-muted-foreground">Feedback submitted via the website</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: rows.length },
          { label: "Pending", value: rows.filter(r => r.status === "pending").length },
          { label: "Approved", value: rows.filter(r => r.status === "approved").length },
          { label: "Avg Rating", value: `${avg} / 5` },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">{s}</Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No reviews.</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-3">{r.message}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-KE")}
                  </TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={v => updateStatus(r.id, v)}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["pending","approved","rejected"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteReview(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
