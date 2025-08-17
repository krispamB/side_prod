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

// Additional types for chat operations
export interface ChatMessageWithMetadata extends ChatMessage {
  isOptimistic?: boolean
  tempId?: string
  retryCount?: number
}

export interface MessageQueue {
  id: string
  message: NewChatMessage
  timestamp: number
  retryCount: number
}

export interface ChatOperationResult {
  success: boolean
  error?: string
  data?: ChatMessage
}

export interface ChatHistoryResult {
  messages: ChatMessage[]
  hasMore: boolean
  totalCount?: number
  error?: string
}

export interface PaginatedChatHistoryOptions {
  limit?: number
  offset?: number
  beforeDate?: string
  afterDate?: string
}

export interface ChatHistoryLoadState {
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  totalCount?: number
  error: string | null
}