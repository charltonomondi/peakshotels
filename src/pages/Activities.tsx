import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mountain, Clock, Users, Check, X, ChevronDown, ArrowRight, MapPin, Shield, Zap } from "lucide-react";

// Hero & key images
import heroImg        from "@/assets/outdoor/outdoorgym.png";
import ngareNdare     from "@/assets/outdoor/Ngare Ndare.jpg";
import greatEscape    from "@/assets/outdoor/great escape.jpg";
import greatescape2   from "@/assets/outdoor/greatescape.jpg";
import spidersweb     from "@/assets/outdoor/spidersweb.jpg";
import magicboots     from "@/assets/outdoor/magicboots.jpg";
import berlingwall    from "@/assets/outdoor/berlingwall.jpg";
import situps         from "@/assets/outdoor/situps.jpg";
import inclinedsitups from "@/assets/outdoor/inclinedsitups.jpg";
import stepups        from "@/assets/outdoor/stepups.jpg";
import eventsgrounds  from "@/assets/outdoor/eventsgrounds.jpg";
import eventsgrounds1 from "@/assets/outdoor/Eventsgrounds1.jpg";
import garden9        from "@/assets/outdoor/garden9.jpg";
import outdoor2       from "@/assets/outdoor/Outdoorcompressed.jpg";
import pxl1  from "@/assets/outdoor/PXL_20240823_125947232.jpg";
import pxl2  from "@/assets/outdoor/PXL_20240823_132156364 (1).jpg";
import pxl3  from "@/assets/outdoor/PXL_20240823_133525309.jpg";
import pxl4  from "@/assets/outdoor/PXL_20240920_152600945.jpg";
import pxl5  from "@/assets/outdoor/PXL_20240920_152651903.jpg";
import pxl6  from "@/assets/outdoor/PXL_20240920_154428686.jpg";
import pxl7  from "@/assets/outdoor/PXL_20240920_163745814.jpg";
import pxl8  from "@/assets/outdoor/PXL_20240920_170139118.jpg";
import pxl9  from "@/assets/outdoor/PXL_20240920_170328202.jpg";
import img1  from "@/assets/outdoor/IMG_20240727_111207_652.jpg";
import img2  from "@/assets/outdoor/IMG_20240727_112106_015.jpg";
import img3  from "@/assets/outdoor/IMG_20240727_112704_085.jpg";
import img4  from "@/assets/outdoor/IMG_20240819_122707.jpg";
import img5  from "@/assets/outdoor/IMG_20240819_123612.jpg";

type Difficulty = "Easy" | "Moderate" | "Challenging" | "Varies";

const difficultyColor: Record<Difficulty, string> = {
  Easy:        "bg-green-600 text-white",
  Moderate:    "bg-amber-500 text-white",
  Challenging: "bg-red-600 text-white",
  Varies:      "bg-slate-600 text-white",
};

const activities: {
  image: string; name: string; tagline: string;
  description: string; duration: string; difficulty: Difficulty; group: string;
}[] = [
  { image: ngareNdare,   name: "Mountain Hiking",     tagline: "Into the wild",         description: "Guided trails through indigenous forests to panoramic Mount Kenya viewpoints.",       duration: "Half – Full day", difficulty: "Moderate",    group: "All ages" },
  { image: greatEscape,  name: "Great Escape",         tagline: "Push your limits",      description: "A full obstacle course that tests agility, strength, and teamwork across multi-stage challenges.", duration: "2 – 3 hrs",       difficulty: "Challenging", group: "12+" },
  { image: spidersweb,   name: "Spider's Web",         tagline: "Teamwork conquers all", description: "Navigate through a rope web without touching the sides — a true test of coordination and trust.", duration: "30 – 45 min",     difficulty: "Moderate",    group: "All" },
  { image: magicboots,   name: "Magic Boots",          tagline: "Bounce to new heights", description: "Strap into spring-loaded stilts and bounce across our adventure zone.",                duration: "1 – 2 hrs",       difficulty: "Moderate",    group: "All ages" },
  { image: berlingwall,  name: "Berlin Wall",          tagline: "Conquer the wall",      description: "Scale a vertical timber wall using only teamwork — no footholds, only each other.",   duration: "30 – 45 min",     difficulty: "Challenging", group: "12+" },
  { image: situps,       name: "Outdoor Fitness",      tagline: "Train in fresh air",    description: "A circuit of outdoor fitness stations — sit-ups, step-ups, incline work, and more.",  duration: "45 – 60 min",     difficulty: "Varies",      group: "All" },
  { image: outdoor2,     name: "Wildlife Safari",      tagline: "Kenya's wild heart",    description: "Day excursions to Ol Pejeta Conservancy and Ngare Ndare Forest.",                      duration: "Full day",         difficulty: "Easy",        group: "All ages" },
  { image: garden9,      name: "Garden & Nature Walk", tagline: "Slow down, look up",    description: "A guided stroll through the hotel's landscaped grounds learning about local flora.",  duration: "1 – 2 hrs",        difficulty: "Easy",        group: "All ages" },
];

const packages = [
  { name: "Single Pass",      price: "KES 500",   popular: false,
    features: ["1 activity", "Safety gear", "Supervision", "30–60 min"],
    excluded: ["Multiple activities", "Refreshments"] },
  { name: "Half Day",          price: "KES 1,500", popular: true,
    features: ["3 activities", "Safety gear", "Guide", "4 hrs", "Water included", "Locker"],
    excluded: ["Lunch"] },
  { name: "Full Day",          price: "KES 2,500", popular: false,
    features: ["Unlimited activities", "Safety gear", "Guide", "Full day", "Lunch", "Water", "Locker", "Towel"],
    excluded: [] },
  { name: "Group (10+)",       price: "KES 2,000", popular: false,
    features: ["Unlimited activities", "Dedicated guide", "Full day", "Lunch", "Team building", "Group photo", "Refreshments"],
    excluded: [] },
];

