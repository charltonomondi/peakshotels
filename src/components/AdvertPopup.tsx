import { useState, useEffect, useCallback } from "react";
import { X, Download, ExternalLink } from "lucide-react";

// Import advert images
import peaksTvLogo from "@/assets/adverts/peaksTv.png";
import conferenceRates from "@/assets/adverts/Conference_Rates_A5.png";
import rackRates from "@/assets/adverts/Rack_Rates_A5.png";
import redesignedA5 from "@/assets/adverts/redesigned_a5_page_1.png";
import stuAccomm from "@/assets/adverts/stuaccommm.png";
import studentSteam from "@/assets/adverts/studentsteam.png";
import teamBuilding from "@/assets/adverts/Team_Building_Rates_A5.png";

interface Advert {
  id: string;
  type: "peaks-tv" | "rates";
  image: string;
  title: string;
  description?: string;
  link?: string;
  downloadName?: string;
}

const adverts: Advert[] = [
  {
    id: "peaks-tv",
    type: "peaks-tv",
    image: peaksTvLogo,
    title: "Watch Peaks TV",
    description: "Subscribe to our YouTube channel for the latest videos from Peaks Hotel Nanyuki",
    link: "https://www.youtube.com/@PeaksHotelNanyukiTv",
  },
  {
    id: "rack-rates",
    type: "rates",
    image: rackRates,
    title: "Rack Rates",
    downloadName: "Peaks_Hotel_Rack_Rates.png",
  },
  {
    id: "conference-rates",
    type: "rates",
    image: conferenceRates,
    title: "Conference Rates",
    downloadName: "Peaks_Hotel_Conference_Rates.png",
  },
  {
    id: "team-building",
    type: "rates",
    image: teamBuilding,
    title: "Team Building Rates",
    downloadName: "Peaks_Hotel_Team_Building_Rates.png",
  },
  {
    id: "stu-accomm",
    type: "rates",
    image: stuAccomm,
    title: "Student Accommodation Rates",
    downloadName: "Peaks_Hotel_Student_Accommodation.png",
  },
  {
    id: "student-steam",
    type: "rates",
    image: studentSteam,
    title: "Student Steam Bath Rates",
    downloadName: "Peaks_Hotel_Student_Steam_Rates.png",
  },
  {
    id: "redesigned-a5",
    type: "rates",
    image: redesignedA5,
    title: "Special Rates",
    downloadName: "Peaks_Hotel_Special_Rates.png",
  },
];

// Show first popup after 8s, then cycle every 30s
const INITIAL_DELAY = 8000;
const INTERVAL = 30000;

export default function AdvertPopup() {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const showNext = useCallback((prevIndex: number) => {
    setCurrentIndex((prevIndex + 1) % adverts.length);
    setVisible(true);
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => {
      setCurrentIndex(0);
      setVisible(true);
    }, INITIAL_DELAY);

    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Auto-dismiss after 12s, then show next after interval
    const autoDismiss = setTimeout(() => {
      setVisible(false);
      const next = setTimeout(() => showNext(currentIndex), INTERVAL - 12000);
      return () => clearTimeout(next);
    }, 12000);

    return () => clearTimeout(autoDismiss);
  }, [visible, currentIndex, showNext]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => showNext(currentIndex), INTERVAL);
  };

  const handleDownload = (advert: Advert) => {
    const link = document.createElement("a");
    link.href = advert.image;
    link.download = advert.downloadName || `${advert.title}.png`;
    link.click();
  };

  if (!visible) return null;

  const advert = adverts[currentIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
          aria-label="Close advertisement"
        >
          <X size={16} />
        </button>

        {advert.type === "peaks-tv" ? (
          // Peaks TV advert
          <a
            href={advert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            onClick={handleClose}
          >
            <div className="bg-gradient-to-br from-red-700 to-red-900 p-6 flex flex-col items-center gap-4">
              <img
                src={advert.image}
                alt="Peaks TV"
                className="w-32 h-32 object-contain rounded-xl shadow-lg"
              />
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold">{advert.title}</h3>
                <p className="text-red-100 text-sm mt-1">{advert.description}</p>
              </div>
              <span className="inline-flex items-center gap-2 bg-white text-red-700 font-semibold px-5 py-2 rounded-full text-sm group-hover:bg-red-50 transition-colors">
                <ExternalLink size={14} />
                Subscribe Now
              </span>
            </div>
          </a>
        ) : (
          // Rates advert
          <div>
            <img
              src={advert.image}
              alt={advert.title}
              className="w-full object-contain cursor-pointer"
              onClick={() => handleDownload(advert)}
            />
            <div className="p-4 flex items-center justify-between bg-gray-50">
              <span className="text-sm font-medium text-gray-700">{advert.title}</span>
              <button
                onClick={() => handleDownload(advert)}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-2 bg-white">
          {adverts.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? "bg-amber-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
