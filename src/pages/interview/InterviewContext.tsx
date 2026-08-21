/**
 * InterviewContext — WebRTC Interview Platform
 *
 * Signaling uses Supabase DB polling (interview_signals table).
 * NO Realtime subscription needed — works with any Supabase plan/settings.
 *
 * Flow:
 *  1. Participants insert rows into interview_signals
 *  2. Each side polls every 1.5s for new rows addressed to them
 *  3. WebRTC offer/answer/ICE exchanged through the same table
 *  4. Old rows auto-cleaned after 5 minutes
 */
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import { supabase } from "@/lib/supabase";

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
  admitCandidate: (id: string) => void;
  removeCandidate: (id: string) => void;
  startExam: () => void;
  endExam: () => void;
  openForm: () => void;
  disconnect: () => void;
  sendVisibilityEvent: (hidden: boolean) => void;
}

const Ctx = createContext<InterviewContextType | null>(null);

const RTC: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const POLL_MS = 1500;

// ─── DB helpers ───────────────────────────────────────────────────────────────
async function dbSend(
  roomId: string,
  fromId: string,
  event: string,
  payload: Record<string, unknown>,
  toId?: string,
) {
  const { error } = await supabase.from("interview_signals").insert({
    room_id: roomId,
    from_id: fromId,
    to_id: toId ?? null,
    event,
    payload,
  });
  if (error) console.error("[signal] insert error", event, error.message);
}

