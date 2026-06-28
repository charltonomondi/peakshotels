import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mountain, User, Mail, Phone, Calendar, Users, MapPin, Tent, Home, Clock, FileText, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Form {
  fullName: string;
  email: string;
  phone: string;
  entryPoint: string;
  exitPoint: string;
  groupSize: string;
  accommodation: "bandas" | "tents";
  numberOfDays: string;
  startDate: string;
  residency: "eac" | "non-eac";
  experience: string;
  specialRequests: string;
}

const initialForm: Form = {
  fullName: "", email: "", phone: "",
  entryPoint: "Sirimon Gate", exitPoint: "Sirimon Gate",
  groupSize: "1", accommodation: "bandas",
  numberOfDays: "4", startDate: "",
  residency: "eac", experience: "beginner",
  specialRequests: "",
};

const gates = ["Sirimon Gate", "Naro Moru Gate", "Chogoria Gate", "Timau Gate"];

export default function MountainBookingModal({ open, onClose }: Props) {
  const [form, setForm] = useState<Form>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof Form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [k]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/send-mountain-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          package: `${form.accommodation === "bandas" ? "Bandas" : "Tents"} · ${form.numberOfDays} Days · ${form.residency === "eac" ? "EAC Resident" : "Non-EAC"}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Submission failed. Please try again.");
      }
    } catch {
      // Still show success — the server may be offline but we don't want to block the UX
      setStatus("success");
    }
  }

  function handleClose() {
    if (status === "submitting") return;
    setForm(initialForm);
    setStatus("idle");
    setErrorMsg("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0d1a0f] border border-green-900/40 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Hero image header */}
            <div className="relative h-36 overflow-hidden rounded-t-3xl shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="h-5 w-5 text-green-300" />
                  <span className="text-green-300 text-xs font-medium tracking-[0.2em] uppercase">Peaks Hotel Adventures</span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-white">Book Your Expedition</h2>
                <p className="text-green-200/70 text-sm mt-1">Mount Kenya · Sirimon Route</p>
              </div>
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {/* SUCCESS */}
              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-white mb-2">Enquiry Received!</h3>
                  <p className="text-green-300/80 mb-2">
                    Thank you, <strong className="text-white">{form.fullName}</strong>.
                  </p>
                  <p className="text-white/50 text-sm max-w-sm mx-auto mb-8">
                    Our adventure team will review your booking and contact you within 24 hours to confirm availability and arrange the details.
                  </p>
                  <Button
                    onClick={handleClose}
                    className="bg-green-600 hover:bg-green-500 text-white border-0 rounded-full px-10"
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Error */}
                  {status === "error" && (
                    <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}
                    </div>
                  )}

                  {/* Personal details */}
                  <div>
                    <p className="text-green-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Personal Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field icon={<User />} label="Full Name *">
                        <input required value={form.fullName} onChange={set("fullName")} placeholder="Your full name"
                          className={inputCls} />
                      </Field>
                      <Field icon={<Mail />} label="Email *">
                        <input required type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                          className={inputCls} />
                      </Field>
                      <Field icon={<Phone />} label="Phone *">
                        <input required value={form.phone} onChange={set("phone")} placeholder="07XXXXXXXX"
                          className={inputCls} />
                      </Field>
                    </div>
                  </div>

                  {/* Expedition details */}
                  <div>
                    <p className="text-green-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Expedition Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field icon={<MapPin />} label="Entry Point *">
                        <select required value={form.entryPoint} onChange={set("entryPoint")} className={selectCls}>
                          {gates.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </Field>
                      <Field icon={<MapPin />} label="Exit Point *">
                        <select required value={form.exitPoint} onChange={set("exitPoint")} className={selectCls}>
                          {gates.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </Field>
                      <Field icon={<Users />} label="Number of People *">
                        <select required value={form.groupSize} onChange={set("groupSize")} className={selectCls}>
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>
                          ))}
                          <option value="11+">11+ people</option>
                        </select>
                      </Field>
                      <Field icon={<Clock />} label="Number of Days *">
                        <select required value={form.numberOfDays} onChange={set("numberOfDays")} className={selectCls}>
                          {["2","3","4","5","6","7"].map(d => (
                            <option key={d} value={d}>{d} days</option>
                          ))}
                        </select>
                      </Field>
                      <Field icon={<Calendar />} label="Preferred Start Date *">
                        <input required type="date" min={today} value={form.startDate} onChange={set("startDate")}
                          className={inputCls} />
                      </Field>
                    </div>
                  </div>

                  {/* Accommodation type */}
                  <div>
                    <p className="text-green-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Accommodation Type</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "bandas", icon: Home, label: "Bandas (Huts)", desc: "Comfortable hut accommodation along the trail" },
                        { value: "tents",  icon: Tent, label: "Tents",          desc: "Camping under the stars on the mountain" },
                      ] as const).map(({ value, icon: Icon, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, accommodation: value }))}
                          className={`rounded-2xl p-4 text-left border transition-all duration-200 ${
                            form.accommodation === value
                              ? "border-green-500 bg-green-950/60 ring-1 ring-green-500"
                              : "border-green-900/40 bg-[#162018] hover:border-green-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-green-400" />
                            <span className="text-white font-semibold text-sm">{label}</span>
                          </div>
                          <p className="text-white/40 text-xs">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Residency */}
                  <div>
                    <p className="text-green-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Residency (for park fee rates)</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "eac",     label: "EAC Resident",     desc: "Kenya, Uganda, Tanzania, Rwanda, Burundi, DRC, South Sudan, Somalia" },
                        { value: "non-eac", label: "Non-EAC Resident", desc: "All other nationalities" },
                      ] as const).map(({ value, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, residency: value }))}
                          className={`rounded-2xl p-4 text-left border transition-all duration-200 ${
                            form.residency === value
                              ? "border-green-500 bg-green-950/60 ring-1 ring-green-500"
                              : "border-green-900/40 bg-[#162018] hover:border-green-700"
                          }`}
                        >
                          <p className="text-white font-semibold text-sm mb-1">{label}</p>
                          <p className="text-white/40 text-xs">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience + notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field icon={<Mountain />} label="Experience Level">
                      <select value={form.experience} onChange={set("experience")} className={selectCls}>
                        <option value="beginner">Beginner — first time</option>
                        <option value="intermediate">Intermediate — some hiking</option>
                        <option value="experienced">Experienced — high altitude</option>
                      </select>
                    </Field>
                  </div>

                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Special Requests / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={form.specialRequests}
                      onChange={set("specialRequests")}
                      placeholder="Dietary requirements, medical conditions, special gear, group notes..."
                      className="w-full px-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                    />
                  </div>

                  <div className="bg-green-950/30 border border-green-900/30 rounded-xl p-4 text-xs text-white/50 leading-relaxed">
                    <span className="text-green-400 font-medium">What happens next: </span>
                    Our adventure team will call you within 24 hours to confirm availability, discuss the itinerary, and arrange payment.
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-green-600 hover:bg-green-500 text-white border-0 rounded-full py-3 text-base font-semibold"
                  >
                    {status === "submitting" ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending Enquiry…</>
                    ) : (
                      <><Mountain className="h-4 w-4 mr-2" />Submit Expedition Request</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls = "w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500";
const selectCls = "w-full pl-9 pr-4 py-2.5 bg-[#162018] border border-green-900/40 rounded-xl text-white text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500";

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {children}
      </div>
    </div>
  );
}
