import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedRooms from "@/components/FeaturedRooms";
import DiningPreview from "@/components/DiningPreview";
import Testimonials from "@/components/Testimonials";
import SpecialOffers from "@/components/SpecialOffers";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Mountain, MapPin, Heart, Users, Award, Waves, Dumbbell, UtensilsCrossed, Users2, TreePine, Star, ArrowRight, Play } from "lucide-react";

import grounds1  from "@/assets/facilities/frontage.jpg";
import grounds2  from "@/assets/facilities/Grounds2.jpg";
import bed5      from "@/assets/bed5.jpg";
import viewOlp   from "@/assets/outdoor/mount.jpeg";
import rooftop   from "@/assets/restaurant/rest2.jpg";
import pool      from "@/assets/swimming/swim1.jpg";
import gym       from "@/assets/gym/gym.jpg";
import conference from "@/assets/conferences/conference1.jpeg";
import spa       from "@/assets/spa.jpg";

const stats = [
  { value: "42+",  label: "Luxury Rooms",         suffix: "" },
  { value: "6",    label: "Dining Spaces",         suffix: "" },
  { value: "5+",   label: "Wellness Facilities",   suffix: "" },
  { value: "24/7", label: "Guest Services",        suffix: "" },
];

const experiences = [
  { icon: Waves,          label: "Heated Pool",       path: "/swimming",   img: pool },
  { icon: Dumbbell,       label: "Fitness Centre",    path: "/gym",        img: gym },
  { icon: UtensilsCrossed,label: "Fine Dining",       path: "/restaurant", img: rooftop },
  { icon: Users2,         label: "Conferences",       path: "/facilities", img: conference },
  { icon: TreePine,       label: "Adventure",         path: "/activities", img: viewOlp },
  { icon: Heart,          label: "Spa & Wellness",    path: "/spa",        img: spa },
];

