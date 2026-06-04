const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();

const db = admin.firestore();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new HttpsError('internal', 'Stripe is not configured on this server.');
  return Stripe(key);
}

function createTemporaryPassword() {
  return `FWS-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString().slice(-4)}`;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function assertAdmin(uid) {
  const user = await db.collection('users').doc(uid).get();
  if (!user.exists || user.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can perform this action.');
  }
}

// ─── Client Management ────────────────────────────────────────

exports.createClientWithUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in before creating clients.');
  }

  await assertAdmin(request.auth.uid);

  const data = request.data || {};
  const portalLoginEmail = cleanString(data.portalLoginEmail || data.email).toLowerCase();
  const businessName = cleanString(data.businessName);
  const contactName = cleanString(data.contactName);

  if (!businessName || !contactName || !portalLoginEmail) {
    throw new HttpsError('invalid-argument', 'Business name, contact name, and portal login email are required.');
  }

  const monthlyMaintenanceAmount = Math.max(Number(data.monthlyMaintenanceAmount || 95), 0);
  const buildPrice = Math.max(Number(data.buildPrice || 0), 0);
  const temporaryPassword = data.temporaryPassword || createTemporaryPassword();
  let userRecord;

  try {
    userRecord = await admin.auth().createUser({
      email: portalLoginEmail,
      password: temporaryPassword,
      displayName: `${contactName} - ${businessName}`,
      emailVerified: false,
    });

    const now = admin.firestore.FieldValue.serverTimestamp();
    const clientRef = db.collection('clients').doc();
    const client = {
      businessName,
      contactName,
      email: cleanString(data.email) || portalLoginEmail,
      phone: cleanString(data.phone),
      address: cleanString(data.address),
      industry: cleanString(data.industry),
      websiteUrl: cleanString(data.websiteUrl),
      domain: cleanString(data.domain),
      hostingProvider: cleanString(data.hostingProvider),
      planName: cleanString(data.planName) || 'Website + Maintenance',
      monthlyMaintenanceAmount,
      buildPrice,
      websiteStatus: cleanString(data.websiteStatus) || 'Discovery',
      launchDate: cleanString(data.launchDate),
      billingDueDate: cleanString(data.billingDueDate),
      subscriptionEnabled: Boolean(data.subscriptionEnabled),
      stripeCustomerId: cleanString(data.stripeCustomerId),
      stripeSubscriptionId: cleanString(data.stripeSubscriptionId),
      paymentStatus: cleanString(data.paymentStatus) || 'Not started',
      billingPortalUrl: cleanString(data.billingPortalUrl),
      notes: cleanString(data.notes),
      internalNotes: cleanString(data.internalNotes),
      servicesIncluded: cleanString(data.servicesIncluded),
      portalLoginEmail,
      authUid: userRecord.uid,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };

    const batch = db.batch();
    batch.set(clientRef, client);
    batch.set(db.collection('users').doc(userRecord.uid), {
      role: 'client',
      clientId: clientRef.id,
      email: portalLoginEmail,
      businessName,
      contactName,
      createdAt: now,
    });
    batch.set(db.collection('payments').doc(clientRef.id), {
      clientId: clientRef.id,
      paymentStatus: client.paymentStatus,
      monthlyMaintenanceAmount: client.monthlyMaintenanceAmount,
      subscriptionEnabled: client.subscriptionEnabled,
      stripeCustomerId: client.stripeCustomerId,
      stripeSubscriptionId: client.stripeSubscriptionId,
      billingPortalUrl: client.billingPortalUrl,
      updatedAt: now,
    });
    batch.set(db.collection('notifications').doc(), {
      title: 'Client created',
      message: businessName,
      clientId: clientRef.id,
      read: false,
      createdAt: now,
    });
    await batch.commit();

    return { clientId: clientRef.id, uid: userRecord.uid, temporaryPassword };
  } catch (error) {
    if (userRecord?.uid) {
      await admin.auth().deleteUser(userRecord.uid).catch(() => {});
    }
    throw error;
  }
});

exports.deleteClientAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in before deleting clients.');
  }

  await assertAdmin(request.auth.uid);

  const clientId = cleanString(request.data?.clientId);
  if (!clientId) throw new HttpsError('invalid-argument', 'Client ID is required.');

  const clientRef = db.collection('clients').doc(clientId);
  const clientSnapshot = await clientRef.get();
  if (!clientSnapshot.exists) throw new HttpsError('not-found', 'Client not found.');

  const client = clientSnapshot.data();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  batch.delete(clientRef);
  batch.delete(db.collection('payments').doc(clientId));
  if (client.authUid) {
    batch.delete(db.collection('users').doc(client.authUid));
  }
  batch.set(db.collection('notifications').doc(), {
    title: 'Client deleted',
    message: client.businessName || clientId,
    clientId,
    read: false,
    createdAt: now,
  });
  await batch.commit();

  if (client.authUid) {
    await admin.auth().deleteUser(client.authUid).catch(() => {});
  }

  return { clientId, deleted: true };
});

