'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function useAuthActions() {
  const { signUp, signIn, signOut, clearError } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async (email: string, password: string) => {
    setIsSubmitting(true)
    clearError()
    
    try {
      const result = await signUp(email, password)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    setIsSubmitting(true)
    clearError()
    
    try {
      const result = await signIn(email, password)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setIsSubmitting(true)
    clearError()
    
    try {
      const result = await signOut()
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isSubmitting,
    clearError,
  }
}