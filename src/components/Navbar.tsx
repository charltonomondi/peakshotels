import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, MapPin, Mail, ChevronDown, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useLoyaltyAuth } from "@/lib/loyaltyAuth";
import { openLipaModal } from "@/components/LipaMdogoMdogoPopup";
import logo from "/logo.jpeg";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Accommodation", path: "/rooms" },
  { name: "Conferences", path: "/facilities" },
  { name: "Outdoor Fitness", path: "/activities" },
  {
    name: "Wellness Center",
    children: [
      { name: "Gym", path: "/gym" },
      { name: "Swimming", path: "/swimming" },
      { name: "Steam Bath", path: "/steam-bath" },
      { name: "Sauna", path: "/sauna" },
      {
        name: "Spa",
        children: [
          { name: "Massage", path: "/massage" },
          { name: "Beauty Parlour", path: "/beauty-parlour" },
        ],
      },
    ],
  },
  { name: "Restaurant & Bar", path: "/restaurant" },
  { name: "News & Updates", path: "/news" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
];

// Map our language codes to Google Translate codes
const gtCodes: Record<string, string> = {
  en: "en", fr: "fr", es: "es", hi: "hi",
  zh: "zh-CN", de: "de", it: "it", pt: "pt", ja: "ja", ko: "ko",
};

// Detect active language from cookie on load
function getActiveLangCode(): string {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : "en";
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const location = useLocation();
  const { member } = useLoyaltyAuth();

  // Initialise selected language from cookie
  const activeLangCode = getActiveLangCode();
  const initialLang = languages.find(l => gtCodes[l.code] === activeLangCode) || languages[0];
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    const gtCode = gtCodes[lang.code] || lang.code;
    if ((window as any).__translateTo) {
      (window as any).__translateTo(gtCode);
    }
  };

  const renderNavItem = (item, index) => {
    const isActive = (item) => {
      if (item.path) return location.pathname === item.path;
      if (item.children) {
        return item.children.some(child => isActive(child));
      }
      return false;
    };
    if (item.children) {
      return (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <button className={`text-sm font-semibold tracking-wide transition-colors hover:text-accent flex items-center gap-1 ${
              isActive(item) ? "text-accent" : "text-foreground"
            }`}>
              {item.name}
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child, childIndex) => {
              if (child.children) {
                return (
                  <DropdownMenuSub key={childIndex}>
                    <DropdownMenuSubTrigger className="flex items-center justify-between">
                      {child.name}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {child.children.map((sub, subIndex) => (
                        <DropdownMenuItem key={subIndex} asChild>
                          <Link to={sub.path}>{sub.name}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                );
              } else {
                return (
                  <DropdownMenuItem key={childIndex} asChild>
                    <Link to={child.path}>{child.name}</Link>
                  </DropdownMenuItem>
                );
              }
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } else {
      return (
        <Link
          key={index}
          to={item.path}
          className={`text-sm font-semibold tracking-wide transition-colors hover:text-accent ${
            location.pathname === item.path ? "text-accent" : "text-foreground"
          }`}
        >
          {item.name}
        </Link>
      );
    }
  };

  const renderMobileNavItem = (item, level = 0) => {
    const indent = level * 16;
    if (item.children) {
      return (
        <div key={item.name}>
          <div
            className={`px-4 py-3 text-base font-semibold text-foreground`}
            style={{ paddingLeft: `${4 + indent}px` }}
          >
            {item.name}
          </div>
          {item.children.map((child) => renderMobileNavItem(child, level + 1))}
        </div>
      );
    } else {
      return (
        <Link
          key={item.name}
          to={item.path}
          onClick={() => setIsOpen(false)}
          className={`block px-4 py-3 text-base font-semibold transition-colors hover:bg-secondary rounded-md ${
            location.pathname === item.path ? "text-accent bg-secondary" : "text-foreground"
          }`}
          style={{ paddingLeft: `${4 + indent}px` }}
        >
          {item.name}
        </Link>
      );
    }
  };

  return (
    <>
      {/* Top Bar - hidden on mobile */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-between h-8 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">3kms from Nanyuki CBD on Nanyuki Meru Road</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="mailto:info@peakshotels.co.ke" className="hidden lg:flex items-center gap-1 hover:text-accent transition-colors">
                <Mail className="h-3 w-3" />
                info@peakshotels.co.ke
              </a>
              <a href="tel:0711969690" className="flex items-center gap-1 hover:text-accent transition-colors">
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">0711969690</span>
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-accent transition-colors">
                    <span>{selectedLanguage.flag}</span>
                    <span className="hidden lg:inline">{selectedLanguage.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`flex items-center gap-2 ${selectedLanguage.code === lang.code ? "font-semibold text-accent" : ""}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="hidden xl:inline">Mon - Sun: 24/7</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navbar */}
      <nav className="fixed top-0 md:top-8 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-12 md:h-16" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
              {logoError ? (
                <div className="h-12 md:h-16 w-12 md:w-16 bg-accent/10 flex items-center justify-center rounded-lg">
                  <span className="text-accent font-bold text-sm md:text-lg">PH</span>
                </div>
              ) : (
                <img
                  src={logo}
                  alt="Peaks Hotel"
                  className={`h-12 md:h-16 w-auto object-cover transition-opacity duration-300 ${logoLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setLogoLoading(false)}
                  onError={() => { setLogoError(true); setLogoLoading(false); }}
                  loading="eager"
                  decoding="async"
                />
              )}
              {logoLoading && !logoError && (
                <div className="absolute inset-0 bg-accent/5 animate-pulse rounded-lg" />
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navItems.map((item, index) => renderNavItem(item, index))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            {/* Lipa Mdogo Mdogo button */}
            <button
              onClick={() => openLipaModal?.()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full text-xs font-semibold text-amber-600 transition-colors border border-amber-400/30"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Lipa Mdogo
            </button>
            {/* Loyalty badge */}
            {member ? (
              <Link to="/loyalty/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-full text-xs font-semibold text-accent transition-colors">
                <Star className="h-3.5 w-3.5" />
                {member.points.toLocaleString()} pts
              </Link>
            ) : (
              <Link to="/loyalty/signup"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 rounded-full text-xs font-semibold text-accent transition-colors">
                <Star className="h-3.5 w-3.5" />
                Loyalty
              </Link>
            )}
            <Button variant="gold" size="sm" className="hidden sm:inline-flex lg:hidden" asChild>
              <Link to="/booking">Book</Link>
            </Button>
            <Button variant="gold" size="lg" className="hidden lg:inline-flex" asChild>
              <Link to="/booking">Book Now</Link>
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground rounded-md hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <div className="py-3 space-y-1 max-h-[70vh] overflow-y-auto">
                {navItems.map((item) => renderMobileNavItem(item))}
                <div className="px-4 pt-3 pb-2 border-t border-border mt-2 space-y-2">
                  <button
                    onClick={() => { setIsOpen(false); openLipaModal?.(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-600 font-semibold text-sm"
                  >
                    <CreditCard className="h-4 w-4" />
                    Lipa Mdogo Mdogo
                  </button>
                  <Button variant="gold" size="lg" className="w-full" asChild>
                    <Link to="/booking" onClick={() => setIsOpen(false)}>Book Now</Link>
                  </Button>
                </div>
                {/* Mobile contact info */}
                <div className="px-4 py-2 text-xs text-muted-foreground space-y-1 border-t border-border">
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
