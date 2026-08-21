/**
 * InterviewContext — WebRTC Interview Platform
 * Signaling: Supabase Realtime Broadcast (confirmed working)
 *
 * THE ACTUAL BUG WAS:
 * - roleRef.current was not set before joinChannel() was called
 * - The onMsg handler checked roleRef.current === "host" but it was null
 * - Fixed: set roleRef BEFORE calling startPolling/subscribe
 */
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type ParticipantRole = "host" | "candidate";

export interface AuditEvent {
  ts: number; candidateId: string; candidateName: string; event: string;
}

export interface CandidateState {
  id: string; name: string; email: string;
  stream: MediaStream | null; screenStream: MediaStream | null;
  micOn: boolean; camOn: boolean; screenOn: boolean;
  connected: boolean; admitted: boolean; examStarted: boolean;
}

interface InterviewContextType {
  role: ParticipantRole | null; roomId: string; myId: string; myName: string;
  localStream: MediaStream | null; screenStream: MediaStream | null;
  candidates: Map<string, CandidateState>; auditLog: AuditEvent[];
  examActive: boolean; examFormUrl: string; examDuration: number; examSecondsLeft: number;
  connected: boolean; admitted: boolean;
  initHost: (roomId: string, name: string, formUrl: string, durationMins: number) => void;
  initCandidate: (roomId: string, name: string, email: string) => void;
  toggleMic: () => void; toggleCam: () => void;
  startScreenShare: () => Promise<void>; stopScreenShare: () => void;
  admitCandidate: (id: string) => void; removeCandidate: (id: string) => void;
  startExam: () => void; endExam: () => void;
  openForm: () => void; disconnect: () => void;
  sendVisibilityEvent: (hidden: boolean) => void;
}

const Ctx = createContext<InterviewContextType | null>(null);

