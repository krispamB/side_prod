# Authentication Context

This directory contains the authentication context and related utilities for Krismini.

## Usage

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, profile, loading, error, signIn, signUp, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  )
}
```

### Using Custom Hooks

```tsx
import { useAuthStatus, useAuthActions } from '@/hooks'

function AuthComponent() {
  const { isAuthenticated, user, profile } = useAuthStatus()
  const { signIn, signUp, signOut, isSubmitting } = useAuthActions()
  
  // Component logic here
}
```

## Features

- **Automatic session persistence**: Sessions are automatically saved and restored across browser sessions
- **Profile management**: User profiles are automatically created and loaded from the database
- **Error handling**: User-friendly error messages for common authentication scenarios
- **Loading states**: Built-in loading states for all authentication operations
- **TypeScript support**: Full TypeScript support with proper typing

## Context Structure

- `AuthContext`: Main authentication context with user state and methods
- `useAuth()`: Hook to access the full authentication context
- `useUser()`: Hook to access just user and profile data
- `useAuthStatus()`: Hook for checking authentication status
- `useAuthActions()`: Hook for authentication actions with loading states