export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'ai'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'ai'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'ai'
          content?: string
          created_at?: string
        }
      }
    }
  }
}

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type NewChatMessage = Database['public']['Tables']['chat_messages']['Insert']