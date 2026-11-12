# Invoice App Client - Project Context

## Overview
This is a React Native mobile application for merchants of small businesses to issue invoices, manage items, and track customers. It integrates with a backend service to handle PDF generation and email delivery of invoices.

## Features
- **Merchant Authentication:** Secure registration and login for business owners.
- **Item Management:** Create and list products or services with pricing.
- **Customer Management:** Maintain a database of client contact information.
- **Invoice Generation:** Combine items and customers to create formal invoices.
- **Invoice Delivery:** Initiate sending invoices as PDFs via email (Backend integration).
- **Payment Integration:** Invoices include a payment URL for online transactions.
- **Profile Management:** Manage merchant business details.

## Pages & Navigation
Structure based on `src/pages/`:
- **Splash:** Initial loading screen.
- **Authentication:** 
    - `Login`: Merchant sign-in.
    - `SignUp`: New merchant registration.
- **Main Dashboard:**
    - `Invoices`: List of generated invoices.
    - `Items`: Management of goods/services.
    - `Customers`: Client directory.
- **Forms:**
    - `InvoiceForm`: UI to create new invoices.
    - `ItemForm`: UI to add/edit items.
    - `CustomerForm`: UI to add/edit customers.
- **Profile:** Merchant account settings.

## State Management
- **Framework:** Redux Toolkit with RTK Query (`src/store/`).
- **Persistence:** `redux-persist` on the auth slice (`key: 'auth'`, AsyncStorage) so login survives refresh.
- **Form Handling:** react-hook-form + zod, with validation mirroring the backend Joi rules (`src/types/schemas.ts`, `src/types/schemas/invoice.schema.ts`).
- **APIs:** `authApi` (login/register/profile/refresh) and `dataApi` (invoices/customers/items).

## API & Networking
- **Base URL:** `EXPO_PUBLIC_API_URL` in `.env` (default `http://localhost:3333`). Use the LAN IP on a physical device or `10.0.2.2` on the Android emulator. Restart Expo with `-c` after changing it.
- **Routes:** items/customers use `POST /<resource>/create` and `PUT /<resource>/:id`; sign-up sends `name, email, password, phone, address, base_currency` and optional `company`.
- **Security:** Bearer token with refresh flow in `authApi`.

## Invoice Print / PDF
- Print and Download PDF are available from invoice list rows and from a saved invoice's form (`src/utils/invoicePdf.ts`, `src/features/invoices/hooks/useInvoiceExport.ts`).
- Web: hidden-iframe print and `html2pdf.js`; mobile: `expo-print` and `expo-sharing`.

## Tech Stack & Packages
- **Runtime:** Expo 54, React Native 0.81, React 19, TypeScript 5.9.
- **UI Framework:** Tamagui plus React Native components.
- **Navigation:** `@react-navigation/*`.
- **Utilities:** `react-native-safe-area-context`, `react-native-screens`.
- **Animation/Gestures:** `react-native-reanimated`, `react-native-gesture-handler`.
- **Storage:** `@react-native-async-storage/async-storage`.

## Development & Operations
### Prerequisites
- Node.js & npm/yarn.
- Android Studio / Xcode for native builds.
- React Native CLI.

### Key Commands
- `npm install`: Install dependencies.
- `npm run start` / `npx expo start --web -c`: Start Expo (clean cache).
- `npm run android` / `npm run ios` / `npm run web`: Run on a platform.
- `npm run typecheck`: Run TypeScript checks.

### Environment Setup
- `.env`: `EXPO_PUBLIC_API_URL=http://localhost:3333`.
- `app.json`: the datetimepicker plugin is referenced as `@react-native-community/datetimepicker/app.plugin.js`.
- `tsconfig.json`: alias `@app-types/*` → `src/types/*`.

## Project Structure
- `src/components/`: Reusable presentation components (`ListView` supports row `actions`).
- `src/features/`: Feature logic (e.g. `invoices/components`, `invoices/hooks`).
- `src/pages/`: Screens (`authentication/`, `main/`, `form-pages/`, `Profile.tsx`).
- `src/store/`: Redux Toolkit store, slices and RTK Query APIs.
- `src/shared/`: Shared forms, errors, observability, logger.
- `src/types/`: Types and zod schemas.
- `src/utils/`: Helpers (currencies, `invoicePdf.ts`).
- `packages/`: Shared packages (`api-contracts`, etc.).
