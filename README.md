# Frontier Web Solutions

A React + Vite + Firebase business website, admin dashboard, and private client portal for Frontier Web Solutions.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd install` and `npm.cmd run dev`.

Fill `.env` with the Firebase web app config from Firebase Console.

## Firebase Setup

1. Create a Firebase project.
2. Enable Firebase Auth with Email/Password sign-in.
3. Create a Firestore database.
4. Install Firebase CLI if needed:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

5. Copy `.firebaserc.example` to `.firebaserc` and set your project ID.
6. Deploy rules and functions:

```bash
firebase deploy --only firestore:rules
cd functions && npm install && cd ..
firebase deploy --only functions
```

## First Admin User

Create the owner account once in Firebase Auth, then seed the matching Firestore role.

1. In Firebase Console, create an Email/Password user for the owner.
2. Copy the user UID.
3. Authenticate locally for Admin SDK credentials:

```bash
gcloud auth application-default login
```

4. Run:

```bash
npm run seed:admin -- <firebase-auth-uid> <admin-email>
```

The seed command uses the `firebase-admin` dependency installed in `functions`, so run `cd functions && npm install && cd ..` first.

After this, sign in at `/login`. Client accounts are created from `/admin/clients` through the secure Cloud Function.

## Routes

- `/` public homepage
- `/services`
- `/pricing`
- `/contact`
- `/login`
- `/admin`
- `/admin/clients`
- `/admin/clients/:clientId`
- `/portal`
- `/portal/forms`
- `/portal/support`
- `/portal/billing`

## Stripe Placeholders

Stripe is not integrated yet. Client and payment records include:

- Stripe customer ID
- Stripe subscription ID
- payment status
- billing portal URL
- automatic subscription toggle

Use Stripe Billing with Checkout Sessions in subscription mode and Stripe Customer Portal when payments are added.
