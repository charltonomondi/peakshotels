import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Phone, ExternalLink } from "lucide-react";

const WA_NUMBER = "254711969690";
const WA_DISPLAY = "+254 711 969 690";

interface Props {
  open: boolean;
  onClose: () => void;
  service?: string; // e.g. "Gym Session", "Sauna", "Massage"
}

export default function WhatsAppBookingModal({ open, onClose, service = "Session" }: Props) {
  const message = encodeURIComponent(
    `Hello Peaks Hotel! I'd like to book a ${service}. Please let me know availability.`
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${message}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#25D366] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-tight">Book via WhatsApp</p>
                  <p className="text-white/80 text-xs">Peaks Hotel Nanyuki</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 text-center">
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                Tap below to open WhatsApp and book your
              </p>
              <p className="text-gray-900 font-bold text-lg mb-1">{service}</p>
              <p className="text-gray-500 text-sm mb-6">
                Our team responds quickly during business hours.
              </p>

              {/* WhatsApp CTA */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-2xl transition-colors text-base"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
                <ExternalLink className="h-4 w-4 opacity-70" />
              </a>

              {/* Or call */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-400 text-xs">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <a
                href={`tel:+${WA_NUMBER}`}
                className="flex items-center justify-center gap-2 w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                Call {WA_DISPLAY}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
