/**
 * Lobby — public-facing candidate join page.
 * Host/Examiner access is via the Admin Console only (not public).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Lobby() {
  const navigate = useNavigate();

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleJoin = () => {
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

  const canJoin =
    candidateName.trim().length > 0 &&
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
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-4">
              <Video className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Join Examination
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your details and the room code provided by your examiner.
            </p>
          </div>

          {/* Join form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4"
          >
            <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              Your camera and screen will be shared once you join. The host will
              admit you into the exam room after verifying your details.
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
                Email Address{" "}
                <span className="text-muted-foreground font-normal">(used for admission)</span>
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
              onClick={handleJoin}
              disabled={!canJoin}
              className="w-full"
              variant="gold"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Examination
            </Button>
          </motion.div>

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
