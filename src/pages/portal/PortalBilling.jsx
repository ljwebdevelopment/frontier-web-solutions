import { useEffect, useState } from 'react';
import { CheckCircle, CreditCard, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getClient,
} from '../../services/firestoreService';

const PAYMENT_STATUS_COLOR = {
  Active: 'active',
  Overdue: 'danger',
  Cancelled: 'inactive',
  'Not started': 'inactive',
  Pending: 'pending',
};

export default function PortalBilling() {
  const { profile } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  const success = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === 'true';

  useEffect(() => {
    if (!profile?.clientId) return;
    getClient(profile.clientId).then((c) => {
      setClient(c);
      setLoading(false);
    });
  }, [profile?.clientId]);

  async function handleBillingPortal() {
    setPortalLoading(true);
    setError('');
    try {
      const result = await createBillingPortalSession(window.location.href);
      window.location.href = result.data.url;
    } catch (err) {
      setError(err.message || 'Unable to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setError('');
    try {
      const result = await createCheckoutSession();
      window.location.href = result.data.url;
    } catch (err) {
      setError(err.message || 'Unable to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="workspace-section">
        <div className="screen-loader" style={{ minHeight: 'auto', padding: '60px 0' }}>Loading billing…</div>
      </section>
    );
  }

  const hasStripeCustomer = !!client?.stripeCustomerId;
  const hasActiveSubscription = client?.subscriptionEnabled && !!client?.stripeSubscriptionId;

  return (
    <section className="workspace-section">
      <div className="workspace-title-row" style={{ marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Account</p>
          <h2>Billing &amp; Subscription</h2>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={18} style={{ color: 'var(--green)', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Payment set up successfully!</p>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Your subscription is now active. Your billing status will update shortly.</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>

        {/* Left: Plan summary + Stripe actions */}
        <div style={{ display: 'grid', gap: 16 }}>

          {/* Current plan */}
          <div className="workspace-card" style={{ borderTop: '3px solid var(--red)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Current Plan</h3>
              <span className={`status-chip ${PAYMENT_STATUS_COLOR[client?.paymentStatus] || 'inactive'}`}>
                {client?.paymentStatus || 'Not started'}
              </span>
            </div>

            <div className="billing-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
              <div>
                <span>Plan</span>
                <strong style={{ fontSize: 14 }}>{client?.planName || 'Website + Maintenance'}</strong>
              </div>
              <div>
                <span>Monthly rate</span>
                <strong style={{ fontSize: 22, color: 'var(--ink)' }}>${client?.monthlyMaintenanceAmount ?? 95}<small style={{ fontSize: 13, fontWeight: 400 }}>/mo</small></strong>
              </div>
              <div>
                <span>Auto-billing</span>
                <strong>{hasActiveSubscription ? 'Enabled' : 'Not set up'}</strong>
              </div>
              <div>
                <span>Next billing date</span>
                <strong>{client?.billingDueDate || '—'}</strong>
              </div>
            </div>

            {client?.servicesIncluded && (
              <div style={{ padding: '12px 14px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--line)', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                {client.servicesIncluded}
              </div>
            )}

            {/* Stripe action buttons */}
            <div style={{ display: 'grid', gap: 10 }}>
              {hasStripeCustomer ? (
                <>
                  <button
                    className="button primary"
                    onClick={handleBillingPortal}
                    disabled={portalLoading}
                    style={{ justifyContent: 'center' }}
                  >
                    {portalLoading
                      ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Opening portal…</>
                      : <><CreditCard size={15} /> Manage Billing &amp; Invoices</>
                    }
                  </button>
                  {!hasActiveSubscription && (
                    <button
                      className="button ghost"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      style={{ justifyContent: 'center' }}
                    >
                      {checkoutLoading
                        ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Loading…</>
                        : <><Zap size={15} /> Set Up Automatic Payments</>
                      }
                    </button>
                  )}
                </>
              ) : (
                <div style={{ padding: '14px 16px', background: 'var(--soft)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Billing not yet activated</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                    Your billing account hasn't been set up yet. Contact Frontier Web Systems to get your subscription started.
                  </p>
                  <button
                    className="button primary sm"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    style={{ marginTop: 12 }}
                  >
                    {checkoutLoading
                      ? 'Loading…'
                      : <><Zap size={13} /> Set Up Subscription</>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* What's included */}
          <div className="workspace-card">
            <h3>What You're Getting</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                'Custom website built and live',
                'Monthly website maintenance',
                'Security and plugin updates',
                'Client portal access',
                'Form submission tracking',
                'Priority support requests',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Account details */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>

          {/* Payment method info */}
          <div className="workspace-card">
            <h3>Account Details</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Customer ID', value: client?.stripeCustomerId || 'Not assigned' },
                { label: 'Subscription ID', value: client?.stripeSubscriptionId || 'Not active' },
                { label: 'Payment Status', value: client?.paymentStatus || 'Not started' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--body)', wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                </div>
              ))}
            </div>

            {hasStripeCustomer && (
              <button
                className="button ghost sm"
                onClick={handleBillingPortal}
                disabled={portalLoading}
                style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
              >
                <ExternalLink size={13} />
                {portalLoading ? 'Opening…' : 'View Invoices & Payment History'}
              </button>
            )}
          </div>

          {/* Billing info note */}
          <div className="workspace-card" style={{ background: 'var(--soft)' }}>
            <h3>Need Help?</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>
              Questions about your plan, invoice, or payment method? We're here to help.
            </p>
            <a
              href="mailto:lukej@frontierwebsystems.com"
              className="button ghost sm"
              style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}
            >
              Contact Frontier Web Systems
            </a>
          </div>

          {/* Powered by Stripe */}
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <CreditCard size={12} /> Payments secured by Stripe
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
