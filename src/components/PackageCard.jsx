import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUILD_FEE } from '../data/pricing.js';

export default function PackageCard({ pkg }) {
  return (
    <article className={`package${pkg.featured ? ' package--featured' : ''}`}>
      {pkg.featured && <div className="package__badge">Most Popular</div>}
      <h3 className="package__name">{pkg.name}</h3>
      <p className="package__best">{pkg.bestFor}</p>
      <div className="package__price">
        <span className="package__currency">$</span>{pkg.monthly}<span className="package__per">/mo</span>
      </div>
      <div className="package__build">+ ${BUILD_FEE} one-time build</div>
      <p className="package__tagline">{pkg.tagline}</p>
      <ul className="package__features">
        {pkg.features.map((f) => (
          <li key={f}><Check size={16} strokeWidth={3} /> {f}</li>
        ))}
      </ul>
      <Link
        to={`/contact?package=${pkg.id}`}
        className={`button ${pkg.featured ? 'button--primary' : 'button--ghost'} button--block`}
      >
        Start with {pkg.name} <ArrowRight size={16} />
      </Link>
    </article>
  );
}
