import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Star, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useLoyaltyAuth } from "@/lib/loyaltyAuth";
import { openLipaModal } from "@/components/LipaMdogoMdogoPopup";
import logo from "/logo.jpeg";

// Primary links shown directly in the navbar
const primaryNavItems = [
  { name: "Home", path: "/" },
  { name: "Accommodation", path: "/rooms" },
  { name: "Restaurant & Bar", path: "/restaurant" },
  { name: "Conferences", path: "/facilities" },
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
];

// Secondary links tucked into a "More" dropdown
const moreNavItems = [
  { name: "Outdoor Fitness", path: "/activities" },
  { name: "News & Updates", path: "/news" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
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
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const location = useLocation();
  const { member } = useLoyaltyAuth();

  const activeLangCode = getActiveLangCode();
  const initialLang = languages.find(l => gtCodes[l.code] === activeLangCode) || languages[0];
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    const gtCode = gtCodes[lang.code] || lang.code;
    if ((window as any).__translateTo) (window as any).__translateTo(gtCode);
  };

  const isActive = (item: any): boolean => {
    if (item.path) return location.pathname === item.path;
    if (item.children) return item.children.some((c: any) => isActive(c));
    return false;
  };

  const renderDesktopItem = (item: any, index: number) => {
    if (item.children) {
      return (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-1 text-sm font-bold tracking-wide transition-colors hover:text-accent ${isActive(item) ? "text-accent" : "text-foreground"}`}>
              {item.name} <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {item.children.map((child: any, ci: number) =>
              child.children ? (
                <DropdownMenuSub key={ci}>
                  <DropdownMenuSubTrigger>{child.name}</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {child.children.map((sub: any, si: number) => (
                      <DropdownMenuItem key={si} asChild>
                        <Link to={sub.path}>{sub.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem key={ci} asChild>
                  <Link to={child.path}>{child.name}</Link>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Link
        key={index}
        to={item.path}
        className={`text-sm font-bold tracking-wide transition-colors hover:text-accent ${location.pathname === item.path ? "text-accent" : "text-foreground"}`}
      >
        {item.name}
      </Link>
    );
  };

  const allMobileItems = [...primaryNavItems, ...moreNavItems];

  const renderMobileItem = (item: any, level = 0) => {
    const pl = 16 + level * 16;
    if (item.children) {
      return (
        <div key={item.name}>
          <div className="py-2 text-sm font-semibold text-muted-foreground" style={{ paddingLeft: pl }}>
            {item.name}
          </div>
          {item.children.map((child: any) => renderMobileItem(child, level + 1))}
        </div>
      );
    }
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
              {/* Language selector */}
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

              {/* More dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-1 text-sm font-bold tracking-wide transition-colors hover:text-accent ${moreNavItems.some(i => location.pathname === i.path) ? "text-accent" : "text-foreground"}`}>
                    More <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {moreNavItems.map((item, i) => (
                    <DropdownMenuItem key={i} asChild>
                      <Link to={item.path}>{item.name}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/about">About Us</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openLipaModal?.()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-full text-xs font-semibold text-amber-600 transition-colors border border-amber-400/30"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Lipa Mdogo
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

              {/* Mobile hamburger */}
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