const galleryAll = [
  pxl1, pxl2, pxl3, pxl4, pxl5, pxl6, pxl7, pxl8, pxl9,
  img1, img2, img3, img4, img5,
  eventsgrounds, eventsgrounds1, inclinedsitups, stepups, greatescape2,
];

const Activities = () => {
  const [lightbox, setLightbox]           = useState<string | null>(null);
  const [showAll, setShowAll]             = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY      = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const displayed = showAll ? galleryAll : galleryAll.slice(0, 12);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#0d1a0f" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={heroImg} alt="Outdoor activities" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-green-950/40 to-[#0d1a0f]" />
        </motion.div>

        {/* tree-line texture overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d1a0f] to-transparent" />

        <motion.div style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4">
          {/* <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-5">
            <MapPin className="h-4 w-4 text-green-400" />
            <span className="text-green-300 font-medium tracking-[0.3em] uppercase text-xs">Nanyuki · Kenya</span>
          </motion.div> */}

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
            className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-none mb-4">
            Step<br /><span className="text-green-400 italic font-light">Outside</span>
          </motion.h1>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.5 }}
            className="w-20 h-px bg-green-500 mx-auto mb-6" />

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="text-white/70 text-lg max-w-2xl leading-relaxed mb-10">
            Adventure, nature, and open air — all on the doorstep of Mount Kenya. Guided experiences for every level.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Mountain, text: "8+ Activities" },
              { icon: Shield,   text: "Safety Certified" },
              { icon: Users,    text: "All Ages Welcome" },
              { icon: Zap,      text: "Year-Round" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="backdrop-blur-md bg-white/8 border border-green-700/40 text-green-200 text-sm px-5 py-2 rounded-full flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />{text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </section>

      {/* ── ACTIVITIES GRID ── */}
      <section className="py-24" style={{ background: "#0d1a0f" }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <p className="text-green-500 text-xs font-medium tracking-[0.25em] uppercase mb-2">What awaits you</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white">Available Activities</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activities.slice(0, 3).map(({ image, name, tagline, description, duration, difficulty, group }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="group relative overflow-hidden rounded-2xl h-80 cursor-default">
                <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {/* default gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-green-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-350" />

                {/* difficulty badge */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${difficultyColor[difficulty]}`}>
                    {difficulty}
                  </span>
                </div>

                {/* default content */}
                <div className="absolute bottom-0 left-0 p-5 group-hover:opacity-0 transition-opacity duration-200">
                  <p className="text-green-400 text-xs uppercase tracking-wider mb-1">{tagline}</p>
                  <h3 className="font-heading text-xl font-bold text-white">{name}</h3>
                </div>

                {/* hover content */}
                <div className="absolute inset-0 flex flex-col justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-350">
                  <h3 className="font-heading text-xl font-bold text-white mb-2">{name}</h3>
                  <p className="text-green-100/80 text-sm leading-relaxed mb-4">{description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-green-200">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{group}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MASONRY PHOTO WALL ── */}
      <section className="py-8" style={{ background: "#0d1a0f" }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
            <p className="text-green-500 text-xs font-medium tracking-[0.25em] uppercase mb-2">In action</p>
            <h2 className="font-heading text-4xl font-bold text-white">Adventure Gallery</h2>
          </motion.div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {galleryAll.slice(0, 12).map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => setLightbox(img)}>
                <img src={img} alt={`Activity ${i + 1}`}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500 group-hover:brightness-110" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-green-700 text-green-300 hover:bg-green-900 rounded-full px-8" asChild>
              <Link to="/gallery?category=Outdoor">
                View All in Gallery <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      {/* <section className="py-24" style={{ background: "#111a12" }}>
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-green-500 text-xs font-medium tracking-[0.25em] uppercase mb-2">Pricing</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Adventure Packages</h2>
            <p className="text-white/40 max-w-lg mx-auto">All packages include safety equipment and professional supervision.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 ${
                  pkg.popular
                    ? "border-green-500 bg-green-950/50 ring-1 ring-green-500"
                    : "border-green-900/40 bg-[#162018]"
                }`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-5 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold text-white mb-1">{pkg.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-green-400">{pkg.price}</span>
                  <span className="text-white/40 text-sm"> / person</span>
                </div>
                <div className="space-y-2.5 mb-8">
                  {pkg.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-white/70">{f}</span>
                    </div>
                  ))}
                  {pkg.excluded.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <X className="h-4 w-4 text-white/20 shrink-0" />
                      <span className="text-white/25 line-through">{f}</span>
                    </div>
                  ))}
                </div>
                <Button className={`w-full rounded-full ${pkg.popular ? "bg-green-600 hover:bg-green-500 text-white border-0" : "border-green-800 text-green-300 hover:bg-green-900"}`}
                  variant={pkg.popular ? "default" : "outline"} asChild>
                  <Link to="/booking">Book Now</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── CTA ── full-bleed forest image */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ngareNdare} alt="Ngare Ndare Forest" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-900/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
            <p className="text-green-400 text-xs font-medium tracking-[0.3em] uppercase mb-4">Ready to explore?</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              The Mountain Forest Is Calling
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Book your stay and our team will arrange your full adventure programme — from sunrise hikes to sunset bonfire sessions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white border-0 rounded-full px-10" asChild>
                <Link to="/booking">Book a Stay</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-10" asChild>
                <Link to="/contact">Plan Custom Trip <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="h-7 w-7" />
          </button>
          <img src={lightbox} alt="Activity" className="max-w-full max-h-[88vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Activities;
