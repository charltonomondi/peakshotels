import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, ArrowLeft, Phone, Mail, Users, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

import mountk  from "@/assets/mountain/mountk.jpg";
import mountk1 from "@/assets/mountain/mountk1.JPG";
import mountk2 from "@/assets/mountain/mountk2.JPG";
import mountk3 from "@/assets/mountain/mountk3.JPG";

// ─── Rate table data ──────────────────────────────────────────────────────────

const eacBandasRows = [
  { ser: 1, item: "Park Fee",                    unit: "800",   usd: "6",  pax: 1, days: 4, ksh: "3,200",  usdTotal: "24.24" },
  { ser: 2, item: "Guide",                       unit: "3,000", usd: "23", pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 3, item: "Assistant Guide",             unit: "—",     usd: "—",  pax: 0, days: 0, ksh: "—",      usdTotal: "—" },
  { ser: 4, item: "Porters (2)",                 unit: "1,500", usd: "11", pax: 2, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 5, item: "Cook",                        unit: "2,500", usd: "19", pax: 1, days: 4, ksh: "10,000", usdTotal: "75.76" },
  { ser: 6, item: "Meals",                       unit: "3,000", usd: "23", pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 7, item: "Accommodation (Bandas)",      unit: "3,500", usd: "27", pax: 1, days: 3, ksh: "10,500", usdTotal: "79.55" },
  { ser: 8, item: "Transport (Return)",          unit: "7,000", usd: "53", pax: 1, days: 2, ksh: "14,000", usdTotal: "106.06" },
  { ser: 9, item: "Evacuation & Air Rescue",     unit: "1,500", usd: "11", pax: 1, days: 1, ksh: "1,500",  usdTotal: "11.36" },
];
const eacBandasSub   = { ksh: "75,200", usd: "569" };
const eacBandasAdmin = { ksh: "800",    usd: "6.06" };
const eacBandasConti = { ksh: "2,980",  usd: "22.58" };
const eacBandasTotal = { ksh: "78,980", usd: "598" };
const eacBandasNotes = [
  "USD based on KWS rates for the day",
  "Vehicle carrying capacity — 7, 12, 14 pax",
  "Porters — 1.5 porters per person",
  "Cook — 1 for 10 pax",
  "Guide — 1 for 25–30 pax",
];

const eacTentsRows = [
  { ser: 1, item: "Park Fee",                    unit: "800",   usd: "6",  pax: 1, days: 4, ksh: "3,200",  usdTotal: "24.24" },
  { ser: 2, item: "Guide",                       unit: "3,000", usd: "23", pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 3, item: "Assistant Guide",             unit: "—",     usd: "—",  pax: 0, days: 0, ksh: "—",      usdTotal: "—" },
  { ser: 4, item: "Porters (2)",                 unit: "1,500", usd: "11", pax: 2, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 5, item: "Cook",                        unit: "2,500", usd: "19", pax: 1, days: 4, ksh: "10,000", usdTotal: "75.76" },
  { ser: 6, item: "Meals",                       unit: "3,000", usd: "23", pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 7, item: "Accommodation (Tents)",       unit: "3,000", usd: "23", pax: 0.5, days: 3, ksh: "4,500", usdTotal: "34.09" },
  { ser: 8, item: "Transport (Return)",          unit: "7,000", usd: "53", pax: 1, days: 2, ksh: "14,000", usdTotal: "106.06" },
  { ser: 9, item: "Evacuation & Air Rescue",     unit: "1,500", usd: "11", pax: 1, days: 1, ksh: "1,500",  usdTotal: "11.36" },
];
const eacTentsSub   = { ksh: "69,200", usd: "524" };
const eacTentsAdmin = { ksh: "800",    usd: "6.06" };
const eacTentsConti = { ksh: "7,650",  usd: "57.95" };
const eacTentsTotal = { ksh: "77,650", usd: "588" };
const eacTentsNotes = [
  "Based on KWS rates for the day",
  "Vehicle carrying capacity — 7, 12, 14",
  "Porters — 1.5 porters per person (food, luggage & personal items)",
  "Cook — 1 for 25–30 pax, assisted by porters/waiters",
  "Guide — 1 for 25–30 pax",
  "Tent — 2 pax sharing",
  "1 Porter for 4 tents + personal items",
];