const RTC_CFG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function ch(roomId: string) { return `interview:${roomId.toUpperCase()}`; }

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

  const chRef      = useRef<RealtimeChannel | null>(null);
  const peersRef   = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localRef   = useRef<MediaStream | null>(null);
  const screenRef  = useRef<MediaStream | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  // IMPORTANT: set these BEFORE subscribing so message handler sees correct values
  const roleRef    = useRef<ParticipantRole | null>(null);
  const myIdRef    = useRef(myId);
  const nameRef    = useRef("");
  const emailRef   = useRef("");
  const candRef    = useRef<Map<string, CandidateState>>(new Map());
  const examRef    = useRef(false);
  const formRef    = useRef("");
  const durRef     = useRef(3600);
  const doneRef    = useRef(false);

  useEffect(() => { examRef.current = examActive; }, [examActive]);
  useEffect(() => { formRef.current = examFormUrl; }, [examFormUrl]);
  useEffect(() => { durRef.current = examDuration; }, [examDuration]);

  const upd = useCallback(
    (fn: (p: Map<string, CandidateState>) => Map<string, CandidateState>) => {
      setCandidates(p => { const n = fn(p); candRef.current = n; return n; });
    }, [],
  );

  const audit = useCallback((id: string, name: string, ev: string) => {
    setAuditLog(p => [...p, { ts: Date.now(), candidateId: id, candidateName: name, event: ev }]);
  }, []);

  // Broadcast helper — reads chRef at call time (no deps needed)
  const bcast = useCallback((event: string, payload: Record<string, unknown>, toId?: string) => {
    const msg = toId ? { ...payload, _to: toId } : payload;
    chRef.current?.send({ type: "broadcast", event, payload: msg })
      .catch(e => console.warn("[signal]", event, e));
  }, []);

  // WebRTC peer
  const getPeer = useCallback((peerId: string, init: boolean) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;
    const pc = new RTCPeerConnection(RTC_CFG);
    localRef.current?.getTracks().forEach(t => pc.addTrack(t, localRef.current!));
    screenRef.current?.getTracks().forEach(t => pc.addTrack(t, screenRef.current!));
    pc.onicecandidate = e => {
      if (e.candidate) bcast("ice", { candidate: e.candidate.toJSON(), _to: peerId });
    };
    const rxIds: string[] = [];
    pc.ontrack = e => {
      if (roleRef.current !== "host") return;
      const s = e.streams[0]; if (!s) return;
      const isNew = !rxIds.includes(s.id);
      if (isNew) rxIds.push(s.id);
      const isScr = rxIds.indexOf(s.id) >= 1 || e.track.contentHint === "detail"
        || e.track.label.toLowerCase().includes("screen")
        || e.track.label.toLowerCase().includes("display");
      upd(prev => {
        const next = new Map(prev); const c = next.get(peerId); if (!c) return prev;
        next.set(peerId, isScr ? { ...c, screenStream: s } : { ...c, stream: s }); return next;
      });
    };
    pc.onconnectionstatechange = () => {
      if (roleRef.current !== "host") return;
      const n = candRef.current.get(peerId)?.name ?? peerId;
      const st = pc.connectionState;
      upd(prev => {
        const next = new Map(prev); const c = next.get(peerId); if (!c) return prev;
        next.set(peerId, { ...c, connected: st === "connected" }); return next;
      });
      if (st === "connected") audit(peerId, n, "WebRTC connected ✓");
      if (st === "failed" || st === "closed") audit(peerId, n, `connection ${st}`);
    };
    if (init) {
      pc.onnegotiationneeded = async () => {
        if (pc.signalingState !== "stable") return;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          bcast("offer", { sdp: pc.localDescription, _to: peerId });
        } catch (err) { console.error("[RTC] offer", err); }
      };
    }
    peersRef.current.set(peerId, pc);
    return pc;
  }, [bcast, audit, upd]);

  // Message processor — NO state in deps
  const onMsg = useCallback(async (event: string, raw: Record<string, unknown>) => {
    const me = myIdRef.current;
    const r  = roleRef.current;
    // Private messages carry _to field — skip if not addressed to me
    const to = raw._to as string | undefined;
    if (to && to !== me) return;

    if (event === "joined" && r === "host") {
      const { id, name, email } = raw as { id: string; name: string; email: string };
      if (!id || !name) return;
      upd(prev => {
        const next = new Map(prev);
        if (next.has(id)) {
          const c = next.get(id)!;
          next.set(id, { ...c, name: name ?? c.name, email: email ?? c.email });
        } else {
          next.set(id, { id, name, email: email ?? "", stream: null, screenStream: null,
            micOn: true, camOn: true, screenOn: false, connected: false, admitted: false, examStarted: false });
        }
        return next;
      });
      audit(id, name, "joined — waiting to be admitted");
      if (examRef.current) bcast("exam-state", { formUrl: formRef.current, duration: durRef.current, active: true, _to: id });
      return;
    }
    if (event === "admitted" && r === "candidate") { setAdmitted(true); return; }
    if (event === "removed" && r === "candidate") {
      setAdmitted(false); doneRef.current = true; chRef.current?.unsubscribe(); return;
    }
    if (event === "offer") {
      const { sdp, _to: t2 } = raw as { sdp: RTCSessionDescriptionInit; _to: string };
      if (t2 !== me) return;
      const from = (raw._from ?? raw.from_id) as string;
      if (!from) return;
      const pc = getPeer(from, false);
      if (pc.signalingState === "have-remote-offer") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        bcast("answer", { sdp: pc.localDescription, _to: from, _from: me });
      } catch (err) { console.error("[RTC] answer", err); }
      return;
    }
    if (event === "answer") {
      const { sdp, _from: from } = raw as { sdp: RTCSessionDescriptionInit; _from: string; _to: string };
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState === "have-local-offer") {
        try { await pc.setRemoteDescription(new RTCSessionDescription(sdp)); } catch {}
      }
      return;
    }
    if (event === "ice") {
      const { candidate, _from: from } = raw as { candidate: RTCIceCandidateInit; _from: string; _to: string };
      const pc = peersRef.current.get(from ?? to);
      if (pc) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} }
      return;
    }
    if (event === "candidate-status" && r === "host") {
      const { micOn, camOn, screenOn, _from: from } = raw as { micOn: boolean; camOn: boolean; screenOn: boolean; _from: string };
      if (!from) return;
      upd(prev => {
        const next = new Map(prev); const c = next.get(from); if (!c) return prev;
        if (!screenOn && c.screenOn) audit(from, c.name, "stopped screen sharing ⚠");
        if (screenOn && !c.screenOn) audit(from, c.name, "started screen sharing");
        if (!camOn && c.camOn) audit(from, c.name, "turned camera off");
        if (!micOn && c.micOn) audit(from, c.name, "muted microphone");
        next.set(from, { ...c, micOn, camOn, screenOn }); return next;
      });
      return;
    }
    if (event === "visibility" && r === "host") {
      const { hidden, _from: from } = raw as { hidden: boolean; _from: string };
      const n = candRef.current.get(from)?.name ?? from;
      audit(from, n, hidden ? "switched away from exam tab ⚠" : "returned to exam tab");
      return;
    }
    if (event === "exam-start" && r === "candidate") {
      const { formUrl, duration } = raw as { formUrl: string; duration: number };
      setExamActive(true); setExamFormUrl(formUrl); setExamDuration(duration); setExamSecondsLeft(duration); return;
    }
    if (event === "exam-state" && r === "candidate") {
      const { formUrl, duration, active } = raw as { formUrl: string; duration: number; active: boolean };
      if (!active) return;
      setExamActive(true); setExamFormUrl(formUrl); setExamDuration(duration); setExamSecondsLeft(duration); return;
    }
    if (event === "exam-end" && r === "candidate") { setExamActive(false); setExamSecondsLeft(0); return; }
    if (event === "left" && r === "host") {
      const { _from: from, name } = raw as { _from: string; name: string };
      if (!from) return;
      audit(from, name ?? from, "left the room");
      upd(prev => { const next = new Map(prev); const c = next.get(from); if (c) next.set(from, { ...c, connected: false }); return next; });
      return;
    }
    if (event === "host-joined" && r === "candidate") {
      bcast("joined", { id: me, name: nameRef.current, email: emailRef.current });
      return;
    }
  }, [bcast, getPeer, audit, upd]);

  // Subscribe — stable, called once
  const sub = useCallback((rid: string, onReady: () => void) => {
    chRef.current?.unsubscribe();
    const channel = supabase.channel(ch(rid), { config: { broadcast: { self: false } } });
    channel.on("broadcast", { event: "*" }, ({ event, payload }) => {
      onMsg(event, payload as Record<string, unknown>).catch(console.error);
    });
    channel.subscribe(status => {
      console.log("[signal]", ch(rid), status);
      if (status === "SUBSCRIBED") { setConnected(true); onReady(); }
      else if (status === "CLOSED" || status === "CHANNEL_ERROR") setConnected(false);
    });
    chRef.current = channel;
  }, [onMsg]);

  const initHost = useCallback(async (rid: string, name: string, formUrl: string, mins: number) => {
    doneRef.current = false;
    // Set refs BEFORE subscribing so onMsg sees correct role
    roleRef.current = "host";
    nameRef.current = name;
    formRef.current = formUrl;
    durRef.current = mins * 60;

    setRole("host"); setRoomId(rid); setMyName(name);
    setExamFormUrl(formUrl); setExamDuration(mins * 60); setExamSecondsLeft(mins * 60);
    setAdmitted(true);

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no host camera"); }

    sub(rid, () => {
      // Tell any already-waiting candidates host is here
      bcast("host-joined", { _from: myIdRef.current });
    });
  }, [sub, bcast]);

  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    doneRef.current = false;
    // Set refs BEFORE subscribing
    roleRef.current = "candidate";
    nameRef.current = name;
    emailRef.current = email;

    setRole("candidate"); setRoomId(rid); setMyName(name);

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no camera"); }

    sub(rid, () => {
      // Announce to host after confirmed subscribed
      bcast("joined", { id: myIdRef.current, name, email });
    });
  }, [sub, bcast]);

  const toggleMic = useCallback(() => {
    const t = localRef.current?.getAudioTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      bcast("candidate-status", { micOn: t.enabled, camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: !!screenRef.current, _from: myIdRef.current });
  }, [bcast]);

  const toggleCam = useCallback(() => {
    const t = localRef.current?.getVideoTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      bcast("candidate-status", { micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true, camOn: t.enabled, screenOn: !!screenRef.current, _from: myIdRef.current });
  }, [bcast]);

  const startScreenShare = useCallback(async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "monitor" } as MediaTrackConstraints, audio: true });
    screen.getVideoTracks().forEach(t => { t.contentHint = "detail"; });
    screenRef.current = screen; setScreenStream(screen);
    peersRef.current.forEach((pc, pid) => {
      screen.getTracks().forEach(t => { try { pc.addTrack(t, screen); } catch {} });
      if (pc.signalingState === "stable")
        pc.createOffer().then(o => pc.setLocalDescription(o).then(() => bcast("offer", { sdp: pc.localDescription, _to: pid, _from: myIdRef.current }))).catch(console.error);
    });
    if (roleRef.current === "candidate")
      bcast("candidate-status", { micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true, camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: true, _from: myIdRef.current });
    screen.getVideoTracks()[0].addEventListener("ended", () => {
      screenRef.current = null; setScreenStream(null);
      if (roleRef.current === "candidate")
        bcast("candidate-status", { micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true, camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: false, _from: myIdRef.current });
    });
  }, [bcast]);

  const stopScreenShare = useCallback(() => {
    screenRef.current?.getTracks().forEach(t => t.stop()); screenRef.current = null; setScreenStream(null);
    if (roleRef.current === "candidate")
      bcast("candidate-status", { micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true, camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: false, _from: myIdRef.current });
  }, [bcast]);

  const admitCandidate = useCallback((cid: string) => {
    upd(prev => { const next = new Map(prev); const c = next.get(cid); if (c) next.set(cid, { ...c, admitted: true }); return next; });
    bcast("admitted", { _to: cid });
    getPeer(cid, true);
    audit(cid, candRef.current.get(cid)?.name ?? cid, "admitted ✓");
  }, [bcast, getPeer, audit, upd]);

  const removeCandidate = useCallback((cid: string) => {
    const n = candRef.current.get(cid)?.name ?? cid;
    bcast("removed", { _to: cid });
    peersRef.current.get(cid)?.close(); peersRef.current.delete(cid);
    upd(prev => { const next = new Map(prev); next.delete(cid); return next; });
    audit(cid, n, "removed by host");
  }, [bcast, audit, upd]);

  const startExam = useCallback(() => {
    const dur = durRef.current; const url = formRef.current;
    setExamActive(true); examRef.current = true; setExamSecondsLeft(dur);
    bcast("exam-start", { formUrl: url, duration: dur });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current!); setExamActive(false); examRef.current = false; bcast("exam-end", {}); return 0; }
        return s - 1;
      });
    }, 1000);
  }, [bcast]);

  const endExam = useCallback(() => {
    clearInterval(timerRef.current!); setExamActive(false); examRef.current = false; setExamSecondsLeft(0); bcast("exam-end", {});
  }, [bcast]);

  const openForm = useCallback(() => { if (formRef.current) window.open(formRef.current, "_blank", "noopener,noreferrer"); }, []);

  const sendVisibilityEvent = useCallback((hidden: boolean) => {
    if (roleRef.current === "candidate") bcast("visibility", { hidden, _from: myIdRef.current });
  }, [bcast]);

  useEffect(() => {
    if (!examActive || role !== "candidate") return;
    const t = setInterval(() => { setExamSecondsLeft(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }); }, 1000);
    return () => clearInterval(t);
  }, [examActive, role]);

  const disconnect = useCallback(() => {
    doneRef.current = true; clearInterval(timerRef.current!);
    peersRef.current.forEach(p => p.close()); peersRef.current.clear();
    localRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current?.getTracks().forEach(t => t.stop());
    if (roleRef.current === "candidate") bcast("left", { _from: myIdRef.current, name: nameRef.current });
    chRef.current?.unsubscribe(); chRef.current = null;
    setConnected(false); setLocalStream(null); setScreenStream(null);
  }, [bcast]);

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
