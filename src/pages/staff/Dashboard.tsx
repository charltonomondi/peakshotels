import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStaffAuth, ROLE_LABELS, STATUS_COLORS } from "@/lib/staffAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, CalendarDays, FileText, Clock, BedDouble,
  Users, CheckCircle2, Circle, Plus, Loader2, Shield,
  UserCheck, UserX, Phone, Mail, Upload, Download, Trash2,
  FileSpreadsheet, FileType2, File, ClipboardList, BarChart2, ChevronDown, ChevronUp, KeyRound, Settings,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import Navbar from "@/components/Navbar";
import DailyReportForm from "@/components/DailyReportForm";
import { REPORT_TEMPLATES, REVENUE_CONFIG, EXPENSE_DEPARTMENTS } from "@/lib/reportTemplates";
import SuperAdminConsole from "./SuperAdminConsole";

interface StaffRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  department: string | null;
  status: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  due_time: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
}

interface Meeting {
  id: string;
  title: string;
  event_type: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  notes: string | null;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  storage_path: string | null;
  category: string;
  uploaded_at: string;
  uploaded_by_name: string | null;
  uploader_department: string | null;
}

interface DailyReport {
  id: string;
  staff_id: string;
  department: string;
  report_date: string;
  entries: Record<string, string>;
  submitted: boolean;
  submitted_at: string | null;
  updated_at: string | null;
  staff_name?: string;
}

