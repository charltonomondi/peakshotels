import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Star, CreditCard, Waves, Dumbbell, Flame, Wind, Sparkles, Scissors, Newspaper, Images, MessageSquare, Info, ArrowRight, Shield, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useLoyaltyAuth } from "@/lib/loyaltyAuth";
import { useStaffAuth } from "@/lib/staffAuth";
import { openLipaModal } from "@/components/LipaMdogoMdogoPopup";
import logo from "/logo.jpeg";
import wellnessBanner from "@/assets/swimming/swim1.jpg";
import moreBanner from "@/assets/facilities/Grounds1.jpg";

const primaryNavItems = [
  { name: "Home", path: "/" },
  { name: "Accommodation", path: "/rooms" },
  { name: "Restaurant", path: "/restaurant" },
  { name: "Conference", path: "/facilities" },
  { name: "Activities", path: "/activities" },
  { name: "Mt. Kenya", path: "/mountain-climbing" },
];

const wellnessLinks = [
  { name: "Gym", path: "/gym", icon: Dumbbell, desc: "State-of-the-art fitness centre" },
  { name: "Swimming Pool", path: "/swimming", icon: Waves, desc: "Heated outdoor pool" },
  { name: "Steam Bath", path: "/steam-bath", icon: Wind, desc: "Therapeutic moist heat" },
  { name: "Sauna", path: "/sauna", icon: Flame, desc: "Traditional Finnish sauna" },
  { name: "Massage", path: "/massage", icon: Sparkles, desc: "Certified therapists" },
  { name: "Beauty Parlour", path: "/beauty-parlour", icon: Scissors, desc: "Hair, skin & nail care" },
];

const moreNavItems = [
  { name: "News & Updates", path: "/news", icon: Newspaper, desc: "Latest news and events" },
  { name: "Careers", path: "/careers", icon: Briefcase, desc: "Job opportunities" },
  { name: "Gallery", path: "/gallery", icon: Images, desc: "Photos from around the hotel" },
  { name: "Contact", path: "/contact", icon: MessageSquare, desc: "Get in touch with us" },
  { name: "About Us", path: "/about", icon: Info, desc: "Our story and values" },
];

const languages = [
  { code: "en", name: "EN", flag: "🇺🇸" }, { code: "fr", name: "FR", flag: "🇫🇷" },
  { code: "es", name: "ES", flag: "🇪🇸" }, { code: "hi", name: "HI", flag: "🇮🇳" },
  { code: "zh", name: "ZH", flag: "🇨🇳" }, { code: "de", name: "DE", flag: "🇩🇪" },
  { code: "it", name: "IT", flag: "🇮🇹" }, { code: "pt", name: "PT", flag: "🇵🇹" },
  { code: "ja", name: "JA", flag: "🇯🇵" }, { code: "ko", name: "KO", flag: "🇰🇷" },
];

const gtCodes: Record<string, string> = {
  en: "en", fr: "fr", es: "es", hi: "hi", zh: "zh-CN",
  de: "de", it: "it", pt: "pt", ja: "ja", ko: "ko",
};

