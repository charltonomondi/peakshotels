import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users, Projector, Wifi, Coffee, Check, X,
  ArrowRight, ChevronDown, Phone, Mail, Calendar,
  Monitor, Utensils, Car, Star
} from "lucide-react";

// Conference images
import conf1  from "@/assets/conferences/conference1.jpeg";
import conf2  from "@/assets/conferences/conference2.jpg";
import conf3  from "@/assets/conferences/conference3.jpeg";
import conf4  from "@/assets/conferences/conference4.jpg";
import conf6  from "@/assets/conferences/conference6.jpeg";
import conf10 from "@/assets/conferences/conference10.jpg";

// Grounds / outdoor
import grounds1    from "@/assets/facilities/Grounds1.jpg";
import grounds2    from "@/assets/facilities/Grounds2.jpg";
import frontage    from "@/assets/facilities/frontage.jpg";
import rooftop     from "@/assets/facilities/rooftop.jpg";
import greatescape from "@/assets/facilities/great escape.jpg";

const venues = [
  {
    name: "Main Conference Hall",
    capacity: "Up to 200",
    setup: "Theatre, Classroom, Banquet",
    image: conf10,
    features: ["Full AV system & stage", "Air conditioning", "Dedicated event coordinator", "Built-in PA system", "Adjustable lighting"],
  },
  {
    name: "Executive Boardroom",
    capacity: "10 – 20",
    setup: "Boardroom",
    image: conf2,
    features: ["Video conferencing", "Executive furniture", "HD display screen", "Private entrance", "Refreshments service"],
  },
  {
    name: "Training Room",
    capacity: "30 – 50",
    setup: "Classroom / U-shape",
    image: conf3,
    features: ["Projector & whiteboard", "Flip charts", "WiFi", "Natural lighting", "Breakout space adjacent"],
  },
  {
    name: "Seminar Space",
    capacity: "Up to 80",
    setup: "Theatre-style",
    image: conf4,
    features: ["Projector & screen", "Stage area", "Sound system", "WiFi", "Catering available"],
  },
  {
    name: "Workshop / Breakout Rooms",
    capacity: "10 – 30",
    setup: "Flexible",
    image: conf6,
    features: ["Configurable layout", "Whiteboards", "WiFi", "Natural light", "Ideal for syndicate groups"],
  },
  {
    name: "Outdoor Events Grounds",
    capacity: "100 – 1,000+",
    setup: "Open air",
    image: grounds1,
    features: ["Landscaped gardens", "Tent / marquee friendly", "Outdoor catering", "Team building space", "Mount Kenya backdrop"],
  },
];

const packages = [
  {
    name: "Half Day",
    price: "",
    popular: false,
    features: ["4 hours venue", "Tea/Coffee break", "Mineral water", "Projector & screen", "WiFi", "Stationery"],
    excluded: ["Lunch", "Full day access"],
  },
  {
    name: "Full Day",
    price: "",
    popular: true,
    features: ["8 hours venue", "Morning & afternoon tea", "Buffet lunch", "Mineral water", "Projector & screen", "WiFi", "Stationery", "Flip charts"],
    excluded: [],
  },
  {
    name: "Residential",
    price: "",
    popular: false,
    features: ["Accommodation (single)", "All meals", "Conference facilities", "Tea breaks", "AV equipment", "WiFi", "Stationery", "Pool access"],
    excluded: [],
  },
];

const suitableFor = [
  { icon: Users,     label: "Conferences" },
  { icon: Projector, label: "Workshops" },
  { icon: Monitor,   label: "Training Programmes" },
  { icon: Star,      label: "Retreats" },
  { icon: Coffee,    label: "Board Meetings" },
  { icon: Users,     label: "Team Building" },
  { icon: Calendar,  label: "Strategic Planning" },
  { icon: Utensils,  label: "Gala Dinners" },
];

const inclusions = [
  { icon: Wifi,      label: "High-Speed WiFi" },
  { icon: Projector, label: "AV Equipment" },
  { icon: Coffee,    label: "Tea & Coffee Breaks" },
  { icon: Utensils,  label: "Catering Options" },
  { icon: Car,       label: "Complimentary Parking" },
  { icon: Users,     label: "Event Coordinator" },
];

