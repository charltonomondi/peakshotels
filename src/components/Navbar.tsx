import { Link, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Star, CreditCard, Waves, Dumbbell, Flame, Wind, Sparkles, Scissors, Newspaper, Images, MessageSquare, Info, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useLoyaltyAuth } from "@/lib/loyaltyAuth";
import { useStaffAuth } from "@/lib/staffAuth";
import { openLipaModal } from "@/components/LipaMdogoMdogoPopup";
import logo from "/logo.jpeg";
import wellnessBanner from "@/assets/swimming/swim1.jpg";
import moreBanner from "@/assets/facilities/Grounds1.jpg";

// Primary links shown directly in the navbar
const primaryNavItems = [
  { name: "Home", path: "/" },
  { name: "Accommodation", path: "/rooms" },
  { name: "Restaurant & Dining", path: "/restaurant" },
  { name: "Conference", path: "/facilities" },
  { name: "Outdoor Activities", path: "/activities" },
  { name: "Mt. Kenya Climbing", path: "/mountain-climbing" },
];

const wellnessLinks = [
  { name: "Gym", path: "/gym", icon: Dumbbell, desc: "State-of-the-art fitness centre" },
  { name: "Swimming Pool", path: "/swimming", icon: Waves, desc: "Heated outdoor pool" },
  { name: "Steam Bath", path: "/steam-bath", icon: Wind, desc: "Therapeutic moist heat" },
  { name: "Sauna", path: "/sauna", icon: Flame, desc: "Traditional Finnish sauna" },
  { name: "Massage", path: "/massage", icon: Sparkles, desc: "Certified therapists" },
  { name: "Beauty Parlour", path: "/beauty-parlour", icon: Scissors, desc: "Hair, skin & nail care" },
];

// Secondary links tucked into a "More" dropdown
const moreNavItems = [
  { name: "News & Updates", path: "/news",    icon: Newspaper,    desc: "Latest news and events" },
  { name: "Gallery",        path: "/gallery",  icon: Images,       desc: "Photos from around the hotel" },
  { name: "Contact",        path: "/contact",  icon: MessageSquare,desc: "Get in touch with us" },
  { name: "About Us",       path: "/about",    icon: Info,         desc: "Our story and values" },
];

const languages = [
  { code: "en", name: "EN", flag: "🇺🇸" },
  { code: "fr", name: "FR", flag: "🇫🇷" },
  { code: "es", name: "ES", flag: "🇪🇸" },
  { code: "hi", name: "HI", flag: "🇮🇳" },
  { code: "zh", name: "ZH", flag: "🇨🇳" },
  { code: "de", name: "DE", flag: "🇩🇪" },
  { code: "it", name: "IT", flag: "🇮🇹" },
  { code: "pt", name: "PT", flag: "🇵🇹" },
  { code: "ja", name: "JA", flag: "🇯🇵" },
  { code: "ko", name: "KO", flag: "🇰🇷" },
];

const gtCodes: Record<string, string> = {
  en: "en", fr: "fr", es: "es", hi: "hi",
  zh: "zh-CN", de: "de", it: "it", pt: "pt", ja: "ja", ko: "ko",
};

