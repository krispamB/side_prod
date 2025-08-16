'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/database'
import { getAuthErrorMessage } from '@/utils/authErrors'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  // Load user profile from database
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error loading user profile:', error)
      return null
    }
  }

  // Create user profile in database
  const createUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const profileData = {
        id: user.id,
        email: user.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: getAuthErrorMessage(error) }))
      return { error }
    }

    // Profile will be created when the session is established
    setAuthState(prev => ({ ...prev, loading: false }))
    return { error: null }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: getAuthErrorMessage(error) }))
      return { error }
    }

    // User state will be updated by the auth state change listener
    return { error: null }
  }

  // Sign out function
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: getAuthErrorMessage(error) }))
      return { error }
    }

    // Clear all auth state
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    })

    return { error: null }
  }

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting initial session:', error)
        setAuthState(prev => ({ ...prev, loading: false, error: getAuthErrorMessage(error) }))
        return
      }

      if (session?.user) {
        // Load or create user profile
        let profile = await loadUserProfile(session.user.id)
        if (!profile) {
          profile = await createUserProfile(session.user)
        }

        setAuthState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
        })
      } else {
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Load or create user profile
          let profile = await loadUserProfile(session.user.id)
          if (!profile) {
            profile = await createUserProfile(session.user)
          }

          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session.user,
          }))
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signOut,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook to get user data
export function useUser() {
  const { user, profile, loading } = useAuth()
  return { user, profile, loading }
}