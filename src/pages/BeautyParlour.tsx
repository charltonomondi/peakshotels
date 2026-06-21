import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Clock, Scissors, Palette, Heart, Star, ChevronDown } from "lucide-react";
import beauty1 from "@/assets/beauty/beauty1.jpg";
import beauty2 from "@/assets/beauty/beauty2.jpg";

const services = [
  {
    icon: Scissors,
    name: "Hair Styling",
    tagline: "Cut. Colour. Transform.",
    description: "Expert cuts, balayage, blow-dries, and treatments crafted by our senior stylists using premium salon products.",
    duration: "30 – 120 min",
    image: beauty1,
  },
  {
    icon: Palette,
    name: "Facial Treatments",
    tagline: "Reveal your glow.",
    description: "Deep-cleansing, hydrating, and anti-ageing facials using luxury skincare formulations tailored to your skin type.",
    duration: "60 – 90 min",
    image: beauty2,
  },
  {
    icon: Sparkles,
    name: "Manicure & Pedicure",
    tagline: "Perfection at every tip.",
    description: "Classic, gel, or nail-art finishes accompanied by a relaxing hand and foot treatment using nourishing oils.",
    duration: "45 – 60 min",
    image: beauty1,
  },
  {
    icon: Heart,
    name: "Skin Care",
    tagline: "Healthy skin starts here.",
    description: "Bespoke skin consultations followed by targeted treatments for radiance, clarity, and lasting luminosity.",
    duration: "45 – 75 min",
    image: beauty2,
  },
];

const marqueeItems = ["Hair Styling", "Facials", "Manicure", "Pedicure", "Skin Care", "Colour Treatment", "Blow Dry", "Eyebrow Shaping"];

const BeautyParlour = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const leftY   = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const rightY  = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#faf7f4" }}>
      <Navbar />

      {/* ── SPLIT HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden flex">
        {/* left half — image 1 */}
        <motion.div style={{ y: leftY }} className="w-1/2 h-full relative overflow-hidden">
          <img src={beauty1} alt="Beauty" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        </motion.div>

        {/* right half — image 2 */}
        <motion.div style={{ y: rightY }} className="w-1/2 h-full relative overflow-hidden">
          <img src={beauty2} alt="Beauty" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
        </motion.div>

        {/* centre overlay — text */}
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          {/* frosted glass card */}
          <div className="backdrop-blur-md bg-black/25 border border-white/20 rounded-3xl px-10 py-12 max-w-2xl w-full mx-4">
            {/* <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-rose-200 font-medium tracking-[0.35em] uppercase text-xs mb-5"
            >
              Peaks Hotel · Beauty & Wellness
            </motion.p> */}

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9 }}
              className="font-heading text-5xl md:text-7xl font-bold text-white mb-4 leading-none"
            >
              Beauty<br />
              <span className="italic font-light text-rose-100">Parlour</span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="w-16 h-px bg-rose-300 mx-auto mb-5"
            />

            {/* <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-white/75 text-base md:text-lg mb-8 leading-relaxed"
            >
              Where expertise meets elegance — beauty treatments crafted exclusively for you.
            </motion.p> */}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {["9:00 AM – 7:00 PM", "By Appointment"].map(tag => (
                <span key={tag} className="bg-white/15 border border-white/25 text-white/80 text-xs px-4 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="bg-rose-900 py-4 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-rose-200 text-sm font-medium tracking-[0.15em] uppercase flex items-center gap-4">
              <Star className="h-3 w-3 fill-rose-300 text-rose-300 shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── INTRO SPLIT ── */}
      {/* <section className="py-24" style={{ background: "#faf7f4" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-rose-400 text-xs font-medium tracking-[0.25em] uppercase mb-3">Our philosophy</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                Your Beauty,<br />Our Craft
              </h2>
              <p className="text-stone-500 text-base leading-relaxed mb-5">
                Every treatment at our beauty parlour begins with a personal consultation. We take the time to understand your unique features, lifestyle, and goals before recommending a service — because beauty is never one-size-fits-all.
              </p>
              <p className="text-stone-500 text-base leading-relaxed mb-8">
                Our certified specialists use only curated, professional-grade products — chosen for their efficacy and the indulgent sensory experience they deliver.
              </p>
              <div className="flex gap-8">
                {[["4+", "Treatments"], ["100%", "Certified Staff"], ["9–7", "Open Daily"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="font-heading text-3xl font-bold text-rose-500">{val}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl h-[480px]">
                <img src={beauty1} alt="Beauty Parlour" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">Premium Services</p>
                  <p className="text-stone-400 text-xs">Luxury at every visit</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* ── SERVICES HOVER GRID ── */}
      <section className="py-8 pb-24" style={{ background: "#faf7f4" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-rose-400 text-xs font-medium tracking-[0.25em] uppercase mb-2">What we offer</p>
            <h2 className="font-heading text-4xl font-bold text-stone-900">Our Services</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(({ icon: Icon, name, tagline, description, duration, image }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onHoverStart={() => setHoveredService(i)}
                onHoverEnd={() => setHoveredService(null)}
                className="group relative overflow-hidden rounded-3xl h-64 cursor-default"
              >
                {/* background image */}
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* default overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-rose-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* default content */}
                <div className="absolute bottom-0 left-0 p-7 transition-opacity duration-300 group-hover:opacity-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-rose-300" />
                    <p className="text-rose-200 text-xs tracking-widest uppercase">{tagline}</p>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white">{name}</h3>
                </div>

                {/* hover content */}
                <div className="absolute inset-0 flex flex-col justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">{name}</h3>
                  <p className="text-rose-100/80 text-sm leading-relaxed mb-2">{description}</p>
                  <div className="flex items-center gap-2 text-rose-200 text-sm">
                    <Clock className="h-4 w-4" />
                    {duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED IMAGE QUOTE ── */}
      {/* <section className="relative h-72 md:h-96 overflow-hidden">
        <img src={beauty2} alt="Beauty" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/85 via-rose-900/60 to-transparent" />
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="absolute inset-0 flex items-center"
        >
          <div className="container mx-auto px-4">
            <p className="text-rose-200 text-xs tracking-[0.3em] uppercase mb-3">Our promise</p>
            <blockquote className="font-heading text-3xl md:text-5xl font-bold text-white max-w-xl leading-tight">
              "Leave feeling more beautiful than when you arrived."
            </blockquote>
          </div>
        </motion.div>
      </section> */}

      {/* ── CTA ── */}
      <section className="pt-0 pb-6" style={{ background: "#faf7f4" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-6 w-6 text-rose-500" />
            </div>
            {/* <h2 className="font-heading text-4xl md:text-5xl font-bold text-stone-900 mb-5">
              Ready to Glow?
            </h2>
            <p className="text-stone-500 text-lg mb-10 leading-relaxed">
              Book your stay at Peaks Hotel and reserve your beauty treatment in advance. Our specialists will be expecting you.
            </p> */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-rose-600 hover:bg-rose-500 text-white border-0 rounded-full px-10 shadow-lg shadow-rose-200" asChild>
                <Link to="/booking">Book</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-10" asChild>
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

export default BeautyParlour;
