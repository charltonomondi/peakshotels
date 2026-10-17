/**
 * Peaks Hotel Navbar
 * Implements the premium brown-pill + floating SVG logo badge design.
 * Wired to React Router (Link/useLocation) and existing app hooks.
 */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLoyaltyAuth } from "@/lib/loyaltyAuth";
import { useStaffAuth } from "@/lib/staffAuth";
import { openLipaModal } from "@/components/LipaMdogoMdogoPopup";
import "./PeaksNavbar.css";

// ── Nav structure ──────────────────────────────────────────────────────────────
interface SubLink { label: string; to: string; }
interface NavItem  { label: string; to: string; children?: SubLink[]; }

const NAV_ITEMS: NavItem[] = [
  { label: "Home",               to: "/" },
  { label: "Accommodation",      to: "/rooms",
    children: [
      { label: "Rooms & Suites", to: "/rooms" },
      { label: "Room Features",  to: "/room-features/101" },
    ],
  },
  { label: "Restaurant & Dining", to: "/restaurant" },
  { label: "Conference",          to: "/facilities" },
  { label: "Outdoor Activities",  to: "/activities" },
  { label: "Mt. Kenya Climbing",  to: "/mountain-climbing" },
  { label: "Wellness Centre", to: "/gym",
    children: [
      { label: "Gym",            to: "/gym" },
      { label: "Swimming Pool",  to: "/swimming" },
      { label: "Steam Bath",     to: "/steam-bath" },
      { label: "Sauna",          to: "/sauna" },
      { label: "Massage",        to: "/massage" },
      { label: "Beauty Parlour", to: "/beauty-parlour" },
      { label: "Spa",            to: "/spa" },
    ],
  },
  { label: "More", to: "#",
    children: [
      { label: "News & Updates", to: "/news" },
      { label: "Careers",        to: "/careers" },
      { label: "Gallery",        to: "/gallery" },
      { label: "Contact",        to: "/contact" },
      { label: "About Us",       to: "/about" },
    ],
  },
];

const LANGUAGES = ["EN", "SW", "FR", "DE", "ES", "ZH"];

// ── Icon components ────────────────────────────────────────────────────────────
const Chevron = () => (
  <svg className="pn-chevron" viewBox="0 0 10 6" aria-hidden="true">
    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.5" y="4" width="19" height="17.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2.5 9.5h19" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7.5 2v4M16.5 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <g fill="currentColor">
      <circle cx="7.5" cy="13" r="1.1" /><circle cx="12" cy="13" r="1.1" /><circle cx="16.5" cy="13" r="1.1" />
      <circle cx="7.5" cy="17.2" r="1.1" /><circle cx="12" cy="17.2" r="1.1" /><circle cx="16.5" cy="17.2" r="1.1" />
    </g>
  </svg>
);

const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.8l1.4-6.8L2.2 9.3l6.9-.8z"
      fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

const UserCircleIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="currentColor" />
    <circle cx="12" cy="9.4" r="3.4" fill="#5b2e16" />
    <path d="M5.6 18.6c1.2-3 3.5-4.3 6.4-4.3s5.2 1.3 6.4 4.3c-1.6 1.7-3.9 2.7-6.4 2.7s-4.8-1-6.4-2.7z" fill="#5b2e16" />
  </svg>
);

const UKFlag = () => (
  <svg className="pn-flag" viewBox="0 0 60 36" aria-hidden="true">
    <clipPath id="pn-flag-clip"><rect width="60" height="36" rx="3" /></clipPath>
    <g clipPath="url(#pn-flag-clip)">
      <rect width="60" height="36" fill="#1f3a93" />
      <path d="M0 0l60 36M60 0L0 36" stroke="#fff" strokeWidth="7.2" />
      <path d="M0 0l60 36M60 0L0 36" stroke="#d6283b" strokeWidth="2.4" />
      <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0v36M0 18h60" stroke="#d6283b" strokeWidth="7" />
    </g>
  </svg>
);

// ── Logo Badge using real logo image ──────────────────────────────────────────
import logoImg from "/logo.jpeg";

