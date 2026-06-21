import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users, Wifi, Coffee, Projector, Check, ChevronDown,
  Phone, Mail, ArrowRight, X, Monitor, Car, Utensils
} from "lucide-react";

import conf1  from "@/assets/conferences/conference1.jpeg";
import conf2  from "@/assets/conferences/conference2.jpg";
import conf3  from "@/assets/conferences/conference3.jpeg";
import conf4  from "@/assets/conferences/conference4.jpg";
import conf6  from "@/assets/conferences/conference6.jpeg";
import conf10 from "@/assets/conferences/conference10.jpg";

const spaces = [
  {
    name: "Main Conference Hall",
    capacity: "Up to 200",
    image: conf10,
    desc: "Our flagship venue with full AV, stage, and flexible seating for large conferences, seminars and product launches.",
    features: ["Full AV system", "Stage & podium", "Flexible seating", "Natural lighting", "Climate control"],
  },
  {
    name: "Executive Boardroom",
    capacity: "10 – 20",
    image: conf2,
    desc: "An intimate, professional setting for board meetings, strategy sessions and high-level negotiations.",
    features: ["Video conferencing", "Executive seating", "Whiteboard", "Private setting", "Refreshments included"],
  },
  {
    name: "Training Room",
    capacity: "30 – 50",
    image: conf3,
    desc: "Flexible classroom or U-shape layout for training programmes, workshops and learning sessions.",
    features: ["Classroom layout", "U-shape option", "Projector & screen", "Flip charts", "WiFi"],
  },
  {
    name: "Seminar Space",
    capacity: "Up to 80",
    image: conf4,
    desc: "Theatre-style seating for lectures, presentations and large-group seminar sessions.",
    features: ["Theatre seating", "PA system", "Projector", "Entry management", "Break area"],
  },
  {
    name: "Workshop / Breakout Room",
    capacity: "Flexible groups",
    image: conf6,
    desc: "Dedicated breakout spaces for syndicate groups, workshop sessions and creative collaboration.",
    features: ["Modular furniture", "Writable walls", "Natural light", "Private access", "AV points"],
  },
];

const packages = [
  {
    name: "Half Day",
    price: "KES 2,500",
    popular: false,
    features: ["4 hours venue", "Tea & coffee break", "Mineral water", "Projector & screen", "WiFi", "Stationery"],
    excluded: ["Lunch", "Full day access"],
  },
  {
    name: "Full Day",
    price: "KES 4,500",
    popular: true,
    features: ["8 hours venue", "Morning & afternoon tea", "Buffet lunch", "Mineral water", "Projector & screen", "WiFi", "Stationery", "Flip charts"],
    excluded: [],
  },
  {
    name: "Residential",
    price: "KES 12,000",
    popular: false,
    features: ["Single accommodation", "All meals", "Conference facilities", "Tea breaks", "AV equipment", "WiFi", "Stationery", "Pool access"],
    excluded: [],
  },
];

const amenities = [
  { icon: Wifi,      label: "High-Speed WiFi" },
  { icon: Projector, label: "AV & Projection" },
  { icon: Coffee,    label: "Catering Service" },
  { icon: Users,     label: "Event Coordinator" },
  { icon: Car,       label: "Free Parking" },
  { icon: Monitor,   label: "Video Conferencing" },
  { icon: Utensils,  label: "On-site Dining" },
  { icon: Wifi,      label: "Backup Power" },
];

const suitableFor = [
  "Conferences", "Workshops", "Training Programmes", "Retreats",
  "Board Meetings", "Team Building", "Strategic Planning Sessions",
  "AGMs", "Product Launches", "Religious Gatherings",
];

