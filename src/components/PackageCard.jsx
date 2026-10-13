import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUILD_FEE } from '../data/pricing.js';

export default function PackageCard({ pkg }) {
  return (
    <article className={`package${pkg.featured ? ' package--featured' : ''}`}>
      {pkg.featured && <div className="package__badge">Most Popular</div>}
      <div className="package__level">{pkg.level}</div>
      <h3 className="package__name">{pkg.name}</h3>
      <div className="package__price">
        ${pkg.monthly}<span>/mo</span>
      </div>
      <div className="package__build">+ ${BUILD_FEE} one-time build</div>
      <p className="package__tagline">{pkg.tagline}</p>
      <ul className="package__features">
        {pkg.features.map((f) => (
          <li key={f}><Check size={16} /> {f}</li>
        ))}
      </ul>
      <Link
        to={`/contact?package=${pkg.id}`}
        className={`button ${pkg.featured ? 'button--primary' : 'button--outline'} button--block`}
      >
        Choose {pkg.name} <ArrowRight size={16} />
      </Link>
    </article>
  );
}
