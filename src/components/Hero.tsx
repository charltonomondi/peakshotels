import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ChevronDown } from "lucide-react";

// ── Video — served from public folder ────────────────────────────────────────
// Place v1.mp4 in public/assets/ for production deployment
const HERO_VIDEO = "/assets/v1.mp4";

const Hero = () => {
  const navigate  = useNavigate();
  const todayStr  = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn,  setCheckIn]  = useState(todayStr);
  const [checkOut, setCheckOut] = useState(todayStr);
  const [guests,   setGuests]   = useState(2);

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

      {/* Video — loops continuously */}
      <video
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65 pointer-events-none" />

      {/* Overlay content — centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4 text-center pt-20 pb-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-accent font-medium tracking-[0.25em] uppercase mb-3 text-xs sm:text-sm"
        >
          Welcome to Peaks Hotel Nanyuki
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="text-white/85 text-base sm:text-xl mb-8 max-w-xl"
        >
          Beauty and taste with nature
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
        >
          <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
            <Link to="/booking">Book Now</Link>
          </Button>
          <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto">
            <Link to="/rooms">Explore Rooms</Link>
          </Button>
        </motion.div>

        {/* Booking widget */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 sm:p-4 w-full max-w-xl"
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
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-white/40">
          <ChevronDown className="h-7 w-7" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
