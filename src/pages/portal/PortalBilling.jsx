import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getClient } from '../../services/firestoreService';

export default function PortalBilling() {
  const { profile } = useAuth();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (profile?.clientId) getClient(profile.clientId).then(setClient);
  }, [profile?.clientId]);

  return (
    <section className="workspace-section">
      <div className="workspace-card billing-card">
        <p className="eyebrow">Billing</p>
        <h2>Maintenance subscription status</h2>
        <div className="billing-grid">
          <div><span>Monthly maintenance</span><strong>${client?.monthlyMaintenanceAmount || 95}/month</strong></div>
          <div><span>Payment status</span><strong>{client?.paymentStatus || 'Not started'}</strong></div>
          <div><span>Automatic subscription</span><strong>{client?.subscriptionEnabled ? 'Enabled' : 'Not enabled'}</strong></div>
          <div><span>Billing due date</span><strong>{client?.billingDueDate || 'Not scheduled'}</strong></div>
        </div>
        <div className="stripe-placeholder">
          <h3>Stripe billing portal</h3>
          <p>Billing portal access will be available after Stripe subscriptions are connected.</p>
          <p>Customer ID: {client?.stripeCustomerId || 'Pending'}</p>
          <p>Subscription ID: {client?.stripeSubscriptionId || 'Pending'}</p>
        </div>
      </div>
    </section>
  );
}
