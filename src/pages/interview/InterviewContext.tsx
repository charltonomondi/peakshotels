/**
 * InterviewContext — shared state and WebSocket signaling for the interview platform.
 *
 * Privacy model (enforced at two levels):
 *  1. Server level: signaling server only relays messages between a candidate and
 *     the host. Candidates never receive offers/answers from other candidates.
 *  2. Client level: ontrack handler only assigns remote streams when role === "host".
 */
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";

export type ParticipantRole = "host" | "candidate";

export interface AuditEvent {
  ts: number;
  candidateId: string;
  candidateName: string;
  event: string;
}

export interface CandidateState {
  id: string;
  name: string;
  email: string;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
  screenOn: boolean;
  connected: boolean;
  admitted: boolean;
  examStarted: boolean;
}

interface InterviewContextType {
  role: ParticipantRole | null;
  roomId: string;
  myId: string;
  myName: string;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  candidates: Map<string, CandidateState>;
  auditLog: AuditEvent[];
  examActive: boolean;
  examFormUrl: string;
  examDuration: number;
  examSecondsLeft: number;
  connected: boolean;
  admitted: boolean;
  initHost: (roomId: string, name: string, formUrl: string, durationMins: number) => void;
  initCandidate: (roomId: string, name: string, email: string) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  admitCandidate: (candidateId: string) => void;
  removeCandidate: (candidateId: string) => void;
  startExam: () => void;
  endExam: () => void;
  openForm: () => void;
  disconnect: () => void;
  sendVisibilityEvent: (hidden: boolean) => void;
}

const InterviewContext = createContext<InterviewContextType | null>(null);

const WS_URL = import.meta.env.VITE_INTERVIEW_WS_URL || "ws://localhost:4000";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

