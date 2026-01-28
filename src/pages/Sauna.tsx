import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Flame,
  Clock,
  Check,
  Heart,
  Droplets,
  Shield
} from "lucide-react";
import spaImage from "@/assets/spa.jpg";

const features = [
  {
    icon: Flame,
    title: "Traditional Sauna",
    description: "Authentic Finnish sauna experience with controlled heat and humidity."
  },
  {
    icon: Heart,
    title: "Improved Circulation",
    description: "Heat therapy that enhances blood flow and cardiovascular health."
  },
  {
    icon: Droplets,
    title: "Essential Oils",
    description: "Aromatherapy infusions for enhanced relaxation and wellness."
  },
  {
    icon: Shield,
    title: "Immune Boost",
    description: "Regular sauna use may strengthen immune system response."
  }
];

const Sauna = () => {
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
            alt="Traditional Sauna"
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
                Traditional Sauna
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Experience the ancient art of sauna bathing in our authentic Finnish sauna.
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
                Heat Therapy & Wellness
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our traditional Finnish sauna offers a pure heat experience that promotes deep relaxation and numerous health benefits. The dry heat penetrates deeply, promoting sweating and detoxification while improving circulation and reducing stress.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Rooted in centuries-old tradition, sauna bathing is not just about heat—it's about holistic wellness. Our sauna is crafted with premium materials and maintained at optimal temperatures for maximum therapeutic effect.
              </p>
              <div className="flex items-center gap-4 text-sm text-accent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  8:00 AM - 8:00 PM
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  80-90°C Temperature
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
                src={spaImage}
                alt="Traditional Sauna"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
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
              Sauna Benefits
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl shadow-elegant"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <feature.icon className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
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
              Experience the Heat?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Book your sauna session and discover the ancient tradition of heat therapy.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/booking">Book Sauna Session</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sauna;