const LogoBadge = () => (
  <svg className="pn-badge" viewBox="0 0 500 208" role="img" aria-label="Peaks Hotels Ltd">
    <defs>
      <linearGradient id="pn-gold-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0be62" />
        <stop offset="55%" stopColor="#c58a3a" />
        <stop offset="100%" stopColor="#8f5a22" />
      </linearGradient>
      {/* Clip the logo image to the badge body shape */}
      <clipPath id="pn-logo-clip">
        <path d="M80 4Q84 1 94 1H366Q376 1 384 9L506 146L440 200Q432 207 420 207H100Q90 207 84 200L0 134V130Z" />
      </clipPath>
    </defs>

    {/* Olive sliver behind badge, left edge */}
    <path d="M0 33H56Q74 33 82 28L0 134Z" fill="#7b6b2b" />

    {/* Grey underside shadow */}
    <path d="M508 150L442 204Q434 210 422 211H300" fill="none" stroke="#cfcfcf"
      strokeWidth="6" strokeLinecap="round" opacity="0.8" />

    {/* Gold bevel on slanted right edge */}
    <path d="M372 0Q384 0 392 8L510 146" fill="none" stroke="url(#pn-gold-edge)"
      strokeWidth="10" strokeLinecap="round" />

    {/* Cream badge body */}
    <path d="M80 4Q84 1 94 1H366Q376 1 384 9L506 146L440 200Q432 207 420 207H100Q90 207 84 200L0 134V130Z"
      fill="#fdf6ea" />

    {/* Real logo image, clipped to badge shape and padded */}
    <image
      href={logoImg}
      x="72"
      y="8"
      width="310"
      height="192"
      preserveAspectRatio="xMidYMid meet"
      clipPath="url(#pn-logo-clip)"
    />

    {/* Gold border outline over the badge edge for definition */}
    <path d="M80 4Q84 1 94 1H366Q376 1 384 9L506 146L440 200Q432 207 420 207H100Q90 207 84 200L0 134V130Z"
      fill="none" stroke="url(#pn-gold-edge)" strokeWidth="2.5" />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────────
const Navbar = () => {
  const location = useLocation();
  const { member } = useLoyaltyAuth();
  const { staff } = useStaffAuth();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [language, setLanguage] = useState("EN");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <header className="pn-root">
        {/* ── Brown pill bar ────────────────────────────────────────────── */}
        <div className="pn-bar">

          {/* Utility row: language + divider + hours */}
          <div className="pn-utility">
            {/* Language picker */}
            <div
              className="pn-lang"
              onMouseEnter={() => setOpenMenu("lang")}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button type="button" className="pn-lang-btn"
                aria-haspopup="listbox" aria-expanded={openMenu === "lang"}
                onClick={() => setOpenMenu(openMenu === "lang" ? null : "lang")}
              >
                <UKFlag />
                <span>{language}</span>
                <Chevron />
              </button>
              {openMenu === "lang" && (
                <ul className="pn-dropdown pn-dropdown--lang" role="listbox">
                  {LANGUAGES.map(l => (
                    <li key={l}>
                      <button type="button" role="option" aria-selected={l === language}
                        onClick={() => { setLanguage(l); setOpenMenu(null); }}>
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <span className="pn-divider" aria-hidden="true" />

            <div className="pn-hours">
              <CalendarIcon className="pn-hours-icon" />
              <span>Mon – Sun, 24/7</span>
            </div>
          </div>

          {/* Main nav row */}
          <nav className="pn-main" aria-label="Primary">
            <ul className="pn-links">
              {NAV_ITEMS.map(item => {
                const active = isActive(item.to) && item.to !== "#";
                const hasChildren = !!item.children;
                return (
                  <li key={item.label} className="pn-li"
                    onMouseEnter={() => hasChildren && setOpenMenu(item.label)}
                    onMouseLeave={() => hasChildren && setOpenMenu(null)}
                  >
                    {hasChildren ? (
                      <button type="button" className={`pn-link${active ? " pn-link--active" : ""}`}
                        aria-haspopup="menu" aria-expanded={openMenu === item.label}
                        onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}>
                        {item.label}<Chevron />
                      </button>
                    ) : (
                      <Link to={item.to} className={`pn-link${active ? " pn-link--active" : ""}`}
                        aria-current={active ? "page" : undefined}>
                        {item.label}
                      </Link>
                    )}
                    {hasChildren && openMenu === item.label && (
                      <ul className="pn-dropdown" role="menu">
                        {item.children!.map(c => (
                          <li key={c.label} role="none">
                            <Link to={c.to} role="menuitem"
                              onClick={() => setOpenMenu(null)}>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Action buttons */}
            <div className="pn-actions">
              <button type="button" className="pn-btn pn-btn--cream"
                onClick={() => openLipaModal?.()}>
                <CalendarIcon className="pn-btn-icon" />
                Payment Plan
              </button>

              <Link to={member ? "/loyalty/dashboard" : "/loyalty/signup"}
                className="pn-btn pn-btn--cream" style={{ textDecoration: "none" }}>
                <StarIcon className="pn-btn-icon" />
                {member ? `${member.points.toLocaleString()} pts` : "Loyalty"}
              </Link>

              <Link to="/booking" className="pn-btn pn-btn--gold" style={{ textDecoration: "none" }}>
                <CalendarIcon className="pn-btn-icon" />
                Book Now
              </Link>

              <Link
                to={staff?.status === "active" ? "/staff/dashboard" : "/staff/login"}
                className="pn-btn pn-btn--outline"
                style={{ textDecoration: "none" }}
              >
                <UserCircleIcon className="pn-btn-icon" />
                {staff?.status === "active" ? "Dashboard" : "Staff Login"}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button className="pn-hamburger" aria-label="Toggle menu"
              onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen
                ? <X style={{ width: "24px", height: "24px" }} />
                : <Menu style={{ width: "24px", height: "24px" }} />}
            </button>
          </nav>
        </div>

        {/* Floating logo badge — sits over both bar and hero */}
        <Link to="/" aria-label="Peaks Hotel — Home">
          <LogoBadge />
        </Link>

        {/* Mobile menu */}
        <div className={`pn-mobile-menu${mobileOpen ? " pn-mobile-menu--open" : ""}`}>
          {NAV_ITEMS.map(item => (
            <div key={item.label}>
              {item.to !== "#" && !item.children ? (
                <Link to={item.to} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              ) : (
                <>
                  <button onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}>
                    {item.label} {item.children && <Chevron />}
                  </button>
                  {item.children && openMenu === item.label && (
                    <div style={{ paddingLeft: "16px" }}>
                      {item.children.map(c => (
                        <Link key={c.label} to={c.to} onClick={() => { setMobileOpen(false); setOpenMenu(null); }}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,243,224,0.2)" }}>
            <button onClick={() => { openLipaModal?.(); setMobileOpen(false); }} className="pn-btn pn-btn--cream" style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}>
              <CalendarIcon className="pn-btn-icon" /> Payment Plan
            </button>
            <Link to="/booking" className="pn-btn pn-btn--gold" style={{ width: "100%", justifyContent: "center", textDecoration: "none", display: "flex" }}
              onClick={() => setMobileOpen(false)}>
              <CalendarIcon className="pn-btn-icon" /> Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer so content starts below navbar */}
      <div className="pn-spacer" />
    </>
  );
};

export default Navbar;
