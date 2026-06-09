import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mountain, ChevronLeft, ChevronRight, Calendar, Users, Phone, Mail, User, MapPin, AlertCircle, CheckCircle, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

import mountk  from "@/assets/mountain/mountk.JPG";
import mountk1 from "@/assets/mountain/mountk1.JPG";
import mountk2 from "@/assets/mountain/mountk2.JPG";
import mountk3 from "@/assets/mountain/mountk3.JPG";

const slides = [
  { img: mountk,  headline: "Conquer Point Lenana",   sub: "4,985m · Guided expedition from Nanyuki" },
  { img: mountk1, headline: "Summit Mount Kenya",     sub: "Africa's second highest peak awaits" },
  { img: mountk2, headline: "Expert Guides. Full Kit.",sub: "Everything arranged from Peaks Hotel" },
  { img: mountk3, headline: "A Once-in-a-Lifetime Climb", sub: "Limited spots — book your expedition today" },
];

const packages = [
  { name: "Day Trek",        days: "1 Day",  price: "KES 8,500",  includes: ["Guide", "Park fees", "Packed lunch", "Transport"] },
  { name: "Weekend Summit",  days: "3 Days", price: "KES 32,000", includes: ["Guide", "Park fees", "Meals", "Camping gear", "Transport"] },
  { name: "Full Expedition", days: "5 Days", price: "KES 55,000", includes: ["Lead guide + porter", "Park fees", "All meals", "Full gear", "Hotel nights", "Certificate"] },
];

interface BookingForm {
  fullName: string; email: string; phone: string;
  climbDate: string; groupSize: string; package: string;
  experience: string; specialRequests: string;
}

type PayStep = "form" | "stk_pending" | "stk_success" | "done";

const STORAGE_KEY = "mountain_popup_dismissed";

