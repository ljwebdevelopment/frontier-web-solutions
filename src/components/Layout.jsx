import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import logo from '../assets/FWSlogo-black-wide.png';
import logoWhite from '../assets/FWSlogo-white-wide.png';
import { CONTACT_EMAIL } from '../config.js';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="site">
      <header className="header">
        <div className="header__inner">
          <Link to="/" className="header__brand">
            <img src={logo} alt="Frontier Web Systems" />
          </Link>
          <button
            className={`header__toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          <nav className={`header__nav${menuOpen ? ' is-open' : ''}`} aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/packages">Packages</NavLink>
            <NavLink to="/contact" className="button button--primary button--sm">Get a Quote</NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <img src={logoWhite} alt="Frontier Web Systems" />
            <p>Websites built and maintained for small businesses.</p>
          </div>
          <div className="footer__links">
            <Link to="/">Home</Link>
            <Link to="/packages">Packages</Link>
            <Link to="/contact">Contact</Link>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </div>
        <div className="footer__bottom">
          © {new Date().getFullYear()} Frontier Web Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
