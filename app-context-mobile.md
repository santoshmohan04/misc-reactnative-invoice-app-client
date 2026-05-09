# App Context - InvoiceAppClient (React Native / Expo)

## Overview
InvoiceAppClient is a cross-platform invoice management app (Android, iOS, and web via Expo) built on Expo SDK 51 and React Native 0.74.

The app supports:
- authentication (register/login/logout)
- profile management
- invoice/customer/item CRUD
- sending invoices by email
- persisted auth session and preloaded business data

## Current Architecture (Post Migration)

### UI stack
- NativeBase has been fully removed from source and dependencies.
- UI now uses React Native primitives plus selective Tamagui components.
- Icons use `@expo/vector-icons`.
- Form controls are custom redux-form renderers using:
  - React Native `TextInput`
  - `@react-native-picker/picker`
  - `@react-native-community/datetimepicker`

### Navigation
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- Custom bottom tab bar (`src/components/NavBar.js`) implemented with React Native views/pressables.

### State and persistence
- Redux + redux-thunk
- redux-form for form state
- redux-persist with split storage:
  - auth slice in secure storage (`expo-secure-store` wrapper)
  - non-sensitive persisted state in AsyncStorage

## Features

| Feature | Description |
|---|---|
| User Registration | Create account with name/email/password and business info |
| User Login / Logout | Token-based auth stored securely |
| Profile Management | Update company, phone, address, base currency |
| Invoice Management | Create/edit invoices with item rows, subtotal, discount, total |
| Send Invoice by Email | Creates payment session then sends invoice |
| Customer Management | Create/edit customers and addresses |
| Item Management | Create/edit item catalog with price and description |
| Splash Preload | Loads invoices/customers/items before entering home tabs |
| Session Persistence | Auth and user data restored between app launches |

## UX Notes
- Splash loading is all-or-nothing: invoices + customers + items must all load before entering home.
- Validation includes required, email, phone, numeric, integer, and invoice due-date ordering checks.
- Post-save flows re-fetch relevant lists to show up-to-date server state.
- Success messages are now native alerts (NativeBase Toast removed).

## API Integration
Base URL is configured in `src/service/api.js`:

```js
const BASE_URL = Constants.expoConfig?.extra?.baseUrl || 'http://localhost:3333'
```

Requests:
- include `x-auth` when token exists
- use a 5000 ms timeout race
- parse text response into JSON when possible

### Endpoints currently used
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/user/register` | POST | No | Register user |
| `/user/login` | POST | No | Login user |
| `/user/logout` | DELETE | Yes | Logout user |
| `/user/user` | GET | Yes | Get current user |
| `/user/edit` | POST | Yes | Update user profile |
| `/invoice/all` | GET | Yes | List invoices |
| `/invoice/edit` | POST | Yes | Create/update invoice |
| `/payment/new` | POST | Yes | Create payment session |
| `/invoice/send` | POST | Yes | Send invoice email |
| `/customer/all` | GET | Yes | List customers |
| `/customer/edit` | POST | Yes | Create/update customer |
| `/item/all` | GET | Yes | List items |
| `/item/edit` | POST | Yes | Create/update item |

## Routing
Defined in `src/components/Routes.js`.

- Unauthenticated stack:
  - `login`
  - `signup`
- Authenticated stack:
  - `splash`
  - `home` (tabs: `invoices`, `customers`, `items`)
  - `customerForm`
  - `itemForm`
  - `invoiceForm`
  - `profile`

## Key Pages (Current)
| Page | File |
|---|---|
| Login | `src/pages/authentication/Login.js` |
| Sign Up | `src/pages/authentication/SignUp.js` |
| Splash | `src/pages/Splash.js` |
| Invoices | `src/pages/main/Invoices.js` |
| Customers | `src/pages/main/Customers.js` |
| Items | `src/pages/main/Items.js` |
| Invoice Form | `src/pages/form-pages/InvoiceForm.js` |
| Customer Form | `src/pages/form-pages/CustomerForm.js` |
| Item Form | `src/pages/form-pages/ItemForm.js` |
| Profile | `src/pages/Profile.js` |

## Packages (Current from package.json)

### Dependencies
- `expo` `~51.0.0`
- `react` `18.2.0`
- `react-native` `0.74.5`
- `@expo/metro-runtime` `~3.2.3`
- `@expo/vector-icons` `^14.0.2`
- `expo-constants` `~16.0.2`
- `expo-secure-store` `~13.0.2`
- `expo-splash-screen` `^0.27.7`
- `expo-status-bar` `~1.12.1`
- `@react-native-async-storage/async-storage` `~1.23.1`
- `@react-native-community/datetimepicker` `^8.0.1`
- `@react-native-picker/picker` `^2.7.5`
- `@react-navigation/native` `^6.1.18`
- `@react-navigation/native-stack` `^6.11.0`
- `@react-navigation/bottom-tabs` `^6.6.1`
- `react-native-gesture-handler` `~2.16.1`
- `react-native-reanimated` `~3.10.1`
- `react-native-safe-area-context` `4.10.5`
- `react-native-screens` `~3.31.1`
- `react-native-web` `^0.19.13`
- `react-dom` `^18.2.0`
- `redux` `^5.0.1`
- `react-redux` `^9.1.2`
- `redux-form` `^8.3.10`
- `redux-persist` `^6.0.0`
- `redux-thunk` `^3.1.0`
- `axios` `^1.7.7`
- `moment` `^2.30.1`
- `tamagui` `^2.0.0-rc.42`
- `@tamagui/core` `^2.0.0-rc.42`
- `@tamagui/config` `^2.0.0-rc.42`

### Dev dependencies
- `@babel/core` `^7.20.0`
- `typescript` `~5.3.3`
- `@types/react` `~18.2.45`
- `@types/react-native` `~0.73.0`

## Scripts (Current)
```bash
npm run start
npm run android
npm run ios
npm run web
npm run eject
```

## Local Development

### Prerequisites
- Node.js 18+
- npm (project currently uses npm lockfile)
- Android Studio (for Android emulator/device testing)
- Xcode + CocoaPods (macOS only for iOS)

### Run
```bash
npm install
npm run start
```

Then choose a target:
- Android: `npm run android`
- iOS: `npm run ios` (macOS)
- Web: `npm run web`

## Cleanup Performed in This Update
- Removed unreferenced duplicate files:
  - `src/pages/form-pages/InvoiceForm.tsx`
  - `src/pages/Splash.tsx`
- Removed unused direct dependencies:
  - `native-base`
  - `@react-navigation/stack`
  - `prop-types`
  - `normalize-css-color`
- Added/kept renderer dependencies used after migration:
  - `@react-native-picker/picker`
  - `@react-native-community/datetimepicker`

## Notes
- The app is now JavaScript-first in `src/` (with one TypeScript utility file in config).
- If you want stricter cleanup, next step is running a full dependency audit tool and test pass to validate runtime-only imports across all platforms.
