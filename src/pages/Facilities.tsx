import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  Projector,
  Wifi,
  Coffee,
  Check,
  X
} from "lucide-react";

// Import conference images
import conference1 from "@/assets/conferences/conference1.jpeg";
import conference2 from "@/assets/conferences/conference2.jpg";
import conference3 from "@/assets/conferences/conference3.jpeg";
import conference4 from "@/assets/conferences/conference4.jpg";
import conference6 from "@/assets/conferences/conference6.jpeg";
import conference10 from "@/assets/conferences/conference10.jpg";
import heroBackground from "@/assets/conferences/conference10.jpg";

const conferenceImages = [
  { src: conference1, title: "Main Conference Hall" },
  { src: conference2, title: "Executive Boardroom" },
  { src: conference3, title: "Training Room Setup" },
  { src: conference4, title: "Seminar Configuration" },
  { src: conference6, title: "Workshop Space" },
  { src: conference10, title: "Event Setup" },
];

const conferenceFeatures = [
  {
    icon: Users,
    title: "Capacity",
    description: "Accommodates up to 200 guests in various configurations",
  },
  {
    icon: Projector,
    title: "AV Equipment",
    description: "State-of-the-art projectors, screens, and sound systems",
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description: "Complimentary high-speed internet for all attendees",
  },
  {
    icon: Coffee,
    title: "Catering Services",
    description: "Full catering options from tea breaks to gala dinners",
  },
];

const conferencePackages = [
  {
    name: "Half Day Package",
    price: "KES 2,500",
    perPerson: true,
    features: [
      "4 hours venue use",
      "Tea/Coffee break",
      "Mineral water",
      "Projector & screen",
      "WiFi access",
      "Notepads & pens",
    ],
    notIncluded: ["Lunch", "Full day access"],
  },
  {
    name: "Full Day Package",
    price: "KES 4,500",
    perPerson: true,
    popular: true,
    features: [
      "8 hours venue use",
      "Morning & afternoon tea",
      "Buffet lunch",
      "Mineral water",
      "Projector & screen",
      "WiFi access",
      "Notepads & pens",
      "Flip charts",
    ],
    notIncluded: [],
  },
  {
    name: "Residential Package",
    price: "KES 12,000",
    perPerson: true,
    features: [
      "Accommodation (single)",
      "All meals included",
      "Conference facilities",
      "Tea breaks",
      "Projector & screen",
      "WiFi access",
      "Notepads & pens",
      "Flip charts",
      "Swimming pool access",
    ],
    notIncluded: [],
  },
];

const Facilities = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
            alt="Conferences"
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
                Business & Events
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Conferences
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Host your next corporate event, seminar, or conference in our state-of-the-art facilities with stunning views of Mount Kenya.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conference Gallery */}
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
              Our Conference Facilities
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our versatile conference spaces designed to accommodate events of all sizes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferenceImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl group cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-heading text-xl font-bold text-primary-foreground">
                    {image.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              Conference Amenities
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {conferenceFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl shadow-elegant text-center"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
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
              Conference Packages
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully curated packages designed to meet your event needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {conferencePackages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-card p-8 rounded-xl shadow-elegant ${
                  pkg.popular ? "ring-2 ring-accent" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-accent">{pkg.price}</span>
                  {pkg.perPerson && (
                    <span className="text-muted-foreground text-sm"> / person</span>
                  )}
                </div>
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {pkg.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm">
                      <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant={pkg.popular ? "gold" : "outline"} 
                  className="w-full" 
                  asChild
                >
                  <Link to="/contact">Enquire Now</Link>
                </Button>
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
              Ready to Plan Your Event?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Contact our events team to discuss your requirements and get a customized quote for your conference or meeting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/contact">Contact Events Team</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/booking">Book Now</Link>
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
            alt="Conference facility"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default Facilities;
