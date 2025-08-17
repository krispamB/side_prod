import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return ''

  // Handle common error patterns
  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  
  if (message.includes('email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.'
  }
  
  if (message.includes('user already registered') || message.includes('already registered')) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  
  if (message.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.'
  }
  
  if (message.includes('invalid email') || message.includes('invalid format')) {
    return 'Please enter a valid email address.'
  }
  
  if (message.includes('signup is disabled')) {
    return 'Account registration is currently disabled. Please contact support.'
  }
  
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many requests. Please wait a few minutes before trying again.'
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Please check your internet connection and try again.'
  }
  
  if (message.includes('weak password')) {
    return 'Password is too weak. Please use a stronger password with at least 6 characters.'
  }

  // Exact matches for specific errors
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.'
    case 'User already registered':
      return 'An account with this email already exists. Please sign in instead.'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.'
    case 'Unable to validate email address: invalid format':
      return 'Please enter a valid email address.'
    case 'Signup is disabled':
      return 'Account registration is currently disabled. Please contact support.'
    case 'Email rate limit exceeded':
      return 'Too many email requests. Please wait a few minutes before trying again.'
    default:
      // Return a more user-friendly version of the original error
      return `${error.message}. Please try again or contact support if the problem persists.`
  }
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error.message === 'string'
}