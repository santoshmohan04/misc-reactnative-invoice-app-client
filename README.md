# invoice-app-client

InvoiceAppClient is a frontend application for small-business merchants to manage invoices, customers, and items.

This repository currently contains:
- A mobile app built with Expo + React Native (root project)
- A separate Next.js web app in `web-app/`

## Features
- Merchant authentication (login/sign-up)
- Customer and item management
- Invoice create/edit flows with line items
- Invoice send flow (email/payment integration)
- Profile management

## Tech Stack (Mobile)
- Expo 51
- React Native 0.74
- TypeScript
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

Install and run:
```bash
npm install
npm run start
```

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

The frontend is aligned to shared API contracts in `packages/api-contracts` and shared API helpers in `packages/shared-api`.

## Notes
- This README reflects the current TypeScript + RTK architecture.
- Legacy references to Redux Form and thunk-based action/reducer folders are intentionally removed from this document.
