import { useEffect, useState, useRef } from "react";
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
  FileSpreadsheet, FileType2, File,
} from "lucide-react";
import Navbar from "@/components/Navbar";

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

  const isAdmin = staff?.role === "manager" || staff?.role === "super_admin";

  const filteredDocs = documents.filter(d =>
    d.uploaded_at.startsWith(selectedDocDate)
  );

  useEffect(() => {
    if (!loading && !staff) {
      // Give it a moment — staffAuth may still be fetching
      const timer = setTimeout(() => {
        navigate("/staff/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (!loading && staff && !isApproved) return;
    if (!loading && isApproved) {
      loadData();
      if (isAdmin) loadStaffRequests();
    }
  }, [loading, staff, isApproved]);

  // const today = new Date().toISOString().split("T")[0];
  // const todayFormatted = new Date().toLocaleDateString("en-KE", {
  //   weekday: "long", year: "numeric", month: "long", day: "numeric",
  // });

  async function loadData() {
    setDataLoading(true);

    const [tasksRes, meetingsRes, docsRes, bookingsRes] = await Promise.all([
      supabase.from("staff_tasks").select("*").eq("staff_id", staff!.id)
        .gte("created_at", today).order("due_time"),
      supabase.from("staff_meetings").select("*").gte("start_time", today + "T00:00:00")
        .lte("start_time", today + "T23:59:59").order("start_time"),
      supabase.from("staff_documents").select("*").order("uploaded_at", { ascending: false }).limit(20),
      supabase.from("bookings").select("id", { count: "exact" })
        .eq("check_in", today).in("status", ["confirmed", "pending"]),
    ]);

    if (docsRes.error) console.error("Docs fetch error:", docsRes.error.message);

    setTasks(tasksRes.data ?? []);
    setMeetings(meetingsRes.data ?? []);
    setDocuments((docsRes.data ?? []).map(d => ({ ...d, storage_path: d.storage_path ?? d.file_url })));
    setTodayBookings(bookingsRes.count ?? 0);
    setDataLoading(false);
  }

  async function loadStaffRequests() {
    const { data } = await supabase
      .from("staff_members")
      .select("id, full_name, email, phone, role, department, status, created_at")
      .neq("user_id", staff!.user_id)
      .order("created_at", { ascending: false });
    setStaffRequests(data ?? []);
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
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
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

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

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

            {/* Meetings */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-purple-600" /> Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                ) : meetings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">No meetings scheduled today</p>
                ) : (
                  meetings.map(m => (
                    <div key={m.id} className="p-3 bg-secondary rounded-lg border-l-4 border-purple-400">
                      <p className="text-sm font-semibold">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.start_time).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                        {m.end_time && ` – ${new Date(m.end_time).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                      {m.location && <p className="text-xs text-muted-foreground">{m.location}</p>}
                      {m.notes && <p className="text-xs text-foreground/70 mt-1 italic">{m.notes}</p>}
                    </div>
                  ))
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

          {/* Admin: Staff Access Requests */}
          {isAdmin && (
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
                              size="sm"
                              variant="outline"
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
                              size="sm"
                              variant="outline"
                              className="text-red-700 border-red-300 hover:bg-red-50"
                              disabled={approvingId === req.id}
                              onClick={() => handleSuspend(req.id)}
                            >
                              {approvingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                              <span className="ml-1.5">Suspend</span>
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

        </div>
      </div>
    </>
  );
}
