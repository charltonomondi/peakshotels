import { Link } from "react-router-dom";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "/logo.jpeg";
import footerBg from "@/assets/footer.jpg";

const Footer = () => {
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);

  return (
    <footer className="relative bg-primary text-primary-foreground" style={{ backgroundImage: `url(${footerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-amber-900/80"></div>
      {/* Main Footer */}
      <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            {logoError ? (
              <div className="h-20 w-20 bg-background flex items-center justify-center rounded-lg p-2">
                <span className="text-accent font-bold text-xl">PH</span>
              </div>
            ) : (
              <img 
                src={logo} 
                alt="Peaks Hotel" 
                className={`h-20 w-auto bg-background rounded-lg p-2 transition-opacity duration-300 ${logoLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLogoLoading(false)}
                onError={() => {
                  setLogoError(true);
                  setLogoLoading(false);
                }}
                loading="lazy"
                decoding="async"
                width="80"
                height="80"
              />
            )}
            {logoLoading && !logoError && (
              <div className="h-20 w-20 bg-background rounded-lg p-2 animate-pulse" />
            )}
            {/* <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Experience unparalleled luxury at the foot of Mount Kenya. Peaks Hotel offers a perfect blend of African elegance and modern comfort.
            </p> */}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/peakshotels/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/peakshotels/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@peakshotelnanyuki" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/channel/UC-cEto_3d-O_v8Dr8gNFRaA" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            {/* Booking.com Review Badge */}
            <div>
              <script
                async
                src="https://badge.hotelstatic.com/embed.js"
                data-url="https://www.booking.com/hotel/ke/peaks-limited.html"
                data-size="120"
                data-position="inline"
                data-clickable="true"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "About Us", path: "/about" },
                { name: "Rooms & Suites", path: "/rooms" },
                { name: "Restaurant & Bar", path: "/dining" },
                { name: "Facilities", path: "/facilities" },
                { name: "Gallery", path: "/gallery" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">
                  Nanyuki-Meru Highway,<br />
                  Nanyuki, Kenya
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a href="tel:+254700000000" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  +254 711 969 690
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a href="mailto:info@peakshotel.co.ke" className="text-primary-foreground/80 hover:text-accent transition-colors text-sm">
                  info@peakshotel.co.ke
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">
                  Reception: 24/7<br />
                  Check-in: 2:00 PM<br />
                  Check-out: 11:00 AM
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Newsletter</h4>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Subscribe to receive special offers and updates from Peaks Hotel.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/20 rounded-md text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-accent text-accent-foreground font-semibold rounded-md hover:bg-accent/90 transition-colors text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2024 Peaks Hotel. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
              <Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
