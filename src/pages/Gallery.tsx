import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Hero
import heroBackground from "@/assets/facilities/frontage.jpg";

// Rooms
import bed   from "@/assets/rooms/bed.jpg";
import bed1  from "@/assets/rooms/bed1.jpg";
import bed2  from "@/assets/rooms/bed2.jpg";
import bed3  from "@/assets/rooms/bed3.jpg";
import bed5  from "@/assets/rooms/bed5.jpg";

// Dining
import gardenDining    from "@/assets/dining/garden dining.jpg";
import grounds4        from "@/assets/dining/grounds4.jpg";
import mainRestaurant  from "@/assets/dining/Mainrestaurant.png";
import mbarukDining    from "@/assets/dining/Mbaruk.jpg";
import ami             from "@/assets/restaurant/Ami.jpg";
import ami2            from "@/assets/restaurant/Ami2.jpg";
import ami3            from "@/assets/restaurant/Ami3.jpg";
import ami4            from "@/assets/restaurant/Ami4.jpg";
import ami5            from "@/assets/restaurant/Ami5.jpg";

// Facilities / Conference
import conference1  from "@/assets/conferences/conference1.jpeg";
import conference2  from "@/assets/facilities/conference2.jpg";
import conference3  from "@/assets/facilities/conference3.jpeg";
import conference4  from "@/assets/facilities/conference4.jpg";
import conference6  from "@/assets/facilities/conference6.jpeg";
import conference10 from "@/assets/facilities/conference10.jpg";
import frontage     from "@/assets/facilities/frontage.jpg";
import frontage1    from "@/assets/facilities/frontage1.jpg";
import grounds1     from "@/assets/facilities/Grounds1.jpg";
import grounds2     from "@/assets/facilities/Grounds2.jpg";
import rooftop      from "@/assets/facilities/rooftop.jpg";
import sitting      from "@/assets/facilities/sitting.jpg";
import sittingArea  from "@/assets/facilities/sitting area2.jpg";
import spidersweb   from "@/assets/facilities/spidersweb.jpg";
import greatEscape  from "@/assets/facilities/great escape.jpg";
import magicboots   from "@/assets/facilities/magicboots.jpg";

// Gym
import gym  from "@/assets/gym/gym.jpg";
import gym1 from "@/assets/gym/gym1.jpg";
import gym2 from "@/assets/gym/gym2.jpg";
import gym3 from "@/assets/gym/gym3.jpg";

// Wellness
import mas1   from "@/assets/massage/mas1.jpg";
import mas2   from "@/assets/massage/mas2.jpg";
import mas3   from "@/assets/massage/mas3.jpg";
import sauna  from "@/assets/sauna/sauna.jpg";
import sauna1 from "@/assets/sauna/sauna1.jpg";
import sauna2 from "@/assets/sauna/sauna2.jpg";
import swim1  from "@/assets/swimming/swim1.jpg";
import swim2  from "@/assets/swimming/swim2.jpg";
import swim3  from "@/assets/swimming/swim3.jpg";
import beauty1 from "@/assets/beauty/beauty1.jpg";
import beauty2 from "@/assets/beauty/beauty2.jpg";

// Views & Outdoors
import viewNgare    from "@/assets/views/Ngare Ndare.jpg";
import viewOlp      from "@/assets/views/Olpajeta conservancy.jpg";
import viewOutdoor  from "@/assets/views/Outdoorcompressed.jpg";
import situps       from "@/assets/facilities/situps.jpg";

const categories = ["All", "Rooms", "Dining", "Facilities", "Gym", "Wellness", "Views"];

type GalleryImage = { src: string; category: string; title: string };

