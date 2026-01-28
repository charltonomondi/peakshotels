import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bed, Users, Maximize, Wifi, Wind, Coffee, ArrowRight } from "lucide-react";
import executive from "@/assets/bed5.jpg";
import superior from "@/assets/bed3.jpg";
import standard from "@/assets/bed1.jpg";

const rooms = [
  {
    name: "Standard Rooms",
    image: standard,
    price: "From KES 8,400",
    size: "35 sqm",
    guests: "2 Adults",
    bed: "King Bed",
    description: "Elegant comfort with mountain views and premium amenities for a memorable stay.",
    amenities: [Wifi, Wind, Coffee],
  },
  {
    name: "Superior Rooms",
    image: superior,
    price: "From KES 9,600",
    size: "55 sqm",
    guests: "3 Adults",
    bed: "King Bed + Sofa",
    description: "Spacious suite featuring a separate living area and panoramic savanna views.",
    amenities: [Wifi, Wind, Coffee],
  },
  {
    name: "Executive Rooms",
    image: executive,
    price: "From KES 13,400",
    size: "90 sqm",
    guests: "4 Adults",
    bed: "2 King Beds",
    description: "Ultimate luxury with private balcony, dining area, and unmatched Mount Kenya vistas.",
    amenities: [Wifi, Wind, Coffee],
  },
];

const FeaturedRooms = () => {
  return (
    <section className="py-24 bg-gradient-warm">
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
            Accommodation
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            Rooms & Suites
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each room is thoughtfully designed to provide the perfect balance of 
            African elegance and modern luxury.
          </p>
        </motion.div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-semibold text-sm">
                  {room.price}<span className="text-xs font-normal">/night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  {room.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {room.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-accent" />
                    {room.size}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    {room.guests}
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-accent" />
                    {room.bed}
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex gap-3 mb-6">
                  {room.amenities.map((Icon, i) => (
                    <div key={i} className="p-2 bg-secondary rounded-md">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                  ))}
                </div>

                <Button variant="elegant" className="w-full group/btn" asChild>
                  <Link to="/rooms">
                    Explore Rooms
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/rooms">
              View All Rooms
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedRooms;
