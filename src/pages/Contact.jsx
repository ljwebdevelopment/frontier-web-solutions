import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { submitContactForm } from '../services/firestoreService';

const initialState = {
  name: '',
  businessName: '',
  email: '',
  phone: '',
  websiteUrl: '',
  service: '',
  message: '',
};

const serviceOptions = [
  'New website build',
  'Website redesign',
  'Ongoing maintenance only',
  'SEO & analytics setup',
  'Custom web application',
  'Not sure — need advice',
];

export default function Contact() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Sending your request...');
    setIsError(false);
    try {
      await submitContactForm(form);
      setForm(initialState);
      setStatus('Your request has been sent. We\'ll follow up within one business day.');
    } catch (err) {
      setIsError(true);
      setStatus(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <section className="section" style={{ background: 'var(--soft)', paddingBottom: '56px' }}>
        <div className="section-inner">
          <div className="section-label">Contact</div>
          <div className="section-heading" style={{ marginBottom: 0 }}>
            <h1>Let's talk about your website</h1>
            <p>
              Tell us what you need and we'll follow up with a clear recommendation
              and transparent pricing — no pressure.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Layout ── */}
      <section className="section" style={{ paddingTop: '64px' }}>
        <div className="section-inner">
          <div className="contact-layout">
            {/* Left: Info */}
            <div className="contact-info">
              <h2>We'd love to hear from you</h2>
              <p>
                Whether you need a new site, a redesign, ongoing maintenance, or just want
                advice on what your web presence needs — reach out. There's no sales pitch,
                just a straightforward conversation.
              </p>
              <div className="contact-details">
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4>Email</h4>
                    <p>hello@frontierwebsystems.com</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4>Response Time</h4>
                    <p>Within 1 business day</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4>Existing Clients</h4>
                    <p>Log in to submit support requests via your client portal</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4>Service Area</h4>
                    <p>Serving businesses nationwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="contact-form-panel">
              <h3>Request a Consultation</h3>
              <p>Fill out the form below and we'll be in touch shortly.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-grid" style={{ marginBottom: '14px' }}>
                  <label>
                    Your Name
                    <input name="name" value={form.name} onChange={updateField} required placeholder="Jane Smith" />
                  </label>
                  <label>
                    Business Name
                    <input name="businessName" value={form.businessName} onChange={updateField} required placeholder="Acme Co." />
                  </label>
                  <label>
                    Email Address
                    <input type="email" name="email" value={form.email} onChange={updateField} required placeholder="jane@acmeco.com" />
                  </label>
                  <label>
                    Phone <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
                    <input name="phone" value={form.phone} onChange={updateField} placeholder="(555) 000-0000" />
                  </label>
                </div>
                <label style={{ marginBottom: '14px' }}>
                  Current Website URL <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(if applicable)</span>
                  <input name="websiteUrl" value={form.websiteUrl} onChange={updateField} placeholder="https://yoursite.com" />
                </label>
                <label style={{ marginBottom: '14px' }}>
                  What do you need help with?
                  <select name="service" value={form.service} onChange={updateField}>
                    <option value="">Select a service...</option>
                    {serviceOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label style={{ marginBottom: '20px' }}>
                  Project Notes
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={updateField}
                    required
                    placeholder="Tell us about your business and what you're looking to accomplish with your website..."
                  />
                </label>
                <button className="button primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Request
                </button>
                {status && (
                  <p style={{ marginTop: '12px' }} className={isError ? 'form-error' : 'form-status'}>
                    {status}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
