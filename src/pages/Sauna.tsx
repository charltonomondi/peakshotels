import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Flame, Clock, Heart, Droplets, Shield, Wind } from "lucide-react";
import WhatsAppBookingModal from "@/components/WhatsAppBookingModal";
import sauna  from "@/assets/sauna/sauna.jpg";
import sauna1 from "@/assets/sauna/sauna1.jpg";
import sauna2 from "@/assets/sauna/sauna2.jpg";

const benefits = [
  { icon: Heart,    title: "Circulation Boost",  desc: "Heat dilates blood vessels, improving cardiovascular health and reducing blood pressure." },
  { icon: Droplets, title: "Deep Detox",          desc: "Intense sweating flushes toxins and deeply cleanses pores for radiant skin." },
  { icon: Wind,     title: "Stress Relief",       desc: "Heat triggers endorphin release, melting away tension after a long day." },
  { icon: Shield,   title: "Immune Support",      desc: "Regular sessions stimulate white blood cell production and strengthen immunity." },
  { icon: Flame,    title: "Muscle Recovery",     desc: "Therapeutic heat loosens tight muscles and accelerates post-exercise recovery." },
  { icon: Clock,    title: "Better Sleep",        desc: "The cool-down after sauna signals deep sleep onset — wake up truly rested." },
];

const Sauna = () => {
  const [waOpen, setWaOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0e0a07]">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={sauna} alt="Sauna" className="w-full h-full object-cover" />
          {/* ember-warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-orange-950/40 to-[#0e0a07]" />
        </motion.div>

        {/* heat shimmer particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 rounded-full bg-orange-400/20 blur-xl"
            style={{ left: `${10 + i * 15}%`, width: `${40 + i * 10}px`, height: `${40 + i * 10}px` }}
            animate={{ y: [0, -120 - i * 30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3 + i * 0.5, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          {/* <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-orange-400 font-medium tracking-[0.3em] uppercase text-sm mb-5"
          >
            Peaks Hotel · Wellness
          </motion.p> */}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4 leading-none"
          >
            Sauna
          </motion.h1>

          {/* temperature badge */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-px h-8 bg-orange-500/50" />
            <span className="text-orange-300 text-2xl font-bold">25 – 40°C</span>
            <div className="w-px h-8 bg-orange-500/50" />
          </motion.div> */}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-white/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Ancient Finnish tradition, perfected at altitude. Step in, feel the heat, and let everything else fall away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {["Traditional Finnish", "8:00 AM – 8:00 PM", "Private Sessions"].map(tag => (
              <span key={tag} className="backdrop-blur-md bg-white/5 border border-orange-500/30 text-orange-200 text-sm px-4 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* scroll cue — animated flame flicker */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <Flame className="h-6 w-6 text-orange-400" />
        </motion.div>
      </section>

      {/* ── STAGGERED SPLIT ── */}
      <section className="bg-[#0e0a07] py-24">
        <div className="container mx-auto px-4 space-y-6">
          {/*Commented out textual sections below for reference. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-3xl h-[420px]"
            >
              <img src={sauna1} alt="Sauna interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-3xl h-[420px]"
            >
              <img src={sauna2} alt="Sauna session" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>

          {/*
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#1a1108] border border-orange-900/30 rounded-3xl p-10 flex flex-col justify-center"
            >
              <p className="text-orange-500 text-xs font-medium tracking-[0.25em] uppercase mb-3">The Experience</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                Heat That Goes Deeper Than the Surface
              </h2>
              <p className="text-white/60 leading-relaxed mb-5">
                Our sauna is built from hand-selected Nordic spruce with a continuously heated kiuas — the traditional Finnish stove. The dry heat sits between 80 and 90°C, penetrating muscle tissue and promoting the kind of relaxation no massage can replicate.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                We add löyly — a ladle of water over the stones — infused with eucalyptus and birch essential oils, filling the room with therapeutic steam that opens airways and clears the mind.
              </p>
              <div className="flex gap-6">
                <div className="w-px bg-orange-900/40" />
                <div>
                  <p className="text-orange-400 font-bold text-2xl">30 min</p>
                  <p className="text-white/40 text-xs mt-0.5">Per session</p>
                </div>
                <div className="w-px bg-orange-900/40" />
              </div>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-orange-950 to-[#1a1108] border border-orange-800/20 rounded-3xl p-10 flex flex-col justify-center order-2 lg:order-1"
            >
              <p className="text-orange-500 text-xs font-medium tracking-[0.25em] uppercase mb-3">Your Session</p>
              <h2 className="font-heading text-3xl font-bold text-white mb-6">What to Expect</h2>
              {[
                "Arrive 10 minutes early — towels and robes provided",
                "Begin with a warm shower to prepare your skin",
                "Enter the sauna and let the heat work for 15–20 minutes",
                "Cool down with a cold plunge or outdoor air break",
                "Repeat 2–3 rounds for maximum benefit",
                "Rehydrate with cold infused water provided",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-white/60 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </motion.div>

          */}
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section className="bg-[#0e0a07] py-8 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-orange-500 text-xs font-medium tracking-[0.25em] uppercase mb-2">Why sauna?</p>
            <h2 className="font-heading text-4xl font-bold text-white">Health Benefits</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-[#1a1108] border border-orange-900/30 rounded-2xl p-6 hover:border-orange-500/40 hover:bg-[#211508] transition-all duration-300"
              >
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Icon className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-1.5">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── full-bleed dark with glow */}
      <section className="relative py-32 overflow-hidden bg-[#0e0a07]">
        <div className="absolute inset-0">
          <img src={sauna} alt="Sauna" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a07] via-orange-950/60 to-[#0e0a07]" />
        </div>
        {/* amber glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Flame className="h-10 w-10 text-orange-500 mx-auto mb-6" />
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5">
              Feel the Heat
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto mb-10">
              Sessions available daily. Book your stay and reserve private sauna time for the ultimate unwind.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-500 text-white border-0 rounded-full px-10" onClick={() => setWaOpen(true)}>
                Book a Session
              </Button>
              {/* <Button size="lg" variant="outline" className="border-orange-800 text-blue hover:bg-orange-950 rounded-full px-10" asChild>
                <Link to="/facilities">All Facilities</Link>
              </Button> */}
            </div>
          </motion.div>
        </div>
      </section>

      <WhatsAppBookingModal open={waOpen} onClose={() => setWaOpen(false)} service="Sauna Session" />
      <Footer />
    </div>
  );
};

export default Sauna;