interface ReportAction {
  id: string;
  report_id: string;
  department: string;
  report_date: string;
  action_type: "comment" | "meeting" | "signed_off";
  comment: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  signed_off: boolean;
  actioned_by_name: string | null;
  created_at: string;
}

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export default function StaffDashboard() {
  const { staff, loading, isApproved, signOut } = useStaffAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-KE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [todayBookings, setTodayBookings] = useState(0);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocDate, setSelectedDocDate] = useState<string>(today);

  const isAdmin = staff?.role === "manager" || staff?.role === "super_admin" || staff?.role === "ceo";
  const isSuperAdmin = staff?.role === "super_admin";
  const canManageCalendar = staff?.role === "receptionist" || isAdmin;
  const [activeTab, setActiveTab] = useState<"dashboard" | "report" | "reports_view" | "my_reports" | "admin_console">("dashboard");

  // Reports viewer state
  const [reportViewDate, setReportViewDate] = useState(today);
  const [reportViewDept, setReportViewDept] = useState<string>("all");
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // CEO actions state
  const [reportActions, setReportActions] = useState<ReportAction[]>([]);
  const isCeoOrSuperAdmin = staff?.role === "ceo" || staff?.role === "super_admin";

  // CEO notification panel state (shown at top of dashboard tab)
  const [ceoNotification, setCeoNotification] = useState<ReportAction | null>(null);
  const [notifDate, setNotifDate] = useState(today);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(today);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", event_type: "meeting", start_time: "", end_time: "", location: "", notes: "",
  });

  const filteredDocs = documents.filter(d =>
    d.uploaded_at.startsWith(selectedDocDate)
  );

  useEffect(() => {
    if (!loading && !staff) {
      const timer = setTimeout(() => {
        navigate("/staff/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (!loading && staff && !isApproved) return;
    if (!loading && isApproved) {
      loadData();
      if (isAdmin) loadStaffRequests();
      // Load CEO notification for this staff's department
      loadCeoNotification();
    }
  }, [loading, staff, isApproved]);

  useEffect(() => {
    if (activeTab === "reports_view") {
      loadDailyReports(reportViewDate, reportViewDept);
    }
  }, [activeTab, reportViewDate, reportViewDept]);

  useEffect(() => {
    if (isApproved) loadCeoNotification(notifDate);
  }, [notifDate, isApproved]);

  useEffect(() => {
    if (isApproved) loadMeetingsForDate(calendarDate);
  }, [calendarDate]);

  // const todayFormatted = new Date().toLocaleDateString("en-KE", {
  //   weekday: "long", year: "numeric", month: "long", day: "numeric",
  // });

  async function loadData() {
    setDataLoading(true);
    const [tasksRes, docsRes, bookingsRes] = await Promise.all([
      supabase.from("staff_tasks").select("*").eq("staff_id", staff!.id)
        .gte("created_at", today).order("due_time"),
      supabase.from("staff_documents").select("*").order("uploaded_at", { ascending: false }).limit(20),
      supabase.from("bookings").select("id", { count: "exact" })
        .eq("check_in", today).in("status", ["confirmed", "pending"]),
    ]);
    if (docsRes.error) console.error("Docs fetch error:", docsRes.error.message);
    setTasks(tasksRes.data ?? []);
    setDocuments((docsRes.data ?? []).map(d => ({ ...d, storage_path: d.storage_path ?? d.file_url })));
    setTodayBookings(bookingsRes.count ?? 0);
    setDataLoading(false);
    await loadMeetingsForDate(calendarDate);
  }

  async function loadMeetingsForDate(date: string) {
    const { data } = await supabase
      .from("staff_meetings")
      .select("*")
      .gte("start_time", date + "T00:00:00")
      .lte("start_time", date + "T23:59:59")
      .order("start_time");
    setMeetings(data ?? []);
  }

  async function loadStaffRequests() {
    const { data } = await supabase
      .from("staff_members")
      .select("id, full_name, email, phone, role, department, status, created_at")
      .neq("user_id", staff!.user_id)
      .order("created_at", { ascending: false });
    setStaffRequests(data ?? []);
  }

  async function loadCeoNotification(date?: string) {
    if (!staff) return;
    const targetDate = date ?? notifDate;
    const { data: report } = await supabase
      .from("daily_reports")
      .select("id")
      .eq("department", staff.role)
      .eq("report_date", targetDate)
      .eq("submitted", true)
      .maybeSingle();
    if (!report) { setCeoNotification(null); return; }
    const { data: action } = await supabase
      .from("report_actions")
      .select("*")
      .eq("report_id", report.id)
      .maybeSingle();
    setCeoNotification(action as ReportAction ?? null);
  }

  async function loadDailyReports(date?: string, dept?: string) {
    setReportsLoading(true);
    const targetDate = date ?? reportViewDate;
    const targetDept = dept ?? reportViewDept;

    let query = supabase
      .from("daily_reports")
      .select("*")
      .eq("report_date", targetDate);

    if (targetDept !== "all") {
      query = query.eq("department", targetDept);
    }

    const { data: reports, error } = await query;
    if (error) console.error("loadDailyReports error:", error.message);
    if (!reports || reports.length === 0) { setDailyReports([]); setReportsLoading(false); return; }

    // fetch staff names
    const staffIds = [...new Set(reports.map(r => r.staff_id))];
    const { data: members } = await supabase
      .from("staff_members")
      .select("id, full_name")
      .in("id", staffIds);
    const nameMap: Record<string, string> = {};
    (members ?? []).forEach(m => { nameMap[m.id] = m.full_name; });

    const mapped = reports.map(r => ({
      ...r,
      // normalise submitted — DB may return boolean or 0/1
      submitted: r.submitted === true || r.submitted === 1 || r.submitted === "true",
      staff_name: nameMap[r.staff_id] ?? "Unknown",
    }));
    // sort: submitted first, then by submitted_at desc
    mapped.sort((a, b) => {
      if (a.submitted !== b.submitted) return a.submitted ? -1 : 1;
      return (b.submitted_at ?? "").localeCompare(a.submitted_at ?? "");
    });
    setDailyReports(mapped);
    setReportsLoading(false);
    // Also load CEO actions for this date
    loadReportActions(targetDate);
  }

  async function loadReportActions(date: string) {
    const { data } = await supabase
      .from("report_actions")
      .select("*")
      .eq("report_date", date)
      .order("created_at", { ascending: false });
    setReportActions(data ?? []);
  }

  async function handleAddEvent() {
    if (!newEvent.title.trim() || !newEvent.start_time) return;
    setAddingEvent(true);
    const datePrefix = calendarDate + "T";
    const { data, error } = await supabase.from("staff_meetings").insert({
      title: newEvent.title.trim(),
      event_type: newEvent.event_type,
      start_time: datePrefix + newEvent.start_time + ":00",
      end_time: newEvent.end_time ? datePrefix + newEvent.end_time + ":00" : null,
      location: newEvent.location || null,
      notes: newEvent.notes || null,
    }).select().single();
    if (error) { alert("Failed to add event: " + error.message); setAddingEvent(false); return; }
    if (data) setMeetings(ms => [...ms, data].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    setNewEvent({ title: "", event_type: "meeting", start_time: "", end_time: "", location: "", notes: "" });
    setShowAddEvent(false);
    setAddingEvent(false);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Remove this event?")) return;
    await supabase.from("staff_meetings").delete().eq("id", id);
    setMeetings(ms => ms.filter(m => m.id !== id));
  }

  async function handleApprove(id: string) {
    setApprovingId(id);
    await supabase.from("staff_members").update({
      status: "active",
      approved_at: new Date().toISOString(),
    }).eq("id", id);
    setStaffRequests(rs => rs.map(r => r.id === id ? { ...r, status: "active" } : r));
    setApprovingId(null);
  }

  async function handleSuspend(id: string) {
    setApprovingId(id);
    await supabase.from("staff_members").update({ status: "suspended" }).eq("id", id);
    setStaffRequests(rs => rs.map(r => r.id === id ? { ...r, status: "suspended" } : r));
    setApprovingId(null);
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    setApprovingId(id);
    const { error } = await supabase.from("staff_members").delete().eq("id", id);
    if (error) { alert("Delete failed: " + error.message); setApprovingId(null); return; }
    setStaffRequests(rs => rs.filter(r => r.id !== id));
    setApprovingId(null);
  }

  async function handleDeleteReport(reportId: string, deptLabel: string) {
    if (!confirm(`Delete the "${deptLabel}" report? This cannot be undone.`)) return;
    const { error } = await supabase.from("daily_reports").delete().eq("id", reportId);
    if (error) { alert("Delete failed: " + error.message); return; }
    setDailyReports(rs => rs.filter(r => r.id !== reportId));
  }

  function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["xls", "xlsx", "csv"].includes(ext ?? "")) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (["doc", "docx"].includes(ext ?? "")) return <FileType2 className="h-4 w-4 text-blue-600" />;
    if (ext === "pdf") return <FileText className="h-4 w-4 text-red-600" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !staff) return;
    setUploading(true);

    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    const storagePath = `${staff.user_id}/${Date.now()}_${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from("staff-documents")
      .upload(storagePath, file, { upsert: false });

    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const category =
      ["xls", "xlsx", "csv"].includes(ext) ? "spreadsheet" :
      ["doc", "docx"].includes(ext) ? "document" :
      ext === "pdf" ? "pdf" :
      ["ppt", "pptx"].includes(ext) ? "presentation" : "general";

    const { data: doc } = await supabase.from("staff_documents").insert({
      name: file.name,
      file_url: storagePath,        // store path, not public URL
      category,
      uploaded_by: staff.user_id,
      uploaded_by_name: staff.full_name,
      uploader_department: staff.department ?? staff.role,
    }).select().single();

    if (doc) setDocuments(ds => [{ ...doc, storage_path: storagePath }, ...ds]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function getSignedUrl(doc: Document, download = false): Promise<string | null> {
    const path = doc.storage_path ?? doc.file_url;
    const { data, error } = await supabase.storage
      .from("staff-documents")
      .createSignedUrl(path, 300, { download: download ? doc.name : undefined }); // 5 min expiry
    if (error) { alert("Could not generate link: " + error.message); return null; }
    return data.signedUrl;
  }

  async function handleOpen(doc: Document) {
    const url = await getSignedUrl(doc, false);
    if (url) window.open(url, "_blank");
  }

  async function handleDownload(doc: Document) {
    const url = await getSignedUrl(doc, true);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    const path = doc.storage_path ?? doc.file_url;
    await supabase.storage.from("staff-documents").remove([path]);
    await supabase.from("staff_documents").delete().eq("id", doc.id);
    setDocuments(ds => ds.filter(d => d.id !== doc.id));
  }

  async function toggleTask(id: string, completed: boolean) {
    await supabase.from("staff_tasks").update({ completed: !completed }).eq("id", id);
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !completed } : t));
  }

  async function addTask() {
    if (!newTask.trim() || !staff) return;
    setAddingTask(true);
    const { data } = await supabase.from("staff_tasks").insert({
      staff_id: staff.id, title: newTask.trim(),
      completed: false, priority: "medium", category: "general",
    }).select().single();
    if (data) setTasks(ts => [...ts, data]);
    setNewTask("");
    setAddingTask(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!staff) return null;

  // Pending approval screen
  if (!isApproved) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background p-6 pt-28">
          <Card className="w-full max-w-md text-center shadow-elegant">
            <CardContent className="pt-8 pb-8">
              <Shield className="h-14 w-14 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Awaiting Approval</h2>
              <p className="text-muted-foreground text-sm mb-2">
                Hello <strong>{staff.full_name}</strong>, your account is pending admin approval.
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                You'll receive access once an admin reviews your request.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-screen-2xl">

          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {staff.full_name.split(" ")[0]} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{todayFormatted}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={STATUS_COLORS[staff.status]}>{staff.status}</Badge>
                <Badge variant="outline">{ROLE_LABELS[staff.role]}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 sm:gap-1 mb-4 sm:mb-6 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "dashboard" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BedDouble className="h-4 w-4" /> Dashboard
            </button>
            {/* CEO only gets Reports Dashboard — no fill-in tab */}
            {staff.role !== "ceo" && (
              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "report" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="h-4 w-4" /> Daily Report
              </button>
            )}
            {/* Non-admin staff can view their own submitted reports */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab("my_reports")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "my_reports" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" /> My Reports
              </button>
            )}
            {/* ALL staff get reports dashboard (admins get full control, others read-only) */}
            <button
              onClick={() => setActiveTab("reports_view")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "reports_view" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="h-4 w-4" /> Reports Dashboard
            </button>
            {/* Admin Console — super_admin only */}
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab("admin_console")}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "admin_console" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4" /> Admin Console
              </button>
            )}
          </div>

          {activeTab === "report" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-accent" /> Daily Operations Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyReportForm staff={staff} />
              </CardContent>
            </Card>
          ) : activeTab === "my_reports" && !isAdmin ? (
            <MyReports staffId={staff.id} today={today} />
          ) : activeTab === "admin_console" && isSuperAdmin ? (
            <SuperAdminConsole staff={staff} />
          ) : activeTab === "reports_view" ? (
            <ReportsDashboard
              today={today}
              reportViewDate={reportViewDate}
              setReportViewDate={(d) => { setReportViewDate(d); }}
              reportViewDept={reportViewDept}
              setReportViewDept={(d) => { setReportViewDept(d); setExpandedReport(null); }}
              dailyReports={dailyReports}
              reportsLoading={reportsLoading}
              expandedReport={expandedReport}
              setExpandedReport={setExpandedReport}
              onRefresh={() => loadDailyReports(reportViewDate, reportViewDept)}
              isSuperAdmin={isSuperAdmin}
              onDeleteReport={handleDeleteReport}
              isAdmin={isAdmin}
              isCeoOrSuperAdmin={isCeoOrSuperAdmin}
              reportActions={reportActions}
              onActionSaved={(action: ReportAction) => setReportActions(prev => {
                const idx = prev.findIndex(a => a.report_id === action.report_id);
                return idx >= 0 ? prev.map((a, i) => i === idx ? action : a) : [action, ...prev];
              })}
            />
          ) : (
          <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: "Today's Check-ins", value: todayBookings, icon: BedDouble, color: "text-blue-600" },
              { label: "Tasks Today", value: tasks.length, icon: CheckCircle2, color: "text-green-600" },
              { label: "Tasks Done", value: completedTasks, icon: CheckCircle2, color: "text-accent" },
              { label: "Meetings Today", value: meetings.length, icon: CalendarDays, color: "text-purple-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{dataLoading ? "—" : value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${color} opacity-60`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">

            {/* Tasks */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dataLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">No tasks for today</p>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <button onClick={() => toggleTask(task.id, task.completed)} className="mt-0.5 shrink-0">
                        {task.completed
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.due_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />{task.due_time}
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Add task */}
                <div className="flex gap-2 pt-2">
                  <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTask()}
                    placeholder="Add a task…"
                    className="flex-1 text-sm px-2.5 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <Button size="sm" variant="outline" onClick={addTask} disabled={addingTask || !newTask.trim()}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule / Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-purple-600" /> Schedule
                  </CardTitle>
                  {canManageCalendar && (
                    <Button size="sm" variant="outline" onClick={() => setShowAddEvent(v => !v)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Event
                    </Button>
                  )}
                </div>
                {/* Date picker */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="date"
                    value={calendarDate}
                    onChange={e => setCalendarDate(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent w-full"
                  />
                  {calendarDate !== today && (
                    <button onClick={() => setCalendarDate(today)} className="text-xs text-accent hover:underline whitespace-nowrap">
                      Today
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Add event form — Front Office & admins only */}
                {canManageCalendar && showAddEvent && (
                  <div className="border border-border rounded-xl p-3 space-y-2 bg-secondary/30">
                    <p className="text-xs font-semibold text-foreground">New Event / Meeting</p>
                    <input
                      value={newEvent.title}
                      onChange={e => setNewEvent(v => ({ ...v, title: e.target.value }))}
                      placeholder="Title *"
                      className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <select
                      value={newEvent.event_type}
                      onChange={e => setNewEvent(v => ({ ...v, event_type: e.target.value }))}
                      className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="event">Event</option>
                      <option value="conference">Conference</option>
                      <option value="training">Training</option>
                      <option value="inspection">Inspection</option>
                      <option value="vip">Team building</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Start time *</p>
                        <input
                          type="time"
                          value={newEvent.start_time}
                          onChange={e => setNewEvent(v => ({ ...v, start_time: e.target.value }))}
                          className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">End time</p>
                        <input
                          type="time"
                          value={newEvent.end_time}
                          onChange={e => setNewEvent(v => ({ ...v, end_time: e.target.value }))}
                          className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <input
                      value={newEvent.location}
                      onChange={e => setNewEvent(v => ({ ...v, location: e.target.value }))}
                      placeholder="Location (optional)"
                      className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <textarea
                      value={newEvent.notes}
                      onChange={e => setNewEvent(v => ({ ...v, notes: e.target.value }))}
                      placeholder="Notes (optional)"
                      rows={2}
                      className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        disabled={addingEvent || !newEvent.title.trim() || !newEvent.start_time}
                        onClick={handleAddEvent}
                      >
                        {addingEvent ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* Events list */}
                {dataLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                ) : meetings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events for {calendarDate === today ? "today" : calendarDate}
                  </p>
                ) : (
                  meetings.map(m => {
                    const typeColors: Record<string, string> = {
                      meeting: "border-purple-400 bg-purple-50/50",
                      event: "border-blue-400 bg-blue-50/50",
                      conference: "border-amber-400 bg-amber-50/50",
                      training: "border-green-400 bg-green-50/50",
                      inspection: "border-orange-400 bg-orange-50/50",
                      vip: "border-rose-400 bg-rose-50/50",
                      other: "border-gray-400 bg-gray-50/50",
                    };
                    const color = typeColors[m.event_type ?? "meeting"] ?? typeColors.other;
                    return (
                      <div key={m.id} className={`p-3 rounded-lg border-l-4 ${color} group relative`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-semibold leading-tight">{m.title}</p>
                              {m.event_type && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/70 border border-border/50 capitalize">
                                  {m.event_type}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(m.start_time).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                              {m.end_time && ` – ${new Date(m.end_time).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}`}
                            </p>
                            {m.location && <p className="text-xs text-muted-foreground mt-0.5">📍 {m.location}</p>}
                            {m.notes && <p className="text-xs text-foreground/60 mt-1 italic">{m.notes}</p>}
                          </div>
                          {canManageCalendar && (
                            <button
                              onClick={() => handleDeleteEvent(m.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 shrink-0 mt-0.5"
                              title="Remove event"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" /> Documents
                  </CardTitle>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                      onChange={handleUpload}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">{uploading ? "Uploading…" : "Upload"}</span>
                    </Button>
                  </div>
                </div>
                {/* Date filter */}
                <div className="flex items-center gap-2 mt-2">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    value={selectedDocDate}
                    max={today}
                    onChange={e => setSelectedDocDate(e.target.value)}
                    className="text-xs px-2 py-1 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent w-full"
                  />
                  {selectedDocDate !== today && (
                    <button
                      onClick={() => setSelectedDocDate(today)}
                      className="text-xs text-accent hover:underline whitespace-nowrap"
                    >
                      Today
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dataLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                ) : filteredDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">
                    No documents for {selectedDocDate === today ? "today" : selectedDocDate}
                  </p>
                ) : (
                  filteredDocs.map(doc => (
                    <div key={doc.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors group border border-border/50">
                      <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        {getFileIcon(doc.name)}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpen(doc)}>
                        <p className="text-sm font-medium truncate hover:text-accent transition-colors">{doc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.category}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {doc.uploaded_by_name && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                              {doc.uploaded_by_name}
                            </span>
                          )}
                          {doc.uploader_department && (
                            <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                              {doc.uploader_department}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Open"
                          onClick={() => handleOpen(doc)}>
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Download"
                          onClick={() => handleDownload(doc)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" title="Delete"
                          onClick={() => handleDelete(doc)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>

          {/* Staff Access Requests — super_admin and manager only */}
          {(isSuperAdmin || staff.role === "manager") && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Staff Access Requests
                  {staffRequests.filter(r => r.status === "pending").length > 0 && (
                    <Badge className="bg-red-100 text-red-700 ml-1">
                      {staffRequests.filter(r => r.status === "pending").length} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staffRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No staff requests yet</p>
                ) : (
                  <div className="space-y-3">
                    {staffRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold">{req.full_name}</p>
                            <Badge className={
                              req.status === "active" ? "bg-green-100 text-green-700" :
                              req.status === "suspended" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }>
                              {req.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{ROLE_LABELS[req.role as keyof typeof ROLE_LABELS] ?? req.role}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />{req.email}
                            </span>
                            {req.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />{req.phone}
                              </span>
                            )}
                            {req.department && (
                              <span className="text-xs text-muted-foreground">{req.department}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested {new Date(req.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {req.status !== "active" && (
                            <Button
                              size="sm" variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              disabled={approvingId === req.id}
                              onClick={() => handleApprove(req.id)}
                            >
                              {approvingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                              <span className="ml-1.5">Approve</span>
                            </Button>
                          )}
                          {req.status === "active" && (
                            <Button
                              size="sm" variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50"
                              disabled={approvingId === req.id}
                              onClick={() => handleSuspend(req.id)}
                            >
                              {approvingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                              <span className="ml-1.5">Suspend</span>
                            </Button>
                          )}
                          {isSuperAdmin && (
                            <Button
                              size="sm" variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50"
                              disabled={approvingId === req.id}
                              onClick={() => handleDeleteUser(req.id, req.full_name)}
                            >
                              {approvingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              <span className="ml-1.5">Delete</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Password Reset Tickets — super_admin only */}
          {isSuperAdmin && <PasswordResetTickets />}

          </>
          )}

        </div>
      </div>
    </>
  );
}

// ── Reports Dashboard Component ──────────────────────────────────────────────

interface ReportsDashboardProps {
  today: string;
  reportViewDate: string;
  setReportViewDate: (d: string) => void;
  reportViewDept: string;
  setReportViewDept: (d: string) => void;
  dailyReports: DailyReport[];
  reportsLoading: boolean;
  expandedReport: string | null;
  setExpandedReport: (id: string | null) => void;
  onRefresh: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCeoOrSuperAdmin: boolean;
  onDeleteReport: (id: string, label: string) => void;
  reportActions: ReportAction[];
  onActionSaved: (action: ReportAction) => void;
}

function ReportsDashboard({
  today, reportViewDate, setReportViewDate,
  reportViewDept, setReportViewDept,
  dailyReports, reportsLoading,
  expandedReport, setExpandedReport,
  onRefresh, isSuperAdmin, isAdmin, isCeoOrSuperAdmin,
  onDeleteReport, reportActions, onActionSaved,
}: ReportsDashboardProps) {

  // Build summary rows — one per template, merged with all fetched data (submitted or draft)
  const summaryRows = REPORT_TEMPLATES.map(t => {
    // prefer submitted, fall back to draft
    const allForDept = dailyReports.filter(r => r.department === t.role);
    const latest = allForDept.find(r => r.submitted) ?? allForDept[0] ?? null;
    const kpi = latest?.entries?.["Key KPI figures"] ?? latest?.entries?.["Key KPI Figures"] ?? "";
    const mgmtAction = latest?.entries?.["Management Action Required"] ?? "";
    return { template: t, latest, kpi, mgmtAction };
  });

  // Submitted reports for the detail section
  const submittedReports = reportViewDept === "all"
    ? dailyReports.filter(r => r.submitted)
    : dailyReports.filter(r => r.submitted && r.department === reportViewDept);

  const submittedCount = dailyReports.filter(r => r.submitted).length;

  const REPORTS_PER_PAGE = 5;
  const [reportPage, setReportPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(submittedReports.length / REPORTS_PER_PAGE));
  const pagedReports = submittedReports.slice(
    (reportPage - 1) * REPORTS_PER_PAGE,
    reportPage * REPORTS_PER_PAGE,
  );

  // Reset to page 1 whenever filters or data changes
  useEffect(() => { setReportPage(1); }, [reportViewDate, reportViewDept, submittedReports.length]);

  function scrollToReport(reportId: string) {
    // expand it first
    setExpandedReport(`collapsed_${reportId}`);
    // then scroll after a tick
    setTimeout(() => {
      document.getElementById(`report-${reportId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="space-y-6">
      {/* Filters — admins get full controls, staff get read-only today view */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdmin ? (
          <>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={reportViewDate}
                max={today}
                onChange={e => setReportViewDate(e.target.value)}
                className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {reportViewDate !== today && (
                <button onClick={() => setReportViewDate(today)} className="text-xs text-accent hover:underline">
                  Today
                </button>
              )}
            </div>
            <select
              value={reportViewDept}
              onChange={e => setReportViewDept(e.target.value)}
              className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Departments</option>
              {REPORT_TEMPLATES.map(t => (
                <option key={t.role} value={t.role}>{t.label}</option>
              ))}
            </select>
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={reportsLoading}>
              {reportsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Refresh</span>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{today}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-1">Read-only</span>
          </div>
        )}
        <span className="text-xs text-muted-foreground">
          {reportsLoading ? "Loading…" : `${submittedCount} / ${REPORT_TEMPLATES.length} submitted`}
        </span>
      </div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Read-only view — today's submitted reports from all departments. Only your own report can be edited from the Daily Report tab.
        </div>
      )}

      {/* ── Charts row ── */}
      {!reportsLoading && (
        <div className="grid xl:grid-cols-2 gap-4">

          {/* Donut — submitted vs pending */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-accent" /> Submission Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6 pb-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Submitted", value: submittedCount },
                      { name: "Pending",   value: Math.max(0, REPORT_TEMPLATES.length - submittedCount) },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [`${v} dept${v !== 1 ? "s" : ""}`, n]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-lg font-bold text-green-600">{submittedCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gray-200 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-lg font-bold text-muted-foreground">
                      {Math.max(0, REPORT_TEMPLATES.length - submittedCount)}
                    </p>
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Completion</span>
                    <span>{Math.round((submittedCount / REPORT_TEMPLATES.length) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.round((submittedCount / REPORT_TEMPLATES.length) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bar chart — per-department status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-600" /> Department Report Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={REPORT_TEMPLATES.map(t => {
                    const found = dailyReports.find(r => r.department === t.role);
                    return {
                      name: t.label.split(" ")[0], // short label
                      submitted: found?.submitted ? 1 : 0,
                      draft:     (found && !found.submitted) ? 1 : 0,
                      pending:   !found ? 1 : 0,
                    };
                  })}
                  barSize={10}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-35} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} ticks={[0, 1]} />
                  <Tooltip
                    formatter={(v: number, n: string) => [v ? "Yes" : "No", n.charAt(0).toUpperCase() + n.slice(1)]}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="submitted" name="Submitted" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="draft"     name="Draft"     fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pending"   name="Pending"   fill="#e5e7eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Revenue vs Expenses charts */}
      {!reportsLoading && (() => {
        // Build revenue per department using new sub-category keys
        const getRevenue = (entries: Record<string, string> | undefined, role: string): number => {
          if (!entries) return 0;
          const subFields = REVENUE_CONFIG[role];
          if (subFields) {
            return subFields.reduce((s, f) => s + (parseFloat(entries[`__rev_${f}`] ?? "0") || 0), 0);
          }
          // fallback for old __revenue key
          return parseFloat(entries["__revenue"] ?? "0") || 0;
        };

        // Build expenses from procurement report keyed by dept label
        const procReport = dailyReports.find(d => d.department === "procurement" && d.submitted);
        const getExpenses = (deptLabel: string): number => {
          if (!procReport?.entries) return 0;
          return parseFloat(procReport.entries[`__exp_${deptLabel}`] ?? "0") || 0;
        };

        const finData = REPORT_TEMPLATES
          .map(t => {
            const r        = dailyReports.find(d => d.department === t.role && d.submitted);
            const revenue  = getRevenue(r?.entries, t.role);
            const expenses = getExpenses(t.label);
            const complimentary = parseFloat(r?.entries?.["__complimentary"] ?? "0") || 0;
            return revenue || expenses || complimentary
              ? { name: t.label.split(" ")[0], fullLabel: t.label, revenue, expenses, complimentary, net: revenue - expenses }
              : null;
          })
          .filter(Boolean) as { name: string; fullLabel: string; revenue: number; expenses: number; complimentary: number; net: number }[];

        if (finData.length === 0 && !procReport) return null;

        const fmt = (v: number) => `KES ${v.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
        const fmtShort = (v: number) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
          : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K`
          : `${v}`;

        // Sub-facility revenue breakdown
        const FACILITY_COLORS = ["#22c55e","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#06b6d4","#f97316","#ec4899"];
        const facilityBreakdown: { name: string; amount: number; color: string }[] = [];
        Object.entries(REVENUE_CONFIG).forEach(([role, fields]) => {
          const r = dailyReports.find(d => d.department === role && d.submitted);
          if (!r) return;
          fields.forEach((f) => {
            const val = parseFloat(r.entries?.[`__rev_${f}`] ?? "0") || 0;
            if (val) facilityBreakdown.push({ name: f, amount: val, color: FACILITY_COLORS[facilityBreakdown.length % FACILITY_COLORS.length] });
          });
        });

        // Expenses per department from procurement
        const expenseBreakdown = procReport
          ? EXPENSE_DEPARTMENTS
              .map(d => ({ name: d.split(" ")[0], fullName: d, amount: parseFloat(procReport.entries?.[`__exp_${d}`] ?? "0") || 0 }))
              .filter(d => d.amount > 0)
          : [];

        const totalRevenue      = finData.reduce((s, d) => s + d.revenue, 0);
        const totalExpenses     = expenseBreakdown.reduce((s, d) => s + d.amount, 0);
        const totalComplimentary = finData.reduce((s, d) => s + d.complimentary, 0);
        const totalNet          = totalRevenue - totalExpenses;

        const pieData = [
          { name: "Revenue",       value: totalRevenue,       fill: "#22c55e" },
          { name: "Expenses",      value: totalExpenses,      fill: "#ef4444" },
          { name: "Complimentary", value: totalComplimentary, fill: "#f97316" },
        ].filter(d => d.value > 0);

        return (
          <div className="grid xl:grid-cols-2 gap-4">
            {/* Revenue by department */}
            {finData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-green-600" /> Revenue by Department
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{reportViewDate}</p>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={finData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtShort} />
                      <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Revenue by facility (Front Office + Wellness breakdown) */}
            {facilityBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-blue-600" /> Revenue by Facility
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Front Office & Wellness Centre breakdown</p>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={facilityBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtShort} />
                      <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {facilityBreakdown.map((_, i) => <Cell key={i} fill={FACILITY_COLORS[i % FACILITY_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Expenses by department */}
            {expenseBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-red-600" /> Expenses by Department
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Filled by Procurement & Stores</p>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={expenseBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtShort} />
                      <Tooltip
                        formatter={(v: number, _n: string, props: any) => [fmt(v), props?.payload?.fullName ?? "Expenses"]}
                        contentStyle={{ fontSize: 11, borderRadius: 8 }}
                      />
                      <Bar dataKey="amount" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Complimentary by department — orange, distinct from revenue/expenses */}
            {(() => {
              const compData = finData.filter(d => d.complimentary > 0)
                .map(d => ({ name: d.name, amount: d.complimentary }));
              if (compData.length === 0) return null;
              const totalComp = compData.reduce((s, d) => s + d.amount, 0);
              return (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-amber-600" /> Complimentary (Non-Sale)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Value of items given free — not actual revenue · Total: {fmt(totalComp)}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={compData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtShort} />
                        <Tooltip
                          formatter={(v: number) => [fmt(v), "Complimentary"]}
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                        />
                        <Bar dataKey="amount" name="Complimentary" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Overall pie */}
            {(totalRevenue > 0 || totalExpenses > 0 || totalComplimentary > 0) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-purple-600" /> Overall Revenue vs Expenses
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{reportViewDate} · All Departments</p>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [fmt(v)]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3 text-sm">
                      <div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span className="text-xs text-muted-foreground">Revenue</span></div>
                        <p className="font-bold text-green-700">{fmt(totalRevenue)}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="text-xs text-muted-foreground">Expenses</span></div>
                        <p className="font-bold text-red-700">{fmt(totalExpenses)}</p>
                      </div>
                      {totalComplimentary > 0 && (
                        <div>
                          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /><span className="text-xs text-muted-foreground">Complimentary</span></div>
                          <p className="font-bold text-orange-600">{fmt(totalComplimentary)}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Net (Rev − Exp)</p>
                        <p className={`text-lg font-bold ${totalNet >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(totalNet)}</p>
                        {totalRevenue > 0 && (
                          <div className="mt-1.5">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Margin</span><span>{Math.round((totalNet / totalRevenue) * 100)}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full rounded-full ${totalNet >= 0 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, Math.abs(Math.round((totalNet / totalRevenue) * 100)))}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* Summary table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-accent" /> Daily Summary — {reportViewDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reportsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-1/4">Department</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-5/12">Critical Daily Indicators</th>
                    <th className="text-left px-4 py-3 font-semibold text-red-700 w-5/12">CEO Attention Required</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map(({ template, latest, kpi, mgmtAction }, i) => {
                    const isSubmitted = latest?.submitted === true;
                    const clickable = latest !== null;
                    return (
                      <tr
                        key={template.role}
                        className={`border-b border-border/50 transition-colors ${i % 2 === 0 ? "bg-background" : "bg-secondary/30"} ${isAdmin && clickable ? "cursor-pointer hover:bg-accent/5" : ""}`}
                        onClick={() => {
                          if (isAdmin && latest && isSubmitted) scrollToReport(latest.id);
                        }}
                      >
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-sm">{template.label}</p>
                          {latest ? (
                            <div className="mt-1 space-y-0.5">
                              <Badge className={isSubmitted ? "bg-green-100 text-green-700 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>
                                {isSubmitted ? "✓ Submitted" : "Draft"}
                              </Badge>
                              {latest.staff_name && (
                                <p className="text-xs text-muted-foreground">by {latest.staff_name}</p>
                              )}
                              {latest.submitted_at && isSubmitted && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(latest.submitted_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              )}
                              {isAdmin && isSubmitted && (
                                <p className="text-xs text-accent mt-1">↓ click to view report</p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs mt-1">Not submitted</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {kpi
                            ? <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{kpi}</p>
                            : <p className="text-xs text-muted-foreground italic">{latest ? "—" : `Expected: ${template.kpiLabel}`}</p>
                          }
                        </td>
                        <td className="px-4 py-3 align-top">
                          {/* Existing action response */}
                          {(() => {
                            const action = reportActions.find(a => a.department === template.role);
                            return (
                              <div className="space-y-2">
                                {/* The dept's original attention required text */}
                                {mgmtAction && (
                                  <p className="text-sm text-red-700 font-medium whitespace-pre-wrap leading-relaxed">{mgmtAction}</p>
                                )}
                                {!mgmtAction && <p className="text-xs text-muted-foreground italic">—</p>}

                                {/* CEO action taken */}
                                {action && (
                                  <div className={`rounded-lg p-2.5 text-xs border mt-2 ${
                                    action.signed_off
                                      ? "bg-green-50 border-green-200"
                                      : action.action_type === "meeting"
                                      ? "bg-purple-50 border-purple-200"
                                      : "bg-blue-50 border-blue-200"
                                  }`}>
                                    <div className="flex items-center gap-1.5 mb-1 font-semibold">
                                      {action.signed_off && <span className="text-green-700">✅ Signed Off</span>}
                                      {!action.signed_off && action.action_type === "meeting" && <span className="text-purple-700">📅 Meeting Scheduled</span>}
                                      {!action.signed_off && action.action_type === "comment" && <span className="text-blue-700">💬 CEO Response</span>}
                                    </div>
                                    {action.comment && <p className="text-foreground/80 whitespace-pre-wrap">{action.comment}</p>}
                                    {action.scheduled_date && (
                                      <p className="mt-1 font-medium text-purple-700">
                                        📅 {action.scheduled_date}{action.scheduled_time ? ` at ${action.scheduled_time}` : ""}
                                      </p>
                                    )}
                                    <p className="text-muted-foreground mt-1">
                                      — {action.actioned_by_name} · {new Date(action.created_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  </div>
                                )}

                                {/* Action panel for CEO/super_admin */}
                                {isCeoOrSuperAdmin && mgmtAction && (
                                  <CeoActionPanel
                                    reportId={latest?.id ?? ""}
                                    department={template.role}
                                    deptLabel={template.label}
                                    reportDate={reportViewDate}
                                    existingAction={action ?? null}
                                    onSaved={onActionSaved}
                                  />
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full submitted reports */}
      {!reportsLoading && submittedReports.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No submitted reports for {reportViewDate}
          {reportViewDept !== "all" ? ` · ${REPORT_TEMPLATES.find(t => t.role === reportViewDept)?.label}` : ""}.
        </div>
      ) : !reportsLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              Submitted Reports — {reportViewDate}
              {reportViewDept !== "all" && ` · ${REPORT_TEMPLATES.find(t => t.role === reportViewDept)?.label}`}
            </p>
            <span className="text-xs text-muted-foreground">
              {submittedReports.length} report{submittedReports.length !== 1 ? "s" : ""} · page {reportPage} of {totalPages}
            </span>
          </div>

          {pagedReports.map(report => {
            const tmpl = REPORT_TEMPLATES.find(t => t.role === report.department);
            const isCollapsed = expandedReport === `collapsed_${report.id}`;

            return (
              <Card key={report.id} id={`report-${report.id}`} className="overflow-hidden scroll-mt-24">
                {/* Report header */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                  <button
                    className="flex-1 flex items-center gap-3 flex-wrap text-left hover:opacity-80 transition-opacity"
                    onClick={() => setExpandedReport(isCollapsed ? null : `collapsed_${report.id}`)}
                  >
                    <span className="font-semibold text-sm">{tmpl?.label ?? report.department}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Submitted</Badge>
                    {report.staff_name && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {report.staff_name}
                      </span>
                    )}
                    {report.submitted_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(report.submitted_at).toLocaleString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    )}
                  </button>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground"
                      onClick={() => setExpandedReport(isCollapsed ? null : `collapsed_${report.id}`)}
                    >
                      {isCollapsed ? <><ChevronDown className="h-4 w-4" /> Show</> : <><ChevronUp className="h-4 w-4" /> Hide</>}
                    </span>
                    {isSuperAdmin && (
                      <Button
                        size="sm" variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50 h-7 px-2"
                        onClick={() => onDeleteReport(report.id, tmpl?.label ?? report.department)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="ml-1 text-xs">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Report fields — shown by default */}
                {!isCollapsed && (
                  <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/30 border-b border-border">
                          <th className="text-left px-4 py-2 w-8 text-xs font-medium text-muted-foreground">Ser</th>
                          <th className="text-left px-4 py-2 w-1/3 text-xs font-medium text-muted-foreground">Reporting Field</th>
                          <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Details / Figures / Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tmpl?.fields ?? []).map((f, idx) => {
                          const value = report.entries?.[f.field];
                          const isCeoField = f.field === "Management Action Required";
                          return (
                            <tr key={`${f.ser}-${f.field}`} className={`border-b border-border/40 ${idx % 2 === 0 ? "bg-background" : "bg-secondary/20"}`}>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground align-top">{f.ser}</td>
                              <td className="px-4 py-2.5 align-top">
                                <p className={`text-sm font-medium ${isCeoField ? "text-red-700" : ""}`}>{f.field}</p>
                              </td>
                              <td className="px-4 py-2.5 align-top">
                                {value
                                  ? <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isCeoField ? "text-red-700 font-medium" : "text-foreground/80"}`}>{value}</p>
                                  : <span className="text-xs text-muted-foreground italic">—</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Financials row — revenue sub-categories + expenses from procurement */}
                  {(() => {
                    const revenueFields = REVENUE_CONFIG[report.department];
                    const hasRevSubs = revenueFields && revenueFields.some(f => report.entries?.[`__rev_${f}`]);
                    const hasOldRev  = !!report.entries?.["__revenue"];
                    const hasComplimentary = !!report.entries?.["__complimentary"];
                    const isProc = report.department === "procurement";
                    const hasExpenses = isProc && EXPENSE_DEPARTMENTS.some(d => report.entries?.[`__exp_${d}`]);
                    const hasOldExp = !!report.entries?.["__expenses"];

                    if (!hasRevSubs && !hasOldRev && !hasComplimentary && !hasExpenses && !hasOldExp) return null;

                    const fmtKes = (v: number) => `KES ${v.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

                    return (
                      <div className="border-t border-border">
                        {/* Revenue sub-categories */}
                        {(hasRevSubs || hasOldRev) && (
                          <div className="bg-green-50/60 px-4 py-3">
                            <p className="text-xs font-semibold text-green-800 mb-2">Revenue Generated</p>
                            {hasRevSubs ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {revenueFields.map(f => {
                                  const val = parseFloat(report.entries?.[`__rev_${f}`] ?? "0") || 0;
                                  if (!val) return null;
                                  return (
                                    <div key={f}>
                                      <p className="text-xs text-muted-foreground">{f}</p>
                                      <p className="text-sm font-semibold text-green-700">{fmtKes(val)}</p>
                                    </div>
                                  );
                                })}
                                {(() => {
                                  const total = revenueFields.reduce((s, f) => s + (parseFloat(report.entries?.[`__rev_${f}`] ?? "0") || 0), 0);
                                  return total > 0 ? (
                                    <div className="col-span-full border-t border-green-200 pt-2 mt-1">
                                      <p className="text-xs text-green-900 font-bold">Total: {fmtKes(total)}</p>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            ) : (
                              <p className="text-sm font-semibold text-green-700">
                                {fmtKes(parseFloat(report.entries?.["__revenue"] ?? "0"))}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Complimentary */}
                        {hasComplimentary && (
                          <div className="bg-amber-50/60 px-4 py-3 border-t border-border">
                            <p className="text-xs font-semibold text-amber-800 mb-1">Complimentary (Non-Sale)</p>
                            <p className="text-sm font-bold text-amber-700">
                              KES {parseFloat(report.entries?.["__complimentary"] ?? "0").toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}

                        {/* Expenses per department (procurement) */}
                        {(hasExpenses || hasOldExp) && (
                          <div className="bg-red-50/60 px-4 py-3 border-t border-border">
                            <p className="text-xs font-semibold text-red-800 mb-2">Expenses by Department</p>
                            {hasExpenses ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {EXPENSE_DEPARTMENTS.map(d => {
                                  const val = parseFloat(report.entries?.[`__exp_${d}`] ?? "0") || 0;
                                  if (!val) return null;
                                  return (
                                    <div key={d}>
                                      <p className="text-xs text-muted-foreground">{d}</p>
                                      <p className="text-sm font-semibold text-red-700">{fmtKes(val)}</p>
                                    </div>
                                  );
                                })}
                                {(() => {
                                  const total = EXPENSE_DEPARTMENTS.reduce((s, d) => s + (parseFloat(report.entries?.[`__exp_${d}`] ?? "0") || 0), 0);
                                  return total > 0 ? (
                                    <div className="col-span-full border-t border-red-200 pt-2 mt-1">
                                      <p className="text-xs text-red-900 font-bold">Total: {fmtKes(total)}</p>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            ) : (
                              <p className="text-sm font-semibold text-red-700">
                                {fmtKes(parseFloat(report.entries?.["__expenses"] ?? "0"))}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </>
                )}
              </Card>
            );
          })}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Showing {(reportPage - 1) * REPORTS_PER_PAGE + 1}–{Math.min(reportPage * REPORTS_PER_PAGE, submittedReports.length)} of {submittedReports.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm" variant="outline"
                  disabled={reportPage === 1}
                  onClick={() => setReportPage(p => Math.max(1, p - 1))}
                  className="h-7 px-2 text-xs"
                >
                  ← Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setReportPage(p)}
                    className={`h-7 w-7 text-xs rounded-md border transition-colors ${
                      p === reportPage
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <Button
                  size="sm" variant="outline"
                  disabled={reportPage === totalPages}
                  onClick={() => setReportPage(p => Math.min(totalPages, p + 1))}
                  className="h-7 px-2 text-xs"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ── My Reports Component (non-admin staff) ───────────────────────────────────

function MyReports({ staffId, today }: { staffId: string; today: string }) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(today);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_reports")
        .select("*")
        .eq("staff_id", staffId)
        .eq("report_date", filterDate)
        .order("created_at", { ascending: false });

      if (error) console.error("MyReports error:", error.message);
      setReports(
        (data ?? []).map(r => ({
          ...r,
          submitted: r.submitted === true || r.submitted === 1 || r.submitted === "true",
        }))
      );
      setLoading(false);
    }
    load();
  }, [staffId, filterDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={filterDate}
            max={today}
            onChange={e => setFilterDate(e.target.value)}
            className="text-sm px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {filterDate !== today && (
            <button onClick={() => setFilterDate(today)} className="text-xs text-accent hover:underline">Today</button>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {loading ? "Loading…" : `${reports.filter(r => r.submitted).length} submitted · ${reports.filter(r => !r.submitted).length} draft`}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No reports for {filterDate === today ? "today" : filterDate}.
        </div>
      ) : (
        reports.map(report => {
          const tmpl = REPORT_TEMPLATES.find(t => t.role === report.department);
          const isOpen = expandedId === report.id;
          return (
            <Card key={report.id} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border hover:bg-secondary/80 transition-colors text-left"
                onClick={() => setExpandedId(isOpen ? null : report.id)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-sm">{tmpl?.label ?? report.department}</span>
                  <Badge className={report.submitted ? "bg-green-100 text-green-700 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>
                    {report.submitted ? "✓ Submitted" : "Draft"}
                  </Badge>
                  {report.submitted_at && report.submitted && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(report.submitted_at).toLocaleString("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                  {isOpen ? <><ChevronUp className="h-4 w-4" /> Hide</> : <><ChevronDown className="h-4 w-4" /> View</>}
                </span>
              </button>

              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/30 border-b border-border">
                        <th className="text-left px-4 py-2 w-8 text-xs font-medium text-muted-foreground">Ser</th>
                        <th className="text-left px-4 py-2 w-1/3 text-xs font-medium text-muted-foreground">Reporting Field</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Details / Figures / Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(tmpl?.fields ?? []).map((f, idx) => {
                        const value = report.entries?.[f.field];
                        return (
                          <tr key={`${f.ser}-${f.field}`} className={`border-b border-border/40 ${idx % 2 === 0 ? "bg-background" : "bg-secondary/20"}`}>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground align-top">{f.ser}</td>
                            <td className="px-4 py-2.5 text-sm font-medium align-top">{f.field}</td>
                            <td className="px-4 py-2.5 align-top">
                              {value
                                ? <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/80">{value}</p>
                                : <span className="text-xs text-muted-foreground italic">—</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

// ── CEO Action Panel ──────────────────────────────────────────────────────────

interface CeoActionPanelProps {
  reportId: string;
  department: string;
  deptLabel: string;
  reportDate: string;
  existingAction: ReportAction | null;
  onSaved: (action: ReportAction) => void;
}

function CeoActionPanel({ reportId, department, deptLabel, reportDate, existingAction, onSaved }: CeoActionPanelProps) {
  const { staff } = useStaffAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionType, setActionType] = useState<"comment" | "meeting" | "signed_off">(
    existingAction?.action_type ?? "comment"
  );
  const [comment, setComment] = useState(existingAction?.comment ?? "");
  const [scheduledDate, setScheduledDate] = useState(existingAction?.scheduled_date ?? "");
  const [scheduledTime, setScheduledTime] = useState(existingAction?.scheduled_time ?? "");

  async function handleSave() {
    if (!staff) return;
    setSaving(true);
    const payload = {
      report_id: reportId,
      department,
      report_date: reportDate,
      action_type: actionType,
      comment: comment.trim() || null,
      scheduled_date: actionType === "meeting" ? scheduledDate || null : null,
      scheduled_time: actionType === "meeting" ? scheduledTime || null : null,
      signed_off: actionType === "signed_off",
      actioned_by_name: staff.full_name,
    };

    let result;
    if (existingAction?.id) {
      const { data, error } = await supabase
        .from("report_actions")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", existingAction.id)
        .select()
        .single();
      if (error) { alert("Failed to save: " + error.message); setSaving(false); return; }
      result = data;
    } else {
      const { data, error } = await supabase
        .from("report_actions")
        .insert(payload)
        .select()
        .single();
      if (error) { alert("Failed to save: " + error.message); setSaving(false); return; }
      result = data;
    }

    if (result) onSaved(result as ReportAction);
    setSaving(false);
    setOpen(false);
  }

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
        >
          {existingAction ? "✏️ Update response" : "💬 Respond / Take action"}
        </button>
      ) : (
        <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-3 space-y-3 mt-2">
          <p className="text-xs font-semibold text-blue-800">CEO Action — {deptLabel}</p>

          {/* Action type */}
          <div className="flex gap-2 flex-wrap">
            {(["comment", "meeting", "signed_off"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActionType(t)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  actionType === t
                    ? t === "signed_off" ? "bg-green-600 text-white border-green-600"
                      : t === "meeting" ? "bg-purple-600 text-white border-purple-600"
                      : "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t === "comment" ? "💬 Comment" : t === "meeting" ? "📅 Schedule Meeting" : "✅ Sign Off"}
              </button>
            ))}
          </div>

          {/* Comment / note */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={
              actionType === "signed_off"
                ? "Optional note on sign-off…"
                : actionType === "meeting"
                ? "Meeting agenda or notes…"
                : "Your response or directive…"
            }
            rows={3}
            className="w-full text-sm px-2.5 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />

          {/* Meeting date/time */}
          {actionType === "meeting" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Date *</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full text-sm px-2.5 py-1.5 border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={saving || (actionType === "meeting" && !scheduledDate) || (!comment.trim() && actionType !== "signed_off")}
              onClick={handleSave}
              className={actionType === "signed_off" ? "bg-green-600 hover:bg-green-700 text-white" : actionType === "meeting" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              {actionType === "signed_off" ? "Sign Off" : actionType === "meeting" ? "Schedule" : "Save Response"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Password Reset Tickets (super_admin only) ────────────────────────────────

interface ResetTicket {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  status: string;
  token: string;
  requested_at: string;
  actioned_at: string | null;
  actioned_by: string | null;
}

function PasswordResetTickets() {
  const { staff } = useStaffAuth();
  const [tickets, setTickets] = useState<ResetTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("password_reset_tickets")
        .select("*")
        .order("requested_at", { ascending: false })
        .limit(50);
      setTickets(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleApprove(ticket: ResetTicket) {
    setActioningId(ticket.id);
    const { error } = await supabase
      .from("password_reset_tickets")
      .update({
        status: "approved",
        actioned_at: new Date().toISOString(),
        actioned_by: staff?.full_name ?? "super_admin",
      })
      .eq("id", ticket.id);

    if (error) { alert("Failed: " + error.message); setActioningId(null); return; }

    // Send the reset link — the reset page URL with the token
    const resetUrl = `${window.location.origin}/staff/reset-password?token=${ticket.token}`;

    // Copy link to clipboard for manual sharing
    try { await navigator.clipboard.writeText(resetUrl); } catch (_) {}

    setTickets(ts => ts.map(t => t.id === ticket.id ? { ...t, status: "approved" } : t));
    setActioningId(null);

    alert(
      `✅ Approved!\n\nShare this reset link with ${ticket.full_name ?? ticket.email}:\n\n${resetUrl}\n\n(Link copied to clipboard)`
    );
  }

  async function handleReject(id: string) {
    if (!confirm("Reject this reset request?")) return;
    setActioningId(id);
    await supabase.from("password_reset_tickets").update({
      status: "rejected",
      actioned_at: new Date().toISOString(),
      actioned_by: staff?.full_name ?? "super_admin",
    }).eq("id", id);
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status: "rejected" } : t));
    setActioningId(null);
  }

  const pending = tickets.filter(t => t.status === "pending");

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-amber-600" /> Password Reset Requests
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 ml-1">{pending.length} pending</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No reset requests yet</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{ticket.full_name ?? ticket.email}</p>
                    <Badge className={
                      ticket.status === "approved"  ? "bg-green-100 text-green-700" :
                      ticket.status === "rejected"  ? "bg-red-100 text-red-700"    :
                      ticket.status === "completed" ? "bg-blue-100 text-blue-700"  :
                      "bg-amber-100 text-amber-700"
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ticket.email}</p>
                  {ticket.department && <p className="text-xs text-muted-foreground">{ticket.department}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested {new Date(ticket.requested_at).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {ticket.actioned_by && ticket.actioned_at && (
                    <p className="text-xs text-muted-foreground">
                      {ticket.status === "approved" ? "Approved" : "Rejected"} by {ticket.actioned_by} · {new Date(ticket.actioned_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {ticket.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm" variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-50"
                      disabled={actioningId === ticket.id}
                      onClick={() => handleApprove(ticket)}
                    >
                      {actioningId === ticket.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">Approve & Send Link</span>
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="text-red-700 border-red-300 hover:bg-red-50"
                      disabled={actioningId === ticket.id}
                      onClick={() => handleReject(ticket.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="ml-1.5">Reject</span>
                    </Button>
                  </div>
                )}
                {ticket.status === "approved" && (
                  <Button
                    size="sm" variant="outline"
                    onClick={async () => {
                      const url = `${window.location.origin}/staff/reset-password?token=${ticket.token}`;
                      try { await navigator.clipboard.writeText(url); alert("Reset link copied!"); }
                      catch (_) { alert(url); }
                    }}
                  >
                    Copy Link
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
