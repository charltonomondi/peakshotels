import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Waves, Dumbbell, Users, Projector, Wifi, Coffee,
  Flame, Wind, Sparkles, Scissors, Check, X,
  ArrowRight, ChevronDown
} from "lucide-react";

// Facility images
import frontage    from "@/assets/facilities/frontage.jpg";
import grounds1    from "@/assets/facilities/Grounds1.jpg";
import grounds2    from "@/assets/facilities/Grounds2.jpg";
import rooftop     from "@/assets/facilities/rooftop.jpg";
import sitting     from "@/assets/facilities/sitting.jpg";
import sittingArea from "@/assets/facilities/sitting area2.jpg";
import mainRest    from "@/assets/facilities/Mainrestaurant.png";
import mbaruk      from "@/assets/facilities/Mbaruk.jpg";
import gymImg      from "@/assets/facilities/gym.jpg";
import conf2       from "@/assets/facilities/conference2.jpg";
import conf3       from "@/assets/facilities/conference3.jpeg";
import conf4       from "@/assets/facilities/conference4.jpg";
import conf6       from "@/assets/facilities/conference6.jpeg";
import conf10      from "@/assets/facilities/conference10.jpg";
import greatescape from "@/assets/facilities/great escape.jpg";
import magicboots  from "@/assets/facilities/magicboots.jpg";
import spidersweb  from "@/assets/facilities/spidersweb.jpg";
import situps      from "@/assets/facilities/situps.jpg";

// Specific facility images
import swim1  from "@/assets/swimming/swim1.jpg";
import sauna  from "@/assets/sauna/sauna.jpg";
import steam1 from "@/assets/steam bath/steam1.jpeg";
import mas1   from "@/assets/massage/mas1.jpg";
import beauty1 from "@/assets/beauty/beauty1.jpg";
import gym1   from "@/assets/gym/gym1.jpg";