// ─── Stripe — Billing Portal ──────────────────────────────────

exports.createBillingPortalSession = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to access billing.');
  }

  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!userDoc.exists) throw new HttpsError('not-found', 'User profile not found.');

  const clientId = userDoc.data().clientId;
  if (!clientId) throw new HttpsError('not-found', 'No client account linked to this user.');

  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) throw new HttpsError('not-found', 'Client record not found.');

  const client = clientDoc.data();
  if (!client.stripeCustomerId) {
    throw new HttpsError(
      'failed-precondition',
      'No Stripe billing account found. Contact Frontier Web Systems to set up your subscription.'
    );
  }

  const stripe = getStripe();
  const returnUrl = cleanString(request.data?.returnUrl) || 'https://frontierwebsystems.com/portal/billing';

  const session = await stripe.billingPortal.sessions.create({
    customer: client.stripeCustomerId,
    return_url: returnUrl,
  });

  return { url: session.url };
});

// ─── Stripe — Checkout Session ────────────────────────────────

exports.createCheckoutSession = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  const clientId = userDoc.data()?.clientId;
  if (!clientId) throw new HttpsError('not-found', 'No client account linked to this user.');

  const clientDoc = await db.collection('clients').doc(clientId).get();
  if (!clientDoc.exists) throw new HttpsError('not-found', 'Client not found.');

  const client = clientDoc.data();
  const stripe = getStripe();

  const amount = Math.round((client.monthlyMaintenanceAmount || 95) * 100);
  const successUrl = 'https://frontierwebsystems.com/portal/billing?success=true';
  const cancelUrl = 'https://frontierwebsystems.com/portal/billing';

  const sessionParams = {
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: client.planName || 'Website Maintenance',
          description: client.servicesIncluded || 'Monthly website maintenance and support',
        },
        unit_amount: amount,
        recurring: { interval: 'month' },
      },
      quantity: 1,
    }],
    metadata: { clientId },
    allow_promotion_codes: true,
  };

  if (client.stripeCustomerId) {
    sessionParams.customer = client.stripeCustomerId;
  } else {
    sessionParams.customer_email = client.email;
    sessionParams.customer_creation = 'always';
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url, sessionId: session.id };
});

// ─── Stripe — Webhook ─────────────────────────────────────────

exports.stripeWebhook = onRequest(async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).send('Webhook secret not configured.');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const now = admin.firestore.FieldValue.serverTimestamp();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clientId = session.metadata?.clientId;
        if (clientId && session.customer) {
          await db.collection('clients').doc(clientId).update({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription || '',
            subscriptionEnabled: true,
            paymentStatus: 'Active',
            updatedAt: now,
          });
          await db.collection('payments').doc(clientId).set({
            clientId,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription || '',
            subscriptionEnabled: true,
            paymentStatus: 'Active',
            updatedAt: now,
          }, { merge: true });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (!invoice.subscription) break;
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const nextDate = new Date(sub.current_period_end * 1000).toISOString().split('T')[0];
        const snap = await db.collection('clients')
          .where('stripeCustomerId', '==', invoice.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            paymentStatus: 'Active',
            billingDueDate: nextDate,
            updatedAt: now,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const snap = await db.collection('clients')
          .where('stripeCustomerId', '==', invoice.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({ paymentStatus: 'Overdue', updatedAt: now });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const snap = await db.collection('clients')
          .where('stripeCustomerId', '==', sub.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          const nextDate = new Date(sub.current_period_end * 1000).toISOString().split('T')[0];
          await snap.docs[0].ref.update({
            subscriptionEnabled: sub.status === 'active',
            paymentStatus: sub.status === 'active' ? 'Active' : sub.status === 'past_due' ? 'Overdue' : sub.status,
            billingDueDate: nextDate,
            stripeSubscriptionId: sub.id,
            updatedAt: now,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const snap = await db.collection('clients')
          .where('stripeCustomerId', '==', sub.customer)
          .limit(1)
          .get();
        if (!snap.empty) {
          await snap.docs[0].ref.update({
            subscriptionEnabled: false,
            stripeSubscriptionId: '',
            paymentStatus: 'Cancelled',
            updatedAt: now,
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err);
    return res.status(500).send('Internal error processing webhook.');
  }

  res.json({ received: true });
});
