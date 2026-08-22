import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BedDouble, CalendarDays, DollarSign, Users, BookOpen, CreditCard,
  BarChart2, Settings, ChevronRight, TrendingUp, TrendingDown,
  FileDown, Loader2, CheckCircle2, XCircle, Clock, Search,
  Pencil, Trash2, Plus, FileText, FileSpreadsheet, X,
  Video, Monitor, Shield, ClipboardCopy, ArrowRight,
} from "lucide-react";
import { generateInvoicePdf } from "@/lib/invoice";
import { exportPdf, exportExcel } from "@/lib/adminReports";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { StaffMember } from "@/lib/staffAuth";

type AdminTab = "overview" | "bookings" | "rooms" | "payments" | "customers" | "reports" | "interview";

interface Props { staff: StaffMember; }

// ─── Main Console ────────────────────────────────────────────────────────────
export default function SuperAdminConsole({ staff }: Props) {
  const [tab, setTab] = useState<AdminTab>("overview");

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview",   label: "Overview",   icon: BarChart2 },
    { id: "bookings",   label: "Bookings",   icon: CalendarDays },
    { id: "rooms",      label: "Rooms",      icon: BedDouble },
    { id: "payments",   label: "Payments",   icon: CreditCard },
    { id: "customers",  label: "Customers",  icon: Users },
    { id: "reports",    label: "Reports",    icon: FileText },
    { id: "interview",  label: "Interviews", icon: Video },
  ];

  return (
    <div className="flex min-h-[calc(100vh-6rem)] bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <p className="text-xs font-bold text-accent uppercase tracking-widest">Admin Console</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{staff.full_name}</p>
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {tab === id && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {tab === "overview"   && <OverviewTab />}
        {tab === "bookings"   && <BookingsTab />}
        {tab === "rooms"      && <RoomsTab />}
        {tab === "payments"   && <PaymentsTab />}
        {tab === "customers"  && <CustomersTab />}
        {tab === "reports"    && <ReportsTab />}
        {tab === "interview"  && <InterviewTab />}
      </main>
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState({ rooms: 0, available: 0, booked: 0, bookings: 0, pending: 0, revenueDay: 0, revenueWeek: 0, revenueMonth: 0, customers: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const today = new Date(); today.setHours(0,0,0,0);
    const week  = new Date(); week.setDate(week.getDate()-7);
    const month = new Date(); month.setDate(month.getDate()-30);

    const [rooms, bookings, payments, customers, recentB] = await Promise.all([
      supabase.from("rooms").select("status"),
      supabase.from("bookings").select("status"),
      supabase.from("payments").select("amount, paid_at, status").eq("status","paid"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(8),
    ]);

    const r = rooms.data ?? []; const b = bookings.data ?? []; const p = payments.data ?? [];
    const sum = (d: Date) => p.filter(x => x.paid_at && new Date(x.paid_at) >= d).reduce((s, x) => s + Number(x.amount || 0), 0);
    setStats({ rooms: r.length, available: r.filter(x => x.status==="available").length, booked: r.filter(x => x.status==="booked").length, bookings: b.length, pending: b.filter(x => x.status==="pending").length, revenueDay: sum(today), revenueWeek: sum(week), revenueMonth: sum(month), customers: customers.count ?? 0 });
    setRecent(recentB.data ?? []);
    setLoading(false);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>;

  const kpis = [
    { label: "Total Rooms", value: stats.rooms, sub: `${stats.available} available · ${stats.booked} booked`, icon: BedDouble, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bookings", value: stats.bookings, sub: `${stats.pending} pending approval`, icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Revenue (30d)", value: `KES ${stats.revenueMonth.toLocaleString()}`, sub: `Today: KES ${stats.revenueDay.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Customers", value: stats.customers, sub: "Guest profiles", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hotel Overview</h1>
        <p className="text-sm text-muted-foreground">Live snapshot of operations — Peaks Hotel Nanyuki</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today", value: stats.revenueDay },
          { label: "Last 7 days", value: stats.revenueWeek },
          { label: "Last 30 days", value: stats.revenueMonth },
        ].map(({ label, value }) => (
          <Card key={label} className="border-0 shadow-sm bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold text-accent">KES {value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent bookings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recent.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>
              : recent.map(b => (
                <div key={b.id} className="px-4 py-3 flex items-center justify-between hover:bg-secondary/40 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{b.guest_name} <span className="text-xs text-muted-foreground">· {b.reference}</span></p>
                    <p className="text-xs text-muted-foreground">{b.check_in} → {b.check_out}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                      {b.status}
                    </Badge>
                    <span className="text-sm font-semibold">KES {Number(b.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Bookings ────────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*, rooms(name, room_number)").order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status } as any).eq("id", id);
    load();
  }

  const filtered = bookings
    .filter(b => filter === "all" || b.status === filter)
    .filter(b => !search || b.guest_name?.toLowerCase().includes(search.toLowerCase()) || b.reference?.toLowerCase().includes(search.toLowerCase()));

  const STATUS_COLORS: Record<string, string> = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-sm text-muted-foreground">All reservations · {bookings.length} total</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest / ref…"
            className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent w-64" />
        </div>
        {["all","pending","confirmed","cancelled","completed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === s ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-secondary"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    {["Reference","Guest","Room","Check-in","Check-out","Status","Amount",""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No bookings found.</td></tr>
                  ) : filtered.map(b => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{b.reference}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{b.guest_name}</p>
                        <p className="text-xs text-muted-foreground">{b.guest_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">{b.rooms?.name} #{b.rooms?.room_number}</td>
                      <td className="px-4 py-3 text-xs">{b.check_in}</td>
                      <td className="px-4 py-3 text-xs">{b.check_out}</td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${STATUS_COLORS[b.status] ?? "bg-secondary"}`}>
                          {["pending","confirmed","cancelled","completed"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 font-semibold">KES {Number(b.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => generateInvoicePdf({ ...b })}>
                          <FileDown className="h-3.5 w-3.5 mr-1" />PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Rooms ───────────────────────────────────────────────────────────────────
function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("rooms").select("*").order("room_number");
    setRooms(data ?? []);
    setLoading(false);
  }

  function openEdit(room: any) { setEditing(room); setForm(room ?? {}); setOpen(true); }

  async function save() {
    const payload = { name: form.name, room_number: form.room_number, category: form.category, price_per_night: Number(form.price_per_night), capacity: Number(form.capacity || 2), status: form.status || "available", description: form.description || null };
    const { error } = editing
      ? await supabase.from("rooms").update(payload).eq("id", editing.id)
      : await supabase.from("rooms").insert(payload);
    if (error) { alert(error.message); return; }
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    load();
  }

  const STATUS_COLORS: Record<string, string> = { available: "bg-green-100 text-green-700", booked: "bg-blue-100 text-blue-700", maintenance: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rooms</h1>
          <p className="text-sm text-muted-foreground">{rooms.length} rooms registered</p>
        </div>
        <Button onClick={() => openEdit(null)}><Plus className="h-4 w-4 mr-2" />Add Room</Button>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map(r => (
            <Card key={r.id} className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Room #{r.room_number} · {r.category}</p>
                  </div>
                  <Badge className={STATUS_COLORS[r.status] ?? "bg-secondary"}>{r.status}</Badge>
                </div>
                <p className="text-lg font-bold text-accent">KES {Number(r.price_per_night).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/night</span></p>
                <p className="text-xs text-muted-foreground mt-1">Capacity: {r.capacity} guests</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? "Edit Room" : "New Room"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[["name","Room name"],["room_number","Room number"],["category","Category (single/double/deluxe/suite/family)"],["price_per_night","Price per night (KES)"],["capacity","Capacity (guests)"]].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input value={form[k] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select value={form.status ?? "available"} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent">
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payments ────────────────────────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("payments").select("*, bookings(reference, guest_name, guest_phone)").order("created_at", { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("payments").update({ status } as any).eq("id", id);
    load();
  }

  const filtered = payments.filter(p =>
    !search ||
    p.bookings?.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.bookings?.reference?.toLowerCase().includes(search.toLowerCase()) ||
    p.method?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLORS: Record<string, string> = { paid: "bg-green-100 text-green-700", pending: "bg-amber-100 text-amber-700", failed: "bg-red-100 text-red-700", refunded: "bg-blue-100 text-blue-700" };
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground">{payments.length} transactions · KES {totalPaid.toLocaleString()} received</p>
        </div>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest / ref…"
          className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent w-full" />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    {["Guest","Method","Amount","Status","Date","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No payments found.</td></tr>
                    : filtered.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.bookings?.guest_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.bookings?.reference}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-xs">{p.method}</td>
                      <td className="px-4 py-3 font-semibold">KES {Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <select value={p.status} onChange={e => updateStatus(p.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${STATUS_COLORS[p.status] ?? "bg-secondary"}`}>
                          {["paid","pending","failed","refunded"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {p.transaction_code && (
                          <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">{p.transaction_code}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Customers ───────────────────────────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data ?? []);
    setLoading(false);
  }

  function openEdit(c: any) { setEditing(c); setForm(c ?? {}); setOpen(true); }

  async function save() {
    if (!form.full_name) { alert("Name required"); return; }
    const payload = { full_name: form.full_name, email: form.email || null, phone: form.phone || null, id_number: form.id_number || null, notes: form.notes || null };
    const { error } = editing
      ? await supabase.from("customers").update(payload).eq("id", editing.id)
      : await supabase.from("customers").insert(payload);
    if (error) { alert(error.message); return; }
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    load();
  }

  const filtered = customers.filter(c =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} guest profiles</p>
        </div>
        <Button onClick={() => openEdit(null)}><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / phone / email…"
          className="pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent w-full" />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    {["Name","Phone","Email","ID No.",""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No customers found.</td></tr>
                    : filtered.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer" onClick={() => openEdit(c)}>
                      <td className="px-4 py-3 font-medium">{c.full_name}</td>
                      <td className="px-4 py-3 text-xs">{c.phone}</td>
                      <td className="px-4 py-3 text-xs">{c.email}</td>
                      <td className="px-4 py-3 text-xs font-mono">{c.id_number}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:text-red-700"
                          onClick={e => { e.stopPropagation(); remove(c.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? "Edit Customer" : "New Customer"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[["full_name","Full Name *"],["phone","Phone"],["email","Email"],["id_number","ID / Passport Number"]].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input value={form[k] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Interview Platform ───────────────────────────────────────────────────────
function InterviewTab() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [duration, setDuration] = useState("60");
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [copied, setCopied] = useState(false);

  // Extra exam resources (Google Drive, OneDrive, custom links etc.)
  const [resources, setResources] = useState<{ label: string; url: string }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleCreateRoom = () => {
    if (!hostName.trim()) return;
    setGeneratedRoom(generateRoomId());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/interview/candidate/${generatedRoom}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHostJoin = () => {
    if (!generatedRoom || !hostName.trim()) return;
    navigate(`/interview/host/${generatedRoom}`, {
      state: { name: hostName, formUrl, duration: Number(duration), resources },
    });
  };

  const addResource = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setResources(r => [...r, { label: newLabel.trim(), url: newUrl.trim() }]);
    setNewLabel(""); setNewUrl("");
  };

  const removeResource = (i: number) => setResources(r => r.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="h-6 w-6 text-accent" /> Interview &amp; Exam Platform
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create and manage proctored examination sessions.
        </p>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <Monitor className="h-4 w-4 text-accent" />, title: "Screen Monitoring", desc: "Candidates share their entire screen" },
          { icon: <Shield className="h-4 w-4 text-accent" />, title: "Privacy Enforced", desc: "Candidates cannot see each other" },
          { icon: <Users className="h-4 w-4 text-accent" />, title: "Audit Log", desc: "All events recorded in real time" },
        ].map(f => (
          <div key={f.title} className="bg-secondary rounded-xl p-3 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">{f.icon}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Host setup */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Video className="h-4 w-4 text-accent" /> Create Meeting Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Your Name (Host)</label>
            <input value={hostName} onChange={e => setHostName(e.target.value)}
              placeholder="Dr. Jane Smith"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Primary Exam Form URL
              <span className="ml-1 text-zinc-400 font-normal">(Google Forms, Typeform, etc.)</span>
            </label>
            <input value={formUrl} onChange={e => setFormUrl(e.target.value)}
              placeholder="https://forms.gle/... or https://docs.google.com/forms/..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Exam Duration (minutes)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              min={5} max={300}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>

          {/* Additional resource links */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Additional Resources
              <span className="ml-1 text-zinc-400 font-normal">(Google Drive, OneDrive, PDFs, instructions…)</span>
            </label>
            {resources.map((r, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-xs">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground truncate block">{r.label}</span>
                  <span className="text-muted-foreground truncate block">{r.url}</span>
                </div>
                <button onClick={() => removeResource(i)}
                  className="text-red-400 hover:text-red-600 shrink-0 p-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="Label (e.g. Answer Sheet)"
                className="px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="px-2 py-1.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
              <button onClick={addResource} disabled={!newLabel.trim() || !newUrl.trim()}
                className="px-2 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium disabled:opacity-40 flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          {!generatedRoom ? (
            <Button onClick={handleCreateRoom} disabled={!hostName.trim()} variant="gold" className="w-full">
              Create Meeting Room <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Room Code — share with candidates</p>
                <p className="font-mono text-2xl font-bold text-foreground tracking-widest">{generatedRoom}</p>
              </div>
              <Button variant="outline" className="w-full text-xs" onClick={handleCopy}>
                {copied
                  ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied!</>
                  : <><ClipboardCopy className="h-3.5 w-3.5 mr-1.5" /> Copy Candidate Invite Link</>}
              </Button>
              <Button onClick={handleHostJoin} variant="gold" className="w-full">
                <Video className="h-4 w-4 mr-2" /> Launch Host Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate join link hint */}
      <div className="text-xs text-muted-foreground bg-secondary rounded-xl px-4 py-3">
        Candidates join via <span className="font-mono font-semibold text-foreground">{window.location.origin}/interview</span>
        {" "}— the Host / Examiner option has been removed from the public page.
        Only admins can create rooms.
      </div>
    </div>
  );
}
function ReportsTab() {
  const today = new Date();
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(endOfMonth(today), "yyyy-MM-dd"));
  const [activeReport, setActiveReport] = useState<"bookings"|"payments"|"customers">("bookings");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReport(); }, [activeReport, from, to]);

  async function fetchReport() {
    setLoading(true);
    if (activeReport === "bookings") {
      const { data: d } = await supabase.from("bookings").select("reference, guest_name, guest_phone, guest_email, check_in, check_out, status, total_amount, payment_method, created_at")
        .gte("check_in", from).lte("check_in", to).order("check_in");
      setData(d ?? []);
    } else if (activeReport === "payments") {
      const { data: d } = await supabase.from("payments").select("*, bookings(reference, guest_name)")
        .gte("created_at", from + "T00:00:00").lte("created_at", to + "T23:59:59").order("created_at");
      setData(d ?? []);
    } else {
      const { data: d } = await supabase.from("customers").select("*").order("created_at");
      setData(d ?? []);
    }
    setLoading(false);
  }

  function handleExportPdf() {
    const cols = activeReport === "bookings"
      ? [{ header: "Ref", key: "reference" }, { header: "Guest", key: "guest_name" }, { header: "Phone", key: "guest_phone" }, { header: "Check-in", key: "check_in" }, { header: "Check-out", key: "check_out" }, { header: "Status", key: "status" }, { header: "Amount (KES)", key: "total_amount" }]
      : activeReport === "payments"
      ? [{ header: "Guest", key: "guest_name_flat" }, { header: "Method", key: "method" }, { header: "Amount", key: "amount" }, { header: "Status", key: "status" }, { header: "Date", key: "paid_at" }, { header: "Code", key: "transaction_code" }]
      : [{ header: "Name", key: "full_name" }, { header: "Phone", key: "phone" }, { header: "Email", key: "email" }, { header: "ID No.", key: "id_number" }];

    const rows = activeReport === "payments"
      ? data.map(p => ({ ...p, guest_name_flat: p.bookings?.guest_name ?? "—" }))
      : data;

    const totalRev = activeReport === "payments"
      ? data.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount || 0), 0) : null;

    exportPdf({
      title: `${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report`,
      subtitle: `${from} to ${to} · Peaks Hotel Nanyuki`,
      columns: cols,
      rows,
      filename: `peaks-${activeReport}-${from}-${to}`,
      summary: totalRev !== null ? [{ label: "Total Revenue", value: `KES ${totalRev.toLocaleString()}` }] : undefined,
    });
  }

  async function handleExportExcel() {
    const cols = activeReport === "bookings"
      ? [{ header: "Reference", key: "reference" }, { header: "Guest", key: "guest_name" }, { header: "Phone", key: "guest_phone" }, { header: "Email", key: "guest_email" }, { header: "Check-in", key: "check_in" }, { header: "Check-out", key: "check_out" }, { header: "Status", key: "status" }, { header: "Amount", key: "total_amount" }, { header: "Payment Method", key: "payment_method" }]
      : activeReport === "payments"
      ? [{ header: "Guest", key: "guest_name_flat" }, { header: "Method", key: "method" }, { header: "Amount", key: "amount" }, { header: "Status", key: "status" }, { header: "Date", key: "paid_at" }, { header: "Code", key: "transaction_code" }]
      : [{ header: "Name", key: "full_name" }, { header: "Phone", key: "phone" }, { header: "Email", key: "email" }, { header: "ID No.", key: "id_number" }, { header: "Notes", key: "notes" }];

    const rows = activeReport === "payments"
      ? data.map(p => ({ ...p, guest_name_flat: p.bookings?.guest_name ?? "—" }))
      : data;

    await exportExcel({
      sheetName: activeReport,
      title: `${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report — Peaks Hotel Nanyuki`,
      columns: cols, rows,
      filename: `peaks-${activeReport}-${from}-${to}.xlsx`,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Export hotel data as PDF or Excel</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="flex gap-2">
            {(["bookings","payments","customers"] as const).map(r => (
              <button key={r} onClick={() => setActiveReport(r)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors capitalize ${activeReport === r ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={loading || data.length === 0}>
              <FileText className="h-4 w-4 mr-2" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={loading || data.length === 0}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview table */}
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold capitalize">{activeReport} — {data.length} records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary">
                  <tr className="border-b border-border">
                    {activeReport === "bookings" && ["Ref","Guest","Check-in","Check-out","Status","Amount"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>)}
                    {activeReport === "payments" && ["Guest","Method","Amount","Status","Date","Code"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>)}
                    {activeReport === "customers" && ["Name","Phone","Email","ID No."].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0
                    ? <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No data for the selected period.</td></tr>
                    : data.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 hover:bg-secondary/20">
                      {activeReport === "bookings" && <>
                        <td className="px-4 py-2.5 font-mono text-xs">{row.reference}</td>
                        <td className="px-4 py-2.5">{row.guest_name}</td>
                        <td className="px-4 py-2.5 text-xs">{row.check_in}</td>
                        <td className="px-4 py-2.5 text-xs">{row.check_out}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{row.status}</td>
                        <td className="px-4 py-2.5 font-semibold">KES {Number(row.total_amount).toLocaleString()}</td>
                      </>}
                      {activeReport === "payments" && <>
                        <td className="px-4 py-2.5">{row.bookings?.guest_name ?? "—"}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{row.method}</td>
                        <td className="px-4 py-2.5 font-semibold">KES {Number(row.amount).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs capitalize">{row.status}</td>
                        <td className="px-4 py-2.5 text-xs">{row.paid_at ? new Date(row.paid_at).toLocaleDateString("en-KE") : "—"}</td>
                        <td className="px-4 py-2.5 font-mono text-xs">{row.transaction_code ?? "—"}</td>
                      </>}
                      {activeReport === "customers" && <>
                        <td className="px-4 py-2.5 font-medium">{row.full_name}</td>
                        <td className="px-4 py-2.5 text-xs">{row.phone}</td>
                        <td className="px-4 py-2.5 text-xs">{row.email}</td>
                        <td className="px-4 py-2.5 text-xs font-mono">{row.id_number}</td>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
