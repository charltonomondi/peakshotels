import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Hand,
  Clock,
  Check,
  Heart,
  Sparkles,
  Users
} from "lucide-react";
import spaImage from "@/assets/spa.jpg";

const massageTypes = [
  {
    name: "Swedish Massage",
    description: "Relaxing full-body massage using gentle, flowing strokes.",
    duration: "60-90 minutes"
  },
  {
    name: "Deep Tissue Massage",
    description: "Therapeutic massage targeting deep muscle layers and chronic tension.",
    duration: "60-90 minutes"
  },
  {
    name: "Aromatherapy Massage",
    description: "Essential oils combined with massage for enhanced relaxation.",
    duration: "60-75 minutes"
  },
  {
    name: "Sports Massage",
    description: "Specialized massage for athletes and active individuals.",
    duration: "60 minutes"
  }
];

const Massage = () => {
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
            alt="Therapeutic Massage"
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
                Therapeutic Massage
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Indulge in professional massage therapy tailored to your wellness needs.
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
                Expert Touch & Healing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our certified massage therapists provide personalized treatments using traditional and modern techniques. Each session is designed to address your specific needs, whether you're seeking relaxation, pain relief, or overall wellness enhancement.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Using premium oils and the finest techniques, our massage services promote deep relaxation, improved circulation, and natural healing. Experience the transformative power of therapeutic touch in our serene spa environment.
              </p>
              <div className="flex items-center gap-4 text-sm text-accent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  By Appointment
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Certified Therapists
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
                alt="Massage Therapy"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Massage Types Section */}
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
              Massage Options
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {massageTypes.map((massage, index) => (
              <motion.div
                key={massage.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card p-8 rounded-xl shadow-elegant"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Hand className="h-8 w-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                      {massage.name}
                    </h3>
                    <p className="text-muted-foreground mb-3">
                      {massage.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-accent">
                      <Clock className="h-4 w-4" />
                      {massage.duration}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Massage Benefits
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                Stress Relief
              </h3>
              <p className="text-muted-foreground">
                Reduces stress hormones and promotes deep relaxation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                Pain Management
              </h3>
              <p className="text-muted-foreground">
                Alleviates muscle tension and chronic pain conditions.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                Improved Circulation
              </h3>
              <p className="text-muted-foreground">
                Enhances blood flow and lymphatic drainage.
              </p>
            </motion.div>
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
              Book Your Massage
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Schedule your therapeutic massage session with our expert therapists.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/booking">Book Massage</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Massage;