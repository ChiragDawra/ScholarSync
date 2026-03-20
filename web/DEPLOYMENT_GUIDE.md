# ScholarSync Web — Deployment Guide

> Deploy the Vite + React + TypeScript web app with Firebase backend.

---

## Prerequisites

| Requirement | Version |
|---|---|
| **Node.js** | ≥ 18.0.0 |
| **npm** | ≥ 8 (ships with Node 18+) |
| **Firebase project** | Already created at `scholarsync-55b0c` |

---

## 1. Choose a Hosting Platform

Since this is a **static SPA** (Vite builds to `dist/`), you can deploy to any static host. Here are the best options:

| Platform | Free Tier | Custom Domain | Auto Deploy | Best For |
|---|---|---|---|---|
| **Vercel** | ✅ Generous | ✅ | ✅ Git push | Easiest setup |
| **Firebase Hosting** | ✅ 10 GB/month | ✅ | ✅ via CLI | You already use Firebase |
| **Netlify** | ✅ 100 GB/month | ✅ | ✅ Git push | Great DX |
| **Cloudflare Pages** | ✅ Unlimited | ✅ | ✅ Git push | Fastest CDN |

> [!IMPORTANT]
> The Vite dev server proxies `/api/claude` requests to the Anthropic API. **This proxy does NOT exist in production.** You'll need a serverless function or backend to handle Claude API calls in production — see [Section 5](#5-handle-the-anthropic-api-proxy-production).

---

## 2. Environment Variables

Create the following environment variables in your hosting provider's dashboard:

```env
# Firebase Configuration (required)
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=scholarsync-55b0c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scholarsync-55b0c
VITE_FIREBASE_STORAGE_BUCKET=scholarsync-55b0c.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>

# Anthropic Claude API (only needed if using serverless proxy)
VITE_ANTHROPIC_API_KEY=<your-anthropic-key>
```

> [!CAUTION]
> **Never expose `VITE_ANTHROPIC_API_KEY` in the client bundle.** The `VITE_` prefix makes it public. In production, move Claude API calls to a serverless function and use a non-prefixed env var (e.g. `ANTHROPIC_API_KEY`).

---

## 3. Deploy — Step by Step

### Option A: Vercel (Recommended)

**1. Install Vercel CLI (optional) or use the dashboard:**
```bash
npm i -g vercel
```

**2. Link your GitHub repo:**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your repository
- Set the **Root Directory** to `web`

**3. Configure build settings:**

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `cd .. && npm run build:web` |
| Output Directory | `dist` |
| Install Command | `cd .. && npm install` |

> [!NOTE]
> Because this is a monorepo with workspaces (`web` + `shared`), the install and build commands run from the **root** to resolve the `@shared` alias correctly.

**4. Set environment variables** in the Vercel dashboard (Settings → Environment Variables).

**5. Deploy:**
```bash
vercel --prod
```

Or just push to your `main` branch for auto-deploy.

---

### Option B: Firebase Hosting

**1. Install Firebase CLI:**
```bash
npm i -g firebase-tools
firebase login
```

**2. Initialize hosting (from the repo root):**
```bash
firebase init hosting
```
When prompted:
- **Public directory:** `web/dist`
- **Single-page app?** `Yes`
- **Set up GitHub deploys?** `Yes` (optional)

**3. Build the app:**
```bash
npm run build:web
```

**4. Deploy:**
```bash
firebase deploy --only hosting
```

**5. (Optional) Deploy Firestore rules too:**
```bash
firebase deploy --only firestore:rules
```

---

### Option C: Netlify

**1. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git.**

**2. Configure build settings:**

| Setting | Value |
|---|---|
| Base directory | _(leave empty — root)_ |
| Build command | `npm run build:web` |
| Publish directory | `web/dist` |

**3. Set environment variables** in Site Settings → Environment Variables.

**4. Add a `web/netlify.toml`** for SPA routing:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option D: Cloudflare Pages

**1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Connect to Git.**

**2. Configure:**

| Setting | Value |
|---|---|
| Build command | `npm run build:web` |
| Build output directory | `web/dist` |
| Root directory | _(leave empty)_ |

**3. Set environment variables** in the Pages project settings.

---

## 4. Firebase Console Setup

Before your deployed app works, ensure these Firebase settings are configured:

### A. Add Your Production Domain to Firebase Auth

1. Go to [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `scholarsync.vercel.app`, `your-domain.com`)

### B. Update Content Security Policy

In `web/index.html`, add your production domain to the `connect-src` directive if you add any new APIs:
```html
<meta http-equiv="Content-Security-Policy" content="... connect-src 'self' https://your-api-domain.com ...;" />
```

### C. Deploy Firestore Rules

If you haven't already, deploy the security rules from the repo root:
```bash
firebase deploy --only firestore:rules
```

---

## 5. Handle the Anthropic API Proxy (Production)

The Vite dev config proxies `/api/claude` → `https://api.anthropic.com/v1/messages`. This **only works locally**. For production, you have three options:

### Option 1: Vercel Serverless Function (Recommended with Vercel)

Create `web/api/claude.ts`:
```typescript
export default async function handler(req: Request) {
  const body = await req.json();
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!, // non-VITE_ prefix = server-only
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Option 2: Firebase Cloud Function

```bash
firebase init functions
```
Then create a function that proxies to the Anthropic API and call it via its HTTPS endpoint.

### Option 3: Netlify Function

Create `web/netlify/functions/claude.ts` with similar proxy logic to Option 1.

---

## 6. Build & Preview Locally

Test the production build before deploying:

```bash
# From the repo root
npm run build:web          # Build the app
cd web && npx vite preview # Preview at http://localhost:4173
```

---

## 7. CI/CD (Optional)

If you want GitHub Actions auto-deploy, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Web

on:
  push:
    branches: [main]
    paths:
      - 'web/**'
      - 'shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:web
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      # Add your deploy step here (Vercel CLI, Firebase CLI, etc.)
```

---

## Quick Reference

```bash
# Local development
npm run dev:web              # Start dev server (from root)

# Production build
npm run build:web            # Build to web/dist/

# Deploy (Firebase example)
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| **Blank page after deploy** | Add SPA redirects (all routes → `index.html`) |
| **Google Sign-In fails** | Add production domain to Firebase Auth → Authorized Domains |
| **`@shared` imports fail** | Ensure install runs from monorepo root, not `web/` |
| **Claude API 403 in production** | Dev proxy doesn't work in prod — set up a serverless function |
| **Build fails on TypeScript** | Run `npx tsc --noEmit` locally to check for type errors |
| **CSP blocks requests** | Update Content-Security-Policy in `index.html` |
