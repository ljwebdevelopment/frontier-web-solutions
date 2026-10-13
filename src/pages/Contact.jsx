import { CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CONTACT_EMAIL, FORMSPREE_FORM_ID } from '../config.js';
import { addOns, packages } from '../data/pricing.js';

export default function Contact() {
  const [params] = useSearchParams();
  const initialPackage = packages.some((p) => p.id === params.get('package')) ? params.get('package') : '';
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const chosen = packages.find((p) => p.id === data.get('package'));
    data.set('package', chosen ? `${chosen.name} (${chosen.level}, $${chosen.monthly}/mo)` : 'Not sure yet');
    data.set('add-ons', data.getAll('add-ons').join(', ') || 'None');

    if (!FORMSPREE_FORM_ID) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="container">
          <p className="eyebrow">Contact</p>
          <h1>Get a free quote</h1>
          <p>Tell us about your business and what you need. We'll get back to you within one business day.</p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container container--narrow">
          {status === 'sent' ? (
            <div className="notice notice--success">
              <CheckCircle2 size={28} />
              <div>
                <h2>Thanks, we got your message!</h2>
                <p>We'll be in touch soon.</p>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <div className="form__row">
                <label className="field">
                  <span>Name *</span>
                  <input name="name" required autoComplete="name" />
                </label>
                <label className="field">
                  <span>Business name</span>
                  <input name="business" autoComplete="organization" />
                </label>
              </div>
              <div className="form__row">
                <label className="field">
                  <span>Email *</span>
                  <input type="email" name="email" required autoComplete="email" />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input type="tel" name="phone" autoComplete="tel" />
                </label>
              </div>
              <label className="field">
                <span>Package</span>
                <select name="package" defaultValue={initialPackage}>
                  <option value="">Not sure yet</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.level}): ${p.monthly}/mo</option>
                  ))}
                </select>
              </label>
              <fieldset className="field">
                <span>Add-ons you're interested in</span>
                <div className="checks">
                  {addOns.map((a) => (
                    <label className="check" key={a.name}>
                      <input type="checkbox" name="add-ons" value={a.name} />
                      {a.name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                <span>Tell us about your project *</span>
                <textarea name="message" rows={5} required placeholder="What does your business do? Do you have a website now? Anything you'd like on the new one?" />
              </label>

              {status === 'error' && (
                <p className="form__error">
                  Something went wrong sending your message. Please email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              )}

              <button type="submit" className="button button--primary button--lg" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}

          <p className="contact-alt">
            <Mail size={16} /> Prefer email? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>
    </>
  );
}
