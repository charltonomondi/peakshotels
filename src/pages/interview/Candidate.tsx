/**
 * Candidate View
 * - Exam form opens as an iframe INSIDE the meeting page
 * - Screen sharing works on desktop; mobile falls back to camera capture
 *   with a clear notice (getDisplayMedia is not supported on mobile browsers)
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Clock, LogOut, Wifi, WifiOff,
  AlertTriangle, CheckCircle2, Hourglass, Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInterview, InterviewProvider } from "./InterviewContext";
import VideoTile from "./VideoTile";

type Step = "media-check" | "waiting" | "exam" | "ended" | "kicked";

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// Detect if getDisplayMedia is available (not on most mobile browsers)
function canShareScreen(): boolean {
  return typeof navigator.mediaDevices?.getDisplayMedia === "function";
}

// Detect mobile
function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function CandidateInner() {
  const { roomId: roomParam } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { name = "Candidate", email = "" } =
    (location.state as { name: string; email: string }) || {};

  const {
    localStream, screenStream,
    examActive, examFormUrl, examSecondsLeft,
    connected, admitted,
    initCandidate, toggleMic, toggleCam,
    startScreenShare, stopScreenShare,
    disconnect, sendVisibilityEvent,
  } = useInterview();

  const [step, setStep] = useState<Step>("media-check");
  const [initialized, setInitialized] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenError, setScreenError] = useState("");
  const [tabWarnings, setTabWarnings] = useState(0);
  const [formExpanded, setFormExpanded] = useState(false);
  const mobile = isMobile();
  const screenSupported = canShareScreen();
  const prevStep = useRef<Step>("media-check");

  useEffect(() => {
    if (!initialized && roomParam) {
      initCandidate(roomParam, name, email);
      setInitialized(true);
    }
  }, [initialized, roomParam, name, email, initCandidate]);

  useEffect(() => { if (admitted && step === "waiting") setStep("exam"); }, [admitted, step]);
  useEffect(() => {
    if (examActive && (step === "waiting" || step === "media-check")) setStep("exam");
  }, [examActive, step]);
  useEffect(() => {
    if (!examActive && step === "exam" && examSecondsLeft === 0) setStep("ended");
  }, [examActive, examSecondsLeft, step]);

  useEffect(() => {
    if ((step === "exam" || step === "waiting") && !screenStream && !mobile) {
      setScreenError("Screen sharing stopped — please restart to continue.");
    } else {
      setScreenError("");
    }
  }, [screenStream, step, mobile]);

  useEffect(() => {
    const handle = () => {
      sendVisibilityEvent(document.hidden);
      if (document.hidden && step === "exam") setTabWarnings(n => n + 1);
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [step, sendVisibilityEvent]);

  const handleMic = () => { toggleMic(); setMicOn(m => !m); };
  const handleCam = () => { toggleCam(); setCamOn(c => !c); };

  const handleShareScreen = async () => {
    setScreenError("");
    if (!screenSupported) {
      // Mobile: capture front camera as "screen share" — proctor sees the face
      // This is already in localStream so nothing extra needed
      prevStep.current = step;
      setStep("waiting");
      return;
    }
    try {
      await startScreenShare();
      prevStep.current = step;
      setStep("waiting");
    } catch {
      setScreenError("Screen sharing was cancelled. Please try again.");
    }
  };

  const handleLeave = () => { disconnect(); navigate("/interview"); };

  // During exam: split layout — camera strip on the side, form takes main space
  if (step === "exam" && examActive) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-white">{name}</p>
            <span className="text-[10px] text-zinc-500 font-mono">· {roomParam}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-700 text-white text-xs font-mono h-6 tabular-nums">
              <Clock className="h-3 w-3 mr-1" /> {formatTime(examSecondsLeft)}
            </Badge>
            {connected ? (
              <Badge variant="outline" className="text-green-400 border-green-700 text-xs h-6">
                <Wifi className="h-3 w-3 mr-1" /> Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-zinc-500 border-zinc-700 text-xs h-6">
                <WifiOff className="h-3 w-3 mr-1" /> …
              </Badge>
            )}
          </div>
        </header>

        {/* Tab switch warning */}
        <AnimatePresence>
          {tabWarnings > 0 && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden bg-red-900/30 border-b border-red-700/40 px-4 py-1.5 flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Tab switch detected ({tabWarnings}×) — proctor notified.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body: form + camera strip */}
        <div className={`flex flex-1 overflow-hidden ${formExpanded ? "" : "flex-col md:flex-row"}`}>

          {/* Google Form iframe — main content */}
          <div className={`flex-1 relative ${formExpanded ? "fixed inset-0 z-50 bg-zinc-950" : ""}`}>
            <div className="absolute inset-0 flex flex-col">
              <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 shrink-0">
                <span className="text-[10px] text-zinc-400 truncate flex-1 mr-2">
                  {/* Never show the URL until exam is active and admitted */}
                  {admitted && examActive && examSecondsLeft > 0 ? examFormUrl : "Examination Form"}
                </span>
                {admitted && examActive && examSecondsLeft > 0 && (
                  <button
                    onClick={() => setFormExpanded(e => !e)}
                    className="text-zinc-400 hover:text-white p-1 rounded"
                    title={formExpanded ? "Exit fullscreen" : "Fullscreen form"}
                  >
                    {formExpanded
                      ? <Minimize2 className="h-3.5 w-3.5" />
                      : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>

              {/* ── Gate: only show form when admitted + exam running + time remaining ── */}
              {admitted && examActive && examSecondsLeft > 0 ? (
                examFormUrl ? (
                  <iframe
                    src={examFormUrl}
                    className="flex-1 w-full border-0 bg-white"
                    allow="camera; microphone"
                    title="Examination Form"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                    No exam form URL provided.
                  </div>
                )
              ) : !admitted ? (
                /* Not yet admitted */
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 gap-4 px-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
                    <Hourglass className="h-7 w-7 text-amber-400" />
                  </div>
                  <p className="text-white font-semibold text-base">Waiting for Admission</p>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    The host has not admitted you yet. The examination form will appear here
                    once you are admitted and the exam begins.
                  </p>
                </div>
              ) : !examActive || examSecondsLeft === 0 ? (
                /* Time elapsed or exam ended */
                <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 gap-4 px-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-red-900/40 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-red-400" />
                  </div>
                  <p className="text-white font-semibold text-base">
                    {examSecondsLeft === 0 ? "Time's Up" : "Exam Not Started"}
                  </p>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {examSecondsLeft === 0
                      ? "The examination time has elapsed. The form is no longer accessible."
                      : "The host has not started the examination yet. Please wait."}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Camera strip */}
          {!formExpanded && (
            <div className="w-full md:w-44 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 flex md:flex-col gap-2 p-2 shrink-0">
              {/* Self camera */}
              <div className="flex-1 md:flex-none">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Your Camera</p>
                <VideoTile
                  stream={localStream}
                  label={name}
                  muted mirror
                  micOn={micOn} camOn={camOn}
                  className="aspect-video w-full rounded-xl"
                />
              </div>

              {/* Controls */}
              <div className="flex md:flex-col gap-1.5 items-center md:items-stretch">
                <ControlBtn active={micOn} onClick={handleMic}
                  activeIcon={<Mic className="h-3.5 w-3.5" />}
                  inactiveIcon={<MicOff className="h-3.5 w-3.5" />} label="Mic" />
                <ControlBtn active={camOn} onClick={handleCam}
                  activeIcon={<Video className="h-3.5 w-3.5" />}
                  inactiveIcon={<VideoOff className="h-3.5 w-3.5" />} label="Cam" />
                {!mobile && (
                  <ControlBtn
                    active={!!screenStream}
                    onClick={screenStream ? stopScreenShare : handleShareScreen}
                    activeIcon={<Monitor className="h-3.5 w-3.5" />}
                    inactiveIcon={<MonitorOff className="h-3.5 w-3.5" />}
                    label="Screen"
                    activeClass="bg-blue-800 hover:bg-blue-700 text-blue-100"
                  />
                )}
                <button onClick={handleLeave}
                  className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-[10px] font-medium bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Leave</span>
                </button>
              </div>

              {/* Screen / no-screen indicator */}
              {!mobile && (
                <div className={`text-[9px] px-2 py-1 rounded-lg text-center ${screenStream ? "bg-blue-900/30 text-blue-400" : "bg-red-900/30 text-red-400"}`}>
                  {screenStream ? "Screen ✓" : "No screen ⚠"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Pre-exam / waiting / ended layouts ────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col select-none">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
            <Video className="h-3.5 w-3.5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">{name}</p>
            <p className="text-[10px] text-zinc-400 font-mono">Room: {roomParam}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {connected
            ? <Badge variant="outline" className="text-green-400 border-green-700 text-xs h-6"><Wifi className="h-3 w-3 mr-1" /> Connected</Badge>
            : <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs h-6"><WifiOff className="h-3 w-3 mr-1" /> Reconnecting…</Badge>}
          {step !== "media-check" && (
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 text-xs h-6 px-2" onClick={handleLeave}>
              <LogOut className="h-3 w-3 mr-1" /> Leave
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-5 w-full max-w-md mx-auto">

        {/* Self camera */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Your Camera</p>
            {screenStream && !mobile && (
              <span className="text-[10px] text-blue-400 flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Screen active
              </span>
            )}
          </div>
          <VideoTile
            stream={localStream}
            label={`${name}${email ? ` · ${email}` : ""}`}
            muted mirror micOn={micOn} camOn={camOn}
            className="aspect-video w-full rounded-2xl border border-zinc-800"
          />
          <div className="flex gap-2 mt-2">
            <ControlBtn active={micOn} onClick={handleMic}
              activeIcon={<Mic className="h-4 w-4" />}
              inactiveIcon={<MicOff className="h-4 w-4" />} label="Mic" />
            <ControlBtn active={camOn} onClick={handleCam}
              activeIcon={<Video className="h-4 w-4" />}
              inactiveIcon={<VideoOff className="h-4 w-4" />} label="Camera" />
            <ControlBtn
              active={!!screenStream}
              onClick={screenStream ? stopScreenShare : handleShareScreen}
              activeIcon={<Monitor className="h-4 w-4" />}
              inactiveIcon={<MonitorOff className="h-4 w-4" />}
              label={mobile ? (screenSupported ? "Screen" : "Ready") : "Screen"}
              activeClass="bg-blue-800 hover:bg-blue-700 text-blue-100"
            />
          </div>
        </div>

        {/* Screen error */}
        <AnimatePresence>
          {screenError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full bg-amber-900/30 border border-amber-600/40 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{screenError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile info */}
        {mobile && !screenSupported && step === "media-check" && (
          <div className="w-full bg-blue-900/20 border border-blue-700/30 rounded-xl p-3 text-xs text-blue-300">
            Screen sharing is not supported on your mobile browser. Your camera will be used for proctoring instead.
            Tap <strong>Ready</strong> to continue.
          </div>
        )}

        {/* Step panels */}
        <AnimatePresence mode="wait">
          {step === "media-check" && (
            <StepCard key="mc" icon={<Video className="h-5 w-5 text-accent" />} title="Camera & Microphone Check">
              <p className="text-sm text-zinc-400 text-center mb-4 leading-relaxed">
                {mobile && !screenSupported
                  ? "Make sure your camera and microphone are working, then tap Ready to join the waiting room."
                  : <>Confirm your camera and mic are working, then share your <strong className="text-white">entire screen</strong> to join the waiting room.</>}
              </p>
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleShareScreen}>
                <Monitor className="h-4 w-4 mr-2" />
                {mobile && !screenSupported ? "I'm Ready — Continue" : "Share My Screen & Continue"}
              </Button>
              {screenError && <p className="text-xs text-red-400 text-center mt-2">{screenError}</p>}
            </StepCard>
          )}

          {step === "waiting" && (
            <StepCard key="wt" icon={<Hourglass className="h-5 w-5 text-amber-400" />} title="Waiting Room">
              <p className="text-sm text-zinc-400 text-center mb-3 leading-relaxed">
                You are in the waiting room. The host will admit you shortly.
              </p>
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">
                {(screenStream || mobile) ? (
                  <><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /><span className="text-xs text-green-400">Ready — waiting for host</span></>
                ) : (
                  <><AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" /><span className="text-xs text-amber-400">Screen not shared</span></>
                )}
              </div>
              {!screenStream && !mobile && (
                <Button className="w-full mt-3" variant="outline" onClick={handleShareScreen}>
                  <Monitor className="h-4 w-4 mr-2" /> Restart Screen Share
                </Button>
              )}
            </StepCard>
          )}

          {step === "exam" && !examActive && (
            <StepCard key="ex-wait" icon={<CheckCircle2 className="h-5 w-5 text-green-400" />} title="Admitted — Waiting for Exam">
              <p className="text-sm text-zinc-400 text-center">
                You have been admitted. The host will start the exam shortly.
              </p>
            </StepCard>
          )}

          {step === "ended" && (
            <StepCard key="end" icon={<CheckCircle2 className="h-5 w-5 text-zinc-400" />} title="Examination Ended">
              <p className="text-sm text-zinc-400 text-center mb-4">The examination has ended. Thank you for your participation.</p>
              <Button className="w-full" variant="outline" onClick={handleLeave}><LogOut className="h-4 w-4 mr-2" /> Leave Room</Button>
            </StepCard>
          )}

          {step === "kicked" && (
            <StepCard key="kick" icon={<AlertTriangle className="h-5 w-5 text-red-400" />} title="Removed from Room">
              <p className="text-sm text-zinc-400 text-center mb-4">You have been removed by the host.</p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/interview")}><LogOut className="h-4 w-4 mr-2" /> Back to Lobby</Button>
            </StepCard>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StepCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">{icon}<h2 className="text-sm font-semibold text-white">{title}</h2></div>
      {children}
    </motion.div>
  );
}

function ControlBtn({ active, onClick, activeIcon, inactiveIcon, label, activeClass }: {
  active: boolean; onClick: () => void;
  activeIcon: React.ReactNode; inactiveIcon: React.ReactNode;
  label: string; activeClass?: string;
}) {
  return (
    <button onClick={onClick} title={label}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-colors ${
        active ? activeClass ?? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-red-900/50 text-red-400 hover:bg-red-900"
      }`}>
      {active ? activeIcon : inactiveIcon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default function Candidate() {
  return <InterviewProvider><CandidateInner /></InterviewProvider>;
}