const facilityCategories = [
  {
    id: "wellness",
    label: "Wellness & Spa",
    facilities: [
      { title: "Swimming Pool",  desc: "Heated outdoor pool with mountain views. Open 6 AM – 10 PM.",      image: swim1,   link: "/swimming",        icon: Waves },
      { title: "Sauna",          desc: "Traditional Finnish sauna at 80–90°C with essential oils.",         image: sauna,   link: "/sauna",           icon: Flame },
      { title: "Steam Bath",     desc: "Therapeutic moist steam at 40–45°C for deep detox.",               image: steam1,  link: "/steam-bath",      icon: Wind },
      { title: "Massage",        desc: "Swedish, deep tissue, aromatherapy & sports massages.",             image: mas1,    link: "/massage",         icon: Sparkles },
      { title: "Beauty Parlour", desc: "Hair, skin, nails, and facial treatments by certified specialists.",image: beauty1, link: "/beauty-parlour",  icon: Scissors },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    facilities: [
      { title: "Fitness Centre", desc: "Fully equipped gym with cardio, free weights, and personal training.", image: gym1,   link: "/gym",         icon: Dumbbell },
      { title: "Outdoor Fitness",desc: "Functional fitness zones in the fresh mountain air.",                  image: situps, link: "/gym",         icon: Dumbbell },
      { title: "Great Escape",   desc: "Outdoor challenge ropes course and team building activities.",         image: greatescape, link: "/activities", icon: Users },
      { title: "Magic Boots",    desc: "Trampoline & balance equipment for all ages.",                         image: magicboots,  link: "/activities", icon: Users },
      { title: "Spider's Web",   desc: "High-rope adventure activity for groups and families.",                 image: spidersweb,  link: "/activities", icon: Users },
    ],
  },
  {
    id: "dining",
    label: "Dining",
    facilities: [
      { title: "Main Restaurant", desc: "African-inspired fine dining with panoramic views. 6:30 AM – 10 PM.", image: mainRest, link: "/dining", icon: Coffee },
      { title: "Mbaruk Restaurant & Spillover", desc: "Relaxed all-day dining and sundowner terrace.",         image: mbaruk,   link: "/dining", icon: Coffee },
      { title: "Rooftop Terrace", desc: "Signature cocktails and small plates above the canopy.",              image: rooftop,  link: "/dining", icon: Coffee },
    ],
  },
  {
    id: "events",
    label: "Conferences & Events",
    facilities: [
      { title: "Main Hall",          desc: "Seats up to 200. Full AV, stage, and catering.",    image: conf10, link: "/facilities", icon: Projector },
      { title: "Executive Boardroom",desc: "Intimate boardroom for 10–20 with VC capability.", image: conf2,  link: "/facilities", icon: Users },
      { title: "Training Room",      desc: "Flexible classroom or U-shape for 30–50 delegates.",image: conf3,  link: "/facilities", icon: Projector },
      { title: "Seminar Space",      desc: "Theatre-style seating for up to 80 attendees.",     image: conf4,  link: "/facilities", icon: Users },
      { title: "Workshop Area",      desc: "Breakout rooms for workshops and syndicate groups.", image: conf6,  link: "/facilities", icon: Wifi },
    ],
  },
  {
    id: "grounds",
    label: "Grounds & Lounges",
    facilities: [
      { title: "Hotel Grounds",    desc: "Beautifully landscaped gardens with Mount Kenya views.",    image: grounds1,    link: "/about",    icon: Users },
      { title: "Outdoor Gardens",  desc: "Manicured lawns and flower gardens ideal for events.",      image: grounds2,    link: "/about",    icon: Users },
      { title: "Sitting Lounge",   desc: "Comfortable indoor lounges for reading or meetings.",       image: sitting,     link: "/about",    icon: Users },
      { title: "Sitting Area",     desc: "Cosy seating areas around the hotel grounds.",              image: sittingArea, link: "/about",    icon: Users },
    ],
  },
];

const conferencePackages = [
  {
    name: "Half Day",
    price: "KES 2,500",
    perPerson: true,
    features: ["4 hours venue", "Tea/Coffee break", "Mineral water", "Projector & screen", "WiFi", "Stationery"],
    excluded: ["Lunch", "Full day access"],
    popular: false,
  },
  {
    name: "Full Day",
    price: "KES 4,500",
    perPerson: true,
    features: ["8 hours venue", "Morning & afternoon tea", "Buffet lunch", "Mineral water", "Projector & screen", "WiFi", "Stationery", "Flip charts"],
    excluded: [],
    popular: true,
  },
  {
    name: "Residential",
    price: "KES 12,000",
    perPerson: true,
    features: ["Accommodation (single)", "All meals", "Conference facilities", "Tea breaks", "AV equipment", "WiFi", "Stationery", "Pool access"],
    excluded: [],
    popular: false,
  },
];

const amenities = [
  { icon: Wifi,     label: "Free WiFi"         },
  { icon: Coffee,   label: "24hr Room Service"  },
  { icon: Users,    label: "Concierge"          },
  { icon: Wind,     label: "Air Conditioning"   },
  { icon: Dumbbell, label: "Fitness Centre"     },
  { icon: Waves,    label: "Swimming Pool"      },
  { icon: Flame,    label: "Sauna & Steam"      },
  { icon: Sparkles, label: "Spa & Beauty"       },
];

const Facilities = () => {
  const [activeTab, setActiveTab] = useState("wellness");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const active = facilityCategories.find(c => c.id === activeTab)!;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative h-[80vh] overflow-hidden">
        <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <img src={frontage} alt="Peaks Hotel Facilities" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-background" />
        </motion.div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-accent font-medium tracking-[0.3em] uppercase text-xs mb-4">
            Peaks Hotel Nanyuki
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            className="font-heading text-5xl md:text-7xl font-bold text-white mb-5 leading-none">
            World-Class<br /><span className="italic font-light text-accent">Facilities</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="text-white/70 text-lg max-w-2xl mb-10 leading-relaxed">
            From therapeutic wellness to state-of-the-art conference suites — everything you need, all in one place.
          </motion.p>

          {/* amenity pills */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-2">
            {amenities.map(({ icon: Icon, label }) => (
              <span key={label} className="backdrop-blur-md bg-white/10 border border-white/20 text-white/80 text-xs px-4 py-2 rounded-full flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-accent" />{label}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
          <ChevronDown className="h-6 w-6 text-white/40" />
        </motion.div>
      </section>

      {/* ── FACILITY TABS ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Explore by category</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Our Facilities</h2>
          </motion.div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-10">
            {facilityCategories.map(cat => (
              <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === cat.id
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70 border border-border"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Facility cards */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.facilities.map(({ title, desc, image, link, icon: Icon }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-52 overflow-hidden cursor-pointer" onClick={() => setLightbox(image)}>
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                  <div className="absolute top-3 left-3 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-foreground mb-1.5">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{desc}</p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-accent hover:text-accent/80 font-medium" asChild>
                    <Link to={link}>Learn more <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONFERENCE PACKAGES ── */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14 text-center">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-2">Events & Meetings</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Conference Packages</h2>
            <div className="w-16 h-px bg-accent mx-auto mb-4" />
            <p className="text-muted-foreground max-w-xl mx-auto">All packages include dedicated event coordinator support and complimentary parking.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {conferencePackages.map((pkg, i) => (
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

      {/* ── CONFERENCE GALLERY STRIP ── */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 h-48 md:h-60">
            {[conf2, conf3, conf4, conf6, conf10].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(img)}>
                <img src={img} alt={`Conference ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-600" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROUNDS FEATURE ── split */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">The Setting</p>
              <h2 className="font-heading text-4xl font-bold text-foreground mb-5 leading-tight">
                Stunning Grounds<br />at Every Turn
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Spread across acres of landscaped gardens, the hotel grounds are as much a facility as any room. Manicured lawns, indigenous trees, and curated outdoor seating areas offer a serene backdrop whether you're hosting an outdoor event or simply unwinding after a long journey.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Mount Kenya frames every view — a constant reminder that you are somewhere truly extraordinary.
              </p>
              <Button variant="gold" asChild>
                <Link to="/booking">Book a Stay <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 h-[400px]">
              {[grounds1, grounds2, sittingArea, rooftop].map((img, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="overflow-hidden rounded-2xl cursor-pointer" onClick={() => setLightbox(img)}>
                  <img src={img} alt="Grounds" className="w-full h-full object-cover hover:scale-110 transition-transform duration-600" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={grounds2} alt="Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
            <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-4">Plan your visit</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
              Ready to Experience It All?
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-10 leading-relaxed">
              Book your stay and access every facility from day one — pool, gym, wellness, dining, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="gold" asChild>
                <Link to="/booking">Book Your Stay</Link>
              </Button>
              <Button size="lg" variant="heroOutline" asChild>
                <Link to="/contact">Contact Events Team</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-5 right-5 text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
            <X className="h-7 w-7" />
          </button>
          <img src={lightbox} alt="Facility" className="max-w-full max-h-[88vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Facilities;
