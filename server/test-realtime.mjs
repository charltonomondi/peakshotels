import { createClient } from "@supabase/supabase-js";

const URL = "https://ceiycdrnoiekqzfjxmwv.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaXljZHJub2lla3F6Zmp4bXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTA2MjMsImV4cCI6MjA4NTc4NjYyM30.HWAVzN00pCl3Wawh4iOB20V0SUcbc89v2-GRPpXi_8Y";

const sb1 = createClient(URL, KEY);
const sb2 = createClient(URL, KEY);

const ROOM = "interview:PEAKSTEST1";
const h = sb1.channel(ROOM, { config: { broadcast: { self: false } } });
const c = sb2.channel(ROOM, { config: { broadcast: { self: false } } });

let hReady = false, cReady = false;

function tryBroadcast() {
  if (!hReady || !cReady) return;
  console.log("Both subscribed — sending joined...");
  c.send({ type: "broadcast", event: "joined", payload: { id: "c1", name: "Alice", email: "alice@test.com" } })
    .then(r => console.log("send result:", r));
}

h.on("broadcast", { event: "joined" }, ({ payload }) => {
  console.log("HOST RECEIVED joined:", payload.name, "→ BROADCAST WORKS!");
  process.exit(0);
});

h.subscribe(s => {
  console.log("host:", s);
  if (s === "SUBSCRIBED") { hReady = true; tryBroadcast(); }
});

c.subscribe(s => {
  console.log("cand:", s);
  if (s === "SUBSCRIBED") { cReady = true; tryBroadcast(); }
});

setTimeout(() => { console.log("TIMEOUT — broadcast NOT received"); process.exit(1); }, 10000);
