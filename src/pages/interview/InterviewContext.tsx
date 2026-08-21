/**
 * InterviewContext — WebRTC interview platform
 *
 * Signaling uses Supabase Realtime Broadcast (works on any hosting, no WS
 * server required). Each room = one Supabase channel named "interview:{roomId}".
 *
 * Privacy model:
 *  – Candidates can only see/hear the host (one-way WebRTC from candidate → host)
 *  – Candidates are never aware of other candidates' streams
 *  – Only the host receives video/audio tracks from all candidates
 */
import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function makeChannelName(roomId: string) {
  return `interview:${roomId.toUpperCase()}`;
}

export function InterviewProvider({ children }: { children: React.ReactNode }) {

  // ── state ─────────────────────────────────────────────────────────────────
  const [role,           setRole]           = useState<ParticipantRole | null>(null);
  const [roomId,         setRoomId]         = useState("");
  const [myId]                              = useState(() => crypto.randomUUID());
  const [myName,         setMyName]         = useState("");
  const [localStream,    setLocalStream]    = useState<MediaStream | null>(null);
  const [screenStream,   setScreenStream]   = useState<MediaStream | null>(null);
  const [candidates,     setCandidates]     = useState<Map<string, CandidateState>>(new Map());
  const [auditLog,       setAuditLog]       = useState<AuditEvent[]>([]);
  const [examActive,     setExamActive]     = useState(false);
  const [examFormUrl,    setExamFormUrl]    = useState("");
  const [examDuration,   setExamDuration]   = useState(3600);
  const [examSecondsLeft,setExamSecondsLeft]= useState(3600);
  const [connected,      setConnected]      = useState(false);
  const [admitted,       setAdmitted]       = useState(false);

  // ── stable refs ───────────────────────────────────────────────────────────
  const channelRef       = useRef<RealtimeChannel | null>(null);
  const peersRef         = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef   = useRef<MediaStream | null>(null);
  const screenStreamRef  = useRef<MediaStream | null>(null);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const roleRef          = useRef<ParticipantRole | null>(null);
  const roomIdRef        = useRef("");
  const myIdRef          = useRef(myId);
  const myNameRef        = useRef("");
  const emailRef         = useRef("");
  const candidatesRef    = useRef<Map<string, CandidateState>>(new Map());
  const intentionalLeave = useRef(false);
  const examFormUrlRef   = useRef("");
  const examDurationRef  = useRef(3600);

  // ── candidates updater (keeps ref in sync) ────────────────────────────────
  const updateCandidates = useCallback(
    (fn: (prev: Map<string, CandidateState>) => Map<string, CandidateState>) => {
      setCandidates(prev => {
        const next = fn(prev);
        candidatesRef.current = next;
        return next;
      });
    }, [],
  );

  const addAudit = useCallback((cid: string, cname: string, ev: string) => {
    setAuditLog(prev => [...prev, { ts: Date.now(), candidateId: cid, candidateName: cname, event: ev }]);
  }, []);

  // ── broadcast via Supabase channel ───────────────────────────────────────
  const broadcast = useCallback((event: string, payload: Record<string, unknown>) => {
    channelRef.current?.send({ type: "broadcast", event, payload })
      .catch(e => console.warn("[signal] broadcast error", e));
  }, []);

  // ── Create/get RTCPeerConnection ──────────────────────────────────────────
  const getOrCreatePeer = useCallback((peerId: string, isInitiator: boolean): RTCPeerConnection => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId)!;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local camera/mic tracks with a stream label the receiver can identify
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t =>
        pc.addTrack(t, localStreamRef.current!),
      );
    }
    // Add screen share if already active — in a separate stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t =>
        pc.addTrack(t, screenStreamRef.current!),
      );
    }

    // ICE candidates → send via broadcast
    pc.onicecandidate = (e) => {
      if (!e.candidate) return;
      broadcast("ice", { to: peerId, from: myIdRef.current, candidate: e.candidate.toJSON() });
    };

    // Incoming media — host only (privacy enforcement)
    // We distinguish camera vs screen by stream ID:
    //   – first stream = camera/mic
    //   – second stream = screen share
    // The candidate sends them in separate streams via addTrack(track, dedicatedStream)
    const receivedStreams: MediaStream[] = [];

    pc.ontrack = (e) => {
      if (roleRef.current !== "host") return;

      const incomingStream = e.streams[0];
      if (!incomingStream) return;

      // Avoid duplicates
      if (receivedStreams.find(s => s.id === incomingStream.id)) return;
      receivedStreams.push(incomingStream);

      // First stream = camera, second = screen share
      const isScreen = receivedStreams.length >= 2 ||
        incomingStream.getVideoTracks().some(t =>
          t.label.toLowerCase().includes("screen") ||
          t.label.toLowerCase().includes("display") ||
          t.contentHint === "detail"
        );

      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(peerId);
        if (c) {
          if (isScreen) {
            next.set(peerId, { ...c, screenStream: incomingStream });
          } else {
            next.set(peerId, { ...c, stream: incomingStream });
          }
        }
        return next;
      });

      // Handle new tracks added to an existing stream (e.g. audio added after video)
      incomingStream.onaddtrack = () => {
        updateCandidates(prev => {
          const next = new Map(prev);
          const c = next.get(peerId);
          if (!c) return prev;
          // Force a re-render by creating a new stream reference wrapper
          if (isScreen) {
            next.set(peerId, { ...c, screenStream: incomingStream });
          } else {
            next.set(peerId, { ...c, stream: incomingStream });
          }
          return next;
        });
      };
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      if (roleRef.current !== "host") return;
      const cname = candidatesRef.current.get(peerId)?.name ?? peerId;
      const s = pc.connectionState;
      if (s === "connected") {
        updateCandidates(prev => {
          const next = new Map(prev);
          const c = next.get(peerId);
          if (c) next.set(peerId, { ...c, connected: true });
          return next;
        });
        addAudit(peerId, cname, "WebRTC connected ✓");
      } else if (s === "disconnected" || s === "failed" || s === "closed") {
        updateCandidates(prev => {
          const next = new Map(prev);
          const c = next.get(peerId);
          if (c) next.set(peerId, { ...c, connected: false });
          return next;
        });
        addAudit(peerId, cname, `connection ${s}`);
      }
    };

    // Negotiation — only initiator creates the offer
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          if (pc.signalingState !== "stable") return;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          broadcast("offer", { to: peerId, from: myIdRef.current, sdp: pc.localDescription });
        } catch (err) {
          console.error("[RTC] offer error", err);
        }
      };
    }

    peersRef.current.set(peerId, pc);
    return pc;
  }, [broadcast, addAudit, updateCandidates]);

  // ── Handle incoming broadcast messages ───────────────────────────────────
  const handleBroadcast = useCallback(async (event: string, payload: Record<string, unknown>) => {

    // ── candidate → host: announces they joined ──────────────────────────
    if (event === "joined" && roleRef.current === "host") {
      const { id, name, email } = payload as { id: string; name: string; email: string };
      if (!id || !name) return;
      updateCandidates(prev => {
        if (prev.has(id)) return prev;
        const next = new Map(prev);
        next.set(id, {
          id, name, email: email ?? "",
          stream: null, screenStream: null,
          micOn: true, camOn: true, screenOn: false,
          connected: false, admitted: false, examStarted: false,
        });
        return next;
      });
      addAudit(id, name, "joined room — waiting to be admitted");
      // Immediately send them the current exam state if already running
      if (examActive) {
        broadcast("exam-state", {
          to: id,
          formUrl: examFormUrlRef.current,
          duration: examDurationRef.current,
          active: true,
        });
      }
      return;
    }

    // ── host → candidate: admitted ───────────────────────────────────────
    if (event === "admitted") {
      const { to } = payload as { to: string };
      if (to !== myIdRef.current) return;
      setAdmitted(true);
      return;
    }

    // ── host → candidate: removed ────────────────────────────────────────
    if (event === "removed") {
      const { to } = payload as { to: string };
      if (to !== myIdRef.current) return;
      setAdmitted(false);
      intentionalLeave.current = true;
      channelRef.current?.unsubscribe();
      return;
    }

    // ── WebRTC signaling — each message has a "to" field ─────────────────
    if (event === "offer") {
      const msg = payload as { to: string; from: string; sdp: RTCSessionDescriptionInit };
      if (msg.to !== myIdRef.current) return;
      const pc = getOrCreatePeer(msg.from, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        broadcast("answer", { to: msg.from, from: myIdRef.current, sdp: pc.localDescription });
      } catch (err) { console.error("[RTC] answer error", err); }
      return;
    }

    if (event === "answer") {
      const msg = payload as { to: string; from: string; sdp: RTCSessionDescriptionInit };
      if (msg.to !== myIdRef.current) return;
      const pc = peersRef.current.get(msg.from);
      if (pc && pc.signalingState !== "stable") {
        try { await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)); } catch {}
      }
      return;
    }

    if (event === "ice") {
      const msg = payload as { to: string; from: string; candidate: RTCIceCandidateInit };
      if (msg.to !== myIdRef.current) return;
      const pc = peersRef.current.get(msg.from);
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
      }
      return;
    }

    // ── candidate → host: media status update ────────────────────────────
    if (event === "candidate-status" && roleRef.current === "host") {
      const { from, micOn, camOn, screenOn } = payload as {
        from: string; micOn: boolean; camOn: boolean; screenOn: boolean;
      };
      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(from);
        if (c) {
          if (!screenOn && c.screenOn) addAudit(from, c.name, "stopped screen sharing ⚠");
          if (screenOn  && !c.screenOn) addAudit(from, c.name, "started screen sharing");
          if (!camOn && c.camOn)       addAudit(from, c.name, "turned camera off");
          if (!micOn && c.micOn)       addAudit(from, c.name, "muted microphone");
          next.set(from, { ...c, micOn, camOn, screenOn });
        }
        return next;
      });
      return;
    }

    // ── candidate → host: tab visibility ─────────────────────────────────
    if (event === "visibility" && roleRef.current === "host") {
      const { from, hidden } = payload as { from: string; hidden: boolean };
      const cname = candidatesRef.current.get(from)?.name ?? from;
      addAudit(from, cname, hidden ? "switched away from exam tab ⚠" : "returned to exam tab");
      return;
    }

    // ── host → all: exam started ──────────────────────────────────────────
    if (event === "exam-start" && roleRef.current === "candidate") {
      const { formUrl, duration } = payload as { formUrl: string; duration: number };
      setExamActive(true);
      setExamFormUrl(formUrl);
      setExamDuration(duration);
      setExamSecondsLeft(duration);
      return;
    }

    // ── host → specific: already-running exam state (for late joiners) ───
    if (event === "exam-state" && roleRef.current === "candidate") {
      const { to, formUrl, duration, active } = payload as {
        to: string; formUrl: string; duration: number; active: boolean;
      };
      if (to !== myIdRef.current || !active) return;
      setExamActive(true);
      setExamFormUrl(formUrl);
      setExamDuration(duration);
      setExamSecondsLeft(duration);
      return;
    }

    // ── host → all: exam ended ─────────────────────────────────────────────
    if (event === "exam-end" && roleRef.current === "candidate") {
      setExamActive(false);
      setExamSecondsLeft(0);
      return;
    }

    // ── candidate left ────────────────────────────────────────────────────
    if (event === "left" && roleRef.current === "host") {
      const { id, name } = payload as { id: string; name: string };
      addAudit(id, name, "left the room");
      updateCandidates(prev => {
        const next = new Map(prev);
        const c = next.get(id);
        if (c) next.set(id, { ...c, connected: false });
        return next;
      });
      return;
    }

    // ── candidate: re-announce presence when host joins late ─────────────
    if (event === "host-joined" && roleRef.current === "candidate") {
      // Re-send our "joined" message so host sees us
      broadcast("joined", {
        id: myIdRef.current,
        name: myNameRef.current,
        email: emailRef.current,
      });
    }

  }, [broadcast, getOrCreatePeer, addAudit, updateCandidates, examActive]);

  // ── Subscribe to Supabase channel ────────────────────────────────────────
  const joinChannel = useCallback((rid: string) => {
    // Unsubscribe from any previous channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    const ch = supabase.channel(makeChannelName(rid), {
      config: { broadcast: { self: false } },
    });

    // Listen for all broadcast events
    ch.on("broadcast", { event: "*" }, ({ event, payload }) => {
      handleBroadcast(event, payload as Record<string, unknown>).catch(console.error);
    });

    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setConnected(true);
        console.log(`[signal] subscribed to ${makeChannelName(rid)}`);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setConnected(false);
        console.warn(`[signal] channel ${status}`);
      }
    });

    channelRef.current = ch;
  }, [handleBroadcast]);

  // ── Init host ─────────────────────────────────────────────────────────────
  const initHost = useCallback(async (
    rid: string, name: string, formUrl: string, durationMins: number,
  ) => {
    intentionalLeave.current = false;
    roleRef.current = "host";
    roomIdRef.current = rid;
    myNameRef.current = name;
    examFormUrlRef.current = formUrl;
    examDurationRef.current = durationMins * 60;

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
    } catch { console.warn("[media] host camera unavailable"); }

    joinChannel(rid);

    // After channel connects, tell any waiting candidates the host is here
    setTimeout(() => {
      broadcast("host-joined", { from: myIdRef.current });
    }, 1500);
  }, [joinChannel, broadcast]);

  // ── Init candidate ────────────────────────────────────────────────────────
  const initCandidate = useCallback(async (rid: string, name: string, email: string) => {
    intentionalLeave.current = false;
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
    } catch { console.warn("[media] camera unavailable"); }

    joinChannel(rid);

    // Announce presence after channel connects
    setTimeout(() => {
      broadcast("joined", { id: myIdRef.current, name, email });
    }, 1000);
  }, [joinChannel, broadcast]);

  // ── Toggle mic / cam ──────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setLocalStream(s => s);
    if (roleRef.current === "candidate") {
      broadcast("candidate-status", {
        from: myIdRef.current,
        micOn: track.enabled,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: !!screenStreamRef.current,
      });
    }
  }, [broadcast]);

  const toggleCam = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setLocalStream(s => s);
    if (roleRef.current === "candidate") {
      broadcast("candidate-status", {
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: track.enabled,
        screenOn: !!screenStreamRef.current,
      });
    }
  }, [broadcast]);

  // ── Screen share ──────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "monitor" } as MediaTrackConstraints,
      audio: true,
    });

    // Label the screen tracks so the receiver can identify them
    screen.getVideoTracks().forEach(t => { t.contentHint = "detail"; });

    screenStreamRef.current = screen;
    setScreenStream(screen);

    // Add screen tracks to all existing peer connections and renegotiate
    peersRef.current.forEach((pc, peerId) => {
      screen.getTracks().forEach(t => {
        try { pc.addTrack(t, screen); } catch {}
      });
      // Manually trigger renegotiation since onnegotiationneeded may not fire
      if (pc.signalingState === "stable") {
        pc.createOffer().then(offer => {
          return pc.setLocalDescription(offer).then(() => {
            broadcast("offer", { to: peerId, from: myIdRef.current, sdp: pc.localDescription });
          });
        }).catch(console.error);
      }
    });

    if (roleRef.current === "candidate") {
      broadcast("candidate-status", {
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: true,
      });
    }

    screen.getVideoTracks()[0].addEventListener("ended", () => {
      screenStreamRef.current = null;
      setScreenStream(null);
      if (roleRef.current === "candidate") {
        broadcast("candidate-status", {
          from: myIdRef.current,
          micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
          camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
          screenOn: false,
        });
      }
    });
  }, [broadcast]);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setScreenStream(null);
    if (roleRef.current === "candidate") {
      broadcast("candidate-status", {
        from: myIdRef.current,
        micOn: localStreamRef.current?.getAudioTracks()[0]?.enabled ?? false,
        camOn: localStreamRef.current?.getVideoTracks()[0]?.enabled ?? false,
        screenOn: false,
      });
    }
  }, [broadcast]);

  // ── Admit candidate ───────────────────────────────────────────────────────
  const admitCandidate = useCallback((candidateId: string) => {
    broadcast("admitted", { to: candidateId });
    updateCandidates(prev => {
      const next = new Map(prev);
      const c = next.get(candidateId);
      if (c) next.set(candidateId, { ...c, admitted: true });
      return next;
    });
    // Start WebRTC negotiation as initiator
    getOrCreatePeer(candidateId, true);
    const cname = candidatesRef.current.get(candidateId)?.name ?? candidateId;
    addAudit(candidateId, cname, "admitted to exam ✓");
  }, [broadcast, getOrCreatePeer, addAudit, updateCandidates]);

  // ── Remove candidate ──────────────────────────────────────────────────────
  const removeCandidate = useCallback((candidateId: string) => {
    const cname = candidatesRef.current.get(candidateId)?.name ?? candidateId;
    broadcast("removed", { to: candidateId });
    peersRef.current.get(candidateId)?.close();
    peersRef.current.delete(candidateId);
    updateCandidates(prev => {
      const next = new Map(prev);
      next.delete(candidateId);
      return next;
    });
    addAudit(candidateId, cname, "removed by host");
  }, [broadcast, addAudit, updateCandidates]);

  // ── Start exam ────────────────────────────────────────────────────────────
  const startExam = useCallback(() => {
    setExamActive(true);
    setExamSecondsLeft(examDuration);
    examFormUrlRef.current = examFormUrl;
    examDurationRef.current = examDuration;
    broadcast("exam-start", { formUrl: examFormUrl, duration: examDuration });

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setExamSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setExamActive(false);
          broadcast("exam-end", {});
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [examDuration, examFormUrl, broadcast]);

  // ── End exam ──────────────────────────────────────────────────────────────
  const endExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamActive(false);
    setExamSecondsLeft(0);
    broadcast("exam-end", {});
  }, [broadcast]);

  const openForm = useCallback(() => {
    if (examFormUrl) window.open(examFormUrl, "_blank", "noopener,noreferrer");
  }, [examFormUrl]);

  const sendVisibilityEvent = useCallback((hidden: boolean) => {
    if (roleRef.current !== "candidate") return;
    broadcast("visibility", { from: myIdRef.current, hidden });
  }, [broadcast]);

  // ── Candidate exam countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (!examActive || role !== "candidate") return;
    const t = setInterval(() => {
      setExamSecondsLeft(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [examActive, role]);

  // ── Disconnect / cleanup ──────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    intentionalLeave.current = true;
    clearInterval(timerRef.current!);
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    if (roleRef.current === "candidate") {
      broadcast("left", { id: myIdRef.current, name: myNameRef.current });
    }
    channelRef.current?.unsubscribe();
    channelRef.current = null;
    setConnected(false);
    setLocalStream(null);
    setScreenStream(null);
  }, [broadcast]);

  useEffect(() => () => { disconnect(); }, [disconnect]);

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
