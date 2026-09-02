import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useAppState } from '../../app/providers/AppState';

/* ── Site chrome ───────────────────────────────────────────────────────
   Transparent over the hero, resolving into a solid dark bar on scroll.
   Collapses to a sheet under 900px.                                   */

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/map', label: 'Map' },
  { to: '/wildlife', label: 'Wildlife' },
  { to: '/trails', label: 'Trails' },
  { to: '/stories', label: 'Stories' },
];

export function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 90);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  // Detail pages open below their own hero, so they start solid.
  const alwaysSolid = !['/', '/map'].includes(pathname);

  return (
    <header className={`nav${solid || alwaysSolid ? ' nav--solid' : ''}${open ? ' nav--open' : ''}`}>
      <div className="nav__inner">
        <Link to="/" className="brand" aria-label="SGNP — Into the Forest, home">
          <span className="brand__mark">SGNP</span>
          <span className="brand__sub">Into the Forest</span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav__link">{l.label}</NavLink>
          ))}
          {/* Shown only once the bar collapses, where the CTA is hidden */}
          <NavLink to="/plan" className="nav__link nav__link--cta">Plan your visit</NavLink>
        </nav>

        <div className="nav__right">
          <Link to="/search" className="nav__icon" aria-label="Search the guide">
            <Icon name="search" size={17} />
          </Link>
          <Link to="/journey" className="nav__icon" aria-label="My forest journey">
            <Icon name="user" size={17} />
          </Link>
          <Link to="/plan" className="btn btn--ghost btn--sm nav__cta" style={{ marginLeft: 4 }}>
            Plan your visit
          </Link>
          <button
            className="nav__icon nav__toggle"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'list'} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__inner">
          <div>
            <div className="brand" style={{ marginBottom: 18 }}>
              <span className="brand__mark" style={{ fontSize: 26 }}>SGNP</span>
              <span className="brand__sub">Into the Forest</span>
            </div>
            <p className="small" style={{ maxWidth: 300 }}>
              A quiet digital field guide to Sanjay Gandhi National Park — the forest inside Mumbai.
            </p>
            <p className="label" style={{ marginTop: 22 }}>Mumbai · India</p>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/explore">Places</Link></li>
              <li><Link to="/map">The map</Link></li>
              <li><Link to="/wildlife">Wildlife</Link></li>
              <li><Link to="/trails">Trails</Link></li>
              <li><Link to="/stories">Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4>Visit</h4>
            <ul>
              <li><Link to="/plan">Plan your visit</Link></li>
              <li><Link to="/experiences">Experiences</Link></li>
              <li><Link to="/journey">My journey</Link></li>
              <li><Link to="/safety">Safety</Link></li>
            </ul>
          </div>

          <div>
            <h4>About this guide</h4>
            <p className="small">
              Park information is not verified by this guide and no booking system is connected. Always check
              official park channels before travelling.
            </p>
            <ul style={{ marginTop: 18 }}>
              <li><Link to="/about">About &amp; sources</Link></li>
              <li><Link to="/safety">Accessibility &amp; safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <span>A design prototype. Not an official Sanjay Gandhi National Park website.</span>
          <span>19°12′ N · 72°54′ E</span>
        </div>
      </div>
    </footer>
  );
}
