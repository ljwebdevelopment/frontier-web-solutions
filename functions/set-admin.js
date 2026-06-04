// Sets admin custom claim + creates Firestore user profile.
// Run from the functions/ directory:
//   node set-admin.js <UID> <email>
//
// Requires service-account.json in this folder (functions/).
// Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const uid = process.argv[2];
const email = process.argv[3];

if (!uid || !email) {
  console.error('Usage: node set-admin.js <UID> <email>');
  console.error('Example: node set-admin.js qlwhAJnFlBd2NLXIyw2Otm6qDvV2 lljohnson1201@gmail.com');
  process.exit(1);
}

const saPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(saPath)) {
  console.error('\nERROR: service-account.json not found in functions/');
  console.error('Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key');
  console.error('Save as: functions/service-account.json\n');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require('./service-account.json')),
});

async function run() {
  // 1. Set custom auth claim
  await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
  console.log('✓ Custom claim set (role: admin)');

  // 2. Create/update Firestore users/{uid} profile
  await admin.firestore().doc(`users/${uid}`).set({
    role: 'admin',
    email: email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✓ Firestore user profile created');

  console.log(`\n✓ Admin setup complete for ${email}`);
  console.log('  Sign out and back in at /login to access /admin\n');
}

run().catch((err) => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
