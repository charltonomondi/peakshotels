import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportPdf, exportExcel, type ReportColumn } from "@/lib/reports";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const today = new Date();
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(endOfMonth(today), "yyyy-MM-dd"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Export bookings, payments, occupancy and customer data as PDF or Excel.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-end gap-4">
          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Range applies to Bookings & Payments reports.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsReport from={from} to={to} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsReport from={from} to={to} />
        </TabsContent>
        <TabsContent value="occupancy">
          <OccupancyReport from={from} to={to} />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExportButtons({ onPdf, onExcel }: { onPdf: () => void; onExcel: () => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onPdf}>
        <FileText className="h-4 w-4 mr-2" /> PDF
      </Button>
      <Button variant="outline" size="sm" onClick={onExcel}>
        <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
      </Button>
    </div>
  );
}

function BookingsReport({ from, to }: { from: string; to: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("bookings")
      .select("reference, guest_name, guest_email, guest_phone, check_in, check_out, num_guests, status, total_amount, rooms(name, room_number)")
      .gte("check_in", from)
      .lte("check_in", to)
      .order("check_in", { ascending: false })
      .then(({ data }) => setRows((data ?? []).map((b: any) => ({ ...b, room: `${b.rooms?.name ?? ""} #${b.rooms?.room_number ?? ""}` }))));
  }, [from, to]);

  const cols: ReportColumn[] = [
    { header: "Ref", key: "reference", width: 14 },
    { header: "Guest", key: "guest_name", width: 22 },
    { header: "Email", key: "guest_email", width: 24 },
    { header: "Phone", key: "guest_phone", width: 16 },
    { header: "Room", key: "room", width: 22 },
    { header: "Check-in", key: "check_in", width: 12 },
    { header: "Check-out", key: "check_out", width: 12 },
    { header: "Guests", key: "num_guests", width: 8 },
    { header: "Status", key: "status", width: 12 },
    { header: "Total (KES)", key: "total_amount", width: 14 },
  ];

  const total = rows.reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const filename = `bookings_${from}_to_${to}`;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Bookings ({rows.length})</CardTitle>
        <ExportButtons
          onPdf={() => {
            if (rows.length === 0) return toast.warning("No data to export");
            exportPdf({
              title: `Bookings Report — ${from} to ${to}`,
              columns: cols,
              rows,
              filename,
              summary: [
                { label: "Total bookings", value: String(rows.length) },
                { label: "Total revenue", value: `KES ${total.toLocaleString()}` },
              ],
            });
          }}
          onExcel={() => {
            if (rows.length === 0) return toast.warning("No data to export");
            exportExcel({
              sheetName: "Bookings",
              title: `Bookings Report — ${from} to ${to}`,
              columns: cols,
              rows,
              filename,
              summary: [
                { label: "Total bookings", value: String(rows.length) },
                { label: "Total revenue", value: `KES ${total.toLocaleString()}` },
              ],
            });
          }}
        />
      </CardHeader>
      <CardContent>
        <PreviewTable cols={cols} rows={rows.slice(0, 10)} />
        <p className="text-sm text-muted-foreground mt-3">
          Total revenue in range: <b>KES {total.toLocaleString()}</b>
        </p>
      </CardContent>
    </Card>
  );
}

function PaymentsReport({ from, to }: { from: string; to: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("payments")
      .select("created_at, amount, method, status, transaction_ref, bookings(reference, guest_name)")
      .gte("created_at", `${from}T00:00:00Z`)
      .lte("created_at", `${to}T23:59:59Z`)
      .order("created_at", { ascending: false })
      .then(({ data }) =>
        setRows(
          (data ?? []).map((p: any) => ({
            date: format(new Date(p.created_at), "yyyy-MM-dd"),
            reference: p.bookings?.reference ?? "",
            guest: p.bookings?.guest_name ?? "",
            amount: p.amount,
            method: p.method,
            status: p.status,
            transaction_ref: p.transaction_ref ?? "",
          })),
        ),
      );
  }, [from, to]);

  const cols: ReportColumn[] = [
    { header: "Date", key: "date", width: 12 },
    { header: "Booking", key: "reference", width: 16 },
    { header: "Guest", key: "guest", width: 22 },
    { header: "Amount (KES)", key: "amount", width: 14 },
    { header: "Method", key: "method", width: 10 },
    { header: "Status", key: "status", width: 10 },
    { header: "Reference", key: "transaction_ref", width: 22 },
  ];

  const totals = useMemo(() => {
    const paid = rows.filter((r) => r.status === "paid");
    const total = paid.reduce((s, r) => s + Number(r.amount || 0), 0);
    const byMethod: Record<string, number> = {};
    paid.forEach((r) => {
      byMethod[r.method] = (byMethod[r.method] || 0) + Number(r.amount || 0);
    });
    return { total, byMethod };
  }, [rows]);

  const filename = `payments_${from}_to_${to}`;
  const summary = [
    { label: "Total paid", value: `KES ${totals.total.toLocaleString()}` },
    ...Object.entries(totals.byMethod).map(([m, v]) => ({
      label: `By ${m}`,
      value: `KES ${v.toLocaleString()}`,
    })),
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Payments ({rows.length})</CardTitle>
        <ExportButtons
          onPdf={() => {
            if (rows.length === 0) return toast.warning("No data to export");
            exportPdf({ title: `Payments Report — ${from} to ${to}`, columns: cols, rows, filename, summary });
          }}
          onExcel={() => {
            if (rows.length === 0) return toast.warning("No data to export");
            exportExcel({ sheetName: "Payments", title: `Payments Report — ${from} to ${to}`, columns: cols, rows, filename, summary });
          }}
        />
      </CardHeader>
      <CardContent>
        <PreviewTable cols={cols} rows={rows.slice(0, 10)} />
        <p className="text-sm text-muted-foreground mt-3">
          Total paid: <b>KES {totals.total.toLocaleString()}</b>
        </p>
      </CardContent>
    </Card>
  );
}

