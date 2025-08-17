import { supabase } from './supabase'
import { ChatMessage, NewChatMessage, UserProfile } from '@/types/database'

// Database operation result types
export interface DatabaseResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface DatabaseArrayResult<T> {
  data: T[]
  error: string | null
  success: boolean
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000   // 5 seconds
}

export class DatabaseService {
  // Utility method for exponential backoff retry
  private static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === config.maxAttempts) {
          break
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt - 1),
          config.maxDelay
        )
        
        console.warn(`Database operation failed (attempt ${attempt}/${config.maxAttempts}), retrying in ${delay}ms:`, lastError.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // Enhanced error handling wrapper
  private static handleDatabaseError(error: any, operation: string): string {
    console.error(`Database error in ${operation}:`, error)
    
    if (error?.code === 'PGRST116') {
      return 'No data found'
    }
    if (error?.code === '23505') {
      return 'Duplicate entry'
    }
    if (error?.message?.includes('JWT')) {
      return 'Authentication expired. Please sign in again.'
    }
    if (error?.message?.includes('network')) {
      return 'Network error. Please check your connection.'
    }
    
    return error?.message || 'An unexpected database error occurred'
  }

  // Profile operations
  static async getProfile(userId: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        return data
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error, 'getProfile'),
        success: false
      }
    }
  }

  static async createProfile(userId: string, email: string): Promise<DatabaseResult<UserProfile>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .insert({ id: userId, email })
          .select()
          .single()

        if (error) throw error
        return data
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error, 'createProfile'),
        success: false
      }
    }
  }

  // Enhanced chat message operations
  static async saveMessage(message: NewChatMessage): Promise<DatabaseResult<ChatMessage>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert(message)
          .select()
          .single()

        if (error) throw error
        return data
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error, 'saveMessage'),
        success: false
      }
    }
  }

  static async saveMessages(messages: NewChatMessage[]): Promise<DatabaseArrayResult<ChatMessage>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert(messages)
          .select()

        if (error) throw error
        return data || []
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'saveMessages'),
        success: false
      }
    }
  }

  static async getChatHistory(
    userId: string, 
    limit = 100, 
    offset = 0
  ): Promise<DatabaseArrayResult<ChatMessage>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .range(offset, offset + limit - 1)

        if (error) throw error
        return data || []
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'getChatHistory'),
        success: false
      }
    }
  }

  // Enhanced method for paginated chat history loading
  static async getChatHistoryPaginated(
    userId: string,
    options: {
      limit?: number
      offset?: number
      beforeDate?: string
      afterDate?: string
    } = {}
  ): Promise<DatabaseArrayResult<ChatMessage> & { hasMore: boolean; totalCount?: number }> {
    const { limit = 50, offset = 0, beforeDate, afterDate } = options

    try {
      const result = await this.withRetry(async () => {
        let query = supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)

        // Add date filters if provided
        if (beforeDate) {
          query = query.lt('created_at', beforeDate)
        }
        if (afterDate) {
          query = query.gt('created_at', afterDate)
        }

        // Get data with one extra item to check if there's more
        const { data, error } = await query
          .order('created_at', { ascending: true })
          .range(offset, offset + limit) // Get limit + 1 items

        if (error) throw error
        return data || []
      })

      // Check if there are more items
      const hasMore = result.length > limit
      const messages = hasMore ? result.slice(0, limit) : result

      return {
        data: messages,
        error: null,
        success: true,
        hasMore
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'getChatHistoryPaginated'),
        success: false,
        hasMore: false
      }
    }
  }

  // Load most recent messages (for initial load)
  static async getRecentChatHistory(
    userId: string,
    limit = 50
  ): Promise<DatabaseArrayResult<ChatMessage> & { hasMore: boolean; totalCount?: number }> {
    try {
      // First get total count
      const countResult = await this.getMessageCount(userId)
      const totalCount = countResult.data || 0

      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit + 1) // Get one extra to check if there's more

        if (error) throw error
        return (data || []).reverse() // Return in chronological order
      })

      // Check if there are more items
      const hasMore = result.length > limit
      const messages = hasMore ? result.slice(1) : result // Remove the extra item if present

      return {
        data: messages,
        error: null,
        success: true,
        hasMore: totalCount > limit,
        totalCount
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'getRecentChatHistory'),
        success: false,
        hasMore: false
      }
    }
  }

  // Load older messages (for pagination)
  static async getOlderMessages(
    userId: string,
    beforeDate: string,
    limit = 50
  ): Promise<DatabaseArrayResult<ChatMessage> & { hasMore: boolean }> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .lt('created_at', beforeDate)
          .order('created_at', { ascending: false })
          .limit(limit + 1) // Get one extra to check if there's more

        if (error) throw error
        return (data || []).reverse() // Return in chronological order
      })

      // Check if there are more items
      const hasMore = result.length > limit
      const messages = hasMore ? result.slice(1) : result // Remove the extra item if present

      return {
        data: messages,
        error: null,
        success: true,
        hasMore
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'getOlderMessages'),
        success: false,
        hasMore: false
      }
    }
  }

  static async getRecentMessages(
    userId: string, 
    limit = 50
  ): Promise<DatabaseArrayResult<ChatMessage>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return (data || []).reverse() // Return in chronological order
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: [],
        error: this.handleDatabaseError(error, 'getRecentMessages'),
        success: false
      }
    }
  }

  static async getMessageCount(userId: string): Promise<DatabaseResult<number>> {
    try {
      const result = await this.withRetry(async () => {
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (error) throw error
        return count || 0
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: null,
        error: this.handleDatabaseError(error, 'getMessageCount'),
        success: false
      }
    }
  }

  static async deleteAllUserMessages(userId: string): Promise<DatabaseResult<boolean>> {
    try {
      await this.withRetry(async () => {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
      })

      return {
        data: true,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: false,
        error: this.handleDatabaseError(error, 'deleteAllUserMessages'),
        success: false
      }
    }
  }

  // Health check method
  static async healthCheck(): Promise<DatabaseResult<boolean>> {
    try {
      const result = await this.withRetry(async () => {
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)

        if (error) throw error
        return true
      })

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      return {
        data: false,
        error: this.handleDatabaseError(error, 'healthCheck'),
        success: false
      }
    }
  }

  // Legacy methods for backward compatibility (deprecated)
  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async getProfileLegacy(userId: string): Promise<UserProfile | null> {
    const result = await this.getProfile(userId)
    return result.data
  }

  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async createProfileLegacy(userId: string, email: string): Promise<UserProfile | null> {
    const result = await this.createProfile(userId, email)
    return result.data
  }

  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async saveMessageLegacy(message: NewChatMessage): Promise<ChatMessage | null> {
    const result = await this.saveMessage(message)
    return result.data
  }

  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async getChatHistoryLegacy(userId: string, limit = 100, offset = 0): Promise<ChatMessage[]> {
    const result = await this.getChatHistory(userId, limit, offset)
    return result.data
  }

  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async getRecentMessagesLegacy(userId: string, limit = 50): Promise<ChatMessage[]> {
    const result = await this.getRecentMessages(userId, limit)
    return result.data
  }

  /** @deprecated Use the new methods that return DatabaseResult instead */
  static async deleteAllUserMessagesLegacy(userId: string): Promise<boolean> {
    const result = await this.deleteAllUserMessages(userId)
    return result.data || false
  }
}