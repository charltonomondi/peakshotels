import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Phone, MapPin, Mail, ChevronDown } from "lucide-react";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const location = useLocation();

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
      {/* Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>3kms from Nanyuki CBD on Nanyuki Meru Road</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:info@peakshotels.co.ke" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="h-4 w-4" />
                info@peakshotels.co.ke
              </a>
              <a href="tel:0711969690" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="h-4 w-4" />
                0711969690 | 0782426689
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:text-accent transition-colors">
                    <span>{selectedLanguage.flag}</span>
                    <span>{selectedLanguage.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className="flex items-center gap-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span>Mon - Sun: 24/7</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Navbar */}
      <nav className="fixed top-9 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div
              className="relative h-32 pt-4 mt-6"
              style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
            >
              {logoError ? (
                <div className="h-32 w-32 bg-accent/10 flex items-center justify-center rounded-lg">
                  <span className="text-accent font-bold text-lg">PH</span>
                </div>
              ) : (
                <img 
                  src={logo} 
                  alt="Peaks Hotel" 
                  className={`h-32 w-auto object-cover transition-opacity duration-300 ${logoLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setLogoLoading(false)}
                  onError={() => {
                    setLogoError(true);
                    setLogoLoading(false);
                  }}
                  loading="eager"
                  decoding="async"
                  width="128"
                  height="128"
                />
              )}
              {logoLoading && !logoError && (
                <div className="absolute inset-0 bg-accent/5 animate-pulse rounded-lg" />
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => renderNavItem(item, index))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 text-base font-semibold transition-colors hover:bg-secondary rounded-md ${
                      location.pathname === item.path
                        ? "text-accent bg-secondary"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="px-4 pt-4">
                  <Button variant="gold" size="lg" className="w-full" asChild>
                    <Link to="/booking">Book Now</Link>
                  </Button>
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
