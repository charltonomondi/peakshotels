import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, Mail, Users, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import MountainBookingModal from "@/components/MountainBookingModal";

import mountk  from "@/assets/mountain/mountk.jpg";
import mountk1 from "@/assets/mountain/mountk1.JPG";
import mountk2 from "@/assets/mountain/mountk2.JPG";
import mountk3 from "@/assets/mountain/mountk3.JPG";

// ─── Data ────────────────────────────────────────────────────────────────────

const tables = [
  {
    badge: "EAC Resident",
    badgeColor: "bg-green-100 text-green-800",
    dividerColor: "bg-green-200",
    cards: [
      {
        title: "Sirimon Entry & Exit — Bandas",
        subtitle: "1 Pax · 4 Days · Hut Accommodation",
        headerFrom: "from-green-900", headerTo: "to-green-700",
        particulars: [
          "Park Fee",
          "Guide",
          "Assistant Guide",
          "Porters (2)",
          "Cook",
          "Meals",
          "Accommodation (Bandas)",
          "Transport (Return)",
          "Evacuation & Air Rescue Cover",
          "Administration Fee",
          "Contingencies (10%)",
        ],
        grandTotal: { ksh: "78,980", usd: "598" },
        notes: [
          "USD based on KWS rates for the day",
          "Vehicle carrying capacity — 7, 12, 14 pax",
          "Porters — 1.5 porters per person",
          "Cook — 1 for 10 pax",
          "Guide — 1 for 25–30 pax",
        ],
      },
      {
        title: "Sirimon Entry & Exit — Tents",
        subtitle: "1 Pax · 4 Days · Tent Accommodation",
        headerFrom: "from-green-900", headerTo: "to-green-700",
        particulars: [
          "Park Fee",
          "Guide",
          "Assistant Guide",
          "Porters (2)",
          "Cook",
          "Meals",
          "Accommodation (Tents)",
          "Transport (Return)",
          "Evacuation & Air Rescue Cover",
          "Administration Fee",
          "Contingencies (10%)",
        ],
        grandTotal: { ksh: "77,650", usd: "588" },
        notes: [
          "Based on KWS rates for the day",
          "Vehicle carrying capacity — 7, 12, 14",
          "Porters — 1.5 porters per person (food, luggage & personal items)",
          "Cook — 1 for 25–30 pax, assisted by porters/waiters",
          "Guide — 1 for 25–30 pax",
          "Tent — 2 pax sharing",
          "1 Porter for 4 tents + personal items",
        ],
      },
    ],
  },
  {
    badge: "Non-EAC Residents",
    badgeColor: "bg-amber-100 text-amber-800",
    dividerColor: "bg-amber-200",
    cards: [
      {
        title: "Sirimon Entry & Exit — Bandas",
        subtitle: "1 Pax · 4 Days · Hut Accommodation",
        headerFrom: "from-amber-900", headerTo: "to-amber-700",
        particulars: [
          "Park Fee",
          "Guide",
          "Assistant Guide",
          "Porters (2)",
          "Cook",
          "Meals",
          "Accommodation (Bandas)",
          "Transport (Return)",
          "Evacuation & Air Rescue Cover",
          "Administration Fee",
          "Contingencies (10%)",
        ],
        grandTotal: { ksh: "112,740", usd: "854" },
        notes: [
          "Based on KWS rates for the day",
          "Vehicle carrying capacity — 7, 12, 14",
          "Porters — 1.5 porters per person",
          "Cook — 1 for 10 pax",
          "Guide — 1 for 30 pax",
          "Tent — 2 pax sharing",
        ],
      },
      {
        title: "Sirimon Entry & Exit — Tents",
        subtitle: "1 Pax · 4 Days · Tent Accommodation",
        headerFrom: "from-amber-900", headerTo: "to-amber-700",
        particulars: [
          "Park Fee",
          "Guide",
          "Assistant Guide",
          "Porters (2)",
          "Cook",
          "Meals",
          "Accommodation (Tents)",
          "Transport (Return)",
          "Evacuation & Air Rescue Cover",
          "Administration Fee",
          "Contingencies (10%)",
        ],
        grandTotal: { ksh: "106,834", usd: "809" },
        notes: [
          "Based on KWS rates for the day",
          "Vehicle carrying capacity — 7, 12, 14",
          "Porters — 1.5 porters per person",
          "Cook — 1 for 10 pax",
          "Guide — 1 for 30 pax",
          "Tent — 2 pax sharing",
        ],
      },
    ],
  },
];

