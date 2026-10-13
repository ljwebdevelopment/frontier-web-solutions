import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-head page-head--full">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="button button--primary">Back to Home</Link>
      </div>
    </section>
  );
}
