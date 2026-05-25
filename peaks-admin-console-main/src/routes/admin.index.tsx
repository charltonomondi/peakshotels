import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CalendarDays, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [stats, setStats] = useState({
    rooms: 0,
    available: 0,
    booked: 0,
    bookings: 0,
    pending: 0,
    revenueDay: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    customers: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const today = new Date(); today.setHours(0,0,0,0);
    const week = new Date(); week.setDate(week.getDate()-7);
    const month = new Date(); month.setDate(month.getDate()-30);

    const [rooms, bookings, payments, customers, recentB] = await Promise.all([
      supabase.from("rooms").select("status"),
      supabase.from("bookings").select("status"),
      supabase.from("payments").select("amount, paid_at, status").eq("status","paid"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    const r = rooms.data ?? [];
    const b = bookings.data ?? [];
    const p = payments.data ?? [];

    const sumSince = (d: Date) => p
      .filter((x) => x.paid_at && new Date(x.paid_at) >= d)
      .reduce((s, x) => s + Number(x.amount || 0), 0);

    setStats({
      rooms: r.length,
      available: r.filter((x) => x.status === "available").length,
      booked: r.filter((x) => x.status === "booked").length,
      bookings: b.length,
      pending: b.filter((x) => x.status === "pending").length,
      revenueDay: sumSince(today),
      revenueWeek: sumSince(week),
      revenueMonth: sumSince(month),
      customers: customers.count ?? 0,
    });
    setRecent(recentB.data ?? []);
  }

  const cards = [
    { label: "Total Rooms", value: stats.rooms, sub: `${stats.available} available · ${stats.booked} booked`, icon: BedDouble },
    { label: "Bookings", value: stats.bookings, sub: `${stats.pending} pending`, icon: CalendarDays },
    { label: "Revenue (30d)", value: `KES ${stats.revenueMonth.toLocaleString()}`, sub: `Today: KES ${stats.revenueDay.toLocaleString()}`, icon: DollarSign },
    { label: "Customers", value: stats.customers, sub: "Guest profiles", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of hotel operations</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent bookings</CardTitle></CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.guest_name} <span className="text-xs text-muted-foreground">· {b.reference}</span></div>
                    <div className="text-xs text-muted-foreground">{b.check_in} → {b.check_out}</div>
                  </div>
                  <div className="text-sm">
                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs uppercase">{b.status}</span>
                    <span className="ml-3 font-medium">KES {Number(b.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Today's revenue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">KES {stats.revenueDay.toLocaleString()}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Last 7 days</CardTitle></CardHeader><CardContent className="text-2xl font-bold">KES {stats.revenueWeek.toLocaleString()}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Last 30 days</CardTitle></CardHeader><CardContent className="text-2xl font-bold">KES {stats.revenueMonth.toLocaleString()}</CardContent></Card>
      </div>
    </div>
  );
}
