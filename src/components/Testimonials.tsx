import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

const defaultTestimonials = [
  {
    name: "Sarah Mitchell",
    initials: "SM",
    rating: 5,
    text: "Absolutely breathtaking views and impeccable service. The staff went above and beyond to make our anniversary special. A true gem in Nanyuki!",
  },
  {
    name: "James Ochieng",
    initials: "JO",
    rating: 5,
    text: "Perfect for both business and leisure. The conference facilities are top-notch, and the rooms are incredibly comfortable. Will definitely return.",
  },
  {
    name: "Emma Thompson",
    initials: "ET",
    rating: 5,
    text: "The perfect base for exploring Mount Kenya. Waking up to those mountain views every morning was magical. Highly recommended!",
  },
];

const Testimonials = () => {
  const { reviews } = useReviews();

  // Merge guest-submitted reviews with defaults; submitted ones appear first
  const guestReviews = reviews.map(r => ({
    name: r.name,
    initials: r.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
    rating: r.rating,
    text: r.message,
  }));

  const all = [...guestReviews, ...defaultTestimonials];

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">Guest Reviews</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            What Our Guests Say
          </h2>
          <div className="w-20 h-0.5 bg-accent mx-auto" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {all.map((t, index) => (
            <motion.div
              key={`${t.name}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
              className="bg-primary-foreground/5 backdrop-blur-sm p-5 md:p-8 rounded-xl border border-primary-foreground/10"
            >
              <Quote className="h-7 w-7 md:h-10 md:w-10 text-accent/50 mb-4 md:mb-6" />
              <div className="flex gap-1 mb-3 md:mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-primary-foreground/90 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-semibold text-sm md:text-base shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground text-sm md:text-base">{t.name}</p>
                  {index < guestReviews.length && (
                    <p className="text-xs text-accent">Verified Guest</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
