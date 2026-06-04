const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

function createTemporaryPassword() {
  return `FWS-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString().slice(-4)}`;
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function assertAdmin(uid) {
  const user = await db.collection('users').doc(uid).get();
  if (!user.exists || user.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can create client accounts.');
  }
}

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

  const monthlyMaintenanceAmount = Math.max(Number(data.monthlyMaintenanceAmount || 95), 95);
  const buildPrice = Math.max(Number(data.buildPrice || 300), 0);
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
      websiteUrl: cleanString(data.websiteUrl),
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

    return {
      clientId: clientRef.id,
      uid: userRecord.uid,
      temporaryPassword,
    };
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
  if (!clientId) {
    throw new HttpsError('invalid-argument', 'Client ID is required.');
  }

  const clientRef = db.collection('clients').doc(clientId);
  const clientSnapshot = await clientRef.get();
  if (!clientSnapshot.exists) {
    throw new HttpsError('not-found', 'Client not found.');
  }

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
