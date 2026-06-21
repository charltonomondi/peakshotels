import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Waves, Clock, Sun, Thermometer, Users, ChevronDown } from "lucide-react";
import swim1 from "@/assets/swimming/swim1.jpg";
import swim2 from "@/assets/swimming/swim2.jpg";
import swim3 from "@/assets/swimming/swim3.jpg";

const stats = [
  { value: "17m", label: "Pool Length" },
  { value: "6:00", label: "Opens Daily" },
  { value: "27°C", label: "Water Temp" },
  { value: "24/7", label: "Lifeguard" },
];

const features = [
  { icon: Waves,       title: "Lap Swimming",       desc: "Multiple lanes for serious swimmers and leisurely floats alike." },
  { icon: Sun,         title: "Sun Deck",            desc: "Poolside loungers with umbrellas and panoramic mountain views." },
  { icon: Thermometer, title: "Heated Year-Round",   desc: "Temperature-controlled water ensures comfort in every season." },
  { icon: Users,       title: "Swimming Lessons",    desc: "Certified instructors available for all ages and skill levels." },
];

const Swimming = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={swim1} alt="Swimming Pool" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/70 via-teal-900/50 to-black/80" />
        </motion.div>

        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            initial={{ width: 100, height: 100, opacity: 0.6 }}
            animate={{ width: 700, height: 700, opacity: 0 }}
            transition={{ duration: 4, delay: i * 1.3, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sky-300 font-medium tracking-[0.3em] uppercase text-sm mb-4"
          >
            Heated Swimming Pool
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none"
          >
            Dive In
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-24 h-0.5 bg-sky-400 mx-auto mb-6"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-12"
          >
            {/* Crystal-clear waters framed by Mount Kenya's peaks — swim, float, and unwind in a pool designed for pure luxury. */}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {stats.map(s => (
              <div key={s.label} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-5 py-2 flex items-center gap-2">
                <span className="text-sky-300 font-bold text-lg">{s.value}</span>
                <span className="text-white/70 text-sm">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <ChevronDown className="h-7 w-7 text-white/50" />
        </motion.div>
      </section>

      {/* WAVE DIVIDER */}
      <div className="relative bg-background overflow-hidden -mt-1">
        <svg viewBox="0 0 1440 80" className="w-full fill-sky-900/70" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* BENTO PHOTO GRID */}
      <section className="py-4 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 grid-rows-2 gap-3 h-[500px] md:h-[600px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="col-span-12 md:col-span-7 row-span-2 overflow-hidden rounded-3xl relative group"
            >
              <img src={swim2} alt="Pool" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="backdrop-blur-md bg-black/30 text-white text-sm px-4 py-1.5 rounded-full border border-white/20">
                  Outdoor Pool
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="col-span-12 md:col-span-5 row-span-1 overflow-hidden rounded-3xl relative group"
            >
              <img src={swim3} alt="Pool" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="col-span-12 md:col-span-5 row-span-1 rounded-3xl bg-gradient-to-br from-sky-500 to-teal-600 flex flex-col items-center justify-center p-8 text-white"
            >
              <Waves className="h-10 w-10 mb-3 opacity-80" />
              <p className="font-heading text-2xl font-bold mb-1">Open Daily</p>
              <p className="text-sky-100 text-sm">6:00 AM – 6:00 PM</p>
              <p className="text-sky-200 text-xs mt-2">Heated · Lifeguard on duty</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-sky-500 font-medium tracking-[0.2em] uppercase text-sm mb-2">What's included</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Pool Experience</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card border border-border rounded-3xl p-7 overflow-hidden hover:border-sky-400/50 transition-colors duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-teal-500/0 group-hover:from-sky-500/5 group-hover:to-teal-500/10 transition-all duration-500 rounded-3xl" />
                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-sky-500/20 transition-colors">
                  <Icon className="h-6 w-6 text-sky-500" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={swim1} alt="Pool" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-900/90 via-teal-900/80 to-black/70" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <p className="text-sky-300 font-medium tracking-[0.2em] uppercase text-sm mb-4">Ready to swim?</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              The Pool is Waiting for You
            </h2>
            <p className="text-white/70 mb-8 text-lg leading-relaxed">
              Open to all hotel guests. Swimming lessons and aqua fitness sessions available on request.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-sky-500 hover:bg-sky-400 text-white border-0 rounded-full px-8" asChild>
                <Link to="/booking">Book Your Stay</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-8" asChild>
                <Link to="/facilities">All Facilities</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Swimming;
