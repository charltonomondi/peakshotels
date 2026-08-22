/**
 * InterviewContext — WebRTC Interview Platform
 * Signaling: Supabase Realtime Broadcast
 * Persistence: Supabase DB (interview_rooms + interview_participants tables)
 *
 * Session survival across page reloads:
 *  - Host reloads → reads existing participants from DB, re-announces to channel
 *  - Candidates still in room re-announce on "host-joined" event
 *  - Admission status persisted in DB so it survives host page reload
 *  - Participant ID stored in localStorage so same person keeps same ID
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

// ── Stable participant ID (persists across page reloads via localStorage) ─────
function getOrCreateParticipantId(roomId: string, role: ParticipantRole): string {
  const key = `interview_pid_${roomId.toUpperCase()}_${role}`;
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  localStorage.setItem(key, fresh);
  return fresh;
}

// ── DB persistence helpers ────────────────────────────────────────────────────
async function dbUpsertRoom(roomId: string, hostName: string, formUrl: string, durationSecs: number) {
  await supabase.from("interview_rooms").upsert({
    room_id: roomId, host_name: hostName, form_url: formUrl,
    duration_secs: durationSecs, updated_at: new Date().toISOString(),
  }, { onConflict: "room_id" });
}

async function dbUpsertParticipant(
  roomId: string, participantId: string, name: string,
  email: string, role: ParticipantRole, admitted = false,
) {
  await supabase.from("interview_participants").upsert({
    room_id: roomId, participant_id: participantId,
    name, email, role, admitted, last_seen: new Date().toISOString(),
  }, { onConflict: "room_id,participant_id" });
}

async function dbSetAdmitted(roomId: string, participantId: string, admitted: boolean) {
  await supabase.from("interview_participants")
    .update({ admitted, last_seen: new Date().toISOString() })
    .eq("room_id", roomId).eq("participant_id", participantId);
}

async function dbLoadParticipants(roomId: string) {
  const { data } = await supabase
    .from("interview_participants")
    .select("*")
    .eq("room_id", roomId)
    .eq("role", "candidate")
    .order("created_at");
  return data ?? [];
}

async function dbLoadRoom(roomId: string) {
  const { data } = await supabase
    .from("interview_rooms")
    .select("*")
    .eq("room_id", roomId)
    .maybeSingle();
  return data;
}

async function dbLoadMyAdmission(roomId: string, participantId: string): Promise<boolean> {
  const { data } = await supabase
    .from("interview_participants")
    .select("admitted")
    .eq("room_id", roomId)
    .eq("participant_id", participantId)
    .maybeSingle();
  return data?.admitted ?? false;
}

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [role,            setRole]            = useState<ParticipantRole | null>(null);
  const [roomId,          setRoomId]          = useState("");
  // myId is set during init from localStorage (stable across reloads)
  const [myId,            setMyId]            = useState(() => crypto.randomUUID());
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
  const roomIdRef  = useRef("");
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
      // Check if this candidate was previously admitted (from DB or current state)
      const existingAdmitted = candRef.current.get(id)?.admitted ?? false;
      upd(prev => {
        const next = new Map(prev);
        if (next.has(id)) {
          const c = next.get(id)!;
          next.set(id, { ...c, name: name ?? c.name, email: email ?? c.email, connected: true });
        } else {
          next.set(id, { id, name, email: email ?? "", stream: null, screenStream: null,
            micOn: true, camOn: true, screenOn: false, connected: true,
            admitted: existingAdmitted, examStarted: false });
        }
        return next;
      });
      audit(id, name, existingAdmitted ? "reconnected (was admitted)" : "joined — waiting to be admitted");
      // Upsert into DB
      dbUpsertParticipant(roomIdRef.current, id, name, email ?? "", "candidate", existingAdmitted);
      // If previously admitted, re-send the admitted signal so they don't wait
      if (existingAdmitted) {
        bcast("admitted", { _to: id });
        // Re-initiate WebRTC
        getPeer(id, true);
      }
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
    // Use stable ID from localStorage so same host gets same ID on reload
    const stableId = getOrCreateParticipantId(rid, "host");
    myIdRef.current = stableId;
    setMyId(stableId);

    roleRef.current = "host";
    nameRef.current = name;
    formRef.current = formUrl;
    durRef.current = mins * 60;
    roomIdRef.current = rid;

    setRole("host"); setRoomId(rid); setMyName(name);
    setExamFormUrl(formUrl); setExamDuration(mins * 60); setExamSecondsLeft(mins * 60);
    setAdmitted(true);

    // Persist room to DB (upsert so reload doesn't duplicate)
    await dbUpsertRoom(rid, name, formUrl, mins * 60);
    await dbUpsertParticipant(rid, stableId, name, "", "host", true);

    // Load any existing participants from DB (handles host page reload)
    const existing = await dbLoadParticipants(rid);
    if (existing.length > 0) {
      upd(() => {
        const next = new Map<string, CandidateState>();
        for (const p of existing) {
          next.set(p.participant_id, {
            id: p.participant_id,
            name: p.name,
            email: p.email ?? "",
            stream: null, screenStream: null,
            micOn: true, camOn: true, screenOn: false,
            connected: false,
            admitted: p.admitted ?? false,
            examStarted: false,
          });
        }
        return next;
      });
      if (existing.length > 0) {
        audit("system", "system", `Restored ${existing.length} participant(s) from previous session`);
      }
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no host camera"); }

    sub(rid, () => {
      // Broadcast host-joined so any still-connected candidates re-announce
      bcast("host-joined", { _from: stableId });
    });
  }, [sub, bcast, upd, audit]);

  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    doneRef.current = false;
    // Use stable ID from localStorage so same candidate keeps same ID on reload
    const stableId = getOrCreateParticipantId(rid, "candidate");
    myIdRef.current = stableId;
    setMyId(stableId);

    roleRef.current = "candidate";
    nameRef.current = name;
    emailRef.current = email;
    roomIdRef.current = rid;

    setRole("candidate"); setRoomId(rid); setMyName(name);

    // Check if already admitted (handles candidate page reload)
    const wasAdmitted = await dbLoadMyAdmission(rid, stableId);
    if (wasAdmitted) {
      setAdmitted(true);
    }

    // Upsert participant row
    await dbUpsertParticipant(rid, stableId, name, email, "candidate", wasAdmitted);

    // Also check if exam is running (load room state)
    const room = await dbLoadRoom(rid);
    if (room?.exam_started && room.exam_ends_at) {
      const secsLeft = Math.max(0, Math.round((new Date(room.exam_ends_at).getTime() - Date.now()) / 1000));
      if (secsLeft > 0 && wasAdmitted) {
        setExamActive(true);
        setExamFormUrl(room.form_url ?? "");
        setExamDuration(room.duration_secs ?? 3600);
        setExamSecondsLeft(secsLeft);
        examRef.current = true;
        formRef.current = room.form_url ?? "";
        durRef.current = secsLeft;
        audit(stableId, name, "rejoined — exam in progress");
      }
    }

    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localRef.current = s; setLocalStream(s);
    } catch { console.warn("[media] no camera"); }

    sub(rid, () => {
      // Announce to host after confirmed subscribed
      bcast("joined", { id: stableId, name, email });
    });
  }, [sub, bcast, audit]);

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
    // Don't constrain displaySurface — let the browser show all options
    // (screen, window, tab) so it works on all platforms
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
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
    const cname = candRef.current.get(cid)?.name ?? cid;
    audit(cid, cname, "admitted ✓");
    // Persist to DB so it survives host reload
    dbSetAdmitted(roomIdRef.current, cid, true);
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
    // Persist exam start to DB so candidates who reload can pick up the state
    const endsAt = new Date(Date.now() + dur * 1000).toISOString();
    supabase.from("interview_rooms").update({
      exam_started: true,
      exam_started_at: new Date().toISOString(),
      exam_ends_at: endsAt,
      updated_at: new Date().toISOString(),
    }).eq("room_id", roomIdRef.current).then(() => {});
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExamActive(false); examRef.current = false;
          bcast("exam-end", {});
          supabase.from("interview_rooms").update({
            exam_started: false, updated_at: new Date().toISOString(),
          }).eq("room_id", roomIdRef.current).then(() => {});
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [bcast]);

  const endExam = useCallback(() => {
    clearInterval(timerRef.current!); setExamActive(false); examRef.current = false; setExamSecondsLeft(0);
    bcast("exam-end", {});
    supabase.from("interview_rooms").update({
      exam_started: false, updated_at: new Date().toISOString(),
    }).eq("room_id", roomIdRef.current).then(() => {});
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