const galleryImages: GalleryImage[] = [
  // Rooms
  { src: bed,   category: "Rooms", title: "Standard Room" },
  { src: bed1,  category: "Rooms", title: "Superior Room" },
  { src: bed2,  category: "Rooms", title: "Double Room" },
  { src: bed3,  category: "Rooms", title: "Twin Room" },
  { src: bed5,  category: "Rooms", title: "Executive Room" },

  // Dining
  { src: mainRestaurant, category: "Dining", title: "Main Restaurant" },
  { src: mbarukDining,   category: "Dining", title: "Mbaruk Restaurant" },
  { src: gardenDining,   category: "Dining", title: "Garden Dining" },
  { src: grounds4,       category: "Dining", title: "Outdoor Dining" },
  { src: ami,            category: "Dining", title: "Dining Experience" },
  { src: ami2,           category: "Dining", title: "Restaurant Ambience" },
  { src: ami3,           category: "Dining", title: "Fine Dining" },
  { src: ami4,           category: "Dining", title: "Culinary Excellence" },
  { src: ami5,           category: "Dining", title: "Chef's Selection" },

  // Facilities
  { src: frontage,     category: "Facilities", title: "Hotel Frontage" },
  { src: frontage1,    category: "Facilities", title: "Hotel Entrance" },
  { src: grounds1,     category: "Facilities", title: "Hotel Grounds" },
  { src: grounds2,     category: "Facilities", title: "Scenic Grounds" },
  { src: rooftop,      category: "Facilities", title: "Rooftop Terrace" },
  { src: sitting,      category: "Facilities", title: "Relaxation Lounge" },
  { src: sittingArea,  category: "Facilities", title: "Sitting Area" },
  { src: conference1,  category: "Facilities", title: "Conference Centre" },
  { src: conference2,  category: "Facilities", title: "Executive Boardroom" },
  { src: conference3,  category: "Facilities", title: "Training Room" },
  { src: conference4,  category: "Facilities", title: "Seminar Space" },
  { src: conference6,  category: "Facilities", title: "Workshop Area" },
  { src: conference10, category: "Facilities", title: "Event Setup" },
  { src: spidersweb,   category: "Facilities", title: "Adventure Activity" },
  { src: greatEscape,  category: "Facilities", title: "Great Escape" },
  { src: magicboots,   category: "Facilities", title: "Magic Boots" },
  { src: situps,       category: "Facilities", title: "Outdoor Fitness" },

  // Gym
  { src: gym,  category: "Gym", title: "Fitness Centre" },
  { src: gym1, category: "Gym", title: "Strength Training" },
  { src: gym2, category: "Gym", title: "Cardio Equipment" },
  { src: gym3, category: "Gym", title: "Workout Area" },

  // Wellness
  { src: swim1,   category: "Wellness", title: "Swimming Pool" },
  { src: swim2,   category: "Wellness", title: "Pool Side" },
  { src: swim3,   category: "Wellness", title: "Aqua Leisure" },
  { src: sauna,   category: "Wellness", title: "Finnish Sauna" },
  { src: sauna1,  category: "Wellness", title: "Sauna Interior" },
  { src: sauna2,  category: "Wellness", title: "Heat Therapy" },
  { src: mas1,    category: "Wellness", title: "Therapeutic Massage" },
  { src: mas2,    category: "Wellness", title: "Deep Tissue Massage" },
  { src: mas3,    category: "Wellness", title: "Aromatherapy" },
  { src: beauty1, category: "Wellness", title: "Beauty Parlour" },
  { src: beauty2, category: "Wellness", title: "Beauty Treatments" },

  // Views
  { src: viewNgare,   category: "Views", title: "Ngare Ndare Forest" },
  { src: viewOlp,     category: "Views", title: "Ol Pejeta Conservancy" },
  { src: viewOutdoor, category: "Views", title: "Outdoor Scenery" },
];

const counts: Record<string, number> = { All: galleryImages.length };
categories.slice(1).forEach(c => {
  counts[c] = galleryImages.filter(img => img.category === c).length;
});

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const filtered = activeCategory === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

  const openAt = (idx: number) => setSelectedIdx(idx);
  const close   = () => setSelectedIdx(null);
  const prev = () => setSelectedIdx(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null);
  const next = () => setSelectedIdx(i => i !== null ? (i + 1) % filtered.length : null);

  const selected = selectedIdx !== null ? filtered[selectedIdx] : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[65vh] overflow-hidden">
        <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <img src={heroBackground} alt="Gallery" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        </motion.div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <p className="text-accent font-medium tracking-[0.25em] uppercase text-sm mb-4">Visual Tour</p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">Photo Gallery</h1>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-5" />
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {galleryImages.length} photos spanning every corner of Peaks Hotel Nanyuki.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {cat}
                <span className={`ml-1.5 text-xs ${activeCategory === cat ? "opacity-70" : "opacity-50"}`}>
                  ({counts[cat] ?? filtered.length})
                </span>
              </button>
            ))}
          </div>

          {/* Masonry-style grid */}
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
              {filtered.map((image, idx) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.25 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl break-inside-avoid"
                  onClick={() => openAt(idx)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    style={{ display: "block" }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-300 rounded-2xl" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-accent text-xs font-medium uppercase tracking-wider mb-0.5">{image.category}</p>
                    <h3 className="text-white font-semibold text-sm leading-tight">{image.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={close}
          >
            {/* close */}
            <button onClick={close} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10">
              <X className="h-7 w-7" />
            </button>

            {/* prev */}
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 md:left-8 text-white/60 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            {/* image */}
            <motion.div
              key={selected.src}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selected.src}
                alt={selected.title}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="text-center mt-4">
                <p className="text-accent text-xs font-medium uppercase tracking-wider">{selected.category}</p>
                <h3 className="text-white font-heading text-xl font-bold mt-1">{selected.title}</h3>
                <p className="text-white/40 text-xs mt-1">{(selectedIdx ?? 0) + 1} / {filtered.length}</p>
              </div>
            </motion.div>

            {/* next */}
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 md:right-8 text-white/60 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;
