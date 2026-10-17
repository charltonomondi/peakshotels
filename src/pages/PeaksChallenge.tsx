import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import MpesaPayment from "@/components/MpesaPayment";
import beamlift from "@/assets/hero/beamlift.JPG";
import {
  Mountain, Trophy, Users, Calendar, MapPin, Utensils,
  Bed, ShieldCheck, Camera, ChevronDown, Send, CheckCircle2,
  Loader2, Star, Zap, Heart, TreePalm, Wind, Sunrise,
  MessageSquare, Image as ImageIcon,
} from "lucide-react";

// ── Challenge images (placeholder — admin adds real ones) ─────────────────────
// Drop challenge photos in src/assets/challenge/ to display here
const CHALLENGE_IMAGES: { src: string; caption: string }[] = [
  // { src: "/challenge/poster.jpg", caption: "Edition 3 Official Poster" },
  // Add images as available
];

// ── Amenities included ─────────────────────────────────────────────────────────
const AMENITIES = [
  { icon: Bed,         title: "Accommodation",       desc: "1 night stay at Peaks Hotel Nanyuki (twin sharing)" },
  { icon: Utensils,    title: "Meals",                desc: "Breakfast, lunch & dinner throughout the challenge" },
  { icon: Mountain,    title: "Trail Guides",         desc: "Professional mountain guides & safety rangers" },
  { icon: ShieldCheck, title: "Safety & First Aid",   desc: "Medical team on standby throughout the event" },
  { icon: Wind,        title: "Challenge Kit",        desc: "Event T-shirt, race bib, and finisher certificate" },
  { icon: TreePalm,    title: "Nature Experiences",   desc: "Forest walks, wildlife sightings & scenic pit stops" },
  { icon: Sunrise,     title: "Sunrise Summit",       desc: "Witness a breathtaking sunrise from the peak" },
  { icon: Heart,       title: "Wellness Session",     desc: "Post-challenge massage & recovery at our spa" },
  { icon: Camera,      title: "Photography",          desc: "Official event photographer — digital copies included" },
  { icon: Zap,         title: "Electricity & WiFi",   desc: "Power & connectivity at Peaks Hotel base camp" },
  { icon: Trophy,      title: "Awards Ceremony",      desc: "Prizes for top finishers in all categories" },
  { icon: Users,       title: "Community",            desc: "Join 200+ adventurers from across Kenya & beyond" },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What is the Peaks Challenge?", a: "The Peaks Challenge is an annual outdoor adventure event hosted by Peaks Hotel Nanyuki. Participants tackle scenic hiking and running trails around Mt. Kenya, the Aberdares and Lolldaiga Hills — now in its 3rd Edition." },
  { q: "Who can participate?", a: "Anyone aged 16 and above who is physically fit and loves the outdoors. We have categories for beginners, intermediate and advanced participants." },
  { q: "What is the registration fee?", a: "KES 5,000 per person (includes accommodation, meals, kit, guides and all amenities listed above). Early-bird rate of KES 4,000 is available until 30 days before the event." },
  { q: "What should I bring?", a: "Comfortable hiking boots, warm layers, a rain jacket, sunscreen, personal medication, a reusable water bottle and a sense of adventure! A full packing list is emailed upon registration." },
  { q: "How do I pay?", a: "Payment is made via M-Pesa STK Push directly on this page. Enter your M-Pesa number and you will receive a prompt on your phone." },
  { q: "Is the route difficult?", a: "We offer routes for all fitness levels. Experienced staff will guide you throughout and there are no penalties for taking it slow!" },
  { q: "Can I register as a group?", a: "Yes! Groups of 5+ receive a 10% discount. Contact us at info@peakshotels.co.ke or fill the Q&A section below with your group details." },
];

// ── Registration form state ───────────────────────────────────────────────────
interface RegForm {
  firstName: string; lastName: string; email: string; phone: string;
  idNumber: string; category: string; tshirtSize: string; emergencyName: string;
  emergencyPhone: string; medicalNotes: string; agreeTerms: boolean;
}

const EMPTY_FORM: RegForm = {
  firstName: "", lastName: "", email: "", phone: "",
  idNumber: "", category: "Beginner (10 km)", tshirtSize: "M",
  emergencyName: "", emergencyPhone: "", medicalNotes: "", agreeTerms: false,
};

