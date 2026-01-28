import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, MapPin, Phone, Utensils, Wine } from "lucide-react";
import restaurantImage from "@/assets/rooftop.jpg";
import barImage from "@/assets/Ami5.jpg";

const DiningPreview = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
            Culinary Excellence
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Restaurant & Bar
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Savor exquisite cuisine crafted by our world-class chefs, featuring 
            the finest local ingredients and international flavors.
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <img
              src={restaurantImage}
              alt="The Summit Restaurant"
              className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 text-accent mb-3">
                <Utensils className="h-5 w-5" />
                <span className="text-sm font-medium tracking-wide uppercase">Restaurant</span>
              </div>
              <h3 className="font-heading text-3xl font-bold text-primary-foreground mb-3">
                The Summit Restaurant
              </h3>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Fine dining experience featuring African-inspired cuisine with 
                stunning views of Mount Kenya.
              </p>
              <div className="flex items-center gap-4 text-primary-foreground/70 text-sm mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  6:30 AM - 10:00 PM
                </span>
              </div>
              <Button variant="hero" asChild>
                <Link to="/dining">View Menu</Link>
              </Button>
            </div>
          </motion.div>

          {/* Bar Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <img
              src={barImage}
              alt="The Peak Lounge"
              className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 text-accent mb-3">
                <Wine className="h-5 w-5" />
                <span className="text-sm font-medium tracking-wide uppercase">Bar & Lounge</span>
              </div>
              <h3 className="font-heading text-3xl font-bold text-primary-foreground mb-3">
                The Ami Bar
              </h3>
              <p className="text-primary-foreground/80 mb-4 max-w-md">
                Unwind with premium spirits, signature cocktails, and live 
                entertainment in an intimate setting.
              </p>
              <div className="flex items-center gap-4 text-primary-foreground/70 text-sm mb-6">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  4:00 PM - Midnight
                </span>
              </div>
              <Button variant="hero" asChild>
                <Link to="/dining">Explore Bar</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiningPreview;
