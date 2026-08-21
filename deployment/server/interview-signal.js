/**
 * Interview Signaling Server
 * WebSocket-based signaling for the WebRTC interview platform.
 *
 * Privacy model enforced at server level:
 *  - Only the host receives offer/answer/ICE relay for ALL candidates.
 *  - Candidates NEVER receive relayed messages from other candidates.
 *  - Candidates only exchange signaling with the host.
 *
 * Run: node interview-signal.js (port 4000)
 */

import { WebSocketServer } from "ws";
import { createServer } from "http";

const PORT = process.env.INTERVIEW_WS_PORT || 4000;

const server = createServer();
const wss = new WebSocketServer({ server });

// rooms: Map<roomId, Map<clientId, { ws, role, name }>>
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId);
}

function getHost(room) {
  for (const [, peer] of room) {
    if (peer.role === "host") return peer;
  }
  return null;
}

function broadcast(room, message, excludeId = null) {
  for (const [id, peer] of room) {
    if (id !== excludeId && peer.ws.readyState === 1) {
      peer.ws.send(JSON.stringify(message));
    }
  }
}

function send(peer, message) {
  if (peer?.ws?.readyState === 1) {
    peer.ws.send(JSON.stringify(message));
  }
}

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const roomId = url.searchParams.get("room") || "default";
  const clientId = url.searchParams.get("id") || Math.random().toString(36).slice(2);
  const role = url.searchParams.get("role") || "candidate";
  const name = decodeURIComponent(url.searchParams.get("name") || "Unknown");
  const email = decodeURIComponent(url.searchParams.get("email") || "");

  const room = getRoom(roomId);
  room.set(clientId, { ws, role, name, email });

  console.log(`[${roomId}] ${role} "${name}" <${email}> (${clientId}) connected. Room size: ${room.size}`);

  // Notify host that a new candidate joined
  if (role === "candidate") {
    const host = getHost(room);
    if (host) {
      send(host, { type: "joined", id: clientId, name, email });
    }
  }

  // If host just joined, send them all existing candidates
  if (role === "host") {
    for (const [id, peer] of room) {
      if (id !== clientId && peer.role === "candidate") {
        send({ ws }, { type: "joined", id, name: peer.name, email: peer.email ?? "" });
      }
    }
  }

  ws.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const { type, to } = msg;

    // ── Signaling messages (offer/answer/ice) ──────────────────────────────
    // Enforce: candidates can only signal the host; host can signal any candidate.
    if (type === "offer" || type === "answer" || type === "ice") {
      const currentPeer = room.get(clientId);
      if (!currentPeer) return;

      if (currentPeer.role === "candidate") {
        // Candidate → host only
        const host = getHost(room);
        send(host, { ...msg, from: clientId });
      } else if (currentPeer.role === "host" && to) {
        // Host → specific candidate only
        const target = room.get(to);
        send(target, { ...msg, from: clientId });
      }
      return;
    }

    // ── Host admits a candidate ────────────────────────────────────────────
    if (type === "admit" && to) {
      const currentPeer = room.get(clientId);
      if (currentPeer?.role !== "host") return; // only host can admit
      const target = room.get(to);
      send(target, { type: "admitted" });
      return;
    }

    // ── Host removes a candidate ───────────────────────────────────────────
    if (type === "remove" && to) {
      const currentPeer = room.get(clientId);
      if (currentPeer?.role !== "host") return;
      const target = room.get(to);
      send(target, { type: "removed" });
      room.delete(to);
      return;
    }

    // ── Candidate status update ────────────────────────────────────────────
    if (type === "candidate-status") {
      const host = getHost(room);
      send(host, { ...msg, from: clientId });
      return;
    }

    // ── Candidate visibility event (tab switch) ────────────────────────────
    if (type === "visibility") {
      const host = getHost(room);
      send(host, { ...msg, from: clientId });
      return;
    }

    // ── Exam start/end — host broadcasts to all candidates ─────────────────
    if (type === "exam-start" || type === "exam-end") {
      const currentPeer = room.get(clientId);
      if (currentPeer?.role !== "host") return;
      for (const [id, peer] of room) {
        if (id !== clientId && peer.role === "candidate") {
          send(peer, msg);
        }
      }
      return;
    }
  });

  ws.on("close", () => {
    const peer = room.get(clientId);
    console.log(`[${roomId}] ${role} "${name}" disconnected`);
    room.delete(clientId);
    if (room.size === 0) rooms.delete(roomId);

    // Notify host that a candidate left
    if (role === "candidate") {
      const host = getHost(room);
      send(host, { type: "left", id: clientId, name });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Interview signaling server running on ws://localhost:${PORT}`);
});