const Conferences = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 scale-110">
          <img src={conf1} alt="Conferences at Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-background" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-accent font-medium tracking-[0.3em] uppercase text-xs mb-5">
            Peaks Hotel Nanyuki
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-5">
            Conferences<br />
            <span className="italic font-light text-accent">& Events</span>
          </motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.5 }}
            className="w-20 h-px bg-accent mx-auto mb-6" />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="text-white/75 text-lg max-w-2xl leading-relaxed mb-10">
            Where ideas meet opportunity. Professional venues, attentive service and unique outdoor experiences — all in the heart of Nanyuki.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
            className="flex flex-wrap justify-center gap-3">
            {["Up to 200 Delegates", "5 Flexible Venues", "Full AV Support", "On-site Catering"].map(tag => (
              <span key={tag} className="backdrop-blur-md bg-white/10 border border-white/20 text-white/85 text-sm px-5 py-2 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">Why choose Peaks</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Where Ideas Meet<br />Opportunity
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-5">
                Peaks Hotel is one of Nanyuki's preferred venues for conferences, workshops, retreats and training programmes. Our facilities combine comfortable accommodation, quality catering, flexible meeting spaces and unique outdoor experiences.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Whether you're planning an intimate board meeting or a large-scale conference for 200 delegates, our dedicated events team ensures every detail is managed with care and professionalism.
              </p>
              <div className="flex flex-wrap gap-3">
                {suitableFor.map(item => (
                  <span key={item} className="flex items-center gap-1.5 bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-full border border-border">
                    <Check className="h-3 w-3 text-accent shrink-0" />{item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Photo grid */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="grid grid-cols-2 gap-3 h-[480px]">
              {[conf10, conf2, conf3, conf4].map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl cursor-pointer group" onClick={() => setLightbox(img)}>
                  <img src={img} alt={`Conference ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES STRIP ── */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {amenities.map(({ icon: Icon, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-primary-foreground/80 text-xs font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENUES ── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Our venues</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Conference Spaces</h2>
          </motion.div>

          <div className="space-y-16">
            {spaces.map((space, i) => (
              <motion.div key={space.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={`overflow-hidden rounded-3xl shadow-xl h-72 md:h-96 cursor-pointer group ${i % 2 === 1 ? "lg:order-2" : ""}`}
                  onClick={() => setLightbox(space.image)}>
                  <img src={space.image} alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full">
                      {space.capacity} delegates
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-foreground mb-3">{space.name}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">{space.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {space.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-accent shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Pricing</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Conference Packages</h2>
            <div className="w-16 h-px bg-accent mx-auto mb-4" />
            <p className="text-muted-foreground max-w-xl mx-auto">All packages include a dedicated event coordinator and complimentary parking.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative bg-card rounded-3xl p-7 border transition-shadow hover:shadow-xl ${pkg.popular ? "border-accent ring-2 ring-accent" : "border-border"}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-5 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-2xl font-bold text-foreground mb-1">{pkg.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-accent">{pkg.price}</span>
                  <span className="text-muted-foreground text-sm"> / person</span>
                </div>
                <div className="space-y-2.5 mb-8">
                  {pkg.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                  {pkg.excluded.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      <span className="text-muted-foreground/50 line-through">{f}</span>
                    </div>
                  ))}
                </div>
                <Button variant={pkg.popular ? "gold" : "outline"} className="w-full rounded-full" asChild>
                  <Link to="/contact">Enquire Now</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ── */}
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-56 md:h-72">
            {[conf1, conf6, conf10, conf2, conf3, conf4].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="overflow-hidden rounded-2xl cursor-pointer group" onClick={() => setLightbox(img)}>
                <img src={img} alt={`Conference gallery ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={conf10} alt="Conference at Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-4">Plan your event</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
              Ready to Host Your Next Event?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">
              Talk to our events team and let us tailor a package that fits your agenda, group size and budget.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="gold" asChild>
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Get in Touch
                </Link>
              </Button>
              <Button size="lg" variant="heroOutline" asChild>
                <a href="tel:+254711969690">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us Now
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button className="absolute top-5 right-5 text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
              <X className="h-7 w-7" />
            </button>
            <img src={lightbox} alt="Conference" className="max-w-full max-h-[88vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Conferences;