function getActiveLangCode() {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : "en";
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [wellnessOpen, setWellnessOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileWellnessOpen, setMobileWellnessOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { member } = useLoyaltyAuth();
  const { staff } = useStaffAuth();
  const wellnessTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLangCode = getActiveLangCode();
  const initialLang = languages.find(l => gtCodes[l.code] === activeLangCode) || languages[0];
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    const gtCode = gtCodes[lang.code] || lang.code;
    if ((window as unknown as Record<string, unknown>).__translateTo) {
      (window as unknown as Record<string, (c: string) => void>).__translateTo(gtCode);
    }
  };

  const isWellnessActive = wellnessLinks.some(l => location.pathname === l.path);
  const isMoreActive = moreNavItems.some(i => location.pathname === i.path);

  const openWellness = () => { if (wellnessTimeout.current) clearTimeout(wellnessTimeout.current); setWellnessOpen(true); };
  const closeWellness = () => { wellnessTimeout.current = setTimeout(() => setWellnessOpen(false), 120); };
  const openMore = () => { if (moreTimeout.current) clearTimeout(moreTimeout.current); setMoreOpen(true); };
  const closeMore = () => { moreTimeout.current = setTimeout(() => setMoreOpen(false), 120); };

  const linkCls = (path: string) =>
    `relative text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 whitespace-nowrap group ${location.pathname === path ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"}`;

  return (
    <>
      {/* Top info bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800/80">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-between h-8 text-[10px] text-zinc-500 tracking-wide">
            <div className="flex items-center gap-5">
              <a href="tel:0711969690" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                <Phone className="h-2.5 w-2.5" /> 0711 969 690
              </a>
              <span className="text-zinc-700">|</span>
              <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                <Mail className="h-2.5 w-2.5" /> info@peakshotels.co.ke
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-zinc-700">Open 24 / 7</span>
              <span className="text-zinc-800">|</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-amber-400 transition-colors">
                    <span>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.name}</span>
                    <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 bg-zinc-900 border-zinc-700 text-zinc-200">
                  {languages.map(lang => (
                    <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang)}
                      className={`hover:bg-zinc-800 focus:bg-zinc-800 ${selectedLanguage.code === lang.code ? "text-amber-400 font-semibold" : ""}`}>
                      <span className="mr-2">{lang.flag}</span> {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`fixed top-0 md:top-8 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/98 backdrop-blur-xl border-b border-amber-400/25 shadow-[0_4px_30px_rgba(0,0,0,0.6)]" : "bg-zinc-950/92 backdrop-blur-xl border-b border-zinc-800/50"}`}>
        {/* Shimmer accent line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* Floating logo */}
            <Link to="/" className="shrink-0 relative z-10 group" style={{ marginTop: "26px" }}>
              <div className="relative" style={{ width: 88, height: 88 }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-400/8 blur-xl scale-125" />
                <div style={{ width: 88, height: 88 }}
                  className="relative bg-zinc-950 rounded-2xl border border-amber-400/50 group-hover:border-amber-400 transition-colors duration-300 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,200,50,0.12)]">
                  <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-amber-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-amber-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-amber-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-amber-400 rounded-br-xl" />
                  {logoError ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-amber-400 font-heading font-bold text-xl">PH</span>
                    </div>
                  ) : (
                    <img src={logo} alt="Peaks Hotel"
                      className={`w-full h-full object-contain rounded-xl transition-opacity duration-300 ${logoLoading ? "opacity-0" : "opacity-100"}`}
                      onLoad={() => setLogoLoading(false)}
                      onError={() => { setLogoError(true); setLogoLoading(false); }}
                      loading="eager" decoding="async" />
                  )}
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  PEAKS HOTEL
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {primaryNavItems.map((item, i) => (
                <Link key={i} to={item.path} className={linkCls(item.path)}>
                  {item.name}
                  <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-amber-400 transition-all duration-300 ${location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              ))}

              {/* Wellness */}
              <div className="relative" onMouseEnter={openWellness} onMouseLeave={closeWellness}>
                <button className={`relative flex items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors group ${isWellnessActive ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"}`}>
                  Wellness
                  <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${wellnessOpen ? "rotate-180" : ""}`} />
                  <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-amber-400 transition-all duration-300 ${isWellnessActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
                <AnimatePresence>
                  {wellnessOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }} onMouseEnter={openWellness} onMouseLeave={closeWellness}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[760px] bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-50">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                      <div className="flex">
                        <div className="relative w-44 shrink-0">
                          <img src={wellnessBanner} alt="Wellness" className="w-full h-full object-cover opacity-75" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/70" />
                          <div className="absolute bottom-4 left-4">
                            <p className="text-amber-400 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Wellness Centre</p>
                            <p className="text-zinc-300 text-xs">Relax. Rejuvenate.</p>
                          </div>
                        </div>
                        <div className="flex-1 p-5 grid grid-cols-2 gap-1.5">
                          {wellnessLinks.map(({ name, path, icon: Icon, desc }) => (
                            <Link key={name} to={path} onClick={() => setWellnessOpen(false)}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-colors group/item ${location.pathname === path ? "bg-amber-400/10" : "hover:bg-zinc-800"}`}>
                              <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-amber-400 transition-colors">
                                <Icon className="h-4 w-4 text-amber-400 group-hover/item:text-zinc-950 transition-colors" />
                              </div>
                              <div>
                                <p className={`text-[12px] font-semibold ${location.pathname === path ? "text-amber-400" : "text-zinc-200"}`}>{name}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5">{desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* More */}
              <div className="relative" onMouseEnter={openMore} onMouseLeave={closeMore}>
                <button className={`relative flex items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors group ${isMoreActive ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"}`}>
                  More
                  <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                  <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-amber-400 transition-all duration-300 ${isMoreActive ? "w-full" : "w-0 group-hover:w-full"}`} />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18 }} onMouseEnter={openMore} onMouseLeave={closeMore}
                      className="absolute top-full right-0 mt-4 w-[480px] bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-50">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                      <div className="flex">
                        <div className="relative w-40 shrink-0">
                          <img src={moreBanner} alt="More" className="w-full h-full object-cover opacity-75" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/70" />
                          <div className="absolute bottom-4 left-4">
                            <p className="text-amber-400 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Peaks Hotel</p>
                            <p className="text-zinc-300 text-xs">Nanyuki, Kenya</p>
                          </div>
                        </div>
                        <div className="flex-1 p-4 flex flex-col gap-0.5">
                          {moreNavItems.map(({ name, path, icon: Icon, desc }) => (
                            <Link key={name} to={path} onClick={() => setMoreOpen(false)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors group/item ${location.pathname === path ? "bg-amber-400/10" : "hover:bg-zinc-800"}`}>
                              <div className="w-7 h-7 bg-amber-400/10 rounded-lg flex items-center justify-center shrink-0 group-hover/item:bg-amber-400 transition-colors">
                                <Icon className="h-3.5 w-3.5 text-amber-400 group-hover/item:text-zinc-950 transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[12px] font-semibold ${location.pathname === path ? "text-amber-400" : "text-zinc-200"}`}>{name}</p>
                                <p className="text-[10px] text-zinc-500">{desc}</p>
                              </div>
                              <ArrowRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => openLipaModal?.()}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors whitespace-nowrap tracking-wide">
                <CreditCard className="h-3 w-3" />
                <span className="hidden xl:inline">Pay Plan</span>
              </button>

              {member ? (
                <Link to="/loyalty/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors whitespace-nowrap">
                  <Star className="h-3 w-3" />
                  <span className="hidden xl:inline">{member.points.toLocaleString()} pts</span>
                  <span className="xl:hidden">Loyalty</span>
                </Link>
              ) : (
                <Link to="/loyalty/signup"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 transition-colors whitespace-nowrap">
                  <Star className="h-3 w-3" />
                  <span className="hidden xl:inline">Loyalty</span>
                </Link>
              )}

              <Link to="/booking"
                className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-[11px] font-bold tracking-wide hover:from-amber-400 hover:to-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)] hover:shadow-[0_0_28px_rgba(251,191,36,0.45)] whitespace-nowrap">
                Book Now
              </Link>

              {staff?.status === "active" ? (
                <Link to="/staff/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap">
                  <Shield className="h-3 w-3" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Link>
              ) : (
                <Link to="/staff/login"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap">
                  <Shield className="h-3 w-3" />
                  <span>Staff</span>
                </Link>
              )}

              <button onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-300" aria-label="Toggle menu">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-zinc-800 overflow-hidden bg-zinc-950">
                <div className="py-4 max-h-[75vh] overflow-y-auto">
                  {[...primaryNavItems, ...moreNavItems].map(item => (
                    <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)}
                      className={`block py-2.5 pl-4 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors border-l-2 mb-0.5 ${location.pathname === item.path ? "text-amber-400 border-amber-400 bg-amber-400/5" : "text-zinc-400 border-transparent hover:text-amber-400 hover:border-amber-400/50"}`}>
                      {item.name}
                    </Link>
                  ))}

                  <button onClick={() => setMobileWellnessOpen(v => !v)}
                    className="w-full flex items-center justify-between py-2.5 pl-4 pr-4 text-[12px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-amber-400 transition-colors">
                    Wellness Centre
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileWellnessOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {mobileWellnessOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        {wellnessLinks.map(({ name, path }) => (
                          <Link key={name} to={path} onClick={() => { setIsOpen(false); setMobileWellnessOpen(false); }}
                            className={`block py-2 pl-8 text-[11px] font-medium tracking-wide transition-colors ${location.pathname === path ? "text-amber-400" : "text-zinc-500 hover:text-amber-400"}`}>
                            {name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 px-3">
                    <button onClick={() => { setIsOpen(false); openLipaModal?.(); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-amber-400/40 text-amber-400 font-semibold text-[12px] tracking-wide hover:bg-amber-400/10 transition-colors">
                      <CreditCard className="h-4 w-4" /> Payment Plan
                    </button>

                    {member ? (
                      <Link to="/loyalty/dashboard" onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-amber-400/40 text-amber-400 font-semibold text-[12px] tracking-wide">
                        <Star className="h-4 w-4" /> {member.points.toLocaleString()} pts
                      </Link>
                    ) : (
                      <Link to="/loyalty/signup" onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-amber-400/40 text-amber-400 font-semibold text-[12px] tracking-wide">
                        <Star className="h-4 w-4" /> Loyalty Programme
                      </Link>
                    )}

                    <Link to="/booking" onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 font-bold text-[13px] tracking-wide shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                      Book Now
                    </Link>

                    {staff?.status === "active" ? (
                      <Link to="/staff/dashboard" onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-zinc-700 text-zinc-400 font-semibold text-[12px] tracking-wide">
                        <Shield className="h-4 w-4" /> Staff Dashboard
                      </Link>
                    ) : (
                      <Link to="/staff/login" onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-zinc-700 text-zinc-400 font-semibold text-[12px] tracking-wide">
                        <Shield className="h-4 w-4" /> Staff Login
                      </Link>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800 px-4 flex flex-col gap-1.5 text-[10px] text-zinc-600">
                    <a href="tel:0711969690" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                      <Phone className="h-3 w-3" /> 0711 969 690
                    </a>
                    <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                      <Mail className="h-3 w-3" /> info@peakshotels.co.ke
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
