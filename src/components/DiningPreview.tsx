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
            Restaurant & Dining Areas
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Savor exquisite cuisine crafted by our chefs, featuring 
            the finest local ingredients and international flavors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Summit Card */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-2xl">
            <img src={restaurantImage} alt="The Summit Restaurant"
              className="w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Utensils className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide uppercase">The Summit Restaurant</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">Dining with a View.</h3>
              <p className="text-primary-foreground/80 mb-3 text-sm hidden sm:block">Enjoy meals and refreshments while taking in panoramic views of Mount Kenya, the Aberdares and the Lolldaiga Hills.</p>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-xs mb-4">
                <Clock className="h-3.5 w-3.5" /><span>6:30 AM - 10:00 PM</span>
              </div>
              <Button variant="hero" size="sm" asChild><Link to="/dining">View Menu</Link></Button>
            </div>
          </motion.div>

          {/* Mbaruk Card */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl">
            // To update this later... MBARUK!!!
            <img src={restaurantImage} alt="Mbaruk Restaurant"
              className="w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Utensils className="h-4 w-4" />
                <span className="text-xs font-medium tracking-wide uppercase">Mbaruk Restaurant</span>
              </div>
              <h3 className="font-heading text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">Fresh. Comfortable. Welcoming.</h3>
              <p className="text-primary-foreground/80 mb-3 text-sm hidden sm:block">Our all-day dining restaurant serving Kenyan, African and international favourites.</p>
              <div className="flex items-center gap-2 text-primary-foreground/70 text-xs mb-4">
                <Clock className="h-3.5 w-3.5" /><span>6:30 AM - 10:00 PM</span>
              </div>
              <Button variant="hero" size="sm" asChild><Link to="/dining">View Menu</Link></Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiningPreview;
