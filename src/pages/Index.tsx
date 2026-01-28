import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedRooms from "@/components/FeaturedRooms";
import Facilities from "@/components/Facilities";
import DiningPreview from "@/components/DiningPreview";
import Testimonials from "@/components/Testimonials";
import SpecialOffers from "@/components/SpecialOffers";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, Heart, Shield, Users } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Excellence",
    description: "We are dedicated to exceeding expectations in every aspect of hospitality.",
  },
  {
    icon: Users,
    title: "Guest-Centered Service",
    description: "Every guest is treated as family, with personalized attention and care.",
  },
  {
    icon: Shield,
    title: "Integrity & Trust",
    description: "We uphold the highest standards of honesty and transparency.",
  },
  {
    icon: Award,
    title: "Quality Assurance",
    description: "From housekeeping to dining, we maintain impeccable standards.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >

              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                About Us
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Nestled at the foot of the majestic Mount Kenya, Peaks Hotel has been a beacon of
                African luxury and hospitality since its founding. Our journey began with a simple
                vision: to create an oasis where travelers could experience the authentic beauty
                of Kenya while enjoying world-class comfort.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Located in the charming town of Nanyuki, we offer our guests breathtaking views
                of Africa's second-highest peak, combined with the warmth and elegance that defines
                true Kenyan hospitality. Every corner of our hotel tells a story of our commitment
                to excellence.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Today, Peaks Hotel stands as a premier destination for discerning travelers seeking
                an unforgettable experience. Whether you're here for business, adventure, or relaxation,
                we promise a stay that will leave lasting memories.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4"
            >
              <iframe width="150%" height="500" src="https://www.youtube.com/embed/ccKNjEAzbz0" title="outdoor dining experience" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="rounded-lg shadow-lg"></iframe>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4">
              What We Stand For
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <div className="w-20 h-0.5 bg-accent mx-auto" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Manager's Message */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant"
            >
              <p className="text-accent font-medium tracking-[0.2em] uppercase mb-4 text-center">
                A Message From Our Team
              </p>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-8 text-center">
                General Manager's Welcome
              </h2>
              <blockquote className="text-lg text-muted-foreground italic leading-relaxed text-center mb-8">
                "At Peaks Hotel, we believe that true hospitality comes from the heart. Our dedicated
                team works tirelessly to ensure that every moment of your stay exceeds expectations.
                From the breathtaking views to the exquisite cuisine, we've crafted an experience
                that celebrates the very best of Kenya. We look forward to welcoming you home."
              </blockquote>
              <p className="text-center font-semibold text-foreground">
                The Peaks Hotel Management Team
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <FeaturedRooms />
      <Facilities />
      <DiningPreview />
      <SpecialOffers />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
