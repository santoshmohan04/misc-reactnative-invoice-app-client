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
- **Framework:** Redux
- **Middleware:** Redux-Thunk (for asynchronous API calls).
- **Persistence:** Redux-Persist (saves state across app restarts).
- **Form Handling:** Redux-Form (syncs form state with the Redux store).
- **Reducers:**
    - `auth`: Handles session tokens and authentication status.
    - `item`: Manages the list of products/services.
    - `customer`: Manages client data.
    - `invoice`: Tracks created invoices.
    - `user`: General user/merchant profile data.

## API & Networking
- **Base URL:** Configurable in `src/service/api.js` (Default: `http://192.168.1.2:3333`).
- **Implementation:** Custom `fetchApi` wrapper.
- **Security:** Uses `x-auth` header for token-based authentication.
- **Timeout:** 5-second request timeout.

## Tech Stack & Packages
- **UI Framework:** NativeBase (Cross-platform components).
- **Navigation:** `react-native-router-flux`.
- **Date Handling:** `moment`.
- **Utilities:** `prop-types`, `react-native-safe-area-context`, `react-native-screens`.
- **Animation/Gestures:** `react-native-reanimated`, `react-native-gesture-handler`.
- **Storage:** `@react-native-async-storage/async-storage`.

## Development & Operations
### Prerequisites
- Node.js & npm/yarn.
- Android Studio / Xcode for native builds.
- React Native CLI.

### Key Commands
- `npm install`: Install dependencies.
- `npx react-native start`: Start the Metro bundler.
- `npx react-native run-android`: Build and run on Android.
- `npx react-native run-ios`: Build and run on iOS.
- `npm test`: Run Jest unit tests.
- `npm run lint`: Run ESLint checks.

### Environment Setup
- **Polyfills:** `src/polyfills.js` handles legacy compatibility for React 18, including `ViewPropTypes` and `Picker` patches.
- **Android Configuration:** 
    - SDK 34, Gradle 8.8, AGP 8.2.1.
    - Namespace: `com.invoiceappclient`.

## Project Structure
- `src/actions/`: Redux action creators.
- `src/components/`: Reusable presentation components.
- `src/config/`: Store and global configuration.
- `src/pages/`: Main screen components.
- `src/reducers/`: Redux state logic.
- `src/service/`: API interaction logic.
- `src/utils/`: Helpers for validation and error handling.
- `Main.js`: Root navigation entry point.
