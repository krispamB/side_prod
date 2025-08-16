import { supabase } from './supabase'
import { ChatMessage, NewChatMessage, UserProfile } from '@/types/database'

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  }

  static async createProfile(userId: string, email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  }

  // Chat message operations
  static async saveMessage(message: NewChatMessage): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single()

    if (error) {
      console.error('Error saving message:', error)
      return null
    }

    return data
  }

  static async getChatHistory(userId: string, limit = 100, offset = 0): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching chat history:', error)
      return []
    }

    return data || []
  }

  static async getRecentMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent messages:', error)
      return []
    }

    // Return in chronological order (oldest first)
    return (data || []).reverse()
  }

  static async deleteAllUserMessages(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting user messages:', error)
      return false
    }

    return true
  }
}