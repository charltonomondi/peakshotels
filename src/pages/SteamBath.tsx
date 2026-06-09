import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cloud, Clock, Heart, Droplets, Sparkles, Wind, ChevronDown } from "lucide-react";
import steam1 from "@/assets/steam bath/steam1.jpeg";
import steam2 from "@/assets/steam bath/steam2.jpeg";

const benefits = [
  { icon: Droplets, title: "Deep Detox",           desc: "Moist heat opens pores and promotes intensive sweating, flushing impurities from the skin." },
  { icon: Heart,    title: "Heart Health",          desc: "Gentle warmth dilates blood vessels, improving circulation and supporting cardiovascular wellness." },
  { icon: Cloud,    title: "Respiratory Relief",    desc: "Warm steam soothes airways, easing congestion and supporting lung function." },
  { icon: Sparkles, title: "Skin Rejuvenation",     desc: "Steam hydrates the skin deeply, leaving it soft, supple, and glowing after each session." },
  { icon: Wind,     title: "Stress Dissolution",    desc: "The enveloping warmth triggers a parasympathetic response, melting tension from the inside out." },
  { icon: Clock,    title: "Muscle Recovery",       desc: "Heat penetrates muscle tissue, easing soreness and accelerating post-activity recovery." },
];

const steps = [
  { num: "01", title: "Hydrate first",         desc: "Drink a full glass of water before entering to prepare your body for the heat." },
  { num: "02", title: "Enter & settle",         desc: "Step in, take a seat, and allow your body to gradually adjust to the steam." },
  { num: "03", title: "Breathe deeply",         desc: "Slow, intentional breaths let the warm moisture work through your airways." },
  { num: "04", title: "Session: 15–20 min",     desc: "Optimal session length for therapeutic benefit without overheating." },
  { num: "05", title: "Cool down & rehydrate",  desc: "Step out, cool off naturally, and replenish with infused water provided." },
];

const SteamBath = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#f0f4f6" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={steam1} alt="Steam Bath" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/65 via-teal-900/45 to-[#f0f4f6]" />
        </motion.div>

        {/* rising steam wisps */}
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 rounded-full bg-white/15 blur-2xl"
            style={{ left: `${8 + i * 13}%`, width: `${50 + i * 8}px`, height: `${80 + i * 15}px` }}
            animate={{ y: [0, -(150 + i * 40)], opacity: [0, 0.5, 0], scaleX: [1, 1.4, 0.8] }}
            transition={{ duration: 3.5 + i * 0.4, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
          />
        ))}

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-teal-200 font-medium tracking-[0.35em] uppercase text-xs mb-5"
          >
            Peaks Hotel · Wellness
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="font-heading text-6xl md:text-8xl font-bold text-white leading-none mb-4"
          >
            Steam<br />
            <span className="italic font-light text-teal-100">Bath</span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="w-20 h-px bg-teal-300 mx-auto mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-white/70 text-lg max-w-xl leading-relaxed mb-10"
          >
            Step into a cloud of therapeutic steam and let warmth do what rest alone cannot.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {["40–45°C", "100% Humidity", "8:00 AM – 8:00 PM", "Aromatherapy"].map(tag => (
              <span key={tag} className="backdrop-blur-md bg-white/10 border border-white/20 text-white/80 text-sm px-5 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-24" style={{ background: "#f0f4f6" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-teal-600 text-xs font-medium tracking-[0.25em] uppercase mb-3">The experience</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Moist Heat.<br />Ancient Healing.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-5">
                Unlike the dry heat of a sauna, steam bathing envelops you in 100% humidity at a gentler temperature — allowing the warmth to penetrate deeper while keeping the body hydrated throughout the session.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                We infuse our steam with eucalyptus and peppermint essential oils, turning each session into an aromatherapy experience that clears the mind as it cleanses the body.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[["40–45°C", "Temperature"], ["15–20 min", "Per session"], ["100%", "Humidity"]].map(([val, lbl]) => (
                  <div key={lbl} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                    <p className="font-heading text-2xl font-bold text-teal-600">{val}</p>
                    <p className="text-slate-400 text-xs mt-1">{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-3xl h-[460px] relative"
            >
              <img src={steam2} alt="Steam Bath" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              {/* steam overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SESSION GUIDE ── horizontal steps */}
      <section className="py-16" style={{ background: "white" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-teal-600 text-xs font-medium tracking-[0.25em] uppercase mb-2">Step by step</p>
            <h2 className="font-heading text-4xl font-bold text-slate-900">Your Session Guide</h2>
          </motion.div>

          <div className="relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-teal-100 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {steps.map(({ num, title, desc }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-start md:items-center md:text-center"
                >
                  <div className="w-14 h-14 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mb-4 shrink-0">
                    <span className="text-teal-600 font-bold text-sm">{num}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section className="py-24" style={{ background: "#f0f4f6" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-teal-600 text-xs font-medium tracking-[0.25em] uppercase mb-2">Why it works</p>
            <h2 className="font-heading text-4xl font-bold text-slate-900">Health Benefits</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-slate-100"
              >
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <Icon className="h-5 w-5 text-teal-500" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5 text-base">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={steam1} alt="Steam Bath" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-slate-900/75 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg"
          >
            <p className="text-teal-300 text-xs font-medium tracking-[0.25em] uppercase mb-4">Book your session</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Step Into the Steam
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Available daily to all hotel guests. Reserve your session in advance for guaranteed access.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white border-0 rounded-full px-10" asChild>
                <Link to="/booking">Book Your Stay</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-10" asChild>
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

export default SteamBath;
