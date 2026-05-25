import { motion } from "framer-motion";
import { 
  Waves, 
  UtensilsCrossed, 
  Shirt, 
  Users, 
  Car, 
  Wifi,
  Dumbbell,
  TreePalm
} from "lucide-react";

const facilities = [
  {
    icon: Waves,
    name: "Infinity Pool",
    description: "Stunning pool overlooking Mount Kenya with poolside service",
  },
  {
    icon: UtensilsCrossed,
    name: "Fine Dining",
    description: "Award-winning cuisine with local and international flavors",
  },
  {
    icon: Dumbbell,
    name: "Fitness Center",
    description: "Fully equipped gym with personal training available",
  },
  {
    icon: Users,
    name: "Conference Halls",
    description: "Modern meeting spaces for up to 200 guests",
  },
  {
    icon: Shirt,
    name: "Laundry Service",
    description: "Same-day laundry and dry cleaning service",
  },
  {
    icon: Car,
    name: "Secure Parking",
    description: "Complimentary covered parking with 24/7 security",
  },
  {
    icon: Wifi,
    name: "High-Speed WiFi",
    description: "Complimentary internet access throughout the hotel",
  },
  {
    icon: TreePalm,
    name: "Garden Terrace",
    description: "Beautiful landscaped gardens for relaxation",
  },
];

const Facilities = () => {
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
            Hotel Amenities
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            World-Class Facilities
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our comprehensive range of amenities designed to make your 
            stay exceptional in every way.
          </p>
        </motion.div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group bg-card p-4 md:p-6 rounded-xl hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-11 h-11 md:w-14 md:h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-accent transition-colors duration-300">
                <facility.icon className="h-5 w-5 md:h-7 md:w-7 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-heading text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                {facility.name}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                {facility.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
