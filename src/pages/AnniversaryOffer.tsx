import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Mountain, BedDouble, Waves, Dumbbell, Flame, Wind, Sparkles, Scissors, Check, Gift, Calendar } from "lucide-react";
import heroImage from "@/assets/facilities/frontage.jpg";
import outdoorImg from "@/assets/outdoor/mount.jpeg";
import roomImg from "@/assets/bed5.jpg";
import wellnessImg from "@/assets/massage/mas1.jpg";

const offerHighlights = [
  "15% off all accommodation (Standard, Superior & Executive Rooms)",
  "15% off all Wellness Centre services — Swimming, Gym, Sauna, Steam Bath, Massage & Beauty Parlour",
  "15% off Outdoor Activities including team building, nature walks and mountain expeditions",
  "Offer valid from now until 9th August 2026",
  "Available for new bookings only — direct bookings only",
  "Cannot be combined with other promotions",
];

const wellness = [
  { icon: Waves,    label: "Heated Swimming Pool", desc: "Relax in our outdoor heated pool with mountain views." },
  { icon: Dumbbell, label: "Gymnasium",             desc: "State-of-the-art fitness equipment for your daily workout." },
  { icon: Flame,    label: "Sauna",                 desc: "Traditional Finnish sauna to unwind and detoxify." },
  { icon: Wind,     label: "Steam Bath",             desc: "Therapeutic moist heat for total relaxation." },
  { icon: Sparkles, label: "Massage",               desc: "Certified therapists offering a range of rejuvenating treatments." },
  { icon: Scissors, label: "Beauty Parlour",        desc: "Hair, skin and nail care by our experienced team." },
];

const outdoor = [
  { label: "Team Building",    desc: "Challenge-based outdoor programmes designed for corporate groups and schools." },
  { label: "Nature Walks",     desc: "Guided walks through Nanyuki's forests and scenic landscapes." },
  { label: "Mount Kenya Treks", desc: "Half-day and full-day expeditions with certified mountain guides." },
  { label: "Outdoor Fitness",  desc: "Outdoor gym circuits and boot camps in the fresh mountain air." },
];

const rooms = [
  { name: "Standard Rooms",  from: "KES 8,400", desc: "Comfortable and well-appointed rooms with all essentials for a perfect stay." },
  { name: "Superior Rooms",  from: "KES 9,600", desc: "Extra space and upgraded amenities including bathtub and premium linens." },
  { name: "Executive Rooms", from: "KES 13,400", desc: "Our finest accommodation with panoramic views and luxury finishes." },
];

export default function AnniversaryOffer() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[55vh] sm:h-[65vh] overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }} className="absolute inset-0">
          <img src={heroImage} alt="Peaks Anniversary 2026" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />
        </motion.div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              🎂 8 Years Strong
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
              Peaks Anniversary 2026
            </h1>
            <p className="text-accent font-semibold text-lg sm:text-xl mb-3">We're turning 8 on 6th August 2026!</p>
            <div className="w-20 h-1 bg-accent mx-auto mb-4" />
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto">
              Eight years of hospitality, adventure and memories. Celebrate with us and enjoy an exclusive <strong className="text-accent">15% discount</strong> across accommodation, wellness and outdoor activities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back */}
      <div className="container mx-auto px-4 sm:px-6 py-5">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>
      </div>

      {/* Discount Banner */}
      <section className="pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-accent to-amber-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="h-8 w-8" />
              <span className="font-heading text-5xl sm:text-6xl font-bold">15% OFF</span>
              <Gift className="h-8 w-8" />
            </div>
            <p className="text-white/90 text-lg font-medium mb-1">Anniversary Special — Book now, valid until 9th August 2026</p>
            <p className="text-white/75 text-sm">Accommodation · Wellness · Outdoor Activities</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">Offer ends: 9th August 2026</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What's included */}
      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">What's included</h2>
            <p className="text-muted-foreground text-sm mt-1">Everything you need for a perfect anniversary celebration</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {offerHighlights.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-900">{h}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodation */}
      <section className="pb-12 bg-secondary/30 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="h-5 w-5 text-accent" />
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">Accommodation</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">Stay with us and save</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Choose from our range of beautifully appointed rooms and enjoy 15% off your stay. Whether you're coming for a weekend escape or a longer retreat, Peaks Hotel Nanyuki is the perfect base for your adventure — right at the foot of Mount Kenya.
              </p>
              <div className="space-y-3">
                {rooms.map(r => (
                  <div key={r.name} className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground text-sm">{r.name}</p>
                      <span className="text-xs text-accent font-bold">{r.from} <span className="line-through text-muted-foreground font-normal">regular</span></span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-lg h-64 sm:h-80 lg:h-full min-h-[300px]">
              <img src={roomImg} alt="Peaks Hotel Rooms" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Outdoor Activities */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="lg:order-2">
              <div className="flex items-center gap-2 mb-3">
                <Mountain className="h-5 w-5 text-accent" />
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">Outdoor Activities</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">Adventure awaits</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                From team building challenges to guided mountain treks, our outdoor programmes are designed to inspire, energise and connect. Enjoy 15% off all outdoor activities when you book during the anniversary period.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outdoor.map(a => (
                  <div key={a.label} className="bg-secondary/50 rounded-xl p-3.5 border border-border/50">
                    <p className="font-semibold text-sm text-foreground mb-1">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:order-1 overflow-hidden rounded-2xl shadow-lg h-64 sm:h-80 lg:h-full min-h-[300px]">
              <img src={outdoorImg} alt="Outdoor Activities" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wellness */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-accent text-xs font-semibold uppercase tracking-widest">Wellness Centre</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">Relax. Restore. Rejoice.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our world-class Wellness Centre is the perfect way to celebrate eight years with us. Swimming, sauna, steam bath, gym, massage and beauty — all at 15% off during the anniversary period.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wellness.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-background rounded-xl p-3.5 border border-border text-center">
                    <Icon className="h-5 w-5 text-accent mx-auto mb-1.5" />
                    <p className="font-semibold text-xs text-foreground mb-1">{label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-lg h-64 sm:h-80 lg:h-full min-h-[300px]">
              <img src={wellnessImg} alt="Wellness Centre" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stars / milestone */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(8)].map((_, i) => <Star key={i} className="h-6 w-6 fill-accent text-accent" />)}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">8 Years of Peaks Hotel Nanyuki</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
              Eight years of genuine Kenyan hospitality, breathtaking mountain views, memorable stays and unforgettable adventures. Thank you for being part of our journey. Here's to many more peaks ahead.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-primary rounded-2xl p-8 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground mb-2">
              Don't miss the 15% anniversary discount
            </h2>
            <p className="text-primary-foreground/75 mb-6 max-w-lg mx-auto text-sm">
              Valid until 9th August 2026 on accommodation, wellness and outdoor activities. Book now — limited availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="gold" size="lg" asChild><Link to="/booking">Book Now — 15% Off</Link></Button>
              <Button variant="heroOutline" size="lg" asChild><a href="tel:+254711969690">Call +254 711 969 690</a></Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