const CATEGORIES = ["Beginner (10 km)", "Intermediate (20 km)", "Advanced (35 km)", "Elite (50 km)"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AMOUNT = 500;

export default function PeaksChallenge() {
  const [form, setForm] = useState<RegForm>(EMPTY_FORM);
  const [step, setStep] = useState<"form" | "pay" | "done">("form");
  const [formErrors, setFormErrors] = useState<Partial<RegForm>>({});
  const [submitting, setSubmitting] = useState(false);

  // Q&A
  const [questions, setQuestions] = useState<{ name: string; q: string; ts: number }[]>([]);
  const [qaName, setQaName] = useState("");
  const [qaQ, setQaQ] = useState("");
  const [qaSubmitted, setQaSubmitted] = useState(false);

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof RegForm, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Partial<RegForm> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 9) e.phone = "Valid phone required";
    if (!form.idNumber.trim()) e.idNumber = "Required";
    if (!form.emergencyName.trim()) e.emergencyName = "Required";
    if (!form.emergencyPhone.trim()) e.emergencyPhone = "Required";
    if (!form.agreeTerms) e.agreeTerms = "You must agree" as unknown as boolean;
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = () => {
    if (validate()) setStep("pay");
  };

  const handlePaySuccess = () => setStep("done");

  const handleQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaName.trim() || !qaQ.trim()) return;
    setQuestions(q => [{ name: qaName.trim(), q: qaQ.trim(), ts: Date.now() }, ...q]);
    setQaName(""); setQaQ(""); setQaSubmitted(true);
    setTimeout(() => setQaSubmitted(false), 3000);
  };

  const field = (label: string, key: keyof RegForm, type = "text", placeholder = "") => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent transition ${formErrors[key] ? "border-red-400" : "border-border"}`}
      />
      {formErrors[key] && <p className="text-xs text-red-500">{formErrors[key] as string}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Peaks Challenge — 3rd Edition | Peaks Hotel Nanyuki"
        description="Register for the Peaks Challenge 3rd Edition. Kenya's premier outdoor adventure at Mt. Kenya. Hiking, trail running, wellness & more."
        keywords="Peaks Challenge, Mt Kenya hiking, Nanyuki adventure, trail running Kenya, Peaks Hotel challenge"
        canonical="https://www.peakshotels.co.ke/peaks-challenge"
      />
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950 pt-24">
        <img src={beamlift} alt="Peaks Challenge" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/30 to-zinc-950" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-5 py-2 rounded-full uppercase tracking-widest mb-6">
              3rd Edition · 2027
            </span>
            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Peaks<br /><span className="text-accent italic font-light">Challenge</span>
            </h1>
            <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Kenya's most scenic outdoor adventure. Conquer trails around Mt. Kenya, the Aberdares and the Lolldaiga Hills — then celebrate at Peaks Hotel Nanyuki.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              {[
                { icon: Calendar, text: "Date: TBA 2025" },
                { icon: MapPin, text: "Nanyuki, Kenya" },
                { icon: Users, text: "200+ Participants" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                  <Icon className="h-4 w-4 text-accent" />{text}
                </div>
              ))}
            </div>
            <Button variant="gold" size="xl" onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Register Now — KES 500
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── AMENITIES ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/40">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">What's Included</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Everything You Need</h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {AMENITIES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4 hover:border-accent/40 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-accent transition-colors">
                  <Icon className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY / POSTERS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">Gallery & Posters</span>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Editions 1 & 2 Highlights</h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
          </motion.div>

          {CHALLENGE_IMAGES.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {CHALLENGE_IMAGES.map(({ src, caption }, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="relative group overflow-hidden rounded-2xl aspect-square bg-secondary">
                  <img src={src} alt={caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-medium">{caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm font-medium">Challenge photos & posters coming soon</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Follow us on social media for sneak peeks</p>
            </div>
          )}
        </div>
      </section>

      {/* ── REGISTRATION FORM ─────────────────────────────────────────────── */}
      <section ref={formRef} className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">3rd Edition</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Register Now</h2>
            <p className="text-muted-foreground text-sm">Registration fee: <strong className="text-foreground">KES 500</strong> per person (all inclusive)</p>
          </motion.div>

          <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">

              {/* STEP 1 — FORM */}
              {step === "form" && (
                <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Participant Details</p>
                      <p className="text-xs text-muted-foreground">Complete all required fields</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {field("First Name", "firstName", "text", "Jane")}
                    {field("Last Name", "lastName", "text", "Doe")}
                  </div>
                  {field("Email Address", "email", "email", "jane@example.com")}
                  {field("Phone Number (M-Pesa)", "phone", "tel", "07XXXXXXXX")}
                  {field("ID / Passport Number", "idNumber", "text", "12345678")}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Challenge Category</label>
                      <select value={form.category} onChange={e => set("category", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">T-Shirt Size</label>
                      <select value={form.tshirtSize} onChange={e => set("tshirtSize", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent">
                        {SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-3">Emergency Contact</p>
                    <div className="space-y-3">
                      {field("Contact Name", "emergencyName", "text", "John Doe")}
                      {field("Contact Phone", "emergencyPhone", "tel", "07XXXXXXXX")}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Medical Notes (optional)</label>
                    <textarea value={form.medicalNotes} onChange={e => set("medicalNotes", e.target.value)}
                      placeholder="Any allergies, conditions or medications we should know about…"
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => set("agreeTerms", e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-accent" />
                    <span className="text-sm text-muted-foreground">
                      I agree to the <span className="text-accent underline cursor-pointer">terms & conditions</span> of the Peaks Challenge and confirm that I am physically fit to participate.
                    </span>
                  </label>
                  {formErrors.agreeTerms && <p className="text-xs text-red-500 -mt-2">You must agree to the terms</p>}

                  <Button variant="gold" size="lg" className="w-full" onClick={handleProceed}>
                    Continue to Payment <Star className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 2 — PAYMENT */}
              {step === "pay" && (
                <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-6">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">M-Pesa Payment</p>
                      <p className="text-xs text-muted-foreground">{form.firstName} {form.lastName} · {form.category}</p>
                    </div>
                  </div>
                  <MpesaPayment
                    email={form.email}
                    phone={form.phone}
                    amount={AMOUNT}
                    onSuccess={handlePaySuccess}
                    onError={() => {}}
                    bookingData={{
                      firstName: form.firstName,
                      lastName: form.lastName,
                      roomNumber: "N/A",
                      roomType: "Peaks Challenge",
                      roomConfig: form.category,
                      mealPlan: "Full Board",
                      checkIn: "TBA",
                      checkOut: "TBA",
                      guests: 1,
                      numberOfRooms: 1,
                      nights: 1,
                      totalPrice: AMOUNT,
                      perNightPrice: AMOUNT,
                      specialRequests: `T-Shirt: ${form.tshirtSize} | ID: ${form.idNumber} | Emergency: ${form.emergencyName} ${form.emergencyPhone}${form.medicalNotes ? " | Medical: " + form.medicalNotes : ""}`,
                    }}
                  />
                  <button onClick={() => setStep("form")}
                    className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                    ← Back to edit details
                  </button>
                </motion.div>
              )}

              {/* STEP 3 — SUCCESS */}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">You're Registered!</h3>
                  <p className="text-muted-foreground text-sm mb-1">
                    Welcome to the Peaks Challenge 3rd Edition, <strong>{form.firstName}</strong>!
                  </p>
                  <p className="text-muted-foreground text-sm mb-6">
                    A confirmation email will be sent to <strong>{form.email}</strong>.
                  </p>
                  <div className="bg-secondary rounded-2xl p-4 text-left space-y-1.5 mb-6 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{form.firstName} {form.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{form.category}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">T-Shirt</span><span className="font-medium">{form.tshirtSize}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-semibold text-accent">KES {AMOUNT.toLocaleString()}</span></div>
                  </div>
                  <Button variant="outline" onClick={() => { setStep("form"); setForm(EMPTY_FORM); }}>
                    Register Another Participant
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">FAQ</span>
            <h2 className="font-heading text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
                  <ChevronDown className={`h-4 w-4 text-accent shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Q&A / ASK A QUESTION ─────────────────────────────────────────── */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">Community Q&A</span>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Have a Question?</h2>
            <p className="text-muted-foreground text-sm">Ask us anything about the challenge. We'll respond within 24 hours.</p>
          </motion.div>

          {/* Q&A form */}
          <form onSubmit={handleQaSubmit} className="bg-card border border-border rounded-3xl p-6 sm:p-8 mb-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Your Name</label>
                <input type="text" value={qaName} onChange={e => setQaName(e.target.value)} required
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Your Question</label>
                <textarea value={qaQ} onChange={e => setQaQ(e.target.value)} required rows={4}
                  placeholder="Ask about routes, accommodation, group registrations, prizes…"
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
              <Button type="submit" variant="gold" className="w-full">
                <Send className="h-4 w-4 mr-2" /> Submit Question
              </Button>
              <AnimatePresence>
                {qaSubmitted && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Question submitted! We'll respond within 24 hours.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Submitted questions list */}
          {questions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recent Questions</p>
              {questions.map(({ name, q, ts }, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl px-5 py-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{name}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{q}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">{new Date(ts).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
