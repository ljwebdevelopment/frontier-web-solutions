# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend (root)
npm run dev          # Start Vite dev server
npm run build        # Production build → /dist
npm run preview      # Preview production build locally

# Backend (Cloud Functions)
cd functions && npm install   # Install function dependencies

# Seed
npm run seed:admin   # Create initial admin user (requires .env + service account)

# Firebase deployment (requires Firebase CLI)
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

There is no test suite or lint config in this project.

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase + Stripe values:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_STRIPE_PUBLISHABLE_KEY
```

Cloud Functions use `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set via `firebase functions:config:set` or Firebase secrets, not the `.env` file.

## Architecture

This is a **React + Firebase SaaS** app for a web agency to manage clients and offer a client portal. It has two distinct user-facing surfaces:

- **Public marketing site** (`/`, `/services`, `/pricing`, `/contact`) and login
- **Admin workspace** (`/admin/*`) — the agency owner manages clients, leads, forms, and settings
- **Client portal** (`/portal/*`) — clients view their analytics, billing, support, documents

### Frontend (`/src`)

**Routing & Auth** — `AuthContext` wraps the app and maintains the current user + their Firestore profile. `ProtectedRoute` enforces roles (`admin` vs `client`). Route structure lives in `main.jsx`.

**Layouts** — `PublicLayout` and `DashboardLayout` share nav/shell between page components. All pages are under `src/pages/{public,admin,portal}/`.

**Data layer** — `src/services/firestoreService.js` is the single abstraction over all Firestore reads/writes. Pages call these helpers; they do **not** call the Firebase SDK directly. Real-time pages use `onSnapshot` listeners cleaned up in `useEffect` return functions.

**Styling** — A single `src/styles/global.css` (1 400+ lines) using CSS custom properties as design tokens. There are no CSS modules or component-scoped styles. Follow BEM-style class naming already in use (e.g., `.stat-card`, `.workspace-section`, `.public-header`).

### Backend (`/functions/index.js`)

All Cloud Functions are in a single file. Key functions:

| Function | Purpose |
|---|---|
| `createClientWithUser` | Creates Firebase Auth user + Firestore client doc atomically using a secondary Firebase app so the admin is not logged out |
| `deleteClientAccount` | Removes client Auth user + Firestore data |
| `createCheckoutSession` | Starts a Stripe checkout for a subscription |
| `createBillingPortalSession` | Opens Stripe billing portal for a client |
| `stripeWebhook` | Processes Stripe events (`checkout.session.completed`, subscription updates) |

### Firestore Schema

Collections and their purpose:

| Collection | Description |
|---|---|
| `users` | Auth profile + role (`admin`/`client`) |
| `clients` | Client business info, website status, billing metadata |
| `leads` | Sales pipeline — statuses: `New Lead → Contacted → Proposal Sent → Won/Lost/Archived` |
| `projects` | Website projects linked to a client |
| `analytics` | Client analytics data shown in portal |
| `formSubmissions` | Submissions from client websites |
| `newsletterSignups` | Public newsletter subscribers |
| `supportRequests` | Client support tickets |
| `notifications` | Activity log entries |
| `payments` | Stripe payment metadata keyed by `clientId` |
| `documents` | Files accessible to clients in their portal |

Security rules in `firestore.rules` enforce that admins can read/write everything while clients can only access their own documents (matched by `userId`/`clientId`).

### Client Creation

Creating a client is a two-step atomic operation handled by the `createClientWithUser` Cloud Function. It uses a **secondary Firebase app instance** (`firebase.initializeApp(config, 'secondary')`) to call `createUserWithEmailAndPassword` without displacing the currently signed-in admin. Auto-generated passwords follow the format `FWS-{random}-{timestamp}`.

### Stripe Integration

Stripe is subscription-based (monthly maintenance plans). The `clientId` Firestore document stores `stripeCustomerId` and `stripeSubscriptionId`. The webhook at `/stripeWebhook` updates subscription status in Firestore when Stripe events fire.

### CI/CD

`.github/workflows/deploy.yml` runs on pushes to `master`: builds the Vite app with Firebase env vars injected from GitHub Actions secrets, then deploys to GitHub Pages (`/dist` → `gh-pages` branch). Firebase rules and functions are **not** deployed by CI — those require manual `firebase deploy` commands.