function getActiveLangCode(): string {
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
  const location = useLocation();
  const { member } = useLoyaltyAuth();
  const { staff } = useStaffAuth();
  const wellnessTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLangCode = getActiveLangCode();
  const initialLang = languages.find(l => gtCodes[l.code] === activeLangCode) || languages[0];
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    const gtCode = gtCodes[lang.code] || lang.code;
    if ((window as any).__translateTo) (window as any).__translateTo(gtCode);
  };

  const isWellnessActive = wellnessLinks.some(l => location.pathname === l.path);
  const isMoreActive = moreNavItems.some(i => location.pathname === i.path);

  const openWellness = () => {
    if (wellnessTimeout.current) clearTimeout(wellnessTimeout.current);
    setWellnessOpen(true);
  };
  const closeWellness = () => {
    wellnessTimeout.current = setTimeout(() => setWellnessOpen(false), 120);
  };

  const openMore = () => {
    if (moreTimeout.current) clearTimeout(moreTimeout.current);
    setMoreOpen(true);
  };
  const closeMore = () => {
    moreTimeout.current = setTimeout(() => setMoreOpen(false), 120);
  };

  const renderDesktopItem = (item: any, index: number) => (
    <Link
      key={index}
      to={item.path}
      className={`text-sm font-bold tracking-wide transition-colors hover:text-accent ${location.pathname === item.path ? "text-accent" : "text-foreground"}`}
    >
      {item.name}
    </Link>
  );

  const allMobileItems = [...primaryNavItems, ...moreNavItems];

  const renderMobileItem = (item: any, level = 0) => {
    const pl = 16 + level * 16;
    return (
      <Link
        key={item.name}
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`block py-2.5 text-sm font-medium rounded-md transition-colors hover:text-accent ${location.pathname === item.path ? "text-accent" : "text-foreground"}`}
        style={{ paddingLeft: pl }}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-between h-8 text-xs">
            <div className="flex items-center gap-4">
              <a href="tel:0711969690" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Phone className="h-3 w-3" /> 0711969690
              </a>
              <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Mail className="h-3 w-3" /> info@peakshotels.co.ke
              </a>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-accent transition-colors">
                    <span>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={selectedLanguage.code === lang.code ? "font-semibold text-accent" : ""}
                    >
                      <span className="mr-2">{lang.flag}</span> {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-primary-foreground/60">Mon – Sun: 24/7</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main navbar */}
      <nav className="fixed top-0 md:top-8 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="shrink-0">
              {logoError ? (
                <div className="h-10 w-10 bg-accent/10 flex items-center justify-center rounded-lg">
                  <span className="text-accent font-bold text-sm">PH</span>
                </div>
              ) : (
                <img
                  src={logo}
                  alt="Peaks Hotel"
                  className={`h-10 w-auto object-contain transition-opacity duration-300 ${logoLoading ? "opacity-0" : "opacity-100"}`}
                  onLoad={() => setLogoLoading(false)}
                  onError={() => { setLogoError(true); setLogoLoading(false); }}
                  loading="eager"
                  decoding="async"
                />
              )}
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {primaryNavItems.map((item, i) => renderDesktopItem(item, i))}

              {/* Wellness Centre mega-menu trigger */}
              <div
                className="relative"
                onMouseEnter={openWellness}
                onMouseLeave={closeWellness}
              >
                <button className={`flex items-center gap-1 text-sm font-bold tracking-wide transition-colors hover:text-accent ${isWellnessActive ? "text-accent" : "text-foreground"}`}>
                  Wellness Centre <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${wellnessOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {wellnessOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      onMouseEnter={openWellness}
                      onMouseLeave={closeWellness}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[780px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="flex">
                        {/* Banner image */}
                        <div className="relative w-48 shrink-0">
                          <img src={wellnessBanner} alt="Wellness Centre" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                          <div className="absolute bottom-4 left-4 right-2">
                            <p className="text-white text-xs font-medium tracking-widest uppercase mb-1">Wellness Centre</p>
                            <p className="text-white/80 text-xs leading-snug">Relax. Rejuvenate. Restore.</p>
                          </div>
                        </div>

                        {/* Links grid */}
                        <div className="flex-1 p-5 grid grid-cols-2 gap-2">
                          {wellnessLinks.map(({ name, path, icon: Icon, desc }) => (
                            <Link
                              key={name}
                              to={path}
                              onClick={() => setWellnessOpen(false)}
                              className={`flex items-start gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group ${location.pathname === path ? "bg-accent/5" : ""}`}
                            >
                              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                                <Icon className="h-4 w-4 text-accent group-hover:text-accent-foreground transition-colors" />
                              </div>
                              <div>
                                <p className={`text-sm font-bold leading-tight ${location.pathname === path ? "text-accent" : "text-foreground"}`}>{name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* More mega-menu */}
              <div
                className="relative"
                onMouseEnter={openMore}
                onMouseLeave={closeMore}
              >
                <button className={`flex items-center gap-1 text-sm font-bold tracking-wide transition-colors hover:text-accent ${isMoreActive ? "text-accent" : "text-foreground"}`}>
                  More <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      onMouseEnter={openMore}
                      onMouseLeave={closeMore}
                      className="absolute top-full right-0 mt-3 w-[520px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="flex">
                        {/* Banner image */}
                        <div className="relative w-44 shrink-0">
                          <img src={moreBanner} alt="Peaks Hotel" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                          <div className="absolute bottom-4 left-4 right-2">
                            <p className="text-white text-xs font-medium tracking-widest uppercase mb-1">Peaks Hotel</p>
                            <p className="text-white/80 text-xs leading-snug">Nanyuki, Kenya</p>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="flex-1 p-4 flex flex-col gap-1">
                          {moreNavItems.map(({ name, path, icon: Icon, desc }) => (
                            <Link
                              key={name}
                              to={path}
                              onClick={() => setMoreOpen(false)}
                              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors group ${location.pathname === path ? "bg-accent/5" : ""}`}
                            >
                              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
                                <Icon className="h-4 w-4 text-accent group-hover:text-accent-foreground transition-colors" />
                              </div>
                              <div>
                                <p className={`text-sm font-bold leading-tight ${location.pathname === path ? "text-accent" : "text-foreground"}`}>{name}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openLipaModal?.()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full text-xs font-semibold text-amber-600 transition-colors border border-amber-400/30"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Payment Plan
              </button>

              {member ? (
                <Link
                  to="/loyalty/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-full text-xs font-semibold text-accent transition-colors"
                >
                  <Star className="h-3.5 w-3.5" />
                  {member.points.toLocaleString()} pts
                </Link>
              ) : (
                <Link
                  to="/loyalty/signup"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-full text-xs font-semibold text-accent transition-colors"
                >
                  <Star className="h-3.5 w-3.5" />
                  Loyalty
                </Link>
              )}

              <Button variant="gold" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/booking">Book Now</Link>
              </Button>

              {/* Staff portal link */}
              {staff?.status === "active" ? (
                <Link
                  to="/staff/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full text-xs font-semibold text-primary transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/staff/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-full text-xs font-semibold text-primary transition-colors"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Staff Login
                </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-secondary transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-border overflow-hidden"
              >
                <div className="py-3 max-h-[75vh] overflow-y-auto">
                  {allMobileItems.map((item) => renderMobileItem(item))}

                  {/* Wellness Centre in mobile */}
                  <div>
                    <button
                      onClick={() => setMobileWellnessOpen(v => !v)}
                      className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-foreground"
                      style={{ paddingLeft: 16 }}
                    >
                      Wellness Centre
                      <ChevronDown className={`h-4 w-4 mr-4 transition-transform ${mobileWellnessOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {mobileWellnessOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {wellnessLinks.map(({ name, path }) => (
                            <Link
                              key={name}
                              to={path}
                              onClick={() => { setIsOpen(false); setMobileWellnessOpen(false); }}
                              className={`block py-2 text-sm font-medium hover:text-accent transition-colors ${location.pathname === path ? "text-accent" : "text-muted-foreground"}`}
                              style={{ paddingLeft: 32 }}
                            >
                              {name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    <button
                      onClick={() => { setIsOpen(false); openLipaModal?.(); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-600 font-semibold text-sm"
                    >
                      <CreditCard className="h-4 w-4" /> Payment Plan
                    </button>
                    <Button variant="gold" size="lg" className="w-full" asChild>
                      <Link to="/booking" onClick={() => setIsOpen(false)}>Book Now</Link>
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1 text-xs text-muted-foreground">
                    <a href="tel:0711969690" className="flex items-center gap-2"><Phone className="h-3 w-3" />0711969690</a>
                    <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-2"><Mail className="h-3 w-3" />info@peakshotels.co.ke</a>
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
