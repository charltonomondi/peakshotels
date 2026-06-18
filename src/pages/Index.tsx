import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedRooms from "@/components/FeaturedRooms";
import Facilities from "@/components/Facilities";
import DiningPreview from "@/components/DiningPreview";
import Testimonials from "@/components/Testimonials";
import SpecialOffers from "@/components/SpecialOffers";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Award, Heart, Shield, Users, MapPin, Mountain, Star, ArrowRight } from "lucide-react";

// Images
import grounds1   from "@/assets/facilities/Grounds1.jpg";
import grounds2   from "@/assets/facilities/Grounds2.jpg";
import frontage   from "@/assets/facilities/frontage.jpg";
import rooftop    from "@/assets/facilities/rooftop.jpg";
import bed5       from "@/assets/bed5.jpg";
import viewOlp    from "@/assets/views/Olpajeta conservancy.jpg";

const stats = [
  { value: "42+", label: "Rooms" },
  { value: "6", label: "Dining Spaces" },
  { value: "5+", label: "Wellness Facilities" },
  { value: "3", label: "Iconic Peaks" },
];

const values = [
  { icon: Mountain, title: "The Three Peaks", description: "Inspired by Mount Kenya, the Aberdare Ranges and the Lolldaiga Hills — the landmarks that define our horizon and identity." },
  { icon: Users,    title: "Something for Everybody", description: "Accommodation, dining, wellness, adventure, conferences, events and celebrations — all in one uniquely Kenyan destination." },
  { icon: Heart,    title: "Wellness and Recreation", description: "Heated pool, gym, sauna, steam bath, massage and beauty services for your health and relaxation." },
  { icon: Award,    title: "Sustainability in Action", description: "Solar energy, biogas, wastewater recycling and environmental stewardship — sustainability is a way of life here." },
];

const Index = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({ target: aboutRef, offset: ["start end", "end start"] });
  const mosaicY = useTransform(aboutScroll, [0, 1], ["-8%", "8%"]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* ── STATS STRIP ── */}
      <section className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-primary-foreground/20">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <p className="font-heading text-4xl md:text-5xl font-bold text-accent mb-1">{value}</p>
                <p className="text-primary-foreground/60 text-sm uppercase tracking-wider">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── cinematic split with photo mosaic */}
      <section ref={aboutRef} className="py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-accent text-xs font-medium tracking-[0.25em] uppercase">Nanyuki, Kenya</span>
              </div>
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Welcome to<br />
                <span className="text-accent italic font-light">Peaks Hotel Nanyuki</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-5">
                Nestled at the foot of Mount Kenya and inspired by the magnificent landscapes of Mount Kenya, the Aberdare Ranges and the Lolldaiga Hills, Peaks Hotel is one of Nanyuki's most distinctive hospitality destinations.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Here, accommodation, dining, wellness, adventure, conferences and celebrations come together in a uniquely Kenyan setting shaped by nature and guided by genuine hospitality. Whether you are a local resident, a traveller, a business guest, a family, or a visitor from anywhere in the world — Peaks Hotel offers an experience designed for you.
              </p>

              {/* location pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  { icon: Mountain, text: "Mount Kenya" },
                  { icon: Mountain, text: "Aberdare Ranges" },
                  { icon: MapPin,   text: "Lolldaiga Hills" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-2 bg-secondary text-foreground text-sm px-4 py-2 rounded-full border border-border">
                    <Icon className="h-3.5 w-3.5 text-accent" />{text}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/about">Our Story</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/booking">Book Now <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </motion.div>

            {/* Photo mosaic */}
            <div className="relative h-[540px] hidden lg:block">
              {/* large left */}
              <motion.div
                style={{ y: mosaicY }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="absolute left-0 top-0 w-[58%] h-[68%] overflow-hidden rounded-3xl shadow-2xl"
              >
                <img src={grounds1} alt="Hotel grounds" className="w-full h-full object-cover" />
              </motion.div>
              {/* top right */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="absolute right-0 top-0 w-[38%] h-[44%] overflow-hidden rounded-3xl shadow-xl"
              >
                <img src={bed5} alt="Executive room" className="w-full h-full object-cover" />
              </motion.div>
              {/* bottom right */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="absolute right-0 bottom-0 w-[38%] h-[44%] overflow-hidden rounded-3xl shadow-xl"
              >
                <img src={viewOlp} alt="Ol Pejeta view" className="w-full h-full object-cover" />
              </motion.div>
              {/* bottom left accent */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="absolute left-0 bottom-0 w-[56%] h-[28%] overflow-hidden rounded-3xl shadow-xl"
              >
                <img src={rooftop} alt="Rooftop" className="w-full h-full object-cover" />
              </motion.div>
              {/* floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute left-[52%] top-[62%] -translate-x-1/2 -translate-y-1/2 bg-accent text-accent-foreground rounded-2xl px-5 py-4 shadow-2xl z-10 text-center"
              >
                <p className="font-heading text-2xl font-bold leading-none">0°</p>
                <p className="text-xs font-medium mt-0.5 opacity-80">The Equator</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO + VALUES ── */}
      <section className="py-24 bg-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Video */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-3xl shadow-2xl aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/ccKNjEAzbz0"
                  title="Peaks Hotel experience"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {/* decorative frame accent */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-accent/30 rounded-3xl -z-10" />
            </motion.div>

            {/* Values */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-accent text-xs font-medium tracking-[0.25em] uppercase mb-3">Our philosophy</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
                Why Guests Choose Peaks
              </h2>
              <div className="space-y-6">
                {values.map(({ icon: Icon, title, description }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-5 group"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors duration-300">
                      <Icon className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FeaturedRooms />
      <Facilities />
      <DiningPreview />

      {/* ── MANAGER'S MESSAGE ── editorial full-bleed */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={frontage} alt="Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20" />
        </div>
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-accent text-xs font-medium tracking-[0.3em] uppercase mb-6">A message from our team</p>
            <blockquote className="font-heading text-2xl md:text-3xl font-light text-white leading-relaxed mb-8 italic">
              "Peaks Hotel is a place where beauty and nature meet taste and genuine hospitality. We are proud to welcome guests from Nanyuki, from Kenya and from around the world. This is your home in the highlands."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-lg">
                P
              </div>
              <div>
                <p className="font-semibold text-white">The Peaks Hotel Team</p>
                <p className="text-white/50 text-sm">Nanyuki, Kenya</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SpecialOffers />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
