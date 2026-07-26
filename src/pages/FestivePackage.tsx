import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Star, Gift, Waves, Dumbbell, Flame, Wind } from "lucide-react";
import heroImage from "@/assets/facilities/conference10.jpg";

const rates = [
  {
    category: "Standard Rooms",
    rows: [
      { type: "1. Single Room",              hb: 13500, fb: 16000 },
      { type: "2. Double Room",              hb: 17900, fb: 20900 },
      { type: "3. Twin Room (per person sharing)", hb: 10600, fb: 13100 },
    ],
  },
  {
    category: "Superior Rooms",
    rows: [
      { type: "1. Single Room",              hb: 15000, fb: 17500 },
      { type: "2. Double Room",              hb: 19400, fb: 22400 },
      { type: "3. Twin Room (per person sharing)", hb: 11400, fb: 13900 },
    ],
  },
  {
    category: "Executive Rooms",
    rows: [
      { type: "1. Single Room",              hb: 20000, fb: 22500 },
      { type: "2. Double Room",              hb: 25000, fb: 28000 },
    ],
  },
];

const notes = [
  "Lunch and dinner for in-house guests will be KSh 2,500 per person per meal.",
  "For walk-ins, brunch is KSh 3,500 per person and dinner is KSh 3,000 per person.",
  "À la carte options will not be available during the festive season.",
  "Early bird direct bookings will receive a 5% discount, valid until 31st October 2026.",
  "Bookings for three days and above will receive a 10% discount.",
  "The heated pool (Swimming), Gymnasium, Steam Bath and Sauna are complimentary for in-house guests.",
  "No one-day bookings over the festive seasons.",
  "Bookings (meal plans) will be only at Half Board and Full Board.",
];

const fmt = (n: number) => `KES ${n.toLocaleString()}`;

export default function FestivePackage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }} className="absolute inset-0">
          <img src={heroImage} alt="Festive Season 2026" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
        </motion.div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">Festive 2026</span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Festive Season 2026
            </h1>
            <div className="w-20 h-1 bg-accent mx-auto mb-4" />
            <p className="text-white/85 text-base sm:text-lg max-w-2xl mx-auto">
              Celebrate in style at Peaks Hotel Nanyuki. Experience the magic of the festive season surrounded by the beauty of Mount Kenya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Back link */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>
      </div>

      {/* Highlights */}
      <section className="pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Waves,    label: "Heated Pool", sub: "Complimentary" },
              { icon: Dumbbell, label: "Gymnasium",   sub: "Complimentary" },
              { icon: Flame,    label: "Sauna",        sub: "Complimentary" },
              { icon: Wind,     label: "Steam Bath",   sub: "Complimentary" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-accent/10 rounded-2xl p-4 text-center">
                <Icon className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-accent font-medium">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates table */}
      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">Festive Season Rates</h2>
            <p className="text-muted-foreground text-sm mb-6">All rates in KES per person per night · inclusive of taxes</p>

            <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="text-left px-5 py-3.5 font-semibold">Type of Room</th>
                    <th className="text-right px-5 py-3.5 font-semibold">Half Board (HB)</th>
                    <th className="text-right px-5 py-3.5 font-semibold">Full Board (FB)</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map(({ category, rows }) => (
                    <>
                      <tr key={category} className="bg-accent/10">
                        <td colSpan={3} className="px-5 py-2.5 font-bold text-foreground text-sm">{category}</td>
                      </tr>
                      {rows.map((row, i) => (
                        <tr key={row.type} className={`border-b border-border/40 ${i % 2 === 0 ? "bg-background" : "bg-secondary/30"}`}>
                          <td className="px-5 py-3 pl-8 text-muted-foreground">{row.type}</td>
                          <td className="px-5 py-3 text-right font-semibold text-foreground">{fmt(row.hb)}</td>
                          <td className="px-5 py-3 text-right font-semibold text-foreground">{fmt(row.fb)}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notes */}
      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-2xl border border-border p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Star className="h-5 w-5 text-accent" />
              <h2 className="font-heading text-xl font-bold text-foreground">Important Notes</h2>
            </div>
            <div className="space-y-3">
              {notes.map((note, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-accent font-bold text-sm shrink-0 mt-0.5">{i + 1}.</span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Children Policy */}
      <section className="pb-14">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-5">
              <Gift className="h-5 w-5 text-accent" />
              <h2 className="font-heading text-xl font-bold text-foreground">Children Policy</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "a. Sharing a room with adult/s",
                  items: ["0–4 years — Free of Charge (FOC)", "5–11 years — KSh 3,500", "12 years and above — Full Adult Rate"],
                },
                {
                  title: "b. Own Room",
                  items: ["5–11 years (max 3 children) — KSh 13,500", "12 years and above — Full Adult Rate"],
                },
                {
                  title: "c. Meals",
                  items: ["0–4 years — Free of Charge (FOC)", "5–7 years — KSh 1,250 per full meal", "8 years and above — Full Adult Rate"],
                },
              ].map(({ title, items }) => (
                <div key={title} className="bg-secondary/40 rounded-2xl p-5">
                  <p className="font-semibold text-foreground text-sm mb-3">{title}</p>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div key={item} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-primary rounded-2xl p-8 text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
              Ready to celebrate the festive season at Peaks?
            </h2>
            <p className="text-primary-foreground/75 mb-6 max-w-xl mx-auto text-sm">
              Book early and enjoy a 5% discount on direct bookings before 31st October 2026. Three nights or more gets you 10% off.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="gold" size="lg" asChild>
                <Link to="/booking">Book Now</Link>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="tel:+254711969690">Call Us</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
