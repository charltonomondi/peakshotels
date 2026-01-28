import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomExecutive from "@/assets/room-executive.jpg";
import roomPresidential from "@/assets/room-presidential.jpg";
import restaurantImage from "@/assets/restaurant.jpg";
import poolImage from "@/assets/pool.jpg";
import barImage from "@/assets/bar.jpg";
import conferenceImage from "@/assets/conference.jpg";
import heroBackground from "@/assets/facilities/Grounds1.jpg";

// Dining images
import gardenDining from "@/assets/dining/garden dining.jpg";
import grounds4 from "@/assets/dining/grounds4.jpg";
import mainRestaurant from "@/assets/dining/Mainrestaurant.png";
import mbarukDining from "@/assets/dining/Mbaruk.jpg";

// Facilities images
import conference2 from "@/assets/facilities/conference2.jpg";
import conference3 from "@/assets/facilities/conference3.jpeg";
import conference4 from "@/assets/facilities/conference4.jpg";
import conference6 from "@/assets/facilities/conference6.jpeg";
import conference10 from "@/assets/facilities/conference10.jpg";
import frontage from "@/assets/facilities/frontage.jpg";
import frontage1 from "@/assets/facilities/frontage1.jpg";
import grounds1 from "@/assets/facilities/Grounds1.jpg";
import grounds2 from "@/assets/facilities/Grounds2.jpg";
import gym from "@/assets/facilities/gym.jpg";
import rooftop from "@/assets/facilities/rooftop.jpg";
import sittingArea from "@/assets/facilities/sitting area2.jpg";
import sitting from "@/assets/facilities/sitting.jpg";

const categories = ["All", "Rooms", "Dining", "Facilities", "Views"];

const galleryImages = [
  { src: heroImage, category: "Views", title: "Mount Kenya Panorama" },
  { src: roomDeluxe, category: "Rooms", title: "Deluxe Room" },
  { src: roomExecutive, category: "Rooms", title: "Executive Suite" },
  { src: roomPresidential, category: "Rooms", title: "Presidential Suite" },
  { src: restaurantImage, category: "Dining", title: "The Summit Restaurant" },
  { src: barImage, category: "Dining", title: "The Peak Lounge" },
  { src: gardenDining, category: "Dining", title: "Garden Dining" },
  { src: grounds4, category: "Dining", title: "Outdoor Dining Area" },
  { src: mainRestaurant, category: "Dining", title: "Main Restaurant" },
  { src: mbarukDining, category: "Dining", title: "Mbaruk Restaurant" },
  { src: poolImage, category: "Facilities", title: "Infinity Pool" },
  { src: conferenceImage, category: "Facilities", title: "Conference Center" },
  { src: gym, category: "Facilities", title: "Fitness Center" },
  { src: conference2, category: "Facilities", title: "Executive Boardroom" },
  { src: conference3, category: "Facilities", title: "Training Room" },
  { src: conference4, category: "Facilities", title: "Seminar Space" },
  { src: conference6, category: "Facilities", title: "Workshop Area" },
  { src: conference10, category: "Facilities", title: "Event Setup" },
  { src: frontage, category: "Views", title: "Hotel Frontage" },
  { src: frontage1, category: "Views", title: "Hotel Entrance" },
  { src: grounds1, category: "Views", title: "Beautiful Grounds" },
  { src: grounds2, category: "Views", title: "Scenic Grounds" },
  { src: rooftop, category: "Views", title: "Rooftop Terrace" },
  { src: sittingArea, category: "Facilities", title: "Sitting Area" },
  { src: sitting, category: "Facilities", title: "Relaxation Area" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  const filteredImages = activeCategory === "All" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroBackground}
            alt="Photo Gallery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>

        <div className="relative h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
                Visual Tour
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Photo Gallery
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Take a visual journey through Peaks Hotel and discover the beauty that awaits you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative group cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-accent text-sm font-medium">{image.category}</span>
                    <h3 className="text-primary-foreground font-heading text-xl font-bold">
                      {image.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-primary-foreground hover:text-accent transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
              />
              <div className="text-center mt-4">
                <span className="text-accent text-sm font-medium">{selectedImage.category}</span>
                <h3 className="text-primary-foreground font-heading text-2xl font-bold">
                  {selectedImage.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View More Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              Want to See More?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Explore our complete collection of stunning images showcasing every corner of Peaks Hotel.
            </p>
            <Button variant="hero" size="lg">
              View More Photos
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
