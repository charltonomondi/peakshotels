import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ChevronDown } from "lucide-react";
const HERO_VIDEO = "/assets/vid1-.mp4";

const Hero = () => {
  const navigate = useNavigate();
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(todayStr);
  const [guests, setGuests] = useState<number>(2);

  const handleCheckAvailability = () => {
    if (!checkIn || !checkOut) return;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return;
    if (outDate <= inDate) {
      // ensure at least one night
      const next = new Date(inDate);
      next.setDate(inDate.getDate() + 1);
      setCheckOut(next.toISOString().split("T")[0]);
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    }).toString();
    navigate(`/booking?${params}`);
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <video src={HERO_VIDEO} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      <div className="relative z-10 container mx-auto px-4 pt-16 md:pt-20 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-accent font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 text-xs md:text-sm">
            Welcome to Peaks Hotel Nanyuki
          </motion.p>
          {/* <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight">
            Beauty and Taste,<br />
            <span className="text-gradient-gold">with Nature</span>
          </motion.h1> */}
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary-foreground/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-10 px-2">
            Beauty and taste with nature
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8 md:mb-16 px-4 sm:px-0">
            <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/booking">Book Your Stay</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/rooms">Explore Rooms</Link>
            </Button>
          </motion.div>

          {/* Quick Booking Form */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-background/95 backdrop-blur-md rounded-xl shadow-elegant p-4 md:p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />Check-in
                </label>
                <input type="date" value={checkIn} min={todayStr} onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />Check-out
                </label>
                <input type="date" value={checkOut} min={checkIn || todayStr} onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />Guests
                </label>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="gold" className="w-full py-2.5 text-sm" onClick={handleCheckAvailability}>
                  Check Availability
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-primary-foreground/60">
          <ChevronDown className="h-6 w-6 md:h-8 md:w-8" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
