import { User, Session } from '@supabase/supabase-js'
import { UserProfile } from './database'

export interface AuthUser extends User {
  profile?: UserProfile
}

export interface AuthSession extends Session {
  user: AuthUser
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}