const Facilities = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeVenue, setActiveVenue] = useState(0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[85vh] overflow-hidden">
        <motion.div initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.6 }} className="absolute inset-0">
          <img src={conf10} alt="Peaks Hotel Conferences" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </motion.div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-accent font-medium tracking-[0.3em] uppercase text-xs mb-4">
            Peaks Hotel Nanyuki
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            className="font-heading text-5xl md:text-7xl font-bold text-white mb-5 leading-none">
            Conferences<br /><span className="italic font-light text-accent">&amp; Events</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-white/75 text-lg max-w-2xl mb-10 leading-relaxed">
            Where Ideas Meet Opportunity. One of Nanyuki's preferred venues for conferences, workshops, retreats and training programmes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-2">
            {["200+ Capacity", "Full AV", "Outdoor Grounds", "Event Coordinator", "Catering Included"].map(tag => (
              <span key={tag} className="backdrop-blur-md bg-white/10 border border-white/20 text-white/80 text-xs px-4 py-2 rounded-full">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              {/* <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">Why choose Peaks</p> */}
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Events Destination
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-5">
                Peaks Hotel combines comfortable accommodation, quality catering, flexible meeting spaces and unique outdoor experiences to create productive and memorable events.
              </p>
              {/* <p className="text-muted-foreground leading-relaxed mb-8">
                Set against the backdrop of Mount Kenya, the Aberdare Ranges and the Lolldaiga Hills, every event at Peaks is enriched by an extraordinary natural environment.
              </p> */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {inclusions.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2.5">
                    <Icon className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm text-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 h-[420px]">
              {[conf1, conf2, conf3, conf4].map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(img)}>
                  <img src={img} alt={`Conference space ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-600" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUITABLE FOR ── */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Flexible for every need</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Suitable For</h2>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {suitableFor.map(({ icon: Icon, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 bg-background border border-border rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors">
                <Icon className="h-4 w-4 text-accent" />{label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENUES ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Our spaces</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Conference Venues</h2>
          </motion.div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-1">
            {venues.map((v, i) => (
              <button key={v.name} onClick={() => setActiveVenue(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeVenue === i
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70 border border-border"
                }`}>
                {v.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeVenue} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="overflow-hidden rounded-3xl shadow-xl h-80 md:h-[420px] cursor-pointer" onClick={() => setLightbox(venues[activeVenue].image)}>
                <img src={venues[activeVenue].image} alt={venues[activeVenue].name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div>
                <h3 className="font-heading text-3xl font-bold text-foreground mb-2">{venues[activeVenue].name}</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Users className="h-3 w-3 inline mr-1" />{venues[activeVenue].capacity} guests
                  </span>
                  <span className="bg-secondary text-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border">
                    {venues[activeVenue].setup}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {venues[activeVenue].features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                      <Check className="h-4 w-4 text-accent shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant="gold" asChild>
                  <Link to="/contact">Enquire About This Space <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Events & Meetings</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Conference Packages</h2>
            <div className="w-16 h-px bg-accent mx-auto mb-4" />
            <p className="text-muted-foreground max-w-xl mx-auto">All packages include dedicated event coordinator support and complimentary parking.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg, i) => (
              <motion.div key={pkg.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
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

      {/* ── PHOTO GALLERY STRIP ── */}
      {/* <section className="py-4 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 h-40 md:h-52">
            {[conf1, conf2, conf3, conf4, conf6, conf10].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="overflow-hidden rounded-xl cursor-pointer" onClick={() => setLightbox(img)}>
                <img src={img} alt={`Conference ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── OUTDOOR GROUNDS ── */}
      {/* <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">Beyond four walls</p>
              <h2 className="font-heading text-4xl font-bold text-foreground mb-5 leading-tight">
                Outdoor Events &<br />Team Building
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Our landscaped Events Grounds can comfortably host more than 1,000 guests. The open-air setting, combined with a range of outdoor activities, makes Peaks the ideal destination for team building, retreats and large gatherings.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Activities include obstacle courses, ropes challenges, outdoor gym circuits, nature walks and guided Mount Kenya hikes — all available to complement your event programme.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["Weddings", "Gala Dinners", "Corporate Functions", "Team Building", "Concerts", "Community Events"].map(tag => (
                  <span key={tag} className="bg-secondary border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
              <Button variant="gold" asChild>
                <Link to="/contact">Plan Your Event <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 h-[400px]">
              {[grounds1, grounds2, greatescape, rooftop].map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(img)}>
                  <img src={img} alt="Outdoor grounds" className="w-full h-full object-cover hover:scale-110 transition-transform duration-600" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={frontage} alt="Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-4">Plan your event</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
              Ready to Host Your Next Event?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">
              Our events team is ready to help you plan every detail — from venue setup and catering to accommodation and activities.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <Button size="lg" variant="gold" asChild>
                <Link to="/contact">Contact Events Team</Link>
              </Button>
              <Button size="lg" variant="heroOutline" asChild>
                <Link to="/booking">Book Accommodation</Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-primary-foreground/70 text-sm">
              <a href="tel:+254711969690" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4 text-accent" />+254 711 969 690
              </a>
              <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4 text-accent" />info@peakshotels.co.ke
              </a>
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
            <button className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors" onClick={() => setLightbox(null)}>
              <X className="h-7 w-7" />
            </button>
            <motion.img
              initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              src={lightbox} alt="Conference space"
              className="max-w-full max-h-[88vh] object-contain rounded-2xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Facilities;
