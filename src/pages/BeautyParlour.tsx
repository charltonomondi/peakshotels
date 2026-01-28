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
  Scissors,
  Palette
} from "lucide-react";
import beautyImage from "@/assets/beauty.jpg";

const services = [
  {
    icon: Scissors,
    name: "Hair Styling",
    description: "Professional haircuts, styling, and treatments for all hair types.",
    duration: "30-120 minutes"
  },
  {
    icon: Palette,
    name: "Facial Treatments",
    description: "Rejuvenating facials using premium products and techniques.",
    duration: "60-90 minutes"
  },
  {
    icon: Sparkles,
    name: "Manicure & Pedicure",
    description: "Complete nail care services with luxury finishes.",
    duration: "45-60 minutes"
  },
  {
    icon: Heart,
    name: "Skin Care",
    description: "Customized skin treatments for healthy, glowing complexion.",
    duration: "45-75 minutes"
  }
];

const BeautyParlour = () => {
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
            src={beautyImage}
            alt="Beauty Parlour"
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
                Spa Services
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Beauty Parlour
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Indulge in luxury beauty treatments and expert styling services.
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
                Luxury Beauty & Wellness
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our beauty parlour offers a complete range of luxury beauty services using premium products and the latest techniques. From expert hair styling to rejuvenating skin treatments, our certified beauty specialists are dedicated to enhancing your natural beauty.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Experience personalized beauty treatments in our serene and elegant parlour. Whether you're preparing for a special occasion or simply treating yourself, our services are designed to leave you feeling confident and radiant.
              </p>
              <div className="flex items-center gap-4 text-sm text-accent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  9:00 AM - 7:00 PM
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Premium Products
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-2xl"
            >
              <img
                src={beautyImage}
                alt="Beauty Parlour"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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
              Beauty Services
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl shadow-elegant"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <service.icon className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <Clock className="h-4 w-4" />
                      {service.duration}
                    </div>
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
              Book Your Beauty Treatment
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Schedule your beauty appointment with our expert stylists and therapists.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/booking">Book Beauty Service</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BeautyParlour;