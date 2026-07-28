import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Briefcase, GraduationCap, Clock, Mail, Paperclip, Calendar, CheckCircle2, ArrowRight, Users } from "lucide-react";
import heroImage from "@/assets/facilities/frontage.jpg";

const positions = [
  { title: "Operations Manager",   count: 1 },
  { title: "F&B Manager",          count: 1 },
  { title: "HR Officer",           count: 1 },
  { title: "Receptionist",         count: 1 },
  { title: "Accounts Clerk",       count: 1 },
  { title: "Marketing Executive",  count: 1 },
  { title: "Tour Driver",          count: 1 },
];

const requirements = [
  "Diploma or Degree in a relevant field",
  "At least 3 years of relevant experience",
  "Hotel experience will be an added advantage",
  "Strong communication and interpersonal skills",
  "Ability to work in a fast-paced environment",
];

export default function Careers() {
  const mailtoLink = `mailto:hr@peakshotels.co.ke?subject=Job Application — Peaks Hotel Nanyuki&body=Dear HR Team,%0A%0AI am writing to apply for the position of [Position Name] at Peaks Hotel Nanyuki.%0A%0APlease find attached my updated CV and testimonials.%0A%0AKind regards,%0A[Your Name]`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Careers | Peaks Hotel Nanyuki"
        description="Join the Peaks Hotel Nanyuki team. We are hiring Operations Manager, F&B Manager, HR Officer, Receptionist, Accounts Clerk, Marketing Executive and Tour Driver. Apply by 8th August 2026."
        keywords="careers Peaks Hotel, jobs Nanyuki, hotel jobs Kenya, Peaks Hotel vacancies, hospitality jobs Nanyuki"
        canonical="https://www.peakshotels.co.ke/careers"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative h-[45vh] sm:h-[55vh] overflow-hidden">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }} className="absolute inset-0">
          <img src={heroImage} alt="Careers at Peaks Hotel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
        </motion.div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              We're hiring
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Careers at Peaks Hotel
            </h1>
            <div className="w-20 h-1 bg-accent mx-auto mb-4" />
            <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto">
              Be part of a passionate team delivering exceptional hospitality at the foot of Mount Kenya. Join us and grow your career.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Deadline banner */}
      <div className="bg-red-600 text-white text-center py-3 px-4">
        <p className="text-sm font-semibold flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          Application Deadline: <strong>8th August 2026</strong> — Apply now, positions are limited!
        </p>
      </div>

      {/* Positions */}
      <section className="py-14 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-accent" />
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">Open Positions</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">Current Vacancies</h2>
            <p className="text-muted-foreground text-sm">7 positions available · Deadline 8th August 2026</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {positions.map((pos, i) => (
              <motion.div
                key={pos.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-accent/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Briefcase className="h-5 w-5 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                    {pos.count} Opening{pos.count > 1 ? "s" : ""}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-base mb-1">{pos.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">Peaks Hotel Nanyuki · Full Time</p>
                <Button variant="outline" size="sm" className="w-full text-xs group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-all" asChild>
                  <a href={mailtoLink}>
                    Apply Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements + How to Apply */}
      <section className="pb-14 sm:pb-20 bg-secondary/30 py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* Requirements */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-lg font-bold text-foreground">Key Requirements</h2>
              </div>
              <div className="space-y-3">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{req}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* How to apply */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="bg-card rounded-2xl border border-accent/30 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Mail className="h-5 w-5 text-accent" />
                <h2 className="font-heading text-lg font-bold text-foreground">How to Apply</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Send your application to</p>
                    <a href="mailto:hr@peakshotels.co.ke" className="text-accent hover:underline font-semibold">
                      hr@peakshotels.co.ke
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Paperclip className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Attachments required</p>
                    <p className="text-muted-foreground">Updated CV and testimonials/certificates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Subject line</p>
                    <p className="text-muted-foreground">Job Application — [Position Name]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <Calendar className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700">Deadline: 8th August 2026</p>
                    <p className="text-red-600 text-xs">Applications after this date will not be considered.</p>
                  </div>
                </div>
              </div>
              <Button variant="gold" className="w-full mt-5" asChild>
                <a href={mailtoLink}>
                  <Mail className="h-4 w-4 mr-2" />
                  Apply via Email
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why join us */}
      <section className="py-14">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Users className="h-8 w-8 text-accent mx-auto mb-4" />
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">Why Join Peaks Hotel?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We are a growing hospitality destination at the foot of Mount Kenya, committed to excellence, sustainability and genuine Kenyan hospitality. Our team is our greatest asset — we invest in people, celebrate talent, and create an environment where careers flourish.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {["Competitive Package", "Career Growth", "Inspiring Location"].map(v => (
                <div key={v} className="bg-secondary rounded-xl py-3 px-2 font-medium text-foreground text-xs sm:text-sm">
                  {v}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
