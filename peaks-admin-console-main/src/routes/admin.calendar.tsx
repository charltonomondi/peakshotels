import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [maint, setMaint] = useState<any[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const ref = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => { load(); }, [monthOffset]);

  async function load() {
    const start = `${ref.getFullYear()}-${String(ref.getMonth()+1).padStart(2,'0')}-01`;
    const endDate = new Date(ref.getFullYear(), ref.getMonth()+1, 0);
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${endDate.getDate()}`;

    const [r, b, m] = await Promise.all([
      supabase.from("rooms").select("id, name, room_number").order("room_number"),
      supabase.from("bookings").select("id, room_id, check_in, check_out, guest_name, status").lte("check_in", end).gte("check_out", start).neq("status","cancelled"),
      supabase.from("maintenance_blocks").select("*").lte("start_date", end).gte("end_date", start),
    ]);
    setRooms(r.data ?? []);
    setBookings(b.data ?? []);
    setMaint(m.data ?? []);
  }

  function cellState(roomId: string, day: number) {
    const dStr = `${ref.getFullYear()}-${String(ref.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const d = new Date(dStr);
    const booked = bookings.find((b) => b.room_id === roomId && new Date(b.check_in) <= d && new Date(b.check_out) > d);
    if (booked) return { type: "booked", label: booked.guest_name };
    const blocked = maint.find((m) => m.room_id === roomId && new Date(m.start_date) <= d && new Date(m.end_date) > d);
    if (blocked) return { type: "maint", label: blocked.reason || "Maintenance" };
    return { type: "free", label: "" };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Occupancy Calendar</h1>
          <p className="text-muted-foreground">{ref.toLocaleString("en", { month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonthOffset(monthOffset - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={() => setMonthOffset(0)}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setMonthOffset(monthOffset + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 bg-card p-2 text-left min-w-[140px]">Room</th>
                {days.map((d) => <th key={d} className="p-1 text-center min-w-[28px]">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="sticky left-0 bg-card p-2 font-medium">{r.name}<div className="text-muted-foreground font-normal">#{r.room_number}</div></td>
                  {days.map((d) => {
                    const s = cellState(r.id, d);
                    const cls = s.type === "booked" ? "bg-primary/70" : s.type === "maint" ? "bg-destructive/40" : "bg-secondary/30";
                    return <td key={d} className={`p-0 h-10 ${cls}`} title={s.label}></td>;
                  })}
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr><td colSpan={days.length+1} className="text-center text-muted-foreground py-8">Add rooms to see calendar.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-primary/70" /> Booked</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-destructive/40" /> Maintenance</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-secondary/30" /> Available</div>
      </div>
    </div>
  );
}
