'use client'

import { useAuth, useUser } from '@/contexts/AuthContext'
import { useAuthStatus, useAuthActions } from '@/hooks'

export function AuthTest() {
  const { user, profile, loading, error } = useAuth()
  const { isAuthenticated, isLoading } = useAuthStatus()
  const { signOut } = useAuthActions()

  if (isLoading) {
    return <div>Loading authentication state...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Auth Status Test</h3>
      <div className="space-y-2">
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User ID: {user?.id || 'None'}</p>
        <p>Email: {user?.email || 'None'}</p>
        <p>Profile: {profile ? 'Loaded' : 'None'}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
        {isAuthenticated && (
          <button 
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}