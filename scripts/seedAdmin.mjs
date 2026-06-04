import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../functions/package.json', import.meta.url));
const admin = require('firebase-admin');

const uid = process.argv[2];
const email = process.argv[3];

if (!uid || !email) {
  console.error('Usage: npm run seed:admin -- <firebase-auth-uid> <admin-email>');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

await admin.firestore().collection('users').doc(uid).set(
  {
    role: 'admin',
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);

console.log(`Admin seeded for ${email} (${uid})`);
