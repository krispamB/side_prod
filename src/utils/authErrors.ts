import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return ''

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
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error.message === 'string'
}