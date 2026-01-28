import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Clock,
  Check,
  Heart,
  Droplets,
  Flower
} from "lucide-react";
import spaImage from "@/assets/spa.jpg";

const spaServices = [
  {
    icon: Droplets,
    name: "Hydrotherapy",
    description: "Relaxing water-based treatments for rejuvenation.",
    duration: "60-90 minutes"
  },
  {
    icon: Heart,
    name: "Body Treatments",
    description: "Nourishing wraps and scrubs for skin health.",
    duration: "75-120 minutes"
  },
  {
    icon: Flower,
    name: "Aromatherapy",
    description: "Essential oil treatments for mind and body wellness.",
    duration: "60-90 minutes"
  },
  {
    icon: Sparkles,
    name: "Facial Treatments",
    description: "Advanced skincare treatments for radiant complexion.",
    duration: "60-75 minutes"
  }
];

const Spa = () => {
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
            src={spaImage}
            alt="Luxury Spa"
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
                Wellness Center
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Luxury Spa
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Escape to tranquility with our comprehensive spa treatments designed for ultimate relaxation and rejuvenation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Holistic Wellness Experience
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our luxury spa offers a sanctuary of serenity where traditional and modern wellness practices converge. From hydrotherapy to aromatherapy, each treatment is crafted to restore balance to your mind, body, and spirit.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Using only the finest natural ingredients and premium products, our skilled therapists provide personalized treatments in a serene environment overlooking Mount Kenya.
              </p>
              <div className="flex items-center gap-4 text-sm text-accent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  8:00 AM - 8:00 PM
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Premium Treatments
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src={spaImage}
                alt="Spa Treatments"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spa Services */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              Our Services
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Spa Treatments
            </h2>
            <div className="w-20 h-1 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {spaServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-accent font-medium">
                        Duration: {service.duration}
                      </span>
                      <Button variant="outline" size="sm">Book Now</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Spa;