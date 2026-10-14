import { useForm, ValidationError } from '@formspree/react';
import { CheckCircle2, Clock, Mail, MessageSquare, Rocket } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CONTACT_EMAIL, FORMSPREE_FORM_ID } from '../config.js';
import { addOns, packages } from '../data/pricing.js';

export default function Contact() {
  const [params] = useSearchParams();
  const initialPackage = packages.some((p) => p.id === params.get('package')) ? params.get('package') : '';
  const [state, submitToFormspree] = useForm(FORMSPREE_FORM_ID);

  // Turn the package id and add-on checkboxes into readable text for the email.
  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const chosen = packages.find((p) => p.id === data.get('package'));
    const packageLabel = chosen ? `${chosen.name} ($${chosen.monthly}/mo)` : 'Not sure yet';
    data.set('package', packageLabel);
    data.set('add-ons', data.getAll('add-ons').join(', ') || 'None');
    data.set('_subject', `New quote request from ${data.get('name')}: ${packageLabel}`);
    return submitToFormspree(data);
  }

  const formErrors = state.errors?.getFormErrors() ?? [];

  return (
    <>
      <section className="page-head">
        <div className="hero__glow" aria-hidden="true" />
        <div className="container page-head__inner">
          <p className="eyebrow">Free Quote</p>
          <h1>Let's build something <span className="gradient-text">great.</span></h1>
          <p>Tell us about your business and what you need. It takes two minutes, and there's no obligation.</p>
        </div>
      </section>

      <section className="section section--overlap">
        <div className="container contact">
          <aside className="contact__side">
            <h2>What happens next</h2>
            <ol>
              <li><MessageSquare size={20} /><div><strong>We read your message</strong><span>And get back to you within one business day.</span></div></li>
              <li><Clock size={20} /><div><strong>Quick call or email</strong><span>We learn about your business and recommend the right package.</span></div></li>
              <li><Rocket size={20} /><div><strong>We get to work</strong><span>Most sites launch in 2–4 weeks.</span></div></li>
            </ol>
            <p className="contact__email">
              <Mail size={16} /> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </aside>
          <div className="contact__main">
          {state.succeeded ? (
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
                  <ValidationError field="email" errors={state.errors} className="field__error" />
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
                    <option key={p.id} value={p.id}>{p.name}: ${p.monthly}/mo</option>
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
                <ValidationError field="message" errors={state.errors} className="field__error" />
              </label>

              {formErrors.length > 0 && (
                <p className="form__error">
                  {formErrors.map((err) => err.message).join(' ')} You can also email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              )}

              <button type="submit" className="button button--primary button--lg" disabled={state.submitting}>
                {state.submitting ? 'Sending…' : 'Get My Free Quote'}
              </button>
            </form>
          )}
          </div>
        </div>
      </section>
    </>
  );
}
