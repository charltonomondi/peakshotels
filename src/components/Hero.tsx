import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ChevronDown } from "lucide-react";

// ── Video — served from public folder (no Vite hashing) ─────────────────────
// Place chal.mp4 in public/assets/ on the server
const HERO_VIDEO = "/assets/chal.mp4";

// ── Posters — src/assets/hero/ ───────────────────────────────────────────────
import poster1 from "@/assets/hero/p1.png";
import poster2 from "@/assets/hero/p2.png";
import poster3 from "@/assets/hero/p3.png";

const POSTERS = [poster1, poster2, poster3];
const POSTER_DURATION = 5000; // ms each poster stays

type Mode = "video" | "posters";

const Hero = () => {
  const navigate  = useNavigate();
  const todayStr  = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn,  setCheckIn]  = useState(todayStr);
  const [checkOut, setCheckOut] = useState(todayStr);
  const [guests,   setGuests]   = useState(2);

  // Playback state
  const [mode,        setMode]        = useState<Mode>("video");
  const [posterIdx,   setPosterIdx]   = useState(0);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const posterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When video ends → switch to posters
  const handleVideoEnd = useCallback(() => {
    setMode("posters");
    setPosterIdx(0);
  }, []);

  // Advance posters; when all done → back to video
  useEffect(() => {
    if (mode !== "posters") return;

    posterTimer.current = setTimeout(() => {
      if (posterIdx < POSTERS.length - 1) {
        setPosterIdx(i => i + 1);
      } else {
        // All posters shown — restart video
        setMode("video");
        // Seek video to start and play
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }
    }, POSTER_DURATION);

    return () => { if (posterTimer.current) clearTimeout(posterTimer.current); };
  }, [mode, posterIdx]);

  // Ensure video plays when mode switches back to video
  useEffect(() => {
    if (mode === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [mode]);

  const handleCheck = () => {
    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      const d = new Date(inDate); d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split("T")[0]); return;
    }
    navigate(`/booking?${new URLSearchParams({ checkIn, checkOut, guests: String(guests) })}`);
  };

  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-black">

      {/* ── BACKGROUND LAYER ────────────────────────────────── */}

      {/* Video — always mounted so browser can seek/play; hidden during poster phase */}
      <video
        ref={videoRef}
        src={HERO_VIDEO}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          mode === "video" ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Poster — full-viewport, object-contain so the whole poster is visible */}
      <AnimatePresence mode="wait">
        {mode === "posters" && (
          <motion.div
            key={posterIdx}
            className="absolute inset-0 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={POSTERS[posterIdx]}
              alt={`Peaks Hotel Poster ${posterIdx + 1}`}
              className="w-full h-full"
              style={{ objectFit: "contain" }}
              draggable={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark overlay over video only (keeps posters clean) */}
      {mode === "video" && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65 pointer-events-none" />
      )}

      {/* ── POSTER PROGRESS DOTS (shown during poster phase) ── */}
      {mode === "posters" && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {POSTERS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === posterIdx ? "w-6 bg-accent" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── OVERLAY CONTENT — always on top ─────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4 text-center pt-20 pb-10">

        <AnimatePresence>
          {mode === "video" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full max-w-xl"
            >
              <p className="text-accent font-medium tracking-[0.25em] uppercase mb-3 text-xs sm:text-sm">
                Welcome to Peaks Hotel Nanyuki
              </p>
              <p className="text-white/85 text-base sm:text-xl mb-8 max-w-xl">
                Beauty and taste with nature
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
                  <Link to="/booking">Book Now</Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto">
                  <Link to="/rooms">Explore Rooms</Link>
                </Button>
              </div>

              {/* Booking widget — directly below buttons, centered */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 w-full"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />Check-in
                    </label>
                    <input type="date" value={checkIn} min={todayStr}
                      onChange={e => setCheckIn(e.target.value)}
                      className="w-full px-2.5 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />Check-out
                    </label>
                    <input type="date" value={checkOut} min={checkIn || todayStr}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full px-2.5 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />Guests
                    </label>
                    <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                      className="w-full px-2.5 py-2 border border-border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent">
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4+ Guests</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="gold" className="w-full py-2 text-xs" onClick={handleCheck}>
                      Check Availability
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-white/30">
          <ChevronDown className="h-7 w-7" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
