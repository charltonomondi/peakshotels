/**
 * Host Dashboard
 * Monitors ALL candidates (camera + screen). Only the host sees participant media.
 * Candidates never see each other — enforced at server and client level.
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Users, PlayCircle, StopCircle, LogOut, Clock,
  AlertTriangle, CheckCircle2, XCircle, Wifi, WifiOff,
  ScrollText, PanelRight, ClipboardCopy, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInterview, InterviewProvider } from "./InterviewContext";
import VideoTile from "./VideoTile";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ── Inner component (must be inside InterviewProvider) ────────────────────────
function HostInner() {
  const { roomId: roomParam } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { name = "Host", formUrl = "", duration = 60 } =
    (location.state as { name: string; formUrl: string; duration: number }) || {};

  const {
    localStream, candidates, auditLog,
    examActive, examSecondsLeft,
    connected,
    initHost, startExam, endExam,
    admitCandidate, removeCandidate,
    toggleMic, toggleCam, disconnect,
  } = useInterview();

  const [activeTab, setActiveTab] = useState<"monitor" | "audit">("monitor");
  const [initialized, setInitialized] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!initialized && roomParam) {
      initHost(roomParam, name, formUrl, duration);
      setInitialized(true);
    }
  }, [initialized, roomParam, name, formUrl, duration, initHost]);

  const handleMic = () => { toggleMic(); setMicOn(m => !m); };
  const handleCam = () => { toggleCam(); setCamOn(c => !c); };

  const handleLeave = () => { disconnect(); navigate("/careers"); };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/interview/candidate/${roomParam}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const candidateList = Array.from(candidates.values());
  const admittedList = candidateList.filter(c => c.admitted);
  const waitingList = candidateList.filter(c => !c.admitted);
  const screenAlerts = admittedList.filter(c => !c.screenOn && c.connected);

  const handleAdmitAll = () => {
    waitingList.forEach(c => admitCandidate(c.id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <Monitor className="h-4 w-4 text-accent" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight">Host Dashboard</p>
            <p className="text-[10px] text-zinc-400 font-mono">Room: {roomParam}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {connected ? (
            <Badge variant="outline" className="text-green-400 border-green-700 text-[10px] h-5 px-1.5">
              <Wifi className="h-2.5 w-2.5 mr-1" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-[10px] h-5 px-1.5">
              <WifiOff className="h-2.5 w-2.5 mr-1" /> Reconnecting…
            </Badge>
          )}
          {examActive && (
            <Badge className="bg-red-700 text-white text-[10px] font-mono h-5 px-1.5">
              <Clock className="h-2.5 w-2.5 mr-1" /> {formatTime(examSecondsLeft)}
            </Badge>
          )}
          {waitingList.length > 0 && (
            <Badge className="bg-amber-600 text-white text-[10px] h-5 px-1.5 animate-pulse">
              {waitingList.length} waiting to join
            </Badge>
          )}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Toggle sidebar"
          >
            <PanelRight className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white text-[10px] h-7 px-2" onClick={handleLeave}>
            <LogOut className="h-3 w-3 mr-1" /> Leave
          </Button>
        </div>
      </header>

      {/* ── Screen share alerts ───────────────────────────────────────────── */}
      <AnimatePresence>
        {screenAlerts.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 bg-amber-600/15 border-b border-amber-500/25 px-4 py-1.5 text-xs text-amber-300 shrink-0 overflow-hidden"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <strong className="font-semibold">{c.name}</strong>
            <span className="text-amber-400/80">is not sharing their screen</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main panel ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 min-w-0">

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4">
            {(["monitor", "audit"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t
                    ? "bg-accent text-accent-foreground"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {t === "monitor" ? (
                  <><Users className="h-3.5 w-3.5 inline mr-1" />Candidates ({candidateList.length})</>
                ) : (
                  <><ScrollText className="h-3.5 w-3.5 inline mr-1" />Audit ({auditLog.length})</>
                )}
              </button>
            ))}

            {/* Admit-all shortcut */}
            {activeTab === "monitor" && waitingList.length > 0 && (
              <Button
                size="sm"
                className="ml-auto h-7 text-[10px] bg-green-800 hover:bg-green-700 px-2"
                onClick={handleAdmitAll}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Admit All ({waitingList.length})
              </Button>
            )}
          </div>

          {/* ── Monitor grid ──────────────────────────────────────────────── */}
          {activeTab === "monitor" && (
            <>
              {candidateList.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-zinc-600 text-sm gap-3"
                >
                  <Users className="h-10 w-10 opacity-30" />
                  <p>Waiting for candidates to join…</p>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5"
                  >
                    <ClipboardCopy className="h-3.5 w-3.5" />
                    {copiedLink ? "Copied!" : "Copy candidate invite link"}
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {candidateList.map(c => (
                    <CandidateCard
                      key={c.id}
                      candidate={c}
                      onAdmit={() => admitCandidate(c.id)}
                      onRemove={() => removeCandidate(c.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Audit log ─────────────────────────────────────────────────── */}
          {activeTab === "audit" && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              {auditLog.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-10">No events yet.</p>
              ) : (
                <div className="divide-y divide-zinc-800/60 max-h-[70vh] overflow-y-auto">
                  {[...auditLog].reverse().map((e, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2">
                      <span className="text-[10px] font-mono text-zinc-600 shrink-0 pt-0.5 w-16 text-right">
                        {new Date(e.ts).toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-zinc-300 leading-snug">
                        <span className="font-semibold text-white">{e.candidateName}</span>{" "}
                        <span className={e.event.includes("⚠") ? "text-amber-400" : ""}>{e.event}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border-l border-zinc-800 flex flex-col p-3 gap-4 shrink-0 overflow-hidden"
            >
              {/* Host self-view */}
              <div>
                <p className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-widest">Your Preview</p>
                <VideoTile
                  stream={localStream}
                  label={name}
                  muted
                  mirror
                  micOn={micOn}
                  camOn={camOn}
                  className="aspect-video w-full rounded-xl"
                />
                <div className="flex gap-1.5 mt-2">
                  <MediaToggle
                    active={micOn}
                    onClick={handleMic}
                    activeIcon={<Mic className="h-3.5 w-3.5" />}
                    inactiveIcon={<MicOff className="h-3.5 w-3.5" />}
                  />
                  <MediaToggle
                    active={camOn}
                    onClick={handleCam}
                    activeIcon={<Video className="h-3.5 w-3.5" />}
                    inactiveIcon={<VideoOff className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>

              {/* Exam controls */}
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Exam Controls</p>
                {!examActive ? (
                  <>
                    <Button
                      className="w-full text-xs bg-green-700 hover:bg-green-600"
                      size="sm"
                      onClick={startExam}
                    >
                      <PlayCircle className="h-3.5 w-3.5 mr-1" />
                      Start Exam
                    </Button>
                    {admittedList.length === 0 && (
                      <p className="text-[10px] text-zinc-500 text-center leading-snug">
                        {candidateList.length === 0
                          ? "No candidates yet — you can still start the timer."
                          : "Admit candidates below to let them receive the exam."}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-red-950 border border-red-800 rounded-lg py-2 text-center">
                      <p className="text-[10px] text-red-400 mb-0.5">Time Remaining</p>
                      <p className="font-mono text-xl font-bold text-red-300 tabular-nums">
                        {formatTime(examSecondsLeft)}
                      </p>
                    </div>
                    <Button
                      className="w-full text-xs bg-red-800 hover:bg-red-700"
                      size="sm"
                      onClick={endExam}
                    >
                      <StopCircle className="h-3.5 w-3.5 mr-1" /> End Exam
                    </Button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Stats</p>
                <StatRow label="Total" value={candidateList.length} />
                <StatRow label="Admitted" value={admittedList.length} color="text-green-400" />
                <StatRow label="Waiting" value={waitingList.length} color="text-amber-400" />
                <StatRow
                  label="Screen OK"
                  value={admittedList.filter(c => c.screenOn).length}
                  color="text-blue-400"
                />
              </div>

              {/* Room code + copy link */}
              <div className="mt-auto space-y-2">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Room Code</p>
                <p className="font-mono text-lg font-bold text-white tracking-widest bg-zinc-800 rounded-lg py-1.5 text-center">
                  {roomParam}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors bg-zinc-800 hover:bg-zinc-700 rounded-lg py-1.5"
                >
                  <ClipboardCopy className="h-3 w-3" />
                  {copiedLink ? "Copied!" : "Copy invite link"}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Candidate card ────────────────────────────────────────────────────────────
function CandidateCard({
  candidate: c,
  onAdmit,
  onRemove,
}: {
  candidate: import("./InterviewContext").CandidateState;
  onAdmit: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
      className={`bg-zinc-900 rounded-2xl border overflow-hidden ${
        c.admitted ? "border-zinc-800" : "border-amber-500/60 ring-1 ring-amber-500/20"
      }`}
    >
      {/* "Knocking" banner for unadmitted candidates */}
      <AnimatePresence>
        {!c.admitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-600/20 border-b border-amber-500/30 px-3 py-2 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="text-[11px] text-amber-300 font-semibold truncate">
                Wants to join
              </span>
            </div>
            <button
              onClick={onAdmit}
              className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-green-600 hover:bg-green-500 text-white px-2.5 py-1 rounded-lg transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" /> Admit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera feed */}
      <div className="relative">
        <VideoTile
          stream={c.stream}
          label={c.name}
          micOn={c.micOn}
          camOn={c.camOn}
          className="aspect-video w-full"
        />
        {!c.screenOn && c.admitted && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <MonitorOff className="h-2.5 w-2.5" /> No Screen
            </span>
          </div>
        )}
      </div>

      {/* Screen share feed (when active) */}
      <AnimatePresence>
        {c.screenOn && c.screenStream && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800 overflow-hidden"
          >
            <p className="text-[10px] text-zinc-500 px-2 pt-1.5 flex items-center gap-1">
              <Monitor className="h-3 w-3" /> Screen Share
            </p>
            <VideoTile stream={c.screenStream} className="aspect-video w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name, email, status row */}
      <div className="px-3 pt-2 pb-1">
        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
        {c.email && (
          <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
            <Mail className="h-2.5 w-2.5 shrink-0" /> {c.email}
          </p>
        )}
      </div>

      {/* Status icons + remove */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <StatusDot on={c.micOn} iconOn={<Mic className="h-3 w-3" />} iconOff={<MicOff className="h-3 w-3" />} title="Microphone" />
          <StatusDot on={c.camOn} iconOn={<Video className="h-3 w-3" />} iconOff={<VideoOff className="h-3 w-3" />} title="Camera" />
          <StatusDot on={c.screenOn} iconOn={<Monitor className="h-3 w-3" />} iconOff={<MonitorOff className="h-3 w-3" />} title="Screen" />
          <StatusDot on={c.connected} iconOn={<Wifi className="h-3 w-3" />} iconOff={<WifiOff className="h-3 w-3" />} title="Connection" />
        </div>
        <button
          onClick={onRemove}
          className="flex items-center gap-0.5 text-[10px] font-medium bg-red-800 hover:bg-red-700 text-white px-2 py-1 rounded-lg transition-colors shrink-0"
        >
          <XCircle className="h-3 w-3" /> Remove
        </button>
      </div>
    </motion.div>
  );
}

function StatusDot({ on, iconOn, iconOff, title }: {
  on: boolean;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  title: string;
}) {
  return (
    <div
      title={title}
      className={`w-6 h-6 rounded-md flex items-center justify-center ${
        on ? "bg-zinc-700 text-zinc-300" : "bg-red-900/50 text-red-400"
      }`}
    >
      {on ? iconOn : iconOff}
    </div>
  );
}

function MediaToggle({ active, onClick, activeIcon, inactiveIcon }: {
  active: boolean;
  onClick: () => void;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-colors ${
        active ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-red-900/60 text-red-400 hover:bg-red-900"
      }`}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  );
}

function StatRow({ label, value, color = "text-white" }: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

export default function Host() {
  return (
    <InterviewProvider>
      <HostInner />
    </InterviewProvider>
  );
}
