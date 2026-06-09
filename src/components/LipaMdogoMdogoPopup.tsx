import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import lipaImg from "@/assets/lipa.png";

// Export so the Navbar can open the modal too
export let openLipaModal: (() => void) | null = null;

const plans = [
  { months: 2, label: "2-Month Plan", example: "KES 8,400 → KES 2,520 deposit + 2 × KES 2,940" },
  { months: 3, label: "3-Month Plan", example: "KES 8,400 → KES 2,520 deposit + 3 × KES 1,960" },
];

const LipaMdogoMdogoPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Register global opener so Navbar can trigger the modal
  openLipaModal = () => { setShowPopup(false); setShowModal(true); };

  useEffect(() => {
    const dismissed = sessionStorage.getItem("lipa_popup_dismissed");
    if (dismissed) return;
    const t = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem("lipa_popup_dismissed", "1");
  };

  const openModal = () => { setShowPopup(false); setShowModal(true); };

  return (
    <>
      {/* ── POPUP BANNER (bottom-left) ── */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 left-6 z-50 w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
            onClick={openModal}
            style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.45)" }}
          >
            {/* image */}
            <div className="relative h-44 overflow-hidden">
              <img src={lipaImg} alt="Lipa Mdogo Mdogo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-900/30 to-transparent" />

              {/* close */}
              <button
                onClick={e => { e.stopPropagation(); dismiss(); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-amber-300 text-xs font-medium tracking-widest uppercase mb-0.5">
                  Peaks Hotel
                </p>
                <h3 className="font-heading text-white text-lg font-bold leading-tight">
                  Lipa Mdogo Mdogo
                </h3>
                <p className="text-white/70 text-xs mt-0.5">Pay your stay in easy instalments</p>
              </div>
            </div>

            {/* bottom strip */}
            <div className="bg-amber-600 px-4 py-2.5 flex items-center justify-between hover:bg-amber-500 transition-colors">
              <span className="text-white text-sm font-semibold flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                30% deposit to start
              </span>
              <ChevronRight className="h-4 w-4 text-white/80" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg rounded-3xl overflow-hidden bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* hero image */}
              <div className="relative h-52 overflow-hidden">
                <img src={lipaImg} alt="Lipa Mdogo Mdogo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/85 via-amber-900/30 to-transparent" />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-5 left-6">
                  <p className="text-amber-300 text-xs tracking-widest uppercase mb-1">Peaks Hotel</p>
                  <h2 className="font-heading text-2xl font-bold text-white">💳 Lipa Mdogo Mdogo</h2>
                  <p className="text-white/70 text-sm mt-0.5">Book now. Pay in easy instalments.</p>
                </div>
              </div>

              <div className="p-6">
                {/* what it is */}
                <p className="text-gray-600 text-sm leading-relaxed mb-5">
                  Enjoy your Peaks Hotel stay today with just a <strong className="text-amber-700">30% deposit</strong> — and spread the rest over 2 or 3 equal monthly instalments. No hidden charges. No interest.
                </p>

                {/* plan cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {plans.map(p => (
                    <div key={p.months} className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                      <p className="font-semibold text-amber-900 text-sm mb-1">{p.label}</p>
                      <p className="text-amber-700/80 text-xs leading-relaxed">{p.example}</p>
                    </div>
                  ))}
                </div>

                {/* benefits */}
                <div className="space-y-2 mb-6">
                  {[
                    "No interest or hidden fees",
                    "Quick approval — takes 2 minutes",
                    "Available on all room types",
                    "Manage your plan from your dashboard",
                  ].map(b => (
                    <div key={b} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => { setShowModal(false); navigate("/lipa/signup"); }}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white border-0 rounded-full py-3 font-semibold"
                  >
                    Apply Now — It's Free
                  </Button>
                  <Button
                    onClick={() => { setShowModal(false); navigate("/lipa/login"); }}
                    variant="outline"
                    className="w-full rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    Sign In to My Account
                  </Button>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 text-xs mt-1 hover:text-gray-600 transition-colors">
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LipaMdogoMdogoPopup;