const nonEacBandasRows = [
  { ser: 1, item: "Park Fee",                    unit: "9,240", usd: "143", pax: 1, days: 4, ksh: "36,960", usdTotal: "280.00" },
  { ser: 2, item: "Guide",                       unit: "3,000", usd: "23",  pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 3, item: "Assistant Guide",             unit: "—",     usd: "—",   pax: 0, days: 0, ksh: "—",      usdTotal: "—" },
  { ser: 4, item: "Porters (2)",                 unit: "1,500", usd: "11",  pax: 2, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 5, item: "Cook",                        unit: "2,500", usd: "19",  pax: 1, days: 4, ksh: "10,000", usdTotal: "75.76" },
  { ser: 6, item: "Meals",                       unit: "3,000", usd: "23",  pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 7, item: "Accommodation (Bandas)",      unit: "3,500", usd: "27",  pax: 1, days: 3, ksh: "10,500", usdTotal: "79.55" },
  { ser: 8, item: "Transport (Return)",          unit: "7,000", usd: "53",  pax: 1, days: 2, ksh: "14,000", usdTotal: "106.06" },
  { ser: 9, item: "Evacuation & Air Rescue",     unit: "1,500", usd: "11",  pax: 1, days: 1, ksh: "1,500",  usdTotal: "11.36" },
];
const nonEacBandasSub   = { ksh: "108,960", usd: "825" };
const nonEacBandasAdmin = { ksh: "800",     usd: "6.06" };
const nonEacBandasConti = { ksh: "2,980",   usd: "22.58" };
const nonEacBandasTotal = { ksh: "112,740", usd: "854" };
const nonEacBandasNotes = [
  "Based on KWS rates for the day",
  "Vehicle carrying capacity — 7, 12, 14",
  "Porters — 1.5 porters per person",
  "Cook — 1 for 10 pax",
  "Guide — 1 for 30 pax",
  "Tent — 2 pax sharing",
];

const nonEacTentsRows = [
  { ser: 1, item: "Park Fee",                    unit: "9,240", usd: "70",  pax: 1, days: 4, ksh: "36,960", usdTotal: "280.00" },
  { ser: 2, item: "Guide",                       unit: "3,000", usd: "23",  pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 3, item: "Assistant Guide",             unit: "—",     usd: "—",   pax: 0, days: 0, ksh: "—",      usdTotal: "—" },
  { ser: 4, item: "Porters (2)",                 unit: "1,500", usd: "11",  pax: 2, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 5, item: "Cook",                        unit: "2,500", usd: "19",  pax: 1, days: 4, ksh: "10,000", usdTotal: "75.76" },
  { ser: 6, item: "Meals",                       unit: "3,000", usd: "23",  pax: 1, days: 4, ksh: "12,000", usdTotal: "90.91" },
  { ser: 7, item: "Accommodation (Tents)",       unit: "3,000", usd: "23",  pax: 0.5, days: 3, ksh: "4,500", usdTotal: "34.09" },
  { ser: 8, item: "Transport (Return)",          unit: "7,000", usd: "53",  pax: 1, days: 2, ksh: "14,000", usdTotal: "106.06" },
  { ser: 9, item: "Evacuation & Air Rescue",     unit: "1,500", usd: "11",  pax: 1, days: 1, ksh: "1,500",  usdTotal: "11.36" },
];
const nonEacTentsSub   = { ksh: "102,960", usd: "780" };
const nonEacTentsAdmin = { ksh: "800",     usd: "6.06" };
const nonEacTentsConti = { ksh: "3,074",   usd: "23.29" };
const nonEacTentsTotal = { ksh: "106,834", usd: "809" };
const nonEacTentsNotes = [
  "Based on KWS rates for the day",
  "Vehicle carrying capacity — 7, 12, 14",
  "Porters — 1.5 porters per person",
  "Cook — 1 for 10 pax",
  "Guide — 1 for 30 pax",
  "Tent — 2 pax sharing",
];

// ─── Reusable rate table component ───────────────────────────────────────────

interface Row { ser: number; item: string; unit: string; usd: string; pax: number | string; days: number | string; ksh: string; usdTotal: string; }
interface TotalsRow { ksh: string; usd: string; }

