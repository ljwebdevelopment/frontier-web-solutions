// Run once to set admin role on your owner account:
//   node scripts/set-admin.mjs lljohnson1201@gmail.com
//
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key,
// OR run `firebase login` and this will use your logged-in credentials automatically
// via `firebase-admin` application default credentials.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <email>');
  process.exit(1);
}

// Try to load service account from ./service-account.json if it exists,
// otherwise fall back to application default credentials (works if you ran `firebase login`).
let appConfig = {};
const saPath = resolve(process.cwd(), 'service-account.json');
try {
  const sa = JSON.parse(readFileSync(saPath, 'utf8'));
  appConfig = { credential: cert(sa) };
  console.log('Using service-account.json');
} catch {
  console.log('No service-account.json found — using application default credentials.');
  console.log('Make sure you ran: firebase login');
}

if (!getApps().length) initializeApp(appConfig);

const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { role: 'admin' });
  console.log(`\n✓ Admin claim set on: ${email}`);
  console.log(`  UID: ${user.uid}`);
  console.log('\nSign out and back in (or wait ~1 hour) for the claim to take effect.');
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`\n✗ No user found with email: ${email}`);
    console.error('  Create the user in Firebase Console → Authentication → Users first.');
  } else {
    console.error('\n✗ Error:', err.message);
  }
  process.exit(1);
}
