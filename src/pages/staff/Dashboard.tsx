import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffAuth, ROLE_LABELS, STATUS_COLORS } from "@/lib/staffAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, CalendarDays, FileText, Clock, BedDouble,
  Users, CheckCircle2, Circle, Plus, Loader2, Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";

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
  category: string;
  uploaded_at: string;
}

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export default function StaffDashboard() {
  const { staff, loading, isApproved, signOut } = useStaffAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [todayBookings, setTodayBookings] = useState(0);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    if (!loading && !staff) navigate("/staff/login");
    if (!loading && staff && !isApproved) return; // show pending screen
    if (!loading && isApproved) loadData();
  }, [loading, staff, isApproved]);

  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-KE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  async function loadData() {
    setDataLoading(true);

    const [tasksRes, meetingsRes, docsRes, bookingsRes] = await Promise.all([
      supabase.from("staff_tasks").select("*").eq("staff_id", staff!.id)
        .gte("created_at", today).order("due_time"),
      supabase.from("staff_meetings").select("*").gte("start_time", today + "T00:00:00")
        .lte("start_time", today + "T23:59:59").order("start_time"),
      supabase.from("staff_documents").select("*").order("uploaded_at", { ascending: false }).limit(10),
      supabase.from("bookings").select("id", { count: "exact" })
        .eq("check_in", today).in("status", ["confirmed", "pending"]),
    ]);

    setTasks(tasksRes.data ?? []);
    setMeetings(meetingsRes.data ?? []);
    setDocuments(docsRes.data ?? []);
    setTodayBookings(bookingsRes.count ?? 0);
    setDataLoading(false);
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
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" /> Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dataLoading ? (
                  <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">No documents available</p>
                ) : (
                  documents.map(doc => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-accent">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.category} · {new Date(doc.uploaded_at).toLocaleDateString("en-KE")}</p>
                      </div>
                    </a>
                  ))
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </>
  );
}
