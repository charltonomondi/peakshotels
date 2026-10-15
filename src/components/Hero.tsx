import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// ── Hero slides ───────────────────────────────────────────────────────────────
import imgHotel      from "@/assets/hero/hotel.JPG";
import imgBed        from "@/assets/hero/bed.JPG";
import imgBed1       from "@/assets/hero/bed1.JPG";
import imgConference from "@/assets/hero/conference.JPG";
import imgFood       from "@/assets/hero/food.JPG";
import imgFood2      from "@/assets/hero/food2.JPG";
import imgGym        from "@/assets/hero/gym.JPG";
import imgSwimming   from "@/assets/hero/swimming.JPG";
import imgSwim2      from "@/assets/hero/swim2.JPG";
import imgSauna      from "@/assets/hero/sauna.JPG";
import imgMassage    from "@/assets/hero/massage.JPG";
import imgZipline    from "@/assets/hero/zipline.JPG";
import imgBridge     from "@/assets/hero/bridgeinthesky.JPG";
import imgFun        from "@/assets/hero/fun.JPG";
import imgKids       from "@/assets/hero/kidscorner.JPG";
import imgPeaks      from "@/assets/hero/peaks.JPG";
import imgSpillover  from "@/assets/hero/spillover.JPG";
import imgService    from "@/assets/hero/service.JPG";

interface Slide {
  img: string;
  headline: string;
  sub: string;
}

const SLIDES: Slide[] = [
  { img: imgHotel,      headline: "Welcome to Peaks Hotel",        sub: "Luxury at the foot of Mount Kenya" },
  { img: imgPeaks,      headline: "Peaks Hotel Nanyuki",            sub: "Where beauty meets nature" },
  { img: imgBed,        headline: "Luxurious Rooms",                sub: "Unwind in elegantly appointed suites" },
  { img: imgBed1,       headline: "Premium Accommodation",          sub: "Every detail crafted for your comfort" },
  { img: imgConference, headline: "World-Class Conference Facilities", sub: "Productive meetings in inspiring spaces" },
  { img: imgFood,       headline: "Exquisite Dining",               sub: "Savour the finest local and international cuisine" },
  { img: imgFood2,      headline: "Culinary Excellence",            sub: "Fresh flavours, unforgettable moments" },
  { img: imgSwimming,   headline: "Refreshing Swimming Pool",       sub: "Dive into relaxation" },
  { img: imgSwim2,      headline: "Aquatic Leisure",                sub: "Enjoy our stunning outdoor pool" },
  { img: imgGym,        headline: "State-of-the-Art Gym",           sub: "Stay fit on your terms" },
  { img: imgSauna,      headline: "Revitalising Sauna",             sub: "Detox, relax and rejuvenate" },
  { img: imgMassage,    headline: "Spa & Wellness",                 sub: "Indulge in world-class treatments" },
  { img: imgZipline,    headline: "Adventure Awaits",               sub: "Soar above the treetops on our zipline" },
  { img: imgBridge,     headline: "Bridge in the Sky",              sub: "Breathtaking views, unforgettable thrills" },
  { img: imgFun,        headline: "Fun for Everyone",               sub: "Create memories that last a lifetime" },
  { img: imgKids,       headline: "Kids Corner",                    sub: "Safe, fun activities for little explorers" },
  { img: imgSpillover,  headline: "Scenic Grounds",                 sub: "Stunning outdoor spaces to explore" },
  { img: imgService,    headline: "Exceptional Service",            sub: "Your comfort is our passion" },
];

const INTERVAL = 5000; // ms per slide

const Hero = () => {
  const navigate  = useNavigate();
  const todayStr  = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [checkIn,  setCheckIn]  = useState(todayStr);
  const [checkOut, setCheckOut] = useState(todayStr);
  const [guests,   setGuests]   = useState(2);
  const [current,  setCurrent]  = useState(0);
  const [paused,   setPaused]   = useState(false);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => { setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length); setPaused(true); };
  const next = () => { setCurrent(c => (c + 1) % SLIDES.length); setPaused(true); };

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

      {/* ── Sliding images ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.img
          key={current}
          src={SLIDES[current].img}
          alt={SLIDES[current].headline}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/70 pointer-events-none" />

      {/* ── Overlay content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-4 text-center pt-20 pb-10">

        {/* Slide headline + subtext */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65 }}
            className="mb-6"
          >
            <p className="text-accent font-medium tracking-[0.25em] uppercase mb-3 text-xs sm:text-sm">
              Peaks Hotel Nanyuki
            </p>
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
              {SLIDES[current].headline}
            </h1>
            <p className="text-white/85 text-base sm:text-xl max-w-xl mx-auto drop-shadow">
              {SLIDES[current].sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
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
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
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

      {/* ── Prev / Next arrows ───────────────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Dot indicators ───────────────────────────────────────────────────── */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPaused(true); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* ── Scroll hint ──────────────────────────────────────────────────────── */}
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