function OccupancyReport({ from, to }: { from: string; to: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const [{ data: rooms }, { data: bookings }] = await Promise.all([
        supabase.from("rooms").select("id, name, room_number"),
        supabase
          .from("bookings")
          .select("room_id, check_in, check_out, status")
          .neq("status", "cancelled")
          .lte("check_in", to)
          .gte("check_out", from),
      ]);
      const fromD = new Date(from);
      const toD = new Date(to);
      const totalDays = Math.max(1, Math.round((toD.getTime() - fromD.getTime()) / 86400000) + 1);
      const out = (rooms ?? []).map((r: any) => {
        const nights = (bookings ?? [])
          .filter((b: any) => b.room_id === r.id)
          .reduce((sum: number, b: any) => {
            const ci = new Date(Math.max(new Date(b.check_in).getTime(), fromD.getTime()));
            const co = new Date(Math.min(new Date(b.check_out).getTime(), toD.getTime() + 86400000));
            return sum + Math.max(0, Math.round((co.getTime() - ci.getTime()) / 86400000));
          }, 0);
        return {
          room: `${r.name} #${r.room_number}`,
          nights_sold: nights,
          available_nights: totalDays,
          occupancy_pct: ((nights / totalDays) * 100).toFixed(1) + "%",
        };
      });
      setRows(out);
    })();
  }, [from, to]);

  const cols: ReportColumn[] = [
    { header: "Room", key: "room", width: 24 },
    { header: "Nights sold", key: "nights_sold", width: 14 },
    { header: "Available nights", key: "available_nights", width: 16 },
    { header: "Occupancy %", key: "occupancy_pct", width: 14 },
  ];

  const totalSold = rows.reduce((s, r) => s + Number(r.nights_sold || 0), 0);
  const totalAvail = rows.reduce((s, r) => s + Number(r.available_nights || 0), 0);
  const overall = totalAvail ? ((totalSold / totalAvail) * 100).toFixed(1) + "%" : "0%";
  const filename = `occupancy_${from}_to_${to}`;
  const summary = [
    { label: "Overall occupancy", value: overall },
    { label: "Total nights sold", value: String(totalSold) },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Occupancy ({overall} overall)</CardTitle>
        <ExportButtons
          onPdf={() => exportPdf({ title: `Occupancy Report — ${from} to ${to}`, columns: cols, rows, filename, summary })}
          onExcel={() => exportExcel({ sheetName: "Occupancy", title: `Occupancy Report — ${from} to ${to}`, columns: cols, rows, filename, summary })}
        />
      </CardHeader>
      <CardContent>
        <PreviewTable cols={cols} rows={rows} />
      </CardContent>
    </Card>
  );
}

function CustomersReport() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("full_name, email, phone, id_number, created_at")
        .order("created_at", { ascending: false });
      setRows(
        (customers ?? []).map((c: any) => ({
          ...c,
          created_at: format(new Date(c.created_at), "yyyy-MM-dd"),
        })),
      );
    })();
  }, []);

  const cols: ReportColumn[] = [
    { header: "Name", key: "full_name", width: 24 },
    { header: "Email", key: "email", width: 24 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "ID Number", key: "id_number", width: 16 },
    { header: "Created", key: "created_at", width: 12 },
  ];
  const filename = `customers_${format(new Date(), "yyyy-MM-dd")}`;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Customers ({rows.length})</CardTitle>
        <ExportButtons
          onPdf={() => exportPdf({ title: "Customers", columns: cols, rows, filename })}
          onExcel={() => exportExcel({ sheetName: "Customers", title: "Customers", columns: cols, rows, filename })}
        />
      </CardHeader>
      <CardContent>
        <PreviewTable cols={cols} rows={rows.slice(0, 15)} />
      </CardContent>
    </Card>
  );
}

function PreviewTable({ cols, rows }: { cols: ReportColumn[]; rows: any[] }) {
  if (rows.length === 0)
    return <p className="text-sm text-muted-foreground py-6 text-center">No data in range.</p>;
  return (
    <div className="overflow-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-secondary">
          <tr>
            {cols.map((c) => (
              <th key={c.key} className="text-left px-3 py-2 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-2">{r[c.key] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
