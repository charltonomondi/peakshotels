import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tag, Mail, Bell } from "lucide-react";

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
        </motion.div>

        {/* No offers state */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="h-9 w-9 text-accent" />
          </div>

          <h3 className="font-heading text-2xl font-bold text-foreground mb-3">
            No Active Offers Right Now
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            We do not have any special offers running at the moment. Keep an eye for a next offer.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" size="lg" asChild>
              <a href="mailto:info@peakshotels.co.ke?subject=Special Offers Enquiry">
                <Mail className="h-4 w-4 mr-2" />
                Email Us for Offers
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:info@peakshotels.co.ke?subject=Notify me of Special Offers">
                <Bell className="h-4 w-4 mr-2" />
                Get Notified
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffers;
