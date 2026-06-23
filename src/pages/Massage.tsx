import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Hand, Clock, Heart, Sparkles, Leaf, Wind, ChevronDown } from "lucide-react";
import mas1 from "@/assets/massage/mas1.jpg";
import mas2 from "@/assets/massage/mas2.jpg";
import mas3 from "@/assets/massage/mas3.jpg";

const massageTypes = [
  {
    id: 0,
    name: "Stone Therapy",
    tagline: "The classic unwind",
    description: "Long, flowing strokes melt surface tension and ease the nervous system into profound calm. The perfect introduction to massage therapy.",
    duration: "60 – 90 min",
    focus: "Full body relaxation",
    image: mas1,
  },
  {
    id: 1,
    name: "Deep Tissue",
    tagline: "Release what's held deep",
    description: "Slow, deliberate pressure reaches the deeper layers of muscle and fascia, dissolving chronic knots and restoring natural movement.",
    duration: "60 – 90 min",
    focus: "Muscle tension & chronic pain",
    image: mas2,
  },
  {
    id: 2,
    name: "Aromatherapy",
    tagline: "Scent meets touch",
    description: "Hand-blended essential oils — lavender, eucalyptus, sandalwood — are warmed and worked into the skin, engaging body and mind simultaneously.",
    duration: "60 – 75 min",
    focus: "Stress & emotional balance",
    image: mas3,
  },
  {
    id: 3,
    name: "Sports",
    tagline: "For those who push harder",
    description: "Targeted techniques improve flexibility, speed up recovery, and address overworked muscle groups so you can perform at your best.",
    duration: "60 min",
    focus: "Performance & recovery",
    image: mas1,
  },
];

const benefits = [
  { icon: Heart,    title: "Cortisol Reduction",     desc: "Lowers stress hormones by up to 30% in a single session." },
  { icon: Wind,     title: "Improved Circulation",   desc: "Boosts blood flow, delivering oxygen to every cell." },
  { icon: Sparkles, title: "Pain Relief",             desc: "Triggers natural endorphin release for lasting relief." },
  { icon: Leaf,     title: "Skin Nourishment",        desc: "Premium oils hydrate and soften skin during treatment." },
  { icon: Hand,     title: "Muscle Recovery",         desc: "Reduces DOMS and accelerates post-exercise healing." },
  { icon: Clock,    title: "Better Sleep",            desc: "Deep relaxation resets the sleep cycle naturally." },
];

const Massage = () => {
  const [active, setActive] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const selected    = massageTypes[active];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f3ee]">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={mas1} alt="Massage" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-800/40 to-[#f7f3ee]" />
        </motion.div>

        {/* floating petal particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-rose-200/60"
            style={{ left: `${15 + i * 18}%`, top: `${20 + i * 10}%` }}
            animate={{ y: [0, 30, 0], x: [0, i % 2 === 0 ? 10 : -10, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
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
            className="text-rose-200 font-medium tracking-[0.35em] uppercase text-xs mb-5"
          >
            Peaks Hotel · Spa Services
          </motion.p> */}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-heading text-6xl md:text-8xl font-bold text-white mb-5 leading-none"
          >
            {/* Healing<br /> */}
            <span className="italic font-light text-rose-100">Massage</span>
          </motion.h1>

          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/70 text-lg max-w-xl leading-relaxed mb-10"
          >
            Certified therapists, premium oils, and complete tranquility — tailored entirely to you.
          </motion.p> */}

          {/* <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {["Certified Therapists", "By Appointment", "Private Rooms", "4 Treatments"].map(tag => (
              <span key={tag} className="backdrop-blur-md bg-white/10 border border-white/20 text-white/80 text-sm px-5 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div> */}
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </section>

      {/* ── TREATMENT SELECTOR ── */}
      <section className="bg-[#f7f3ee] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            {/* <p className="text-rose-400 text-xs font-medium tracking-[0.25em] uppercase mb-2">Our treatments</p> */}
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-stone-900">Choose Your Journey</h2>
          </motion.div>

          {/* tab nav */}
          <div className="flex flex-wrap gap-2 mb-10">
            {massageTypes.map((m, i) => (
              <button
                key={m.id}
                onClick={() => setActive(i)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === i
                    ? "bg-stone-900 text-white shadow-lg"
                    : "bg-white/70 text-stone-600 hover:bg-white border border-stone-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* treatment panel */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
          >
            {/* image */}
            <div className="overflow-hidden rounded-3xl h-[420px] md:h-[500px]">
              <motion.img
                key={selected.image}
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={selected.image}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* info */}
            <div className="bg-white rounded-3xl p-10 flex flex-col justify-between shadow-sm">
              <div>
                <p className="text-rose-400 text-xs font-medium tracking-[0.2em] uppercase mb-2">{selected.tagline}</p>
                <h3 className="font-heading text-4xl font-bold text-stone-900 mb-5">{selected.name} Massage</h3>
                <p className="text-stone-500 text-base leading-relaxed mb-8">{selected.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-2xl p-4">
                    <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-stone-800 font-semibold text-sm flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-rose-400" />{selected.duration}
                    </p>
                  </div>
                  <div className="bg-stone-50 rounded-2xl p-4">
                    <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">Best for</p>
                    <p className="text-stone-800 font-semibold text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-rose-400" />{selected.focus}
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="mt-8 w-full bg-stone-900 hover:bg-stone-700 text-white rounded-full" asChild>
                <Link to="/booking">Book {selected.name} Massage</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PHOTO STRIP ── */}
      <section className="bg-[#f7f3ee] py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-3 h-52 md:h-72">
            {[mas1, mas2, mas3].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`overflow-hidden ${i === 1 ? "rounded-3xl" : i === 0 ? "rounded-tl-3xl rounded-bl-3xl" : "rounded-tr-3xl rounded-br-3xl"}`}
              >
                <img src={img} alt="massage" className="w-full h-full object-cover hover:scale-105 transition-transform duration-600" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-[#f7f3ee] py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-rose-400 text-xs font-medium tracking-[0.25em] uppercase mb-2">Why it matters</p>
            <h2 className="font-heading text-4xl font-bold text-stone-900">The Benefits</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl p-6 hover:shadow-md transition-shadow duration-300 border border-stone-100"
              >
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                  <Icon className="h-5 w-5 text-rose-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1.5 text-base">{title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={mas2} alt="Massage" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-800/75 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg"
          >
            <p className="text-rose-300 text-xs font-medium tracking-[0.25em] uppercase mb-4">Reserve your session</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Your Body Deserves This
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Sessions are available daily by appointment. Book your stay and we'll arrange everything.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-stone-900 hover:bg-rose-50 rounded-full px-10 font-semibold" asChild>
                <Link to="/booking">Book a Session</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-10" asChild>
                <Link to="/spa">Full Spa Menu</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Massage;
