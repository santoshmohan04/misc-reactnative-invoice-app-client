# invoice-app-client

InvoiceAppClient is a frontend application for small-business merchants to manage invoices, customers, and items.

This repository currently contains:
- A mobile app built with Expo + React Native (root project)
- A separate Next.js web app in `web-app/`

## Features
- Merchant authentication (login/sign-up)
- Customer and item management
- Invoice create/edit flows with line items and an auto-generated invoice number (`INV-YYYYMMDD-HHmmss`)
- Print and Download PDF for invoices (list rows and saved-invoice form) on web and mobile
- Invoice send flow (email/payment integration)
- Profile management
- Form validation in the UI aligned with the backend Joi rules (login, sign-up, item, customer, invoice)

## Tech Stack (Mobile)
- Expo 54
- React Native 0.81
- React 19
- TypeScript 5.9
- `expo-print`, `expo-sharing` (mobile print / PDF share) and `html2pdf.js` (web PDF download)
- Redux Toolkit + RTK Query
- react-hook-form + Zod
- Tamagui
- redux-persist
- Sentry

## Quick Start (Mobile App)

Prerequisites:
- Node.js (LTS)
- npm
- Expo-compatible Android/iOS simulator or device

Configure the backend URL in `.env` (the backend runs on port 3333):
```
EXPO_PUBLIC_API_URL=http://localhost:3333
```
Use your machine's LAN IP for a physical phone, or `http://10.0.2.2:3333` for the Android emulator.

Install and run:
```bash
npm install
npm run start
```

After changing `.env`, `tsconfig.json` path aliases or `app.json`, restart with a clean cache: `npx expo start --web -c`.
The `@app-types/*` alias is used for `src/types/*` (`@types/*` is reserved by TypeScript).

Useful scripts:
- `npm run android` - open Expo on Android
- `npm run ios` - open Expo on iOS
- `npm run web` - run Expo web build
- `npm run typecheck` - run TypeScript checks

## Quick Start (Next.js Web App)

```bash
cd web-app
npm install
npm run dev
```

Other web scripts:
- `npm run build`
- `npm run start`
- `npm run lint`

## Project Structure

Top-level:
- `src/` - mobile application source
- `android/`, `ios/` - native projects
- `web-app/` - Next.js web app
- `packages/` - shared packages (`api-contracts`, `shared-api`, `shared-ui`, `shared-utils`)

Mobile source (`src/`):
- `components/` - reusable UI/navigation pieces
- `pages/` - route-level screens
- `store/` - Redux Toolkit store, slices, RTK Query APIs
- `shared/` - shared forms, errors, observability, logger
- `features/` - feature-level logic/components
- `utils/`, `types/`, `config/`

## API / Backend

Backend repository:
- https://github.com/jKh98/invoice-app-backend

Create routes are `POST /item/create` and `POST /customer/create`; updates are `PUT /item/:id` and `PUT /customer/:id`.

The frontend is aligned to shared API contracts in `packages/api-contracts` and shared API helpers in `packages/shared-api`.

## Notes
- This README reflects the current TypeScript + RTK architecture.
- Legacy references to Redux Form and thunk-based action/reducer folders are intentionally removed from this document.
