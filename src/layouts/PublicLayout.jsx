import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import logo from '../assets/FWSlogo-black.png';
import logoWhite from '../assets/FWSlogo-white.png';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  function closeMenu() { setMenuOpen(false); }

  return (
    <div className="site-shell">
      <header className="public-header">
        <Link className="brand" to="/" onClick={closeMenu}>
          <img src={logo} alt="Frontier Web Systems" />
        </Link>

        <nav className={`public-nav${menuOpen ? ' open' : ''}`} aria-label="Primary navigation">
          <NavLink to="/services" onClick={closeMenu}>Services</NavLink>
          <NavLink to="/pricing" onClick={closeMenu}>Pricing</NavLink>
          <NavLink to="/contact" onClick={closeMenu} className="nav-cta">Get a Quote</NavLink>
          <NavLink to="/login" onClick={closeMenu} className="nav-login">Client Login</NavLink>
        </nav>

        <button
          className="nav-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
        </button>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <img src={logoWhite} alt="Frontier Web Systems" />
            <p>
              Professional websites, ongoing maintenance, and client systems for businesses
              that need a dependable digital presence.
            </p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Website Development</Link></li>
              <li><Link to="/services">Website Redesigns</Link></li>
              <li><Link to="/services">Ongoing Maintenance</Link></li>
              <li><Link to="/services">SEO &amp; Analytics</Link></li>
              <li><Link to="/services">Client Portal</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/login">Client Login</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Get Started</h4>
            <ul>
              <li><Link to="/contact">Request a Quote</Link></li>
              <li><Link to="/contact">Free Consultation</Link></li>
              <li><Link to="/pricing">View Pricing</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Frontier Web Systems. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/contact">Privacy Policy</Link>
            <Link to="/contact">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