// ── Reconnect parameters ─────────────────────────────────────────────────────
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 15000];

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<ParticipantRole | null>(null);
  const [roomId, setRoomId] = useState("");
  const [myId] = useState(() => crypto.randomUUID());
  const [myName, setMyName] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [candidates, setCandidates] = useState<Map<string, CandidateState>>(new Map());
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [examActive, setExamActive] = useState(false);
  const [examFormUrl, setExamFormUrl] = useState("");
  const [examDuration, setExamDuration] = useState(3600);
  const [examSecondsLeft, setExamSecondsLeft] = useState(3600);
  const [connected, setConnected] = useState(false);
  const [admitted, setAdmitted] = useState(false);

  // Stable refs — avoids stale closures in callbacks
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roleRef = useRef<ParticipantRole | null>(null);
  const roomIdRef = useRef("");
  const myNameRef = useRef("");
  const myIdRef = useRef(myId);
  const emailRef = useRef("");
  const candidatesRef = useRef<Map<string, CandidateState>>(new Map());
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);

  // Keep candidatesRef in sync with state
  const updateCandidates = useCallback((updater: (prev: Map<string, CandidateState>) => Map<string, CandidateState>) => {
    setCandidates(prev => {
      const next = updater(prev);
      candidatesRef.current = next;
      return next;
    });
  }, []);

  // ── Audit helper ─────────────────────────────────────────────────────────────
  const addAudit = useCallback((candidateId: string, candidateName: string, event: string) => {
    setAuditLog(prev => [...prev, { ts: Date.now(), candidateId, candidateName, event }]);
  }, []);

  // ── Send via WS ──────────────────────────────────────────────────────────────
  const wsSend = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // ── Create / get RTCPeerConnection ───────────────────────────────────────────
  const getOrCreatePeer = useCallback((peerId: string, isInitiator: boolean): RTCPeerConnection => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local camera/mic tracks
    localStreamRef.current?.getTracks().forEach(t =>
      pc.addTrack(t, localStreamRef.current!)
    );

    // Add existing screen tracks if any
    screenStreamRef.current?.getTracks().forEach(t =>
      pc.addTrack(t, screenStreamRef.current!)
    );

    // ICE
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        wsSend({ type: "ice", to: peerId, from: myIdRef.current, candidate: e.candidate });
      }
    };

    // Incoming tracks — only host renders remote streams (privacy enforcement)
    pc.ontrack = (e) => {
      if (roleRef.current !== "host") return;
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      const label = e.track.label ?? "";
      const isScreen =
        label.toLowerCase().includes("screen") ||
        e.track.contentHint === "detail" ||
        e.track.kind === "video" && label.toLowerCase().includes("display");

      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(peerId);
        if (c) {
          next.set(peerId, isScreen ? { ...c, screenStream: stream } : { ...c, stream });
        }
        return next;
      });
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (roleRef.current !== "host") return;
      const name = candidatesRef.current.get(peerId)?.name ?? peerId;
      if (state === "connected") {
        updateCandidates(prev => {
          const next = new Map(prev);
          const c = next.get(peerId);
          if (c) next.set(peerId, { ...c, connected: true });
          return next;
        });
        addAudit(peerId, name, "WebRTC connected");
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        updateCandidates(prev => {
          const next = new Map(prev);
          const c = next.get(peerId);
          if (c) next.set(peerId, { ...c, connected: false });
          return next;
        });
        addAudit(peerId, name, `WebRTC ${state}`);
      }
    };

    // Negotiation (initiator side only)
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsSend({ type: "offer", to: peerId, from: myIdRef.current, sdp: pc.localDescription });
        } catch (err) {
          console.error("[RTC] offer error", err);
        }
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [wsSend, addAudit, updateCandidates]);

  // ── WS message handler ───────────────────────────────────────────────────────
  const handleMessage = useCallback(async (raw: string) => {
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(raw); } catch { return; }

    const { type } = msg;

    if (type === "joined") {
      const { id, name, email } = msg as { type: string; id: string; name: string; email: string };
      updateCandidates(prev => {
        if (prev.has(id)) return prev;
        const next = new Map(prev);
        next.set(id, {
          id, name, email: email ?? "", stream: null, screenStream: null,
          micOn: true, camOn: true, screenOn: false,
          connected: false, admitted: false, examStarted: false,
        });
        return next;
      });
      addAudit(id, name, "joined room");
    }

    else if (type === "admitted") {
      setAdmitted(true);
    }

    else if (type === "removed") {
      setAdmitted(false);
      intentionalCloseRef.current = true;
      wsRef.current?.close();
    }

    else if (type === "offer") {
      const { from, sdp } = msg as { from: string; sdp: RTCSessionDescriptionInit };
      const pc = getOrCreatePeer(from, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsSend({ type: "answer", to: from, from: myIdRef.current, sdp: pc.localDescription });
      } catch (err) {
        console.error("[RTC] answer error", err);
      }
    }

    else if (type === "answer") {
      const { from, sdp } = msg as { from: string; sdp: RTCSessionDescriptionInit };
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState !== "stable") {
        try { await pc.setRemoteDescription(new RTCSessionDescription(sdp)); } catch {}
      }
    }

    else if (type === "ice") {
      const { from, candidate } = msg as { from: string; candidate: RTCIceCandidateInit };
      const pc = peersRef.current.get(from);
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
    }

    else if (type === "candidate-status") {
      const { from, micOn, camOn, screenOn } = msg as {
        from: string; micOn: boolean; camOn: boolean; screenOn: boolean;
      };
      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(from);
        if (c) {
          if (!screenOn && c.screenOn) addAudit(from, c.name, "stopped screen sharing ⚠");
          if (screenOn && !c.screenOn) addAudit(from, c.name, "started screen sharing");
          if (!camOn && c.camOn) addAudit(from, c.name, "turned camera off");
          if (!micOn && c.micOn) addAudit(from, c.name, "muted microphone");
          next.set(from, { ...c, micOn, camOn, screenOn });
        }
        return next;
      });
    }

    else if (type === "visibility") {
      const { from, hidden } = msg as { from: string; hidden: boolean };
      const name = candidatesRef.current.get(from)?.name ?? from;
      if (hidden) addAudit(from, name, "switched away from exam tab ⚠");
      else addAudit(from, name, "returned to exam tab");
    }

    else if (type === "exam-start") {
      const { formUrl, duration } = msg as { formUrl: string; duration: number };
      setExamActive(true);
      setExamFormUrl(formUrl);
      setExamDuration(duration);
      setExamSecondsLeft(duration);
    }

    else if (type === "exam-end") {
      setExamActive(false);
      setExamSecondsLeft(0);
    }

    else if (type === "left") {
      const { id, name } = msg as { id: string; name: string };
      addAudit(id, name, "left room");
      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(id);
        if (c) next.set(id, { ...c, connected: false });
        return next;
      });
    }
  }, [getOrCreatePeer, wsSend, addAudit, updateCandidates]);

  // ── Connect / reconnect WS ───────────────────────────────────────────────────
  const connectWS = useCallback((rid: string, r: ParticipantRole, name: string, email = "") => {
    if (wsRef.current && wsRef.current.readyState < WebSocket.CLOSING) {
      wsRef.current.close();
    }

    const url = `${WS_URL}?room=${rid}&id=${myIdRef.current}&role=${r}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (e) => handleMessage(e.data);

    ws.onclose = () => {
      setConnected(false);
      if (intentionalCloseRef.current) return;
      const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
      reconnectAttemptRef.current++;
      reconnectTimerRef.current = setTimeout(() => {
        connectWS(roomIdRef.current, roleRef.current!, myNameRef.current, emailRef.current);
      }, delay);
    };
  }, [handleMessage]);

  // ── Init host ────────────────────────────────────────────────────────────────
  const initHost = useCallback(async (rid: string, name: string, formUrl: string, durationMins: number) => {
    intentionalCloseRef.current = false;
    roleRef.current = "host";
    roomIdRef.current = rid;
    myNameRef.current = name;

    setRole("host");
    setRoomId(rid);
    setMyName(name);
    setExamFormUrl(formUrl);
    setExamDuration(durationMins * 60);
    setExamSecondsLeft(durationMins * 60);
    setAdmitted(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch {
      console.warn("[Media] Camera/mic unavailable — host joining without media");
    }

    connectWS(rid, "host", name);
  }, [connectWS]);

  // ── Init candidate ───────────────────────────────────────────────────────────
  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    intentionalCloseRef.current = false;
    roleRef.current = "candidate";
    roomIdRef.current = rid;
    myNameRef.current = name;
    emailRef.current = email;

    setRole("candidate");
    setRoomId(rid);
    setMyName(name);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch {
      console.warn("[Media] Camera/mic unavailable");
    }

    connectWS(rid, "candidate", name, email);
  }, [connectWS]);

  // ── Toggle mic ───────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    // Force re-render by replacing the stream reference copy
    setLocalStream(s => s);
    if (roleRef.current === "candidate") {
      wsSend({
        type: "candidate-status",
        from: myIdRef.current,
        micOn: track.enabled,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: !!screenStreamRef.current,
      });
    }
  }, [wsSend]);

  // ── Toggle cam ───────────────────────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setLocalStream(s => s);
    if (roleRef.current === "candidate") {
      wsSend({
        type: "candidate-status",
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: track.enabled,
        screenOn: !!screenStreamRef.current,
      });
    }
  }, [wsSend]);

  // ── Screen share ─────────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "monitor" } as MediaTrackConstraints,
      audio: true,
    });
    screenStreamRef.current = screen;
    setScreenStream(screen);

    // Add screen tracks to all existing peer connections
    peersRef.current.forEach((pc) => {
      screen.getVideoTracks().forEach(t => {
        try { pc.addTrack(t, screen); } catch {}
      });
    });

    // Notify host of status change
    if (roleRef.current === "candidate") {
      wsSend({
        type: "candidate-status",
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: true,
      });
    }

    // Handle browser stopping screen share
    screen.getVideoTracks()[0].addEventListener("ended", () => {
      screenStreamRef.current = null;
      setScreenStream(null);
      if (roleRef.current === "candidate") {
        wsSend({
          type: "candidate-status",
          from: myIdRef.current,
          micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
          camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
          screenOn: false,
        });
      }
    });
  }, [wsSend]);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    if (roleRef.current === "candidate") {
      wsSend({
        type: "candidate-status",
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: false,
      });
    }
  }, [wsSend]);

  // ── Admit candidate ──────────────────────────────────────────────────────────
  const admitCandidate = useCallback((candidateId: string) => {
    wsSend({ type: "admit", to: candidateId });
    updateCandidates(prev => {
      const next = new Map(prev);
      const c = next.get(candidateId);
      if (c) next.set(candidateId, { ...c, admitted: true });
      return next;
    });
    // Create peer and trigger negotiation
    getOrCreatePeer(candidateId, true);
    const name = candidatesRef.current.get(candidateId)?.name ?? candidateId;
    addAudit(candidateId, name, "admitted to exam");
  }, [wsSend, getOrCreatePeer, addAudit, updateCandidates]);

  // ── Remove candidate ─────────────────────────────────────────────────────────
  const removeCandidate = useCallback((candidateId: string) => {
    const name = candidatesRef.current.get(candidateId)?.name ?? candidateId;
    wsSend({ type: "remove", to: candidateId });
    peersRef.current.get(candidateId)?.close();
    peersRef.current.delete(candidateId);
    updateCandidates(prev => {
      const next = new Map(prev);
      next.delete(candidateId);
      return next;
    });
    addAudit(candidateId, name, "removed by host");
  }, [wsSend, addAudit, updateCandidates]);

  // ── Start exam ───────────────────────────────────────────────────────────────
  const startExam = useCallback(() => {
    setExamActive(true);
    setExamSecondsLeft(examDuration);
    wsSend({ type: "exam-start", formUrl: examFormUrl, duration: examDuration });

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExamActive(false);
          wsSend({ type: "exam-end" });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [examDuration, examFormUrl, wsSend]);

  // ── End exam ─────────────────────────────────────────────────────────────────
  const endExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamActive(false);
    setExamSecondsLeft(0);
    wsSend({ type: "exam-end" });
  }, [wsSend]);

  const openForm = useCallback(() => {
    if (examFormUrl) window.open(examFormUrl, "_blank", "noopener,noreferrer");
  }, [examFormUrl]);

  // ── Visibility event (candidate tab-switch detection) ────────────────────────
  const sendVisibilityEvent = useCallback((hidden: boolean) => {
    if (roleRef.current !== "candidate") return;
    wsSend({ type: "visibility", from: myIdRef.current, hidden });
  }, [wsSend]);

  // ── Full disconnect ──────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearTimeout(reconnectTimerRef.current!);
    clearInterval(timerRef.current!);
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    wsRef.current?.close();
    setConnected(false);
    setLocalStream(null);
    setScreenStream(null);
  }, []);

  // ── Candidate exam timer (server fires it, client counts down) ───────────────
  useEffect(() => {
    if (!examActive || role !== "candidate") return;
    const t = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [examActive, role]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => () => disconnect(), [disconnect]);

  return (
    <InterviewContext.Provider value={{
      role, roomId, myId, myName,
      localStream, screenStream,
      candidates, auditLog,
      examActive, examFormUrl, examDuration, examSecondsLeft,
      connected, admitted,
      initHost, initCandidate,
      toggleMic, toggleCam,
      startScreenShare, stopScreenShare,
      admitCandidate, removeCandidate,
      startExam, endExam, openForm, disconnect,
      sendVisibilityEvent,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used inside InterviewProvider");
  return ctx;
}
