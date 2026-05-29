# S V TEL Inventory

A React + Vite + Firebase stock management web app with role-based access, realtime Firestore sync, PO entry, partial inward, outward dispatch, reports, backup/restore, and a responsive SaaS-style dashboard.

## Demo Admin

Create this Firebase Authentication user before first login:

- Email: `rohitkumar5480@gmail.com`
- Password: `Rohit6919`

Then import or create a matching Firestore document in `users/{uid}` with role `admin`. Sample seed data is available in `src/data/demoData.js`.

Minimum admin profile:

```json
{
  "uid": "firebase-auth-user-uid",
  "name": "Rohit Kumar",
  "email": "rohitkumar5480@gmail.com",
  "mobile": "",
  "role": "admin",
  "status": "active",
  "permissions": {
    "dashboard": true,
    "parts": true,
    "po": true,
    "inward": true,
    "outward": true,
    "vendors": true,
    "transactions": true,
    "reports": true,
    "users": true,
    "settings": true
  }
}
```

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill your Firebase values.
4. In Firebase Console, enable Email/Password Authentication, Firestore, Storage, and Hosting.
5. Deploy rules with `firebase deploy --only firestore:rules,storage`.
6. Run locally with `npm run dev`.
7. Build with `npm run build`.
8. Deploy hosting with `firebase deploy --only hosting`.

## Firebase Collections

- `users`
- `products`
- `categories`
- `vendors`
- `purchase_orders`
- `stock_transactions`
- `activity_logs`
- `notifications`
- `password_reset_requests`
- `settings`

## Important Notes

- User creation from a browser cannot safely set another user's password unless you use Firebase Admin SDK/Cloud Functions. This app stores user profile, role, permissions, mobile number, and suspend status. Create Auth accounts or change passwords through Firebase Console or an Admin SDK endpoint, then use the app to notify the user.
- Session persistence is set to browser-local persistence. The app signs the user out when the calendar date changes, matching the one-day login requirement.
- Reports export both XLSX and PDF, including generated timestamp.

## Deploy

```bash
npm install -g firebase-tools
firebase login
firebase init hosting firestore storage
npm run build
firebase deploy
```
