import { useState, useEffect, useCallback, useRef } from "react";
import { X, Download, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Advert {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; href?: string; download?: string };
  accent: string; // tailwind bg colour for the bottom bar
}

const adverts: Advert[] = [
  {
    id: "peaks-tv",
    image: "/adverts/peaksTv.png",
    title: "Watch Peaks TV",
    subtitle: "Subscribe for the latest videos from Peaks Hotel Nanyuki",
    cta: { label: "Subscribe Now", href: "https://www.youtube.com/@PeaksHotelNanyukiTv" },
    accent: "bg-red-700",
  },
  {
    id: "rack-rates",
    image: "/adverts/Rack_Rates_A5.png",
    title: "Rack Rates",
    subtitle: "Our standard accommodation rates",
    cta: { label: "Download", download: "Peaks_Hotel_Rack_Rates.png" },
    accent: "bg-amber-700",
  },
  {
    id: "conference-rates",
    image: "/adverts/Conference_Rates_A5.png",
    title: "Conference Rates",
    subtitle: "Full-day & half-day packages available",
    cta: { label: "Download", download: "Peaks_Hotel_Conference_Rates.png" },
    accent: "bg-amber-700",
  },
  {
    id: "team-building",
    image: "/adverts/Team_Building_Rates_A5.png",
    title: "Team Building Rates",
    subtitle: "Outdoor challenges, nature walks & more",
    cta: { label: "Download", download: "Peaks_Hotel_Team_Building.png" },
    accent: "bg-amber-700",
  },
  {
    id: "stu-accomm",
    image: "/adverts/stuaccommm.png",
    title: "Student Accommodation",
    subtitle: "Special rates for students & groups",
    cta: { label: "Download", download: "Peaks_Hotel_Student_Accommodation.png" },
    accent: "bg-amber-700",
  },
  {
    id: "student-steam",
    image: "/adverts/studentsteam.png",
    title: "Student Steam Bath",
    subtitle: "Discounted wellness rates for students",
    cta: { label: "Download", download: "Peaks_Hotel_Student_Steam.png" },
    accent: "bg-amber-700",
  },
  {
    id: "special-rates",
    image: "/adverts/redesigned_a5_page_1.png",
    title: "Special Rates",
    subtitle: "Exclusive offers for our valued guests",
    cta: { label: "Download", download: "Peaks_Hotel_Special_Rates.png" },
    accent: "bg-amber-700",
  },
];

const DISPLAY_DURATION = 10000; // how long each ad shows
const BETWEEN_DELAY   = 25000; // gap before next ad

export default function AdvertPopup() {
  const [visible, setVisible]       = useState(false);
  const [index, setIndex]           = useState(0);
  const [progress, setProgress]     = useState(0);
  const [exiting, setExiting]       = useState(false);
  const progressRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTimerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (progressRef.current)  clearInterval(progressRef.current);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
  };

  const dismiss = useCallback((andShowNext = true) => {
    clearTimers();
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      setVisible(false);
      setProgress(0);
      if (andShowNext) {
        nextTimerRef.current = setTimeout(() => {
          setIndex(i => (i + 1) % adverts.length);
          setVisible(true);
        }, BETWEEN_DELAY);
      }
    }, 350);
  }, []);

  // Start progress bar when visible
  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    const tick = 100;
    const steps = DISPLAY_DURATION / tick;
    let step = 0;
    progressRef.current = setInterval(() => {
      step++;
      setProgress(Math.min((step / steps) * 100, 100));
      if (step >= steps) {
        clearInterval(progressRef.current!);
        dismiss();
      }
    }, tick);
    return () => clearTimers();
  }, [visible, index, dismiss]);

  // Initial delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const goTo = (i: number) => {
    clearTimers();
    setProgress(0);
    setIndex(i);
    // re-trigger the effect by briefly flipping visible
    setVisible(false);
    setTimeout(() => setVisible(true), 50);
  };

  const handleCta = (ad: Advert) => {
    if (ad.cta?.href) {
      window.open(ad.cta.href, "_blank", "noopener,noreferrer");
      dismiss(false);
    } else if (ad.cta?.download) {
      const a = document.createElement("a");
      a.href = ad.image;
      a.download = ad.cta.download;
      a.click();
    }
  };

  if (!visible) return null;

  const ad = adverts[index];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-350
        ${exiting ? "opacity-0 backdrop-blur-none" : "opacity-100 backdrop-blur-sm bg-black/60"}`}
      onClick={() => dismiss()}
    >
      <div
        className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transition-all duration-350
          ${exiting ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-none"
            style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={() => dismiss(false)}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/80 rounded-full transition-colors"
        >
          <X size={15} className="text-white" />
        </button>

        {/* Nav arrows */}
        {adverts.length > 1 && (
          <>
            <button
              onClick={() => goTo((index - 1 + adverts.length) % adverts.length)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => goTo((index + 1) % adverts.length)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </>
        )}

        {/* Full advert image */}
        <div className="relative w-full bg-gray-100" style={{ aspectRatio: "3/4" }}>
          <img
            src={ad.image}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Bottom bar */}
        <div className={`${ad.accent} px-5 py-4 flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">{ad.title}</p>
            {ad.subtitle && (
              <p className="text-white/70 text-xs mt-0.5 leading-tight line-clamp-1">{ad.subtitle}</p>
            )}
          </div>
          {ad.cta && (
            <button
              onClick={() => handleCta(ad)}
              className="shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-white/30"
            >
              {ad.cta.href ? <ExternalLink size={12} /> : <Download size={12} />}
              {ad.cta.label}
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-[56px] left-0 right-0 flex justify-center gap-1.5 pb-2">
          {adverts.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to advert ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === index ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