const Index = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: aboutScroll } = useScroll({ target: aboutRef, offset: ["start end", "end start"] });
  const mosaicY = useTransform(aboutScroll, [0, 1], ["-6%", "6%"]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950">
      <Navbar />
      <Hero />

      {/* ── STATS STRIP — dark gold ────────────────────────────────────── */}
      <section className="relative bg-zinc-900 border-y border-zinc-800 py-0 overflow-hidden">
        {/* Gold shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800">
            {stats.map(({ value, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="text-center py-10 px-4">
                <p className="font-heading text-4xl md:text-5xl font-bold text-amber-400 mb-1 leading-none">{value}</p>
                <p className="text-zinc-500 text-[11px] uppercase tracking-[0.18em] font-medium mt-2">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </section>

      {/* ── ABOUT — cinematic editorial split ─────────────────────────── */}
      <section ref={aboutRef} className="py-20 md:py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text side */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-[1px] w-10 bg-amber-400" />
                <span className="text-amber-400/80 text-[10px] font-bold tracking-[0.3em] uppercase">Nanyuki, Kenya</span>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] mb-6">
                Where Nature Meets<br />
                <span className="italic font-light text-amber-400">Extraordinary</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                Nestled at the foothills of Mt. Kenya, Peaks Hotel Nanyuki blends genuine Kenyan hospitality with natural beauty. From memorable stays and fine dining to wellness and adventure — every visit is designed to exceed expectations.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-10">
                {[
                  { icon: Mountain, text: "Mount Kenya" },
                  { icon: Mountain, text: "Aberdare Ranges" },
                  { icon: MapPin,   text: "Lolldaiga Hills" },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-2 bg-amber-400/5 border border-amber-400/20 text-foreground text-sm px-4 py-2 rounded-full">
                    <Icon className="h-3.5 w-3.5 text-amber-400" />{text}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="gold" size="lg" asChild>
                  <Link to="/about">Our Story</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/booking">Book Now <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
              </div>
            </motion.div>

            {/* Mosaic */}
            <div className="relative h-[520px] hidden lg:block">
              <motion.div style={{ y: mosaicY }} initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="absolute left-0 top-0 w-[58%] h-[66%] overflow-hidden rounded-3xl shadow-2xl">
                <img src={grounds1} alt="Hotel" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
                className="absolute right-0 top-0 w-[38%] h-[42%] overflow-hidden rounded-3xl shadow-xl">
                <img src={bed5} alt="Room" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25 }}
                className="absolute right-0 bottom-0 w-[38%] h-[42%] overflow-hidden rounded-3xl shadow-xl">
                <img src={viewOlp} alt="View" className="w-full h-full object-cover" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35 }}
                className="absolute left-0 bottom-0 w-[56%] h-[28%] overflow-hidden rounded-3xl shadow-xl">
                <img src={rooftop} alt="Rooftop dining" className="w-full h-full object-cover" />
              </motion.div>
              {/* Rating badge */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.5 }}
                className="absolute left-[52%] top-[60%] -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-zinc-950 rounded-2xl px-4 py-3 shadow-2xl z-10 text-center">
                <div className="flex items-center gap-1 justify-center mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
                <p className="text-[10px] font-bold tracking-wider">GUEST RATED</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCES GRID — dark magazine style ─────────────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="mb-14">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8 bg-amber-400" />
              <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.3em] uppercase">Experiences</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Everything in One Place
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {experiences.map(({ icon: Icon, label, path, img }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link to={path}
                  className="group relative overflow-hidden rounded-2xl block aspect-[4/3]">
                  <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" style={{ transform: "scale(1)" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                  <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/8 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-amber-400/20 group-hover:bg-amber-400 flex items-center justify-center transition-colors duration-300">
                        <Icon className="h-3.5 w-3.5 text-amber-400 group-hover:text-zinc-950 transition-colors duration-300" />
                      </div>
                    </div>
                    <p className="text-white text-[13px] font-semibold tracking-wide">{label}</p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center">
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-950" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO + WHY PEAKS ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Video */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative group">
              <div className="overflow-hidden rounded-3xl shadow-2xl aspect-video border border-border">
                <iframe
                  src="https://www.youtube.com/embed/kwW1S6c_RlM"
                  title="Peaks TV — Outdoor Experience"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen className="w-full h-full" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-amber-400/20 rounded-3xl -z-10" />
            </motion.div>

            {/* Values */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-8 bg-amber-400" />
                <span className="text-amber-400/70 text-[10px] font-bold tracking-[0.3em] uppercase">Why Peaks</span>
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
                Something for<br />Everybody
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Users,  title: "For Every Traveller", desc: "Accommodation, dining, wellness, adventure, conferences, events and celebrations." },
                  { icon: Heart,  title: "Wellness & Recreation", desc: "Heated pool, gym, sauna, steam bath, massage and beauty services." },
                  { icon: Award,  title: "Adventure & Discovery", desc: "Outdoor challenges, nature walks, hiking, and Mount Kenya expeditions." },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 group">
                    <div className="w-11 h-11 bg-amber-400/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-400 transition-colors duration-300 border border-amber-400/20">
                      <Icon className="h-5 w-5 text-amber-400 group-hover:text-zinc-950 transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FeaturedRooms />
      <DiningPreview />

      {/* ── MANAGER'S QUOTE — full bleed dark ─────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={grounds2} alt="Peaks Hotel grounds" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-zinc-950/60" />
        </div>
        {/* Decorative gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        <div className="relative container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }} className="max-w-2xl">
            <div className="text-amber-400/60 text-7xl font-heading leading-none mb-4 select-none">"</div>
            <blockquote className="font-heading text-2xl md:text-3xl font-light text-white leading-relaxed mb-8 italic -mt-8">
              Peaks Hotel is a place where beauty and nature meet taste and genuine hospitality. We are proud to welcome guests from Nanyuki, from Kenya and around the world.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-400 rounded-full flex items-center justify-center text-zinc-950 font-heading font-bold text-lg shadow-lg">
                P
              </div>
              <div>
                <p className="font-semibold text-white text-sm">The Peaks Hotel Team</p>
                <p className="text-zinc-500 text-xs tracking-wide">Nanyuki, Kenya</p>
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
