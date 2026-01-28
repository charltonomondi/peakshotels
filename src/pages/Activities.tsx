import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mountain,
  Camera,
  Flower,
  Dumbbell,
  Sparkles,
  Clock,
  Check,
  MapPin,
  Users,
  Play,
  X
} from "lucide-react";

// Import outdoor images
import berlingwall from "@/assets/outdoor/berlingwall.jpg";
import eventsgrounds from "@/assets/outdoor/eventsgrounds.jpg";
import eventsgrounds1 from "@/assets/outdoor/Eventsgrounds1.jpg";
import garden9 from "@/assets/outdoor/garden9.jpg";
import greatEscape from "@/assets/outdoor/great escape.jpg";
import greatescape from "@/assets/outdoor/greatescape.jpg";
import img1 from "@/assets/outdoor/IMG_20240727_111207_652.jpg";
import img2 from "@/assets/outdoor/IMG_20240727_112106_015.jpg";
import img3 from "@/assets/outdoor/IMG_20240727_112704_085.jpg";
import img4 from "@/assets/outdoor/IMG_20240819_122707.jpg";
import img5 from "@/assets/outdoor/IMG_20240819_123612.jpg";
import inclinedsitups from "@/assets/outdoor/inclinedsitups.jpg";
import magicboots from "@/assets/outdoor/magicboots.jpg";
import ngareNdare from "@/assets/outdoor/Ngare Ndare.jpg";
import outdoorCompressed from "@/assets/outdoor/Out door compressed.jpg";
import outdoorCompressed2 from "@/assets/outdoor/Outdoorcompressed.jpg";
import pxl1 from "@/assets/outdoor/PXL_20240823_125947232.jpg";
import pxl2 from "@/assets/outdoor/PXL_20240823_132156364 (1).jpg";
import pxl3 from "@/assets/outdoor/PXL_20240823_133525309.jpg";
import pxl4 from "@/assets/outdoor/PXL_20240920_152600945.jpg";
import pxl5 from "@/assets/outdoor/PXL_20240920_152651903.jpg";
import pxl6 from "@/assets/outdoor/PXL_20240920_154428686.jpg";
import pxl7 from "@/assets/outdoor/PXL_20240920_163745814.jpg";
import pxl8 from "@/assets/outdoor/PXL_20240920_170139118.jpg";
import pxl9 from "@/assets/outdoor/PXL_20240920_170328202.jpg";
import situps from "@/assets/outdoor/situps.jpg";
import spidersweb from "@/assets/outdoor/spidersweb.jpg";
import stepups from "@/assets/outdoor/stepups.jpg";
import heroBackground from "@/assets/outdoor/Out door compressed.jpg";

import PoolVideo from "@/assets/video/Pool.mp4";

const outdoorImages = [
  { src: berlingwall, title: "Berlin Wall Challenge" },
  { src: greatEscape, title: "Great Escape Course" },
  { src: greatescape, title: "Adventure Course" },
  { src: spidersweb, title: "Spider's Web" },
  { src: magicboots, title: "Magic Boots" },
  { src: situps, title: "Outdoor Sit-ups Station" },
  { src: inclinedsitups, title: "Inclined Sit-ups" },
  { src: stepups, title: "Step-ups Station" },
  { src: eventsgrounds, title: "Events Grounds" },
  { src: eventsgrounds1, title: "Outdoor Events Area" },
  { src: garden9, title: "Garden Area" },
  { src: ngareNdare, title: "Ngare Ndare Forest" },
  { src: outdoorCompressed, title: "Outdoor Fitness Area" },
  { src: outdoorCompressed2, title: "Fitness Grounds" },
  { src: img1, title: "Adventure Activity" },
  { src: img2, title: "Outdoor Challenge" },
  { src: img3, title: "Fitness Station" },
  { src: img4, title: "Nature Trail" },
  { src: img5, title: "Outdoor Experience" },
  { src: pxl1, title: "Adventure Zone" },
  { src: pxl2, title: "Fitness Challenge" },
  { src: pxl3, title: "Outdoor Training" },
  { src: pxl4, title: "Nature Fitness" },
  { src: pxl5, title: "Adventure Park" },
  { src: pxl6, title: "Outdoor Workout" },
  { src: pxl7, title: "Fitness Trail" },
  { src: pxl8, title: "Adventure Course" },
  { src: pxl9, title: "Outdoor Activities" },
];