export default function MountainClimbingPopup() {
  const [showPopup,  setShowPopup]  = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [slideIdx,   setSlideIdx]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [payStep,    setPayStep]    = useState<PayStep>("form");
  const [bookingId,  setBookingId]  = useState<string | null>(null);
  const [stkMsg,     setStkMsg]     = useState("");
  const [error,      setError]      = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState<BookingForm>({
    fullName: "", email: "", phone: "",
    climbDate: "", groupSize: "1", package: "Weekend Summit",
    experience: "beginner", specialRequests: "",
  });

  // Show popup after 8 seconds, only once per session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const t = setTimeout(() => setShowPopup(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (!showPopup) return;
    intervalRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % slides.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [showPopup]);

  const dismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const openModal = () => {
    setShowPopup(false);
    setShowModal(true);
  };

  const set = (k: keyof BookingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const todayStr = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/send-mountain-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setBookingId(data.bookingId || null);
        setPayStep("stk_pending");
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setPayStep("stk_pending"); // still proceed to payment
    } finally {
      setSubmitting(false);
    }
  }

  async function triggerSTK() {
    setStkMsg("");
    setSubmitting(true);
    try {
      const pkgAmounts: Record<string, number> = { "Day Trek": 8500, "Weekend Summit": 32000, "Full Expedition": 55000 };
      const amount = pkgAmounts[form.package] || 8500;
      const res = await fetch("/api/daraja/mountain-stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, amount, bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        setStkMsg(data.isTest
          ? "✅ Test mode — no real charge. Booking confirmed!"
          : "✅ STK push sent! Check your phone for the M-Pesa prompt.");
        setPayStep("stk_success");
      } else {
        setStkMsg("❌ " + (data.message || "STK push failed. Please try again."));
      }
    } catch {
      setStkMsg("❌ Could not reach payment server. Your booking is saved — our team will contact you.");
      setPayStep("stk_success");
    } finally {
      setSubmitting(false);
    }
  }

  const prev = () => setSlideIdx(i => (i - 1 + slides.length) % slides.length);
  const next = () => setSlideIdx(i => (i + 1) % slides.length);

  return (
    <>
      {/* ── POPUP BANNER ── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl"
            style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
          >
            {/* image slider — clicking anywhere on it opens the modal */}
            <div className="relative h-52 overflow-hidden cursor-pointer" onClick={openModal}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={slideIdx}
                  src={slides[slideIdx].img}
                  alt="Mount Kenya"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* close */}
              <button onClick={(e) => { e.stopPropagation(); dismiss(); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors">
                <X className="h-4 w-4" />
              </button>

              {/* slide arrows */}
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60">
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === slideIdx ? "bg-white w-4" : "bg-white/40"}`} />
                ))}
              </div>

              {/* text overlay */}
              <div className="absolute bottom-8 left-4 right-10">
                <p className="text-green-400 text-xs font-medium tracking-wider uppercase mb-0.5">
                  Peaks Hotel Adventures
                </p>
                <h3 className="font-heading text-white text-lg font-bold leading-tight">
                  {slides[slideIdx].headline}
                </h3>
                <p className="text-white/70 text-xs mt-0.5">{slides[slideIdx].sub}</p>
              </div>
            </div>

            {/* bottom CTA */}
            <div className="bg-[#0d1a0f] border-t border-green-900/40 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#111f13] transition-colors" onClick={openModal}>
              <div>
                <p className="text-white text-sm font-semibold flex items-center gap-1.5">
                  <Mountain className="h-4 w-4 text-green-400" />
                  Mount Kenya Climbing
                </p>
                <p className="text-white/50 text-xs">From KES 8,500 per person</p>
              </div>
              <Button onClick={(e) => { e.stopPropagation(); openModal(); }} size="sm"
                className="bg-green-600 hover:bg-green-500 text-white border-0 rounded-full px-4 text-xs">
                Book Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !submitting && setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0d1a0f] border border-green-900/40 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal hero */}
              <div className="relative h-48 overflow-hidden rounded-t-3xl">
                <img src={mountk2} alt="Mount Kenya" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a0f] via-black/40 to-transparent" />
                <button onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70">
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 left-6">
                  <p className="text-green-400 text-xs tracking-widest uppercase mb-1">Peaks Hotel · Adventures</p>
                  <h2 className="font-heading text-2xl font-bold text-white">Mount Kenya Climbing</h2>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {payStep === "done" || payStep === "stk_success" ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8">
                    <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl font-bold text-white mb-2">
                      {payStep === "stk_success" ? "Payment Initiated!" : "Booking Confirmed!"}
                    </h3>
                    {stkMsg && <p className="text-green-300 text-sm mb-3">{stkMsg}</p>}
                    <p className="text-white/60 mb-6">Our adventure team will contact you within 24 hours to confirm your Mount Kenya climbing reservation.</p>
                    <Button onClick={() => { setShowModal(false); setPayStep("form"); setStkMsg(""); setBookingId(null); }}
                      className="bg-green-600 hover:bg-green-500 text-white border-0 rounded-full px-8">
                      Close
                    </Button>
                  </motion.div>

                ) : payStep === "stk_pending" ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6">
                    <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                    <h3 className="font-heading text-xl font-bold text-white mb-2">Booking Submitted!</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Your reservation is saved. Pay your deposit now via M-Pesa to confirm your spot.
                    </p>
                    <div className="bg-green-950/40 border border-green-800/40 rounded-2xl p-5 mb-5 text-left">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Payment Summary</p>
                      <p className="text-white font-semibold">{form.package}</p>
                      <p className="text-green-400 text-2xl font-bold mt-1">
                        KES {({ "Day Trek": "8,500", "Weekend Summit": "32,000", "Full Expedition": "55,000" }[form.package] || "—")}
                      </p>
                      <p className="text-white/40 text-xs mt-1">30% deposit = KES {
                        Math.round(({ "Day Trek": 8500, "Weekend Summit": 32000, "Full Expedition": 55000 }[form.package] || 0) * 0.3).toLocaleString()
                      } will be charged</p>
                      <p className="text-white/40 text-xs mt-1">Phone: {form.phone}</p>
                    </div>
                    {stkMsg && (
                      <p className={`text-sm mb-4 ${stkMsg.startsWith("❌") ? "text-red-400" : "text-green-400"}`}>{stkMsg}</p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button onClick={triggerSTK} disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-500 text-white border-0 rounded-full">
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending STK Push…</> : <><Smartphone className="h-4 w-4 mr-2" />Pay with M-Pesa</>}
                      </Button>
                      <Button variant="outline" onClick={() => setPayStep("done")}
                        className="w-full border-green-800 text-green-300 hover:bg-green-900 rounded-full text-sm">
                        Skip — Pay Later / Bank Transfer
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Package selector */}
                    <div className="mb-6">
                      <p className="text-green-400 text-xs font-medium tracking-[0.2em] uppercase mb-3">Choose a Package</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {packages.map(pkg => (
                          <button key={pkg.name} onClick={() => setForm(f => ({ ...f, package: pkg.name }))}
                            className={`rounded-2xl p-4 text-left border transition-all duration-200 ${
                              form.package === pkg.name
                                ? "border-green-500 bg-green-950/60 ring-1 ring-green-500"
                                : "border-green-900/40 bg-[#162018] hover:border-green-700"
                            }`}>
                            <p className="text-white font-semibold text-sm">{pkg.name}</p>
                            <p className="text-green-400 font-bold text-base mt-0.5">{pkg.price}</p>
                            <p className="text-white/40 text-xs mt-0.5">{pkg.days}</p>
                            <ul className="mt-2 space-y-0.5">
                              {pkg.includes.map(item => (
                                <li key={item} className="text-white/50 text-xs flex items-center gap-1">
                                  <span className="text-green-600">·</span>{item}
                                </li>
                              ))}
                            </ul>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Form */}
                    {error && (
                      <div className="mb-4 flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />{error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input required value={form.fullName} onChange={set("fullName")} placeholder="Your full name"
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Phone *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input required value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX"
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Preferred Start Date *</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input required type="date" min={todayStr} value={form.climbDate} onChange={set("climbDate")}
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Group Size *</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <select required value={form.groupSize} onChange={set("groupSize")}
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                              ))}
                              <option value="10+">10+ people</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Experience Level</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <select value={form.experience} onChange={set("experience")}
                              className="w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                              <option value="beginner">Beginner — first time</option>
                              <option value="intermediate">Intermediate — some hiking</option>
                              <option value="experienced">Experienced — high altitude</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Special Requests / Notes</label>
                        <textarea rows={3} value={form.specialRequests} onChange={set("specialRequests")}
                          placeholder="Dietary requirements, medical conditions, special gear needs..."
                          className="w-full px-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none" />
                      </div>

                      <div className="bg-green-950/30 border border-green-900/30 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
                        <span className="text-green-400 font-medium">What happens next:</span> Our adventure team at Peaks Hotel will review your booking request and call you within 24 hours to confirm availability, discuss the itinerary, and arrange payment.
                      </div>

                      <Button type="submit" disabled={submitting}
                        className="w-full bg-green-600 hover:bg-green-500 text-white border-0 rounded-full py-3 text-base font-semibold">
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending Enquiry…</>
                        ) : (
                          <><Mountain className="h-4 w-4 mr-2" />Reserve My Climb</>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
