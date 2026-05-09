# App Context – InvoiceAppClient (React Native Mobile)

## Overview
InvoiceAppClient is a cross-platform (iOS & Android) mobile application built with the **Expo SDK (Managed/Prebuild workflow)**. It allows business users to manage invoices, customers, and billable items. Users can create and send invoices by email via a connected backend server, and manage their company profile.

---

## Features

| Feature | Description |
|---|---|
| User Registration | New users can create an account with email and password |
| User Login / Logout | Secure token-based authentication; session persisted across app restarts |
| Profile Management | Edit company name, phone, address, and base currency |
| Invoice Management | Create, view, and edit invoices with line items, discount, subtotal, and total |
| Send Invoice by Email | Trigger a payment session and email the invoice to the customer |
| Customer Management | Create and edit customers with contact details and multiple addresses |
| Item (Product) Management | Create and edit billable items with name, unit price, and description |
| Currency Support | Multi-currency support; base currency set per user profile |
| Offline Session Persistence | Auth token persisted via **Expo SecureStore**; other data via **AsyncStorage** and **redux-persist** |
| Splash / Data Preload | On login, all invoices, customers, and items are preloaded before the main UI is shown |

---

## UI

- **Component library:** [NativeBase v2](https://docs.nativebase.io/) — provides `Container`, `Card`, `CardItem`, `Button`, `Text`, `Icon`, `List`, `Fab`, `Toast`, `Footer`, `FooterTab`, `Input`, and modal components
- **Navigation:** `@react-navigation/native` — stack and bottom tab navigation
- **Bottom Tab Bar (`NavBar`):** Three tabs: Invoices, Customers, Items
- **Forms:** Built with `redux-form` `Field` and `FieldArray` components, using custom renderers for text inputs, select dropdowns, and date pickers
- **Loading indicator (`Loader`):** Overlay spinner displayed during async API calls
- **Empty state (`EmptyListPlaceHolder`):** Shown when a list has no data
- **Language:** Core pages have been migrated to **TypeScript** (`.tsx`) for improved type safety.
- **FAB (Floating Action Button):** Blue `+` button on list pages to add new records
- **Status bar:** Dark background (`#1c313a`) with light-content style

---

## UX

- **All-or-nothing data load:** The Splash screen preloads invoices, customers, and items in parallel. If any request fails the app shows an error alert and exits after 4 seconds, preventing a partially-loaded state.
- **Inline form validation:** Required fields, email format, phone format, numeric checks, and date ordering (due date must be after issue date) are validated before submission.
- **Optimistic list refresh:** After creating or editing any record the corresponding list is immediately re-fetched from the server and a success Toast is shown.
- **Token-based auth persistence:** Auth token and user details are stored in AsyncStorage so users remain logged in after closing and reopening the app.
- **Error handling:** All API errors are normalised through `ErrorUtils` and surfaced as native alerts.
- **Compute Total button:** On the invoice form a dedicated button re-computes subtotal and total from line items before saving, accounting for the redux-form one-tick-behind issue with `FieldArray`.

---

## APIs Consumed

Base URL is configured in `src/service/api.js`:

```javascript
import Constants from 'expo-constants';
const BASE_URL = Constants.expoConfig?.extra?.baseUrl || 'http://localhost:3333';
```
Configured in `app.json` under `expo.extra.baseUrl`.

All requests include a `5000 ms` timeout. Authenticated requests send the token in the `x-auth` header.

| Endpoint | Method | Auth Required | Purpose |
|---|---|---|---|
| `/user/register` | POST | No | Register a new user |
| `/user/login` | POST | No | Login and receive auth token |
| `/user/logout` | DELETE | Yes | Invalidate auth token |
| `/user/user` | GET | Yes | Fetch current user details |
| `/user/edit` | POST | Yes | Update user profile |
| `/invoice/all` | GET | Yes | Fetch all invoices |
| `/invoice/edit` | POST | Yes | Create or update an invoice |
| `/invoice/send` | POST | Yes | Send invoice by email |
| `/customer/all` | GET | Yes | Fetch all customers |
| `/customer/edit` | POST | Yes | Create or update a customer |
| `/item/all` | GET | Yes | Fetch all items |
| `/item/edit` | POST | Yes | Create or update an item |
| `/payment/new` | POST | Yes | Create a new payment session (used before sending invoice by email) |

---

## State Management

The app uses **Redux** with **redux-thunk** middleware for async actions, **redux-form** for form state, and **redux-persist** backed by **AsyncStorage** for local persistence.

### Store configuration (`src/config/store.js`)

- **Persistence Strategy:**
  - `authReducer`: Persisted using a custom **SecureStore** engine for sensitive auth tokens.
  - Other reducers: Persisted via **AsyncStorage**.
- All other slices (invoices, customers, items, form state) are loaded fresh on each session

### Reducer tree

| Slice | Sub-reducers | Persisted |
|---|---|---|
| `authReducer` | `authData` (token, isLoggedIn), `registerUser`, `loginUser` | ✅ (Secure) |
| `userReducer` | `getUser` (userDetails), `editUser` | ✅ |
| `invoiceReducer` | `getInvoices`, `editInvoice`, `sendInvoiceEmail` | ❌ |
| `customerReducer` | `getCustomers`, `editCustomer` | ❌ |
| `itemReducer` | `getItems`, `editItem` | ❌ |
| `form` | redux-form managed | ❌ |

### Action files

| File | Actions |
|---|---|
| `auth.actions.js` | `registerNewUser`, `loginUser`, `getUser`, `logoutUser`, `editUser` |
| `invoice.actions.js` | `getInvoicesList`, `editInvoice`, `sendInvoiceByEmail` |
| `customer.actions.js` | `getCustomersList`, `editCustomer` |
| `item.actions.js` | `getItemsList`, `editItem` |

Each action dispatches `_LOADING`, `_SUCCESS`, and `_FAIL` action types to drive loading/error/success UI state.

---

## Pages

| Page | File | Route Key | Description |
|---|---|---|---|
| Login | `src/pages/authentication/Login.js` | `login` | Email + password login form |
| Sign Up | `src/pages/authentication/SignUp.js` | `signup` | New user registration form |
| Splash | `src/pages/Splash.tsx` | `splash` | Preloads data via `expo-splash-screen`; redirects to Home on success |
| Invoices (list) | `src/pages/main/Invoices.js` | `invoices` | Tab 1 — lists all invoices |
| Customers (list) | `src/pages/main/Customers.js` | `customers` | Tab 2 — lists all customers |
| Items (list) | `src/pages/main/Items.js` | `items` | Tab 3 — lists all billable items |
| Invoice Form | `src/pages/form-pages/InvoiceForm.tsx` | `invoiceForm` | Add/edit invoice; compute total; send by email |
| Customer Form | `src/pages/form-pages/CustomerForm.js` | `customerForm` | Add/edit customer |
| Item Form | `src/pages/form-pages/ItemForm.js` | `itemForm` | Add/edit item |
| Profile | `src/pages/Profile.js` | `profile` | Edit user profile; logout |

### Routing

Routing is handled by `@react-navigation/native` in `src/components/Routes.js`:

- **Unauthenticated stack** (`AuthStack`): Login → SignUp
- **Authenticated stack** (`AppStack`): Splash → Home (tabs: Invoices / Customers / Items) → Invoice/Customer/Item forms → Profile

The initial stack is determined by `isLoggedIn` from the persisted `authReducer`.

---

## Packages Used

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.2.0 | Core React library |
| `expo` | latest | Expo SDK |
| `expo-secure-store` | latest | Secure storage for auth tokens |
| `expo-constants` | latest | Environment variable access |
| `expo-splash-screen` | latest | Native splash screen handling |
| `react-redux` | ^7.2.0 | Connect React components to Redux store |
| `redux` | ^4.0.5 | State management |
| `redux-thunk` | ^2.3.0 | Async action middleware |
| `redux-form` | ^8.3.5 | Form state management integrated with Redux |
| `redux-persist` | ^5.6.12 | Persist and rehydrate Redux store |
| `@react-native-async-storage/async-storage` | ^1.24.0 | Key-value storage used by redux-persist |
| `@react-navigation/native` | ^7.2.4 | Navigation framework |
| `@react-navigation/native-stack` | ^7.14.14 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^7.15.13 | Bottom tab navigator |
| `react-native-gesture-handler` | 2.16.2 | Gesture handling for navigation |
| `react-native-reanimated` | 3.10.1 | Animations for navigation |
| `react-native-safe-area-context` | ^4.10.1 | Safe area insets |
| `react-native-screens` | ^4.24.0 | Native screen containers |
| `native-base` | ^2.13.12 | UI component library |
| `moment` | ^2.25.3 | Date formatting on invoice list |
| `prop-types` | ^15.7.2 | Runtime prop validation |

### Development Dependencies

| Package | Version | Purpose |
|---|---|---|
| `eas-cli` | latest | EAS Build and Submit CLI |
| `eslint` | ^8.57.0 | Linting |
| `prettier` | 2.8.8 | Code formatting |
| `jest` | ^29.7.0 | Unit testing |
| `babel-jest` | ^29.7.0 | Babel transform for Jest |
| `react-test-renderer` | 18.2.0 | React component rendering in tests |
| `typescript` | 5.0.4 | TypeScript support |

---

## Local Development Procedure

### Prerequisites

- **Node.js** ≥ 18 and **npm** or **Yarn**
- **React Native CLI** (not Expo): `npm install -g @react-native-community/cli`
- **Android:** Android Studio with Android SDK and an AVD (or a physical device with USB debugging enabled)
- **iOS (macOS only):** Xcode ≥ 14, CocoaPods (`sudo gem install cocoapods`)
- A running instance of the backend server reachable from the device/emulator network

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd misc-reactnative-invoice-app-client

# 2. Install JavaScript dependencies
npm install
# or
yarn install

# 3. iOS only — install native pods
cd ios && pod install && cd ..

# 4. Update the backend base URL
# Edit src/service/api.js and set BASE_URL to your server's IP address:
# const BASE_URL = 'http://<your-server-ip>:3333';

# 5. Start the Metro bundler
npm start
# or
yarn start

# 6. Run on Android (in a separate terminal)
npm run android
# or
yarn android

# 6. Run on iOS (macOS only, in a separate terminal)
npm run ios
# or
yarn ios
```

### Linting

```bash
npm run lint
# or
yarn lint
```

### Unit Tests

```bash
npm test
# or
yarn test
```

---

## Testing on Real Device / Virtual Device

### Android — Virtual Device (AVD)

1. Open **Android Studio → AVD Manager** and create or start an emulator (API 30+ recommended).
2. Confirm the emulator is running: `adb devices` should list it.
3. Run `npm run android`. Metro will bundle and deploy to the emulator automatically.
4. Set `BASE_URL` to `http://10.0.2.2:3333` so the emulator can reach `localhost` on the host machine.

### Android — Real Device

1. Enable **Developer Options** on the device (tap *Build number* 7 times in *Settings → About phone*).
2. Enable **USB Debugging** in Developer Options.
3. Connect the device via USB and confirm visibility: `adb devices`.
4. Run `npm run android`. Metro will bundle and deploy to the connected device.
5. Set `BASE_URL` to the host machine's local network IP (e.g. `http://192.168.1.x:3333`). The device and host must be on the same Wi-Fi network.

### iOS — Simulator (macOS only)

1. Open Xcode, select a simulator (e.g. iPhone 15, iOS 17).
2. Run `npm run ios`. Metro will bundle and launch the app in the selected simulator.
3. Set `BASE_URL` to `http://localhost:3333` or `http://127.0.0.1:3333`.

### iOS — Real Device (macOS only)

1. Connect the iPhone/iPad via USB.
2. In Xcode open `ios/InvoiceAppClient.xcworkspace`, select your device as the build target.
3. Sign the app with your Apple Developer account under *Signing & Capabilities*.
4. Build and run from Xcode, or run `npm run ios --device "Your Device Name"`.
5. Trust the developer certificate on the device: *Settings → General → VPN & Device Management*.
6. Set `BASE_URL` to the host machine's local network IP. The device must be on the same Wi-Fi network.

### Enabling Fast Refresh / Debugging

- Shake the device (or press `Cmd+D` on iOS Simulator / `Cmd+M` on Android Emulator) to open the React Native developer menu.
- Enable **Fast Refresh** for instant JS reloading without losing component state.
- Select **Open Debugger** to open Chrome DevTools for JS debugging.

---

## Deployment Procedure

### Android — Release APK / AAB

```bash
# 1. Generate a signing keystore (one-time)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/release.keystore \
  -alias invoiceapp -keyalg RSA -keysize 2048 -validity 10000

# 2. Configure signing in android/app/build.gradle
#    (add signingConfigs block and reference it in buildTypes.release)

# 3. Build release APK
cd android && ./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# 4. Or build release AAB (required for Google Play)
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

Upload the `.aab` to the **Google Play Console** under your app's release track.

### iOS — App Store

```bash
# 1. In Xcode set the scheme to Release
# 2. Select Product → Archive
# 3. Open the Organizer window, select the archive, and click Distribute App
# 4. Choose App Store Connect and follow the wizard
# 5. Submit the build for review in App Store Connect
```

### Backend URL for Production

Before building a production release, update `src/service/api.js`:

```js
const BASE_URL = 'https://your-production-server.com';
```

Use HTTPS for production. Ensure the server's SSL certificate is valid; React Native enforces ATS (iOS) and cleartext traffic restrictions (Android) in release builds.
