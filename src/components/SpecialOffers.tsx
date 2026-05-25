import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Percent, Calendar, Gift } from "lucide-react";

const offers = [
  {
    icon: Calendar,
    title: "Weekend Getaway",
    discount: "20% OFF",
    description: "Book 2 nights, get 20% off on your total stay. Valid for Friday-Sunday bookings.",
    validUntil: "Valid until March 2024",
    bgColor: "bg-gradient-to-br from-accent/20 to-accent/5",
  },
  {
    icon: Percent,
    title: "Early Bird Special",
    discount: "15% OFF",
    description: "Book 30 days in advance and save 15% on accommodation.",
    validUntil: "Ongoing offer",
    bgColor: "bg-gradient-to-br from-forest/20 to-forest/5",
  },
  {
    icon: Gift,
    title: "Honeymoon Package",
    discount: "Complimentary Dinner",
    description: "Celebrate love with a romantic dinner, spa treatment, and champagne.",
    validUntil: "Couple packages",
    bgColor: "bg-gradient-to-br from-primary/20 to-primary/5",
  },
];

const SpecialOffers = () => {
  return (
    <section className="py-24 bg-secondary">
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
            Exclusive Deals
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Special Offers
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take advantage of our exclusive packages and seasonal promotions 
            for an unforgettable stay.
          </p>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {offers.map((offer, index) => (
            <motion.div key={offer.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${offer.bgColor} rounded-2xl p-5 md:p-8 border border-border`}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                <offer.icon className="h-6 w-6 md:h-8 md:w-8 text-accent-foreground" />
              </div>
              <p className="text-accent font-bold text-lg md:text-xl mb-1 md:mb-2">{offer.discount}</p>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3">{offer.title}</h3>
              <p className="text-muted-foreground mb-3 md:mb-4 text-sm">{offer.description}</p>
              <p className="text-xs text-muted-foreground/70 mb-4 md:mb-6">{offer.validUntil}</p>
              <Button variant="elegant" className="w-full" asChild>
                <Link to="/booking">Book This Offer</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
