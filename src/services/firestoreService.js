import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { db, functions, firebaseConfig } from '../firebase/config';

export const collections = {
  users: 'users',
  clients: 'clients',
  leads: 'leads',
  projects: 'projects',
  analytics: 'analytics',
  formSubmissions: 'formSubmissions',
  newsletterSignups: 'newsletterSignups',
  supportRequests: 'supportRequests',
  notifications: 'notifications',
  payments: 'payments',
  documents: 'documents',
};

export const LEAD_STATUSES = ['New Lead', 'Contacted', 'Discovery Scheduled', 'Proposal Sent', 'Won', 'Lost', 'Archived'];

function requireFirestore() {
  if (!db) {
    throw new Error('Firebase is not configured. Copy .env.example to .env and add your Firebase web app config.');
  }
}

function requireFunctions() {
  if (!functions) {
    throw new Error('Firebase is not configured. Add your Firebase config before calling Cloud Functions.');
  }
}

export function listenToCollection(collectionName, callback, constraints = []) {
  requireFirestore();
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function listenToClientScoped(collectionName, clientId, callback) {
  return listenToCollection(collectionName, callback, [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ]);
}

export function listenToClients(callback) {
  return listenToCollection(collections.clients, callback, [orderBy('createdAt', 'desc')]);
}

export function listenToNotifications(callback) {
  return listenToCollection(collections.notifications, callback, [orderBy('createdAt', 'desc')]);
}

export async function getClient(clientId) {
  requireFirestore();
  const snapshot = await getDoc(doc(db, collections.clients, clientId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateClient(clientId, data) {
  requireFirestore();
  const { id, ...clientData } = data;
  await updateDoc(doc(db, collections.clients, clientId), {
    ...clientData,
    updatedAt: serverTimestamp(),
  });

  const paymentKeys = ['paymentStatus', 'monthlyMaintenanceAmount', 'subscriptionEnabled', 'stripeCustomerId', 'stripeSubscriptionId', 'billingPortalUrl'];
  const hasPaymentUpdate = paymentKeys.some((key) => Object.prototype.hasOwnProperty.call(clientData, key));

  if (!hasPaymentUpdate) return null;

  const paymentPayload = {};
  for (const key of paymentKeys) {
    if (Object.prototype.hasOwnProperty.call(clientData, key)) {
      paymentPayload[key] = key === 'monthlyMaintenanceAmount' ? Number(clientData[key] || 95) : clientData[key] || '';
    }
  }

  if (Object.prototype.hasOwnProperty.call(clientData, 'subscriptionEnabled')) {
    paymentPayload.subscriptionEnabled = Boolean(clientData.subscriptionEnabled);
  }

  return upsertPayment(clientId, paymentPayload);
}

// Creates a Firebase Auth user via a secondary app instance (no Cloud Functions needed).
// The secondary app signs in as the new user then immediately signs out,
// leaving the admin session completely untouched.
function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === 'client-creator');
  const app = existing || initializeApp(firebaseConfig, 'client-creator');
  return getAuth(app);
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createClientWithPortalLogin(payload) {
  requireFirestore();

  const {
    portalLoginEmail,
    temporaryPassword,
    monthlyMaintenanceAmount,
    buildPrice,
    subscriptionEnabled,
    ...rest
  } = payload;

  const email = (portalLoginEmail || rest.email || '').toLowerCase().trim();
  if (!email) throw new Error('Portal login email is required.');
  if (!rest.businessName?.trim()) throw new Error('Business name is required.');
  if (!rest.contactName?.trim()) throw new Error('Contact name is required.');

  const password = temporaryPassword?.trim() || generatePassword();

  // Create the Firebase Auth user via secondary app — does NOT log out the admin
  const secondaryAuth = getSecondaryAuth();
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error(`A portal login for ${email} already exists. Use a different email or reset their password.`);
    }
    throw new Error(`Could not create login: ${err.message}`);
  } finally {
    await signOut(secondaryAuth).catch(() => {});
  }

  const uid = userCredential.user.uid;
  const now = serverTimestamp();
  const clientRef = doc(collection(db, collections.clients));

  const client = {
    ...rest,
    portalLoginEmail: email,
    monthlyMaintenanceAmount: Number(monthlyMaintenanceAmount) || 95,
    buildPrice: Number(buildPrice) || 0,
    subscriptionEnabled: Boolean(subscriptionEnabled),
    authUid: uid,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);

  batch.set(clientRef, client);

  batch.set(doc(db, collections.users, uid), {
    role: 'client',
    clientId: clientRef.id,
    email,
    businessName: client.businessName,
    contactName: client.contactName,
    createdAt: now,
  });

  batch.set(doc(db, collections.payments, clientRef.id), {
    clientId: clientRef.id,
    paymentStatus: client.paymentStatus || 'Not started',
    monthlyMaintenanceAmount: client.monthlyMaintenanceAmount,
    subscriptionEnabled: client.subscriptionEnabled,
    stripeCustomerId: client.stripeCustomerId || '',
    stripeSubscriptionId: client.stripeSubscriptionId || '',
    billingPortalUrl: client.billingPortalUrl || '',
    updatedAt: now,
  });

  batch.set(doc(collection(db, collections.notifications)), {
    title: 'New client created',
    message: client.businessName,
    clientId: clientRef.id,
    read: false,
    createdAt: now,
  });

  try {
    await batch.commit();
  } catch (err) {
    // Firestore write failed — clean up the auth user so we don't leave orphans
    const { getAuth: getAdminAuth } = await import('firebase/auth');
    // We can't delete the user client-side (requires admin SDK), but flag it clearly
    throw new Error(`Client data failed to save: ${err.message}. Auth user created for ${email} — delete it manually in Firebase Console if needed.`);
  }

  return { clientId: clientRef.id, uid, temporaryPassword: password };
}

// Requires Firebase Cloud Functions (Blaze plan). Creates Firebase Auth user for portal login.
export async function createPortalLogin(payload) {
  requireFunctions();
  const callable = httpsCallable(functions, 'createClientWithUser');
  return callable(payload);
}

export async function archiveClient(clientId) {
  return updateClient(clientId, { status: 'Archived', websiteStatus: 'Archived', archived: true });
}

export async function deleteClient(clientId) {
  requireFirestore();

  const clientSnap = await getDoc(doc(db, collections.clients, clientId));
  if (!clientSnap.exists()) throw new Error('Client not found.');

  const client = clientSnap.data();
  const now = serverTimestamp();
  const batch = writeBatch(db);

  batch.delete(doc(db, collections.clients, clientId));
  batch.delete(doc(db, collections.payments, clientId));

  if (client.authUid) {
    batch.delete(doc(db, collections.users, client.authUid));
  }

  batch.set(doc(collection(db, collections.notifications)), {
    title: 'Client deleted',
    message: client.businessName || clientId,
    clientId,
    read: false,
    createdAt: now,
  });

  await batch.commit();

  // Auth user is blocked (no Firestore profile) but not hard-deleted.
  // To fully remove it: Firebase Console → Authentication → find the email → delete.
  return { clientId, deleted: true };
}

export async function createClientWithUser(payload) {
  requireFunctions();
  const callable = httpsCallable(functions, 'createClientWithUser');
  return callable(payload);
}

// Direct Firestore write — no Cloud Functions required.
// Creates the client record and payments doc in a single batch.
// Portal login (Firebase Auth user) is created separately via createClientWithUser.
export async function createClientDirect(payload) {
  requireFirestore();
  const {
    temporaryPassword: _pw,
    portalLoginEmail,
    monthlyMaintenanceAmount,
    buildPrice,
    subscriptionEnabled,
    ...rest
  } = payload;

  const now = serverTimestamp();
  const clientRef = doc(collection(db, collections.clients));

  const client = {
    ...rest,
    portalLoginEmail: portalLoginEmail || rest.email || '',
    monthlyMaintenanceAmount: Number(monthlyMaintenanceAmount) || 95,
    buildPrice: Number(buildPrice) || 0,
    subscriptionEnabled: Boolean(subscriptionEnabled),
    authUid: '',
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(clientRef, client);
  batch.set(doc(db, collections.payments, clientRef.id), {
    clientId: clientRef.id,
    paymentStatus: client.paymentStatus || 'Not started',
    monthlyMaintenanceAmount: client.monthlyMaintenanceAmount,
    subscriptionEnabled: client.subscriptionEnabled,
    stripeCustomerId: client.stripeCustomerId || '',
    stripeSubscriptionId: client.stripeSubscriptionId || '',
    billingPortalUrl: client.billingPortalUrl || '',
    updatedAt: now,
  });
  batch.set(doc(collection(db, collections.notifications)), {
    title: 'Client created',
    message: client.businessName || '',
    clientId: clientRef.id,
    read: false,
    createdAt: now,
  });
  await batch.commit();

  return { data: { clientId: clientRef.id, temporaryPassword: null } };
}

// ─── Leads ────────────────────────────────────────────────────
export function listenToLeads(callback) {
  return listenToCollection(collections.leads, callback, [orderBy('createdAt', 'desc')]);
}

export async function createLead(payload) {
  requireFirestore();
  return addDoc(collection(db, collections.leads), {
    ...payload,
    status: payload.status || 'New Lead',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateLead(leadId, data) {
  requireFirestore();
  const { id, ...rest } = data;
  return updateDoc(doc(db, collections.leads, leadId), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteLead(leadId) {
  requireFirestore();
  return deleteDoc(doc(db, collections.leads, leadId));
}

export async function convertLeadToClient(lead) {
  requireFunctions();
  const callable = httpsCallable(functions, 'createClientWithUser');
  const result = await callable({
    businessName: lead.businessName || lead.name,
    contactName: lead.contactName || lead.name,
    email: lead.email,
    phone: lead.phone || '',
    websiteUrl: lead.websiteUrl || '',
    planName: 'Website + Maintenance',
    monthlyMaintenanceAmount: 95,
    buildPrice: 300,
    websiteStatus: 'Discovery',
    notes: lead.notes || '',
  });
  await updateLead(lead.id, { status: 'Won', convertedToClientAt: serverTimestamp() });
  return result;
}

// ─── Projects ─────────────────────────────────────────────────
export function listenToProjects(clientId, callback) {
  return listenToCollection(collections.projects, callback, [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function createProject(payload) {
  requireFirestore();
  return addDoc(collection(db, collections.projects), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function updateProject(projectId, data) {
  requireFirestore();
  const { id, ...rest } = data;
  return updateDoc(doc(db, collections.projects, projectId), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteProject(projectId) {
  requireFirestore();
  return deleteDoc(doc(db, collections.projects, projectId));
}

// ─── Support requests ─────────────────────────────────────────
export async function updateSupportRequest(requestId, data) {
  requireFirestore();
  return updateDoc(doc(db, collections.supportRequests, requestId), { ...data, updatedAt: serverTimestamp() });
}

// ─── Form submissions ─────────────────────────────────────────
export async function updateFormSubmission(submissionId, data) {
  requireFirestore();
  return updateDoc(doc(db, collections.formSubmissions, submissionId), { ...data, updatedAt: serverTimestamp() });
}

export async function submitContactForm(payload) {
  requireFirestore();
  const submission = await addDoc(collection(db, collections.formSubmissions), {
    ...payload,
    type: 'contact',
    status: 'new',
    createdAt: serverTimestamp(),
  });
  await createNotification('New contact form', payload.businessName || payload.name || 'Website visitor', submission.id);
  return submission;
}

export async function submitNewsletterSignup(payload) {
  requireFirestore();
  const signup = await addDoc(collection(db, collections.newsletterSignups), {
    ...payload,
    source: payload.source || 'public-site',
    createdAt: serverTimestamp(),
  });
  await createNotification('New newsletter signup', payload.email, signup.id);
  return signup;
}

export async function submitSupportRequest(payload) {
  requireFirestore();
  const request = await addDoc(collection(db, collections.supportRequests), {
    ...payload,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  await createNotification('New support request', payload.subject || 'Client support', request.id, payload.clientId);
  return request;
}

export async function createNotification(title, message, sourceId, clientId = null) {
  requireFirestore();
  return addDoc(collection(db, collections.notifications), {
    title,
    message,
    sourceId,
    clientId,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// ─── Stripe ───────────────────────────────────────────────────
export async function createBillingPortalSession(returnUrl) {
  requireFunctions();
  const callable = httpsCallable(functions, 'createBillingPortalSession');
  return callable({ returnUrl });
}

export async function createCheckoutSession() {
  requireFunctions();
  const callable = httpsCallable(functions, 'createCheckoutSession');
  return callable({});
}

// ─── Documents / Resources ────────────────────────────────────
export function listenToDocuments(clientId, callback) {
  return listenToCollection(collections.documents, callback, [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ]);
}

export async function addDocument(payload) {
  requireFirestore();
  return addDoc(collection(db, collections.documents), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function deleteDocument(docId) {
  requireFirestore();
  return deleteDoc(doc(db, collections.documents, docId));
}

export async function upsertPayment(clientId, payload) {
  requireFirestore();
  return setDoc(
    doc(db, collections.payments, clientId),
    {
      clientId,
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
