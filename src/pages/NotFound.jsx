import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-head page-head--full">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has moved. Try one of these instead:</p>
        <div className="hero__actions">
          <Link to="/" className="button button--primary">Back to Home</Link>
          <Link to="/packages" className="button button--ghost">See Website Packages</Link>
          <Link to="/contact" className="button button--ghost">Get a Free Quote</Link>
        </div>
      </div>
    </section>
  );
}
