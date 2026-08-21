/**
 * Candidate View — distraction-free exam interface.
 * Candidates ONLY see their own camera. No other participants visible.
 * Screen share is REQUIRED before proceeding to the waiting room.
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  Clock, ExternalLink, LogOut, Wifi, WifiOff,
  AlertTriangle, CheckCircle2, Hourglass,
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

function CandidateInner() {
  const { roomId: roomParam } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { name = "Candidate", email = "" } = (location.state as { name: string; email: string }) || {};

  const {
    localStream, screenStream,
    examActive, examFormUrl, examSecondsLeft,
    connected, admitted,
    initCandidate,
    toggleMic, toggleCam,
    startScreenShare, stopScreenShare,
    openForm, disconnect, sendVisibilityEvent,
  } = useInterview();

  const [step, setStep] = useState<Step>("media-check");
  const [initialized, setInitialized] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenError, setScreenError] = useState("");
  const [tabWarnings, setTabWarnings] = useState(0);
  const prevStepRef = useRef<Step>("media-check");

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized && roomParam) {
      initCandidate(roomParam, name, email);
      setInitialized(true);
    }
  }, [initialized, roomParam, name, email, initCandidate]);

  // ── Step transitions ──────────────────────────────────────────────────────
  // After screen share + waiting room, host admission or exam-start moves us to "exam"
  useEffect(() => {
    if (admitted && step === "waiting") setStep("exam");
  }, [admitted, step]);

  useEffect(() => {
    if (examActive && step === "waiting") setStep("exam");
    if (examActive && step === "media-check") setStep("exam"); // host started mid-flow
  }, [examActive, step]);

  useEffect(() => {
    if (!examActive && step === "exam" && examSecondsLeft === 0) {
      setStep("ended");
    }
  }, [examActive, examSecondsLeft, step]);

  // ── Screen share lost warning ─────────────────────────────────────────────
  useEffect(() => {
    if ((step === "exam" || step === "waiting") && !screenStream) {
      setScreenError("Screen sharing stopped — please restart it to continue.");
    } else {
      setScreenError("");
    }
  }, [screenStream, step]);

  // ── Page visibility (tab switch) audit ───────────────────────────────────
  useEffect(() => {
    const handle = () => {
      sendVisibilityEvent(document.hidden);
      if (document.hidden && step === "exam") {
        setTabWarnings(n => n + 1);
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [step, sendVisibilityEvent]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleMic = () => { toggleMic(); setMicOn(m => !m); };
  const handleCam = () => { toggleCam(); setCamOn(c => !c); };

  const handleShareScreen = async () => {
    setScreenError("");
    try {
      await startScreenShare();
      prevStepRef.current = step;
      setStep("waiting");
    } catch {
      setScreenError("Screen sharing was cancelled or denied. It is required to join the exam.");
    }
  };

  const handleLeave = () => {
    disconnect();
    navigate("/interview");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col select-none">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
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
          {connected ? (
            <Badge variant="outline" className="text-green-400 border-green-700 text-xs h-6">
              <Wifi className="h-3 w-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs h-6">
              <WifiOff className="h-3 w-3 mr-1" /> Reconnecting…
            </Badge>
          )}
          {examActive && (
            <Badge className="bg-red-700 text-white text-xs font-mono h-6">
              <Clock className="h-3 w-3 mr-1" /> {formatTime(examSecondsLeft)}
            </Badge>
          )}
          {step !== "media-check" && (
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-700 text-zinc-300 text-xs h-6 px-2"
              onClick={handleLeave}
            >
              <LogOut className="h-3 w-3 mr-1" /> Leave
            </Button>
          )}
        </div>
      </header>

      {/* ── Tab-switch warnings ─────────────────────────────────────────── */}
      <AnimatePresence>
        {tabWarnings > 0 && step === "exam" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-900/30 border-b border-red-700/40 px-4 py-1.5 text-xs text-red-300"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Tab switch detected ({tabWarnings}×). The proctor has been notified.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-5 w-full max-w-md mx-auto">

        {/* Self camera — ONLY own video, always muted locally */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Your Camera</p>
            {screenStream && (
              <span className="text-[10px] text-blue-400 flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Screen sharing active
              </span>
            )}
          </div>
          <VideoTile
            stream={localStream}
            label={`${name}${email ? ` · ${email}` : ""}`}
            muted
            mirror
            micOn={micOn}
            camOn={camOn}
            className="aspect-video w-full rounded-2xl border border-zinc-800"
          />
          {/* Media controls */}
          <div className="flex gap-2 mt-2">
            <ControlBtn
              active={micOn}
              onClick={handleMic}
              activeIcon={<Mic className="h-4 w-4" />}
              inactiveIcon={<MicOff className="h-4 w-4" />}
              label="Mic"
            />
            <ControlBtn
              active={camOn}
              onClick={handleCam}
              activeIcon={<Video className="h-4 w-4" />}
              inactiveIcon={<VideoOff className="h-4 w-4" />}
              label="Camera"
            />
            <ControlBtn
              active={!!screenStream}
              onClick={screenStream ? stopScreenShare : handleShareScreen}
              activeIcon={<Monitor className="h-4 w-4" />}
              inactiveIcon={<MonitorOff className="h-4 w-4" />}
              label="Screen"
              activeClass="bg-blue-800 hover:bg-blue-700 text-blue-100"
            />
          </div>
        </div>

        {/* Screen share error banner */}
        <AnimatePresence>
          {screenError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-amber-900/30 border border-amber-600/40 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-300"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{screenError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step panels ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {step === "media-check" && (
            <StepCard
              key="media-check"
              icon={<Video className="h-5 w-5 text-accent" />}
              title="Camera & Microphone Check"
            >
              <p className="text-sm text-zinc-400 text-center mb-4 leading-relaxed">
                Confirm your camera and mic are working above, then share your
                <strong className="text-white"> entire screen</strong> to join the waiting room.
              </p>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleShareScreen}
              >
                <Monitor className="h-4 w-4 mr-2" /> Share My Screen &amp; Continue
              </Button>
              {screenError && (
                <p className="text-xs text-red-400 text-center mt-2">{screenError}</p>
              )}
            </StepCard>
          )}

          {step === "waiting" && (
            <StepCard
              key="waiting"
              icon={<Hourglass className="h-5 w-5 text-amber-400" />}
              title="Waiting Room"
            >
              <p className="text-sm text-zinc-400 text-center mb-3 leading-relaxed">
                You are in the waiting room. The host will admit you shortly and start the examination.
              </p>
              <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">
                {screenStream ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <span className="text-xs text-green-400">Screen sharing active — you're ready</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-400">Screen not shared — please restart</span>
                  </>
                )}
              </div>
              {!screenStream && (
                <Button
                  className="w-full mt-3"
                  variant="outline"
                  onClick={handleShareScreen}
                >
                  <Monitor className="h-4 w-4 mr-2" /> Restart Screen Share
                </Button>
              )}
            </StepCard>
          )}

          {step === "exam" && (
            <StepCard
              key="exam"
              icon={<CheckCircle2 className="h-5 w-5 text-green-400" />}
              title="Examination in Progress"
            >
              {examActive ? (
                <>
                  <div className="bg-red-950 border border-red-800 rounded-xl py-3 text-center mb-4">
                    <p className="text-[10px] text-red-400 uppercase tracking-widest mb-0.5">Time Remaining</p>
                    <p className="font-mono text-3xl font-bold text-red-300 tabular-nums">
                      {formatTime(examSecondsLeft)}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mb-3"
                    onClick={openForm}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Examination Form
                  </Button>
                  {!screenStream && (
                    <Button
                      className="w-full mb-3"
                      variant="outline"
                      onClick={handleShareScreen}
                    >
                      <Monitor className="h-4 w-4 mr-2" /> Restart Screen Share
                    </Button>
                  )}
                  <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                    Keep this tab open and do not stop screen sharing.<br />
                    The proctor is monitoring your session.
                  </p>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-zinc-400">
                    Waiting for the host to start the examination…
                  </p>
                </div>
              )}
            </StepCard>
          )}

          {step === "ended" && (
            <StepCard
              key="ended"
              icon={<CheckCircle2 className="h-5 w-5 text-zinc-400" />}
              title="Examination Ended"
            >
              <p className="text-sm text-zinc-400 text-center mb-4">
                The examination has ended. Thank you for your participation.
              </p>
              <Button className="w-full" variant="outline" onClick={handleLeave}>
                <LogOut className="h-4 w-4 mr-2" /> Leave Room
              </Button>
            </StepCard>
          )}

          {step === "kicked" && (
            <StepCard
              key="kicked"
              icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
              title="Removed from Room"
            >
              <p className="text-sm text-zinc-400 text-center mb-4">
                You have been removed from the room by the host.
              </p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/interview")}>
                <LogOut className="h-4 w-4 mr-2" /> Back to Lobby
              </Button>
            </StepCard>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepCard({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function ControlBtn({
  active, onClick, activeIcon, inactiveIcon, label, activeClass,
}: {
  active: boolean;
  onClick: () => void;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  label: string;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-colors ${
        active
          ? activeClass ?? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          : "bg-red-900/50 text-red-400 hover:bg-red-900"
      }`}
    >
      {active ? activeIcon : inactiveIcon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

export default function Candidate() {
  return (
    <InterviewProvider>
      <CandidateInner />
    </InterviewProvider>
  );
}
