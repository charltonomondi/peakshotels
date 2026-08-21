/**
 * Lobby — landing page for the interview platform.
 * Host creates a meeting; candidates enter name, email, and room code.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Users, Link2, ClipboardCopy, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Lobby() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"host" | "candidate">("candidate");

  // Host fields
  const [hostName, setHostName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [duration, setDuration] = useState("60");
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [copied, setCopied] = useState(false);

  // Candidate fields
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleCreateRoom = () => {
    if (!hostName.trim()) return;
    setGeneratedRoom(generateRoomId());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/interview/candidate/${generatedRoom}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHostJoin = () => {
    if (!generatedRoom || !hostName.trim()) return;
    navigate(`/interview/host/${generatedRoom}`, {
      state: { name: hostName, formUrl, duration: Number(duration) },
    });
  };

  const handleCandidateJoin = () => {
    if (!candidateName.trim() || !roomCode.trim()) return;
    if (!candidateEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    navigate(`/interview/candidate/${roomCode.toUpperCase()}`, {
      state: { name: candidateName, email: candidateEmail.trim() },
    });
  };

  const canJoin = candidateName.trim().length > 0 &&
    roomCode.length >= 4 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
              <Video className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Interview &amp; Exam Platform
            </h1>
            <p className="text-muted-foreground text-sm">
              Secure, monitored online examinations with live video proctoring.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            {(["candidate", "host"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t === "host" ? "Host / Examiner" : "Join as Candidate"}
              </button>
            ))}
          </div>

          {/* Candidate Panel */}
          {tab === "candidate" && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                Your camera and screen will be shared automatically once you join.
                The host will then see your preview and admit you into the exam.
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="candidateName">Full Name</Label>
                <Input
                  id="candidateName"
                  placeholder="John Doe"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="candidateEmail">
                  Email Address <span className="text-muted-foreground font-normal">(used for admission)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="candidateEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={candidateEmail}
                    onChange={e => { setCandidateEmail(e.target.value); setEmailError(""); }}
                    className="pl-9"
                  />
                </div>
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleCandidateJoin}
                disabled={!canJoin}
                className="w-full"
                variant="gold"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Examination
              </Button>
            </motion.div>
          )}

          {/* Host Panel */}
          {tab === "host" && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="hostName">Your Name</Label>
                <Input
                  id="hostName"
                  placeholder="Dr. Jane Smith"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="formUrl">Google Form URL</Label>
                <Input
                  id="formUrl"
                  placeholder="https://forms.gle/..."
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration">Exam Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={300}
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
              </div>

              {!generatedRoom ? (
                <Button
                  onClick={handleCreateRoom}
                  disabled={!hostName.trim()}
                  className="w-full"
                  variant="gold"
                >
                  Create Meeting Room
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Room Code — share with candidates</p>
                    <p className="font-mono text-2xl font-bold text-foreground tracking-widest">
                      {generatedRoom}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full text-xs" onClick={handleCopy}>
                    {copied ? (
                      <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" /> Copied!</>
                    ) : (
                      <><ClipboardCopy className="h-3.5 w-3.5 mr-1.5" /> Copy Candidate Link</>
                    )}
                  </Button>
                  <Button onClick={handleHostJoin} className="w-full" variant="gold">
                    <Link2 className="h-4 w-4 mr-2" />
                    Open Host Dashboard
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Info badges */}
          <div className="grid grid-cols-3 gap-3 mt-6 text-center text-xs text-muted-foreground">
            {["End-to-End Encrypted", "Screen Monitored", "Audit Logged"].map(v => (
              <div key={v} className="bg-secondary rounded-xl py-2.5 px-2 font-medium">
                {v}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