function RateTable({
  title, subtitle, badge, rows, sub, admin, conti, total, notes,
}: {
  title: string; subtitle: string; badge: string;
  rows: Row[]; sub: TotalsRow; admin: TotalsRow; conti: TotalsRow; total: TotalsRow;
  notes: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-5">
        <span className="inline-block bg-white/20 text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
          {badge}
        </span>
        <h3 className="text-white font-heading text-xl font-bold">{title}</h3>
        <p className="text-green-200 text-sm mt-1">{subtitle}</p>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-50 border-b border-green-100">
              <th className="text-left px-4 py-3 text-green-800 font-semibold w-8">Ser.</th>
              <th className="text-left px-4 py-3 text-green-800 font-semibold min-w-[160px]">Particulars</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold whitespace-nowrap">Unit (KES)</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold whitespace-nowrap">Unit (USD)</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold">Pax</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold">Days</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold whitespace-nowrap">Total (KES)</th>
              <th className="text-right px-4 py-3 text-green-800 font-semibold whitespace-nowrap">Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.ser} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-gray-400">{r.ser}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{r.item}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.unit}</td>
                <td className="px-4 py-3 text-right text-gray-500">{r.usd}</td>
                <td className="px-4 py-3 text-right text-gray-500">{r.pax === 0 ? "—" : r.pax}</td>
                <td className="px-4 py-3 text-right text-gray-500">{r.days === 0 ? "—" : r.days}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{r.ksh}</td>
                <td className="px-4 py-3 text-right text-gray-600">{r.usdTotal}</td>
              </tr>
            ))}

            {/* Sub-total */}
            <tr className="bg-green-50 border-t border-green-200">
              <td colSpan={6} className="px-4 py-3 text-green-800 font-semibold">Sub-total</td>
              <td className="px-4 py-3 text-right font-bold text-green-800">{sub.ksh}</td>
              <td className="px-4 py-3 text-right font-bold text-green-700">{sub.usd}</td>
            </tr>
            <tr className="bg-white border-t border-gray-100">
              <td colSpan={6} className="px-4 py-3 text-gray-600">Administration fee</td>
              <td className="px-4 py-3 text-right text-gray-700">{admin.ksh}</td>
              <td className="px-4 py-3 text-right text-gray-500">{admin.usd}</td>
            </tr>
            <tr className="bg-gray-50 border-t border-gray-100">
              <td colSpan={6} className="px-4 py-3 text-gray-600">Contingencies (10%)</td>
              <td className="px-4 py-3 text-right text-gray-700">{conti.ksh}</td>
              <td className="px-4 py-3 text-right text-gray-500">{conti.usd}</td>
            </tr>

            {/* Grand total */}
            <tr className="bg-green-800 border-t-2 border-green-600">
              <td colSpan={6} className="px-4 py-4 text-white font-bold text-base uppercase tracking-wide">Grand Total (1 Pax · 4 Days)</td>
              <td className="px-4 py-4 text-right text-white font-bold text-base">KES {total.ksh}</td>
              <td className="px-4 py-4 text-right text-green-200 font-bold">USD {total.usd}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-amber-800 text-xs font-semibold uppercase tracking-wider">Notes</span>
        </div>
        <ol className="space-y-1">
          {notes.map((n, i) => (
            <li key={i} className="text-amber-900/70 text-xs flex gap-2">
              <span className="shrink-0 text-amber-600">{i + 1}.</span>{n}
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const heroImages = [mountk, mountk1, mountk2, mountk3];

export default function MountainClimbing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={mountk2} alt="Mount Kenya" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
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
              <Button asChild className="bg-green-600 hover:bg-green-500 text-white rounded-full px-8 border-0">
                <Link to="/booking">Book Your Expedition</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 border-white/40 text-white hover:bg-white/10">
                <a href="tel:+254700000000">Call Us</a>
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

      {/* Rates section */}
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
            <p className="text-gray-500 max-w-xl mx-auto">All rates are per person for a 4-day expedition on the Sirimon Route (entry and exit). Prices shown for 1 pax — group discounts available.</p>
          </motion.div>

          {/* Tab-style section headers */}
          <div className="space-y-10">

            {/* EAC Resident — Bandas */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">East African Residents</span>
                <div className="flex-1 h-px bg-green-200" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RateTable
                  title="Sirimon Entry & Exit — Bandas"
                  subtitle="1 Pax · 4 Days · Hut Accommodation"
                  badge="EAC Resident · Bandas"
                  rows={eacBandasRows}
                  sub={eacBandasSub} admin={eacBandasAdmin} conti={eacBandasConti} total={eacBandasTotal}
                  notes={eacBandasNotes}
                />
                <RateTable
                  title="Sirimon Entry & Exit — Tents"
                  subtitle="1 Pax · 4 Days · Tent Accommodation"
                  badge="EAC Resident · Tents"
                  rows={eacTentsRows}
                  sub={eacTentsSub} admin={eacTentsAdmin} conti={eacTentsConti} total={eacTentsTotal}
                  notes={eacTentsNotes}
                />
              </div>
            </div>

            {/* Non-EAC */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Non-EAC Residents</span>
                <div className="flex-1 h-px bg-amber-200" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RateTable
                  title="Sirimon Entry & Exit — Bandas"
                  subtitle="1 Pax · 4 Days · Hut Accommodation"
                  badge="Non-EAC · Bandas"
                  rows={nonEacBandasRows}
                  sub={nonEacBandasSub} admin={nonEacBandasAdmin} conti={nonEacBandasConti} total={nonEacBandasTotal}
                  notes={nonEacBandasNotes}
                />
                <RateTable
                  title="Sirimon Entry & Exit — Tents"
                  subtitle="1 Pax · 4 Days · Tent Accommodation"
                  badge="Non-EAC · Tents"
                  rows={nonEacTentsRows}
                  sub={nonEacTentsSub} admin={nonEacTentsAdmin} conti={nonEacTentsConti} total={nonEacTentsTotal}
                  notes={nonEacTentsNotes}
                />
              </div>
            </div>
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
              Contact our adventures team at Peaks Hotel to book your expedition. Group rates and custom itineraries available.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild className="bg-green-500 hover:bg-green-400 text-white border-0 rounded-full px-8 py-3">
                <Link to="/booking">
                  <Users className="h-4 w-4 mr-2" />
                  Book an Expedition
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 py-3">
                <Link to="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Enquire Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