const activities = [
  {
    image: ngareNdare,
    name: "Mountain Hiking",
    description: "Guided hikes through the stunning landscapes surrounding Mount Kenya.",
    duration: "Half-day to full-day",
    difficulty: "Easy to Challenging",
  },
  {
    image: outdoorCompressed,
    name: "Wildlife Safaris",
    description: "Experience Kenya's diverse wildlife in nearby reserves and parks.",
    duration: "Full-day excursions",
    difficulty: "Easy",
  },
  {
    image: garden9,
    name: "Garden Tours",
    description: "Explore our beautifully landscaped gardens and learn about local flora.",
    duration: "1-2 hours",
    difficulty: "Easy",
  },
  {
    image: magicboots,
    name: "Magic Boots",
    description: "Thrilling bouncing adventures with our magic boots equipment.",
    duration: "1-2 hours",
    difficulty: "Moderate",
  },
  {
    image: spidersweb,
    name: "Spider's Web",
    description: "Navigate through the challenging spider's web obstacle course.",
    duration: "30-45 minutes",
    difficulty: "Challenging",
  },
  {
    image: situps,
    name: "Outdoor Fitness Stations",
    description: "Various outdoor fitness stations for a complete workout experience.",
    duration: "45-60 minutes",
    difficulty: "Varies",
  },
  {
    image: greatEscape,
    name: "Great Escape",
    description: "Navigate obstacle courses and challenges in our outdoor adventure park.",
    duration: "2-3 hours",
    difficulty: "Varies",
  },
  {
    image: berlingwall,
    name: "Berlin Wall Challenge",
    description: "Conquer our challenging climbing wall obstacle.",
    duration: "30-45 minutes",
    difficulty: "Challenging",
  },
];

const outdoorRates = [
  {
    name: "Single Activity Pass",
    price: "KES 500",
    perPerson: true,
    features: [
      "Access to one activity",
      "Safety equipment included",
      "Professional supervision",
      "30-60 minutes duration",
    ],
    notIncluded: ["Multiple activities", "Refreshments"],
  },
  {
    name: "Half Day Adventure",
    price: "KES 1,500",
    perPerson: true,
    popular: true,
    features: [
      "Access to 3 activities",
      "Safety equipment included",
      "Professional guides",
      "4 hours access",
      "Bottled water",
      "Locker access",
    ],
    notIncluded: ["Lunch"],
  },
  {
    name: "Full Day Adventure",
    price: "KES 2,500",
    perPerson: true,
    features: [
      "Unlimited activities access",
      "Safety equipment included",
      "Professional guides",
      "Full day access",
      "Lunch included",
      "Bottled water",
      "Locker access",
      "Towel service",
    ],
    notIncluded: [],
  },
  {
    name: "Group Package (10+)",
    price: "KES 2,000",
    perPerson: true,
    features: [
      "Unlimited activities access",
      "Safety equipment included",
      "Dedicated guide",
      "Full day access",
      "Lunch included",
      "Group photo session",
      "Team building activities",
      "Refreshments",
    ],
    notIncluded: [],
  },
];

const Activities = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  
  const initialImageCount = 8;
  const displayedImages = showAllImages ? outdoorImages : outdoorImages.slice(0, initialImageCount);

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
            alt="Outdoor Fitness"
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
                Outdoor Adventures
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Outdoor Fitness
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Experience outdoor fitness and adventure activities in the stunning Kenyan landscape.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outdoor Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Outdoor Facilities
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our extensive outdoor fitness and adventure facilities.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer aspect-square"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-heading text-sm font-bold text-primary-foreground">
                    {image.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
          
          {!showAllImages && outdoorImages.length > initialImageCount && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => setShowAllImages(true)} 
                variant="outline" 
                size="lg"
              >
                View More ({outdoorImages.length - initialImageCount} more images)
              </Button>
            </div>
          )}
          
          {showAllImages && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => setShowAllImages(false)} 
                variant="outline" 
                size="lg"
              >
                Show Less
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Experience Outdoor Adventures
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <video
                src={PoolVideo}
                autoPlay
                muted
                loop
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="font-heading text-3xl font-bold text-foreground">
                Thrilling Outdoor Adventures
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Embark on exhilarating outdoor adventures in the breathtaking Kenyan landscape. From ziplining through treetops to conquering challenging obstacle courses, our outdoor activities offer the perfect blend of excitement and natural beauty.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Experience heart-pounding thrills, stunning vistas, and the joy of outdoor fitness. Our adventure facilities are designed to challenge your body and inspire your spirit.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-accent">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Guided Adventures</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Safety Equipment</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rates Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Outdoor Fitness Rates
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our adventure packages designed for individuals and groups.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outdoorRates.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-card p-6 rounded-xl shadow-elegant ${
                  pkg.popular ? "ring-2 ring-accent" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-accent">{pkg.price}</span>
                  {pkg.perPerson && (
                    <span className="text-muted-foreground text-sm"> / person</span>
                  )}
                </div>
                <div className="space-y-2 mb-6">
                  {pkg.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {pkg.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant={pkg.popular ? "gold" : "outline"} 
                  className="w-full" 
                  size="sm"
                  asChild
                >
                  <Link to="/booking">Book Now</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Available Activities
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="relative overflow-hidden rounded-2xl group h-[300px]"
              >
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-heading text-xl font-bold text-primary-foreground mb-2">
                    {activity.name}
                  </h3>
                  <p className="text-primary-foreground/80 mb-3 text-sm">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-primary-foreground/70">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.duration}
                    </div>
                    <span>{activity.difficulty}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready for Adventure?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Book your preferred activities or contact us for custom experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/booking">Book Activities</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={selectedImage}
            alt="Outdoor activity"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Activities;