// ─── Rate card ────────────────────────────────────────────────────────────────

function RateCard({ card }: { card: typeof tables[0]["cards"][0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${card.headerFrom} ${card.headerTo} px-6 py-5`}>
        <h3 className="text-white font-heading text-lg font-bold">{card.title}</h3>
        <p className="text-white/70 text-sm mt-1">{card.subtitle}</p>
      </div>

      {/* Particulars list */}
      <div className="flex-1 px-6 py-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Includes</p>
        <ul className="space-y-2">
          {card.particulars.map((p, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-600 font-bold text-xs">
                {i + 1}
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Grand total */}
      <div className="mx-6 mb-5 rounded-xl bg-gray-900 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Grand Total · 1 Pax · 4 Days</p>
          <p className="text-white font-bold text-2xl">KES {card.grandTotal.ksh}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">USD</p>
          <p className="text-green-400 font-bold text-xl">$ {card.grandTotal.usd}</p>
        </div>
      </div>

      {/* Notes */}
      <div className="px-6 pb-5">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider">Notes</span>
          </div>
          <ol className="space-y-1">
            {card.notes.map((n, i) => (
              <li key={i} className="text-amber-900/70 text-xs flex gap-2">
                <span className="shrink-0 text-amber-500">{i + 1}.</span>{n}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const heroImages = [mountk, mountk1, mountk2, mountk3];

export default function MountainClimbing() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <MountainBookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden mt-16 md:mt-24">
        <img src={mountk2} alt="Mount Kenya" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-green-400" />
              <span className="text-green-400 text-sm font-medium tracking-[0.25em] uppercase">Peaks Hotel Adventures</span>
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Mount Kenya<br />
              <span className="text-green-400 font-light italic">Climbing Expeditions</span>
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Sirimon Route · Point Lenana (4,985m) · Expert Guides · All-inclusive Packages
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => setBookingOpen(true)} className="bg-green-600 hover:bg-green-500 text-white rounded-full px-8 border-0">
                Book Your Expedition
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 border-white/40 text-white hover:bg-white/10">
                <Link to="/contact">Enquire Now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Photo strip */}
      <div className="grid grid-cols-4 h-28 md:h-40">
        {heroImages.map((img, i) => (
          <div key={i} className="overflow-hidden">
            <img src={img} alt={`Mount Kenya ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
      </div>

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Africa's Second Highest Peak, From Your Doorstep
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Peaks Hotel Nanyuki is the perfect base for your Mount Kenya climbing adventure. We arrange everything — guides, porters, permits, gear, meals and transport — so you can focus entirely on the climb.
            </p>
            <p className="text-gray-600 leading-relaxed">
              All expeditions follow the <strong>Sirimon Route</strong>, entering and exiting via Sirimon Gate. Choose between comfortable <strong>bandas (huts)</strong> or <strong>tents</strong>, and select your residency rate below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rates */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold text-gray-900 mb-3">Climbing Rates</h2>
            <div className="w-16 h-0.5 bg-green-600 mx-auto mb-4" />
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              Per person · 4-day Sirimon Route expedition · Group discounts available on request.
            </p>
          </motion.div>

          <div className="space-y-12">
            {tables.map((section) => (
              <div key={section.badge}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                  <div className={`flex-1 h-px ${section.dividerColor}`} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {section.cards.map((card) => (
                    <RateCard key={card.title} card={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-green-900">
        <img src={mountk3} alt="Mount Kenya summit" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Mountain className="h-10 w-10 text-green-400 mx-auto mb-4" />
            <h2 className="font-heading text-4xl font-bold text-white mb-4">Ready to Conquer Point Lenana?</h2>
            <p className="text-green-200 max-w-lg mx-auto mb-8">
              Contact our adventures team at Peaks Hotel. Group rates and custom itineraries available.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => setBookingOpen(true)} className="bg-green-500 hover:bg-green-400 text-white border-0 rounded-full px-8 py-3">
                <Users className="h-4 w-4 mr-2" />Book an Expedition
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 py-3">
                <Link to="/contact"><Mail className="h-4 w-4 mr-2" />Enquire Now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
