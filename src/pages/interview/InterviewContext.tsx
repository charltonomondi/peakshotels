/**
 * InterviewContext - WebRTC interview platform
 * Signaling: Supabase Realtime Broadcast
 *
 * ROOT CAUSE FIXES:
 * 1. handleBroadcast has NO state vars in deps (only stable refs/callbacks)
 *    This prevents joinChannel from being recreated mid-session.
 * 2. "joined" broadcast fires ONLY after channel confirms SUBSCRIBED
 *    (no more setTimeout race condition)
 * 3. examActive stored in ref so handleBroadcast never re-creates
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

const InterviewContext = createContext<InterviewContextType | null>(null);

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

function roomChannel(roomId: string) { return `interview:${roomId.toUpperCase()}`; }

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

  // Refs — used in callbacks to avoid stale closures
  const chRef         = useRef<RealtimeChannel | null>(null);
  const peersRef      = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localRef      = useRef<MediaStream | null>(null);
  const screenRef     = useRef<MediaStream | null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const roleRef       = useRef<ParticipantRole | null>(null);
  const myIdRef       = useRef(myId);
  const nameRef       = useRef("");
  const emailRef      = useRef("");
  const candRef       = useRef<Map<string, CandidateState>>(new Map());
  const examActRef    = useRef(false);
  const formUrlRef    = useRef("");
  const durationRef   = useRef(3600);
  const leftRef       = useRef(false);

  // Keep refs in sync with state where needed
  useEffect(() => { examActRef.current = examActive; }, [examActive]);
  useEffect(() => { formUrlRef.current = examFormUrl; }, [examFormUrl]);
  useEffect(() => { durationRef.current = examDuration; }, [examDuration]);

  const updateCandidates = useCallback(
    (fn: (p: Map<string, CandidateState>) => Map<string, CandidateState>) => {
      setCandidates(p => { const n = fn(p); candRef.current = n; return n; });
    }, [],
  );

  const addAudit = useCallback((id: string, name: string, ev: string) => {
    setAuditLog(p => [...p, { ts: Date.now(), candidateId: id, candidateName: name, event: ev }]);
  }, []);

  // Broadcast — reads chRef at call time, truly stable (empty deps)
  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    chRef.current?.send({ type: "broadcast", event, payload })
      .catch(e => console.warn("[signal]", event, e));
  }, []);

  // WebRTC peer
  const getOrMakePeer = useCallback((peerId: string, initiator: boolean) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;
    const pc = new RTCPeerConnection(RTC_CONFIG);

    localRef.current?.getTracks().forEach(t => pc.addTrack(t, localRef.current!));
    screenRef.current?.getTracks().forEach(t => pc.addTrack(t, screenRef.current!));

    pc.onicecandidate = e => {
      if (e.candidate)
        send("ice", { to: peerId, from: myIdRef.current, candidate: e.candidate.toJSON() });
    };

    const rxIds: string[] = [];
    pc.ontrack = e => {
      if (roleRef.current !== "host") return;
      const s = e.streams[0]; if (!s) return;
      const isNew = !rxIds.includes(s.id);
      if (isNew) rxIds.push(s.id);
      const idx = rxIds.indexOf(s.id);
      const isScreen = idx >= 1 || e.track.contentHint === "detail"
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
          send("offer", { to: peerId, from: myIdRef.current, sdp: pc.localDescription });
        } catch (err) { console.error("[RTC] offer", err); }
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [send, addAudit, updateCandidates]);

  // Message handler — NO state in deps, all reads via refs
  const onMsg = useCallback(async (event: string, payload: Record<string, unknown>) => {
    const me = myIdRef.current;
    const r  = roleRef.current;

    if (event === "joined" && r === "host") {
      const { id, name, email } = payload as { id: string; name: string; email: string };
      if (!id || !name) return;
      updateCandidates(prev => {
        const next = new Map(prev);
        if (next.has(id)) {
          const c = next.get(id)!;
          next.set(id, { ...c, name, email: email ?? c.email });
        } else {
          next.set(id, { id, name, email: email ?? "", stream: null, screenStream: null,
            micOn: true, camOn: true, screenOn: false, connected: false, admitted: false, examStarted: false });
        }
        return next;
      });
      addAudit(id, name, "joined — waiting to be admitted");
      if (examActRef.current) {
        send("exam-state", { to: id, formUrl: formUrlRef.current, duration: durationRef.current, active: true });
      }
      return;
    }

    if (event === "admitted" && r === "candidate") {
      const { to } = payload as { to: string };
      if (to === me) setAdmitted(true);
      return;
    }

    if (event === "removed" && r === "candidate") {
      const { to } = payload as { to: string };
      if (to !== me) return;
      setAdmitted(false);
      leftRef.current = true;
      chRef.current?.unsubscribe();
      return;
    }

    if (event === "offer") {
      const { to, from, sdp } = payload as { to: string; from: string; sdp: RTCSessionDescriptionInit };
      if (to !== me) return;
      const pc = getOrMakePeer(from, false);
      if (pc.signalingState === "have-remote-offer") return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        send("answer", { to: from, from: me, sdp: pc.localDescription });
      } catch (err) { console.error("[RTC] answer", err); }
      return;
    }

    if (event === "answer") {
      const { to, from, sdp } = payload as { to: string; from: string; sdp: RTCSessionDescriptionInit };
      if (to !== me) return;
      const pc = peersRef.current.get(from);
      if (pc && pc.signalingState === "have-local-offer") {
        try { await pc.setRemoteDescription(new RTCSessionDescription(sdp)); } catch {}
      }
      return;
    }

    if (event === "ice") {
      const { to, from, candidate } = payload as { to: string; from: string; candidate: RTCIceCandidateInit };
      if (to !== me) return;
      const pc = peersRef.current.get(from);
      if (pc) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} }
      return;
    }

    if (event === "candidate-status" && r === "host") {
      const { from, micOn, camOn, screenOn } = payload as { from: string; micOn: boolean; camOn: boolean; screenOn: boolean };
      updateCandidates(prev => {
        const next = new Map(prev); const c = next.get(from); if (!c) return prev;
        if (!screenOn && c.screenOn) addAudit(from, c.name, "stopped screen sharing ⚠");
        if (screenOn && !c.screenOn) addAudit(from, c.name, "started screen sharing");
        if (!camOn && c.camOn) addAudit(from, c.name, "turned camera off");
        if (!micOn && c.micOn) addAudit(from, c.name, "muted microphone");
        next.set(from, { ...c, micOn, camOn, screenOn }); return next;
      });
      return;
    }

    if (event === "visibility" && r === "host") {
      const { from, hidden } = payload as { from: string; hidden: boolean };
      const n = candRef.current.get(from)?.name ?? from;
      addAudit(from, n, hidden ? "switched away from exam tab ⚠" : "returned to exam tab");
      return;
    }

    if (event === "exam-start" && r === "candidate") {
      const { formUrl, duration } = payload as { formUrl: string; duration: number };
      setExamActive(true); setExamFormUrl(formUrl); setExamDuration(duration); setExamSecondsLeft(duration);
      return;
    }

    if (event === "exam-state" && r === "candidate") {
      const { to, formUrl, duration, active } = payload as { to: string; formUrl: string; duration: number; active: boolean };
      if (to !== me || !active) return;
      setExamActive(true); setExamFormUrl(formUrl); setExamDuration(duration); setExamSecondsLeft(duration);
      return;
    }

    if (event === "exam-end" && r === "candidate") {
      setExamActive(false); setExamSecondsLeft(0);
      return;
    }

    if (event === "left" && r === "host") {
      const { id, name } = payload as { id: string; name: string };
      addAudit(id, name, "left the room");
      updateCandidates(prev => {
        const next = new Map(prev); const c = next.get(id);
        if (c) next.set(id, { ...c, connected: false }); return next;
      });
      return;
    }

    if (event === "host-joined" && r === "candidate") {
      send("joined", { id: me, name: nameRef.current, email: emailRef.current });
      return;
    }
  }, [send, getOrMakePeer, addAudit, updateCandidates]);
  // ^^^ NO state deps — all reads are via refs ^^^

  // Subscribe — called once, stable because onMsg is now stable
  const subscribe = useCallback((rid: string, onReady: () => void) => {
    chRef.current?.unsubscribe();
    const ch = supabase.channel(roomChannel(rid), { config: { broadcast: { self: false } } });
    ch.on("broadcast", { event: "*" }, ({ event, payload }) => {
      onMsg(event, payload as Record<string, unknown>).catch(console.error);
    });
    ch.subscribe(status => {
      console.log("[signal]", roomChannel(rid), status);
      if (status === "SUBSCRIBED") { setConnected(true); onReady(); }
      else if (status === "CLOSED" || status === "CHANNEL_ERROR") setConnected(false);
    });
    chRef.current = ch;
  }, [onMsg]);

  const initHost = useCallback(async (rid: string, name: string, formUrl: string, mins: number) => {
    leftRef.current = false;
    roleRef.current = "host";
    nameRef.current = name;
    formUrlRef.current = formUrl;
    durationRef.current = mins * 60;
    setRole("host"); setRoomId(rid); setMyName(name);
    setExamFormUrl(formUrl); setExamDuration(mins * 60); setExamSecondsLeft(mins * 60);
    setAdmitted(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no host camera"); }
    subscribe(rid, () => send("host-joined", { from: myIdRef.current }));
  }, [subscribe, send]);

  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    leftRef.current = false;
    roleRef.current = "candidate";
    nameRef.current = name; emailRef.current = email;
    setRole("candidate"); setRoomId(rid); setMyName(name);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no camera"); }
    subscribe(rid, () => send("joined", { id: myIdRef.current, name, email }));
  }, [subscribe, send]);

  const toggleMic = useCallback(() => {
    const t = localRef.current?.getAudioTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      send("candidate-status", { from: myIdRef.current, micOn: t.enabled,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true,
        screenOn: !!screenRef.current });
  }, [send]);

  const toggleCam = useCallback(() => {
    const t = localRef.current?.getVideoTracks()[0]; if (!t) return;
    t.enabled = !t.enabled; setLocalStream(s => s);
    if (roleRef.current === "candidate")
      send("candidate-status", { from: myIdRef.current,
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: t.enabled, screenOn: !!screenRef.current });
  }, [send]);

  const startScreenShare = useCallback(async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "monitor" } as MediaTrackConstraints, audio: true,
    });
    screen.getVideoTracks().forEach(t => { t.contentHint = "detail"; });
    screenRef.current = screen; setScreenStream(screen);

    peersRef.current.forEach((pc, pid) => {
      screen.getTracks().forEach(t => { try { pc.addTrack(t, screen); } catch {} });
      if (pc.signalingState === "stable") {
        pc.createOffer().then(o => pc.setLocalDescription(o).then(() =>
          send("offer", { to: pid, from: myIdRef.current, sdp: pc.localDescription })
        )).catch(console.error);
      }
    });

    if (roleRef.current === "candidate")
      send("candidate-status", { from: myIdRef.current,
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: true });

    screen.getVideoTracks()[0].addEventListener("ended", () => {
      screenRef.current = null; setScreenStream(null);
      if (roleRef.current === "candidate")
        send("candidate-status", { from: myIdRef.current,
          micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
          camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: false });
    });
  }, [send]);

  const stopScreenShare = useCallback(() => {
    screenRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current = null; setScreenStream(null);
    if (roleRef.current === "candidate")
      send("candidate-status", { from: myIdRef.current,
        micOn: localRef.current?.getAudioTracks()[0]?.enabled ?? true,
        camOn: localRef.current?.getVideoTracks()[0]?.enabled ?? true, screenOn: false });
  }, [send]);

  const admitCandidate = useCallback((cid: string) => {
    updateCandidates(prev => {
      const next = new Map(prev); const c = next.get(cid);
      if (c) next.set(cid, { ...c, admitted: true }); return next;
    });
    send("admitted", { to: cid });
    getOrMakePeer(cid, true);
    addAudit(cid, candRef.current.get(cid)?.name ?? cid, "admitted ✓");
  }, [send, getOrMakePeer, addAudit, updateCandidates]);

  const removeCandidate = useCallback((cid: string) => {
    const n = candRef.current.get(cid)?.name ?? cid;
    send("removed", { to: cid });
    peersRef.current.get(cid)?.close(); peersRef.current.delete(cid);
    updateCandidates(prev => { const next = new Map(prev); next.delete(cid); return next; });
    addAudit(cid, n, "removed by host");
  }, [send, addAudit, updateCandidates]);

  const startExam = useCallback(() => {
    const dur = durationRef.current; const url = formUrlRef.current;
    setExamActive(true); examActRef.current = true; setExamSecondsLeft(dur);
    send("exam-start", { formUrl: url, duration: dur });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExamActive(false); examActRef.current = false;
          send("exam-end", {}); return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [send]);

  const endExam = useCallback(() => {
    clearInterval(timerRef.current!);
    setExamActive(false); examActRef.current = false; setExamSecondsLeft(0);
    send("exam-end", {});
  }, [send]);

  const openForm = useCallback(() => {
    if (formUrlRef.current) window.open(formUrlRef.current, "_blank", "noopener,noreferrer");
  }, []);

  const sendVisibilityEvent = useCallback((hidden: boolean) => {
    if (roleRef.current === "candidate")
      send("visibility", { from: myIdRef.current, hidden });
  }, [send]);

  useEffect(() => {
    if (!examActive || role !== "candidate") return;
    const t = setInterval(() => {
      setExamSecondsLeft(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [examActive, role]);

  const disconnect = useCallback(() => {
    leftRef.current = true;
    clearInterval(timerRef.current!);
    peersRef.current.forEach(p => p.close()); peersRef.current.clear();
    localRef.current?.getTracks().forEach(t => t.stop());
    screenRef.current?.getTracks().forEach(t => t.stop());
    if (roleRef.current === "candidate")
      send("left", { id: myIdRef.current, name: nameRef.current });
    chRef.current?.unsubscribe(); chRef.current = null;
    setConnected(false); setLocalStream(null); setScreenStream(null);
  }, [send]);

  useEffect(() => () => { disconnect(); }, [disconnect]);

  return (
    <InterviewContext.Provider value={{
      role, roomId, myId, myName, localStream, screenStream,
      candidates, auditLog, examActive, examFormUrl, examDuration, examSecondsLeft,
      connected, admitted,
      initHost, initCandidate, toggleMic, toggleCam,
      startScreenShare, stopScreenShare, admitCandidate, removeCandidate,
      startExam, endExam, openForm, disconnect, sendVisibilityEvent,
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be inside InterviewProvider");
  return ctx;
}
