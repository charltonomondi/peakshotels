import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Clock,
  Check,
  Users,
  Zap,
  Target
} from "lucide-react";
import gymHero from "@/assets/gym/gym.jpg";
import gym1 from "@/assets/gym/gym1.jpg";
import gym2 from "@/assets/gym/gym2.jpg";
import gym3 from "@/assets/gym/gym3.jpg";

const gymGallery = [gym1, gym2, gym3];

const features = [
  {
    icon: Dumbbell,
    title: "Strength Training",
    description: "Complete range of free weights and machines for all muscle groups."
  },
  {
    icon: Zap,
    title: "Cardio Equipment",
    description: "Treadmills, ellipticals, and stationary bikes with scenic views."
  },
  {
    icon: Target,
    title: "Personal Training",
    description: "Certified trainers available for personalized workout plans."
  },
  {
    icon: Users,
    title: "Group Classes",
    description: "Yoga, pilates, and strength training classes throughout the week."
  }
];

const Gym = () => {
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
            src={gymHero}
            alt="Our Gym"
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
                Our Gym
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto mb-6" />
              <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Stay fit and energized during your stay with our state-of-the-art gym facilities.
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
                Modern Equipment & Scenic Views
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our gym offers a complete fitness experience with the latest equipment and breathtaking views of Mount Kenya. Whether you're maintaining your routine or starting a new one, our facilities provide everything you need for an effective workout.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                With certified trainers available and a variety of equipment, you'll find the perfect environment to achieve your fitness goals while enjoying the luxury of Peaks Hotel.
              </p>
              <div className="flex items-center gap-4 text-sm text-accent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Open 24/7
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Personal Training Available
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
                src={gym1}
                alt="Gym Facilities"
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
              Gym Features
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

      {/* Gallery */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Take a Look Inside
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gymGallery.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="overflow-hidden rounded-xl aspect-square"
              >
                <img
                  src={img}
                  alt={`Gym photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
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
              Ready to Work Out?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Visit our gym anytime during your stay. Personal training sessions can be booked in advance.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/booking">Book Personal Training</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gym;