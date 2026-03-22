import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Users, ChevronDown } from "lucide-react";
import poolVideo from "@/assets/video/Pool.mp4";

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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <video
          src={poolVideo}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        ></video>
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent font-medium tracking-[0.3em] uppercase mb-6"
          >
            Welcome to Peaks Hotel
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            Where Luxury Meets<br />
            <span className="text-gradient-gold">African Majesty</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Experience unparalleled hospitality at the foot of Mount Kenya. 
            Immerse yourself in elegance, nature, and world-class service.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/booking">Book Your Stay</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/rooms">Explore Rooms</Link>
            </Button>
          </motion.div>

          {/* Quick Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-background/95 backdrop-blur-md rounded-xl shadow-elegant p-6 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || todayStr}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="gold" size="xl" className="w-full" onClick={handleCheckAvailability}>
                  Check Availability
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-primary-foreground/60"
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
