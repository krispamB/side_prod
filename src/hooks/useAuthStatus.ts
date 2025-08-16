'use client'

import { useAuth } from '@/contexts/AuthContext'

export function useAuthStatus() {
  const { user, profile, session, loading, error } = useAuth()

  const isAuthenticated = !!user && !!session
  const isLoading = loading
  const hasError = !!error
  const hasProfile = !!profile

  return {
    isAuthenticated,
    isLoading,
    hasError,
    hasProfile,
    user,
    profile,
    session,
    error,
  }
}