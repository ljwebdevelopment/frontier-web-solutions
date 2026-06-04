import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';

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
  requireFunctions();
  const callable = httpsCallable(functions, 'deleteClientAccount');
  return callable({ clientId });
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
