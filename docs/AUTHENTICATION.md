# JWT Token Authentication Integration

This document explains how JWT token authentication is implemented in the ZareShop Vendor app.

## Overview

The app uses JWT tokens from the backend for authentication. When users log in or register, they receive a JWT token that is stored locally and used for subsequent API requests.

## Backend Token Generation

The backend generates JWT tokens in the `auth.controller.js` file:

```javascript
const token = jwt.sign(
  { id: user.id, type: user.type },
  process.env.SECRET_KEY,
  { expiresIn: "7d" }
);
```

## Frontend Token Management

### 1. Token Storage

Tokens are stored using `@react-native-async-storage/async-storage` in the `utils/tokenStorage.ts` file:

- **Storage**: Tokens and user data are persisted locally
- **Retrieval**: Tokens are automatically restored on app startup
- **Cleanup**: Tokens are removed on logout

### 2. Redux State Management

Authentication state is managed in `features/auth/authSlice.ts`:

- **State**: Stores user data and token
- **Async Thunks**: Handle token persistence and restoration
- **Actions**: Set credentials, logout, etc.

### 3. API Integration

All API requests automatically include the JWT token in the Authorization header:

```typescript
// In baseApi.ts
prepareHeaders: (headers, { getState }) => {
  const token = (getState() as RootState).auth.token;
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  return headers;
}
```

## Authentication Flow

### Login Flow

1. User enters phone number and password
2. Frontend calls `/auth/login` endpoint
3. Backend validates credentials and returns JWT token
4. Frontend stores token and user data in Redux and AsyncStorage
5. User is redirected to main app

### Registration Flow

1. User fills registration form
2. Frontend calls `/auth/register-vendor-owner` endpoint
3. Backend creates user and sends OTP
4. User verifies OTP via `/auth/verify-otp` endpoint
5. Frontend calls login to get JWT token
6. Token is stored and user is redirected to main app

### App Startup

1. `AuthProvider` component restores authentication state from storage
2. If token exists, user is automatically logged in
3. If no token, user is redirected to login/onboarding

## Protected Routes

The following routes require authentication:

- `/(tabs)/*` - Main app tabs (Dashboard, Products, Orders, Payouts, Profile)
- Authentication is checked in the tabs layout

## Logout

Users can logout from the Profile screen, which:

1. Removes token from Redux state
2. Clears token from AsyncStorage
3. Redirects to login screen

## Token Security

- Tokens expire after 7 days (configured on backend)
- Tokens are stored securely in AsyncStorage
- All API requests include token validation
- Failed authentication redirects to login

## Usage Examples

### Using the useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return <AuthenticatedContent />;
}
```

### Making Authenticated API Calls

```typescript
// All API calls automatically include the token
const { data } = useGetCategoriesQuery();
const [createVendor] = useCreateIndividualVendorMutation();
```

## Error Handling

- Network errors are handled by RTK Query
- Authentication errors (401) should redirect to login
- Token expiration is handled by backend validation