async function dbFetch(roomId: string, myId: string, since: string) {
  const { data, error } = await supabase
    .from("interview_signals")
    .select("*")
    .eq("room_id", roomId)
    .neq("from_id", myId)              // never read own messages
    .gt("created_at", since)
    .or(`to_id.is.null,to_id.eq.${myId}`)  // broadcast or addressed to me
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[signal] fetch error", error.message);
    return [];
  }
  return data ?? [];
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [role,            setRole]            = useState<ParticipantRole | null>(null);
  const [roomId,          setRoomId]          = useState("");
  const [myId]                                = useState(() => crypto.randomUUID());
  const [myName,          setMyName]          = useState("");
  const [localStream,     setLocalStream]     = useState<MediaStream | null>(null);
  const [screenStream,    setScreenStream]    = useState<MediaStream | null>(null);
  const [candidates,      setCandidates]      = useState<Map<string, CandidateState>>(new Map());
  const [auditLog,        setAuditLog]        = useState<AuditEvent[]>([]);
  const [examActive,      setExamActive]      = useState(false);
  const [examFormUrl,     setExamFormUrl]     = useState("");
  const [examDuration,    setExamDuration]    = useState(3600);
  const [examSecondsLeft, setExamSecondsLeft] = useState(3600);
  const [connected,       setConnected]       = useState(false);
  const [admitted,        setAdmitted]        = useState(false);

  const peersRef     = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localRef     = useRef<MediaStream | null>(null);
  const screenRef    = useRef<MediaStream | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const roleRef      = useRef<ParticipantRole | null>(null);
  const roomIdRef    = useRef("");
  const myIdRef      = useRef(myId);
  const nameRef      = useRef("");
  const emailRef     = useRef("");
  const candRef      = useRef<Map<string, CandidateState>>(new Map());
  const examActRef   = useRef(false);
  const formUrlRef   = useRef("");
  const durRef       = useRef(3600);
  const sinceRef     = useRef(new Date().toISOString());
  const leftRef      = useRef(false);

  useEffect(() => { examActRef.current = examActive; }, [examActive]);
  useEffect(() => { formUrlRef.current = examFormUrl; }, [examFormUrl]);
  useEffect(() => { durRef.current = examDuration; }, [examDuration]);

  const updateCandidates = useCallback(
    (fn: (p: Map<string, CandidateState>) => Map<string, CandidateState>) => {
      setCandidates(p => { const n = fn(p); candRef.current = n; return n; });
    }, [],
  );

  const addAudit = useCallback((id: string, name: string, ev: string) => {
    setAuditLog(p => [...p, { ts: Date.now(), candidateId: id, candidateName: name, event: ev }]);
  }, []);

  // Thin wrapper so rest of code doesn't need to pass roomId/myId each time
  const sig = useCallback((
    event: string,
    payload: Record<string, unknown>,
    toId?: string,
  ) => {
    dbSend(roomIdRef.current, myIdRef.current, event, payload, toId);
  }, []);

  // ── WebRTC peer management ──────────────────────────────────────────────
  const getOrMakePeer = useCallback((peerId: string, initiator: boolean) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;
    const pc = new RTCPeerConnection(RTC);

    localRef.current?.getTracks().forEach(t => pc.addTrack(t, localRef.current!));
    screenRef.current?.getTracks().forEach(t => pc.addTrack(t, screenRef.current!));

    pc.onicecandidate = e => {
      if (e.candidate)
        sig("ice", { candidate: e.candidate.toJSON() }, peerId);
    };

    const rxIds: string[] = [];
    pc.ontrack = e => {
      if (roleRef.current !== "host") return;
      const s = e.streams[0]; if (!s) return;
      const isNew = !rxIds.includes(s.id);
      if (isNew) rxIds.push(s.id);
      const isScreen = rxIds.indexOf(s.id) >= 1
        || e.track.contentHint === "detail"
        || e.track.label.toLowerCase().includes("screen")
        || e.track.label.toLowerCase().includes("display");
      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(peerId); if (!c) return prev;
        next.set(peerId, isScreen ? { ...c, screenStream: s } : { ...c, stream: s });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (roleRef.current !== "host") return;
      const cname = candRef.current.get(peerId)?.name ?? peerId;
      const st = pc.connectionState;
      updateCandidates(prev => {
        const next = new Map(prev); const c = next.get(peerId); if (!c) return prev;
        next.set(peerId, { ...c, connected: st === "connected" }); return next;
      });
      if (st === "connected") addAudit(peerId, cname, "WebRTC connected ✓");
      if (st === "failed" || st === "closed") addAudit(peerId, cname, `connection ${st}`);
    };

    if (initiator) {
      pc.onnegotiationneeded = async () => {
        if (pc.signalingState !== "stable") return;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sig("offer", { sdp: pc.localDescription }, peerId);
        } catch (err) { console.error("[RTC] offer", err); }
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [sig, addAudit, updateCandidates]);

  // ── Process a single incoming signal row ───────────────────────────────
  const handleRow = useCallback(async (row: {
    from_id: string; to_id: string | null; event: string; payload: Record<string, unknown>;
  }) => {
    const { from_id: from, event, payload } = row;
    const r = roleRef.current;

    // ── candidate → host: joined ──────────────────────────────────────
    if (event === "joined" && r === "host") {
      const { name, email } = payload as { name: string; email: string };
      updateCandidates(prev => {
        const next = new Map(prev);
        if (next.has(from)) {
          const c = next.get(from)!;
          next.set(from, { ...c, name: name ?? c.name, email: email ?? c.email });
        } else {
          next.set(from, {
            id: from, name, email: email ?? "",
            stream: null, screenStream: null,
            micOn: true, camOn: true, screenOn: false,
            connected: false, admitted: false, examStarted: false,
          });
        }
        return next;
      });
      addAudit(from, name, "joined — waiting to be admitted");
      // If exam already running, tell them
      if (examActRef.current) {
        sig("exam-state", {
          formUrl: formUrlRef.current,
          duration: durRef.current,
          active: true,
        }, from);
      }
      return;
    }

    // ── host → candidate: admitted ────────────────────────────────────
    if (event === "admitted" && r === "candidate") {
      setAdmitted(true);
      return;
    }

    // ── host → candidate: removed ─────────────────────────────────────
    if (event === "removed" && r === "candidate") {
      setAdmitted(false);
      leftRef.current = true;
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    // ── WebRTC: offer ─────────────────────────────────────────────────
    if (event === "offer") {
      const { sdp } = payload as { sdp: RTCSessionDescriptionInit };
      const pc = getOrMakePeer(from, false);
      if (pc.signalingState === "have-remote-offer") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        sig("answer", { sdp: pc.localDescription }, from);
      } catch (err) { console.error("[RTC] answer", err); }
      return;
    }

    // ── WebRTC: answer ────────────────────────────────────────────────
    if (event === "answer") {
      const { sdp } = payload as { sdp: RTCSessionDescriptionInit };
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState === "have-local-offer") {
        try { await pc.setRemoteDescription(new RTCSessionDescription(sdp)); } catch {}
      }
      return;
    }

    // ── WebRTC: ICE ───────────────────────────────────────────────────
    if (event === "ice") {
      const { candidate } = payload as { candidate: RTCIceCandidateInit };
      const pc = peersRef.current.get(from);
      if (pc) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} }
      return;
    }

    // ── candidate-status ──────────────────────────────────────────────
    if (event === "candidate-status" && r === "host") {
      const { micOn, camOn, screenOn } = payload as {
        micOn: boolean; camOn: boolean; screenOn: boolean;
      };
      updateCandidates(prev => {
        const next = new Map(prev); const c = next.get(from); if (!c) return prev;
        if (!screenOn && c.screenOn) addAudit(from, c.name, "stopped screen sharing ⚠");
        if (screenOn && !c.screenOn) addAudit(from, c.name, "started screen sharing");
        if (!camOn && c.camOn)       addAudit(from, c.name, "turned camera off");
        if (!micOn && c.micOn)       addAudit(from, c.name, "muted microphone");
        next.set(from, { ...c, micOn, camOn, screenOn }); return next;
      });
      return;
    }

    // ── visibility ────────────────────────────────────────────────────
    if (event === "visibility" && r === "host") {
      const { hidden } = payload as { hidden: boolean };
      const n = candRef.current.get(from)?.name ?? from;
      addAudit(from, n, hidden ? "switched away from exam tab ⚠" : "returned to exam tab");
      return;
    }

    // ── exam-start (candidate) ────────────────────────────────────────
    if (event === "exam-start" && r === "candidate") {
      const { formUrl, duration } = payload as { formUrl: string; duration: number };
      setExamActive(true); setExamFormUrl(formUrl);
      setExamDuration(duration); setExamSecondsLeft(duration);
      return;
    }

    // ── exam-state (late joiner) ──────────────────────────────────────
    if (event === "exam-state" && r === "candidate") {
      const { formUrl, duration, active } = payload as {
        formUrl: string; duration: number; active: boolean;
      };
      if (!active) return;
      setExamActive(true); setExamFormUrl(formUrl);
      setExamDuration(duration); setExamSecondsLeft(duration);
      return;
    }

    // ── exam-end ──────────────────────────────────────────────────────
    if (event === "exam-end" && r === "candidate") {
      setExamActive(false); setExamSecondsLeft(0);
      return;
    }

    // ── left ──────────────────────────────────────────────────────────
    if (event === "left" && r === "host") {
      const { name } = payload as { name: string };
      addAudit(from, name ?? from, "left the room");
      updateCandidates(prev => {
        const next = new Map(prev); const c = next.get(from);
        if (c) next.set(from, { ...c, connected: false }); return next;
      });
      return;
    }

    // ── host-joined → candidate re-announces ─────────────────────────
    if (event === "host-joined" && r === "candidate") {
      sig("joined", { name: nameRef.current, email: emailRef.current });
      return;
    }
  }, [sig, getOrMakePeer, addAudit, updateCandidates]);

  // ── Start polling ───────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    sinceRef.current = new Date().toISOString();
    setConnected(true);

    pollRef.current = setInterval(async () => {
      if (leftRef.current) return;
      const rows = await dbFetch(roomIdRef.current, myIdRef.current, sinceRef.current);
      if (rows.length > 0) {
        sinceRef.current = rows[rows.length - 1].created_at;
        for (const row of rows) {
          await handleRow(row as {
            from_id: string; to_id: string | null;
            event: string; payload: Record<string, unknown>;
          });
        }
      }
      // Clean old rows (fire and forget)
      supabase.from("interview_signals")
        .delete()
        .eq("room_id", roomIdRef.current)
        .lt("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .then(() => {});
    }, POLL_MS);
  }, [handleRow]);

  // ── Init host ──────────────────────────────────────────────────────────
  const initHost = useCallback(async (
    rid: string, name: string, formUrl: string, mins: number,
  ) => {
    leftRef.current = false;
    roleRef.current = "host";
    roomIdRef.current = rid;
    nameRef.current = name;
    formUrlRef.current = formUrl;
    durRef.current = mins * 60;

    setRole("host"); setRoomId(rid); setMyName(name);
    setExamFormUrl(formUrl); setExamDuration(mins * 60); setExamSecondsLeft(mins * 60);
    setAdmitted(true);

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no host camera — continuing anyway"); }

    startPolling();
    // Tell any waiting candidates the host is here
    await sig("host-joined", { name });
  }, [startPolling, sig]);

  // ── Init candidate ──────────────────────────────────────────────────────
  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    leftRef.current = false;
    roleRef.current = "candidate";
    roomIdRef.current = rid;
    nameRef.current = name;
    emailRef.current = email;

    setRole("candidate"); setRoomId(rid); setMyName(name);

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no camera"); }

    startPolling();
    // Announce to host
    await sig("joined", { name, email });
  }, [startPolling, sig]);

  // ── Toggle mic/cam ──────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const t = localRef.current?.getAudioTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      sig("candidate-status", {
        micOn: t.enabled,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true,
        screenOn: !!screenRef.current,
      });
  }, [sig]);

  const toggleCam = useCallback(() => {
    const t = localRef.current?.getVideoTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      sig("candidate-status", {
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: t.enabled,
        screenOn: !!screenRef.current,
      });
  }, [sig]);

  // ── Screen share ────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "monitor" } as MediaTrackConstraints,
      audio: true,
    });
    screen.getVideoTracks().forEach(t => { t.contentHint = "detail"; });
    screenRef.current = screen; setScreenStream(screen);

    peersRef.current.forEach((pc, pid) => {
      screen.getTracks().forEach(t => { try { pc.addTrack(t, screen); } catch {} });
      if (pc.signalingState === "stable") {
        pc.createOffer()
          .then(o => pc.setLocalDescription(o)
            .then(() => sig("offer", { sdp: pc.localDescription }, pid)))
          .catch(console.error);
      }
    });

    if (roleRef.current === "candidate")
      sig("candidate-status", {
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true,
        screenOn: true,
      });

    screen.getVideoTracks()[0].addEventListener("ended", () => {
      screenRef.current = null; setScreenStream(null);
      if (roleRef.current === "candidate")
        sig("candidate-status", {
          micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
          camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true,
          screenOn: false,
        });
    });
  }, [sig]);

  const stopScreenShare = useCallback(() => {
    screenRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current = null; setScreenStream(null);
    if (roleRef.current === "candidate")
      sig("candidate-status", {
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true,
        screenOn: false,
      });
  }, [sig]);

  // ── Admit / Remove ──────────────────────────────────────────────────────
  const admitCandidate = useCallback((cid: string) => {
    updateCandidates(prev => {
      const next = new Map(prev); const c = next.get(cid);
      if (c) next.set(cid, { ...c, admitted: true }); return next;
    });
    sig("admitted", {}, cid);
    getOrMakePeer(cid, true);
    addAudit(cid, candRef.current.get(cid)?.name ?? cid, "admitted ✓");
  }, [sig, getOrMakePeer, addAudit, updateCandidates]);

  const removeCandidate = useCallback((cid: string) => {
    const n = candRef.current.get(cid)?.name ?? cid;
    sig("removed", {}, cid);
    peersRef.current.get(cid)?.close(); peersRef.current.delete(cid);
    updateCandidates(prev => { const next = new Map(prev); next.delete(cid); return next; });
    addAudit(cid, n, "removed by host");
  }, [sig, addAudit, updateCandidates]);

  // ── Exam controls ───────────────────────────────────────────────────────
  const startExam = useCallback(() => {
    const dur = durRef.current; const url = formUrlRef.current;
    setExamActive(true); examActRef.current = true; setExamSecondsLeft(dur);
    sig("exam-start", { formUrl: url, duration: dur });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExamActive(false); examActRef.current = false;
          sig("exam-end", {}); return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [sig]);

  const endExam = useCallback(() => {
    clearInterval(timerRef.current!);
    setExamActive(false); examActRef.current = false; setExamSecondsLeft(0);
    sig("exam-end", {});
  }, [sig]);

  const openForm = useCallback(() => {
    if (formUrlRef.current)
      window.open(formUrlRef.current, "_blank", "noopener,noreferrer");
  }, []);

  const sendVisibilityEvent = useCallback((hidden: boolean) => {
    if (roleRef.current === "candidate")
      sig("visibility", { hidden });
  }, [sig]);

  // Candidate exam countdown
  useEffect(() => {
    if (!examActive || role !== "candidate") return;
    const t = setInterval(() => {
      setExamSecondsLeft(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [examActive, role]);

  // ── Disconnect ──────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    leftRef.current = true;
    clearInterval(pollRef.current!); clearInterval(timerRef.current!);
    peersRef.current.forEach(p => p.close()); peersRef.current.clear();
    localRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current?.getTracks().forEach(t => t.stop());
    if (roleRef.current === "candidate")
      sig("left", { name: nameRef.current });
    setConnected(false); setLocalStream(null); setScreenStream(null);
  }, [sig]);

  useEffect(() => () => { disconnect(); }, [disconnect]);

  return (
    <Ctx.Provider value={{
      role, roomId, myId, myName, localStream, screenStream,
      candidates, auditLog, examActive, examFormUrl, examDuration, examSecondsLeft,
      connected, admitted,
      initHost, initCandidate, toggleMic, toggleCam,
      startScreenShare, stopScreenShare, admitCandidate, removeCandidate,
      startExam, endExam, openForm, disconnect, sendVisibilityEvent,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInterview must be inside InterviewProvider");
  return ctx;
}
