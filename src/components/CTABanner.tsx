import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import poolImage from "@/assets/pool.jpg";

const CTABanner = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src={poolImage} alt="Peaks Hotel Pool" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      <div className="relative z-10 container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center">
          <p className="text-accent font-medium tracking-[0.2em] uppercase mb-3 text-xs md:text-sm">Book Your Escape</p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary-foreground mb-4 md:mb-6">
            Ready for the Peaks Experience?
          </h2>
          <p className="text-primary-foreground/90 text-sm md:text-lg mb-6 md:mb-10 max-w-xl mx-auto px-2">
            Let us create unforgettable memories for you. Book your stay today and discover the magic of Peaks Hotel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 sm:px-0">
            <Button variant="hero" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/booking">Reserve Your Room</Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
