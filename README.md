# ParkPoint Enterprise Parking — Finalized Working Prototype v3

A standalone front-end working prototype for the Alraedah × Laysen Valley parking validation concept.

## Run locally on macOS

From Terminal:

```bash
cd ~/Downloads/ParkPoint_Enterprise_Prototype_v2
python3 -m http.server 8080
```

Then open:

```bash
open http://localhost:8080
```

Or run:

```bash
chmod +x run.command
./run.command
```

## Functional prototype features

### Company Admin
- Corporate wallet
- Employee analytics
- Employee directory
- Reception permission controls
- Enable / disable Reception top-up
- Set Reception per-transaction top-up limit
- Wallet transaction ledger
- Permission audit activity
- Parking policy overview

### Reception
- Ticket / plate lookup simulation
- Employee exceptions
- Visitor / exception workflow
- Corporate wallet top-up only when delegated by Company Admin
- Top-up limit enforcement
- Audited top-up entries

### Employee
- Mobile-first parking experience
- Own vehicle
- Current parking session
- Self-validation
- Personal usage metrics
- No wallet or top-up access

### ParkPoint Operator
- Multi-tenant portfolio view
- Tenant analytics
- Enterprise permission model
- Product flow maps

### Analytics
- Monthly validations
- Points consumption
- Average parking duration
- Self-service rate
- Reception-assisted rate
- Reception time saved
- Usage trend
- Department usage
- Exit-time concentration
- Employee-level usage
- High-usage signals
- Friction signals
- CSV export

## Prototype state

The prototype uses browser `localStorage`, so:
- permission changes persist after refresh
- top-ups persist after refresh
- validations update the wallet
- audit events persist

Use **Reset demo data** on the role selection screen to restore the starting state.

## Important

This is an independent concept prototype, not an official ParkPoint application. It is not connected to a real ParkPoint/YooValidate/YooPass API and does not process real money or parking tickets.

The ParkPoint wordmark is referenced from ParkPoint's public website at runtime. If the computer is offline, the local fallback mark is used.

## What is needed for a real pilot

ParkPoint API access for:
1. ticket / parking session lookup
2. validation
3. corporate wallet balance
4. top-up / wallet transaction
5. plate / vehicle session lookup
6. tenant and employee identity
7. validation reversal/status
8. webhooks for parking entry / exit

For production, also add:
- Microsoft Entra ID / SSO
- real role-based access control on the backend
- server-side audit logs
- PDPL-compliant retention controls
- rate limits and transaction approval rules
- API idempotency for top-ups and validations


## GitHub Pages deployment

This package includes `.github/workflows/pages.yml`. Put the files in the root of a public GitHub repository, then in GitHub open **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow deploys the site on each push to `main` or `master`.

Recommended repository name: `parkpoint-enterprise-parking`.

## Reliability improvements in v3
- fixed the route-rendering bug that could leave every page blank
- added a UI error boundary so a rendering failure shows a recovery screen instead of a blank page
- added hash-based role/route URLs for hosted sharing
- included GitHub Pages workflow and `.nojekyll`
