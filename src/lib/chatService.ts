import { DatabaseService, DatabaseResult } from './database'
import { ChatMessage, NewChatMessage, MessageQueue, ChatMessageWithMetadata } from '@/types/database'

export interface ChatServiceConfig {
  enableOfflineQueue: boolean
  maxRetries: number
  retryDelay: number
}

const DEFAULT_CONFIG: ChatServiceConfig = {
  enableOfflineQueue: true,
  maxRetries: 3,
  retryDelay: 2000
}

export class ChatService {
  private static messageQueue: MessageQueue[] = []
  private static isProcessingQueue = false
  private static config = DEFAULT_CONFIG

  // Generate temporary ID for optimistic updates
  private static generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Save a single message with optimistic UI support
  static async saveMessage(
    userId: string,
    role: 'user' | 'ai',
    content: string,
    tempId?: string
  ): Promise<{
    optimisticMessage: ChatMessageWithMetadata
    savePromise: Promise<DatabaseResult<ChatMessage>>
  }> {
    const messageId = tempId || this.generateTempId()
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: ChatMessageWithMetadata = {
      id: messageId,
      user_id: userId,
      role,
      content,
      created_at: new Date().toISOString(),
      isOptimistic: true,
      tempId: messageId
    }

    // Create the actual save operation
    const savePromise = this.performSaveMessage(userId, role, content, messageId)

    return {
      optimisticMessage,
      savePromise
    }
  }

  // Perform the actual save operation with retry logic
  private static async performSaveMessage(
    userId: string,
    role: 'user' | 'ai',
    content: string,
    tempId: string
  ): Promise<DatabaseResult<ChatMessage>> {
    const newMessage: NewChatMessage = {
      user_id: userId,
      role,
      content
    }

    try {
      const result = await DatabaseService.saveMessage(newMessage)
      
      if (!result.success && this.config.enableOfflineQueue) {
        // Add to offline queue if save fails
        this.addToQueue({
          id: tempId,
          message: newMessage,
          timestamp: Date.now(),
          retryCount: 0
        })
      }

      return result
    } catch (error) {
      // Handle network errors by queuing the message
      if (this.config.enableOfflineQueue) {
        this.addToQueue({
          id: tempId,
          message: newMessage,
          timestamp: Date.now(),
          retryCount: 0
        })
      }

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to save message',
        success: false
      }
    }
  }

  // Save both user and AI messages as a conversation pair
  static async saveConversationPair(
    userId: string,
    userMessage: string,
    aiMessage: string
  ): Promise<{
    userOptimistic: ChatMessageWithMetadata
    aiOptimistic: ChatMessageWithMetadata
    savePromise: Promise<DatabaseResult<ChatMessage[]>>
  }> {
    const userTempId = this.generateTempId()
    const aiTempId = this.generateTempId()
    const timestamp = new Date().toISOString()

    // Create optimistic messages
    const userOptimistic: ChatMessageWithMetadata = {
      id: userTempId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      created_at: timestamp,
      isOptimistic: true,
      tempId: userTempId
    }

    const aiOptimistic: ChatMessageWithMetadata = {
      id: aiTempId,
      user_id: userId,
      role: 'ai',
      content: aiMessage,
      created_at: new Date(Date.now() + 1000).toISOString(), // AI message slightly later
      isOptimistic: true,
      tempId: aiTempId
    }

    // Create save operation for both messages
    const savePromise = this.performSaveConversationPair(
      userId,
      userMessage,
      aiMessage,
      userTempId,
      aiTempId
    )

    return {
      userOptimistic,
      aiOptimistic,
      savePromise
    }
  }

  private static async performSaveConversationPair(
    userId: string,
    userMessage: string,
    aiMessage: string,
    userTempId: string,
    aiTempId: string
  ): Promise<DatabaseResult<ChatMessage[]>> {
    const messages: NewChatMessage[] = [
      {
        user_id: userId,
        role: 'user',
        content: userMessage
      },
      {
        user_id: userId,
        role: 'ai',
        content: aiMessage
      }
    ]

    try {
      const result = await DatabaseService.saveMessages(messages)
      
      if (!result.success && this.config.enableOfflineQueue) {
        // Add both messages to queue if save fails
        messages.forEach((msg, index) => {
          this.addToQueue({
            id: index === 0 ? userTempId : aiTempId,
            message: msg,
            timestamp: Date.now(),
            retryCount: 0
          })
        })
      }

      return result
    } catch (error) {
      if (this.config.enableOfflineQueue) {
        messages.forEach((msg, index) => {
          this.addToQueue({
            id: index === 0 ? userTempId : aiTempId,
            message: msg,
            timestamp: Date.now(),
            retryCount: 0
          })
        })
      }

      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to save conversation',
        success: false
      }
    }
  }

  // Load chat history with error handling
  static async loadChatHistory(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<DatabaseResult<ChatMessage[]>> {
    try {
      return await DatabaseService.getChatHistory(userId, limit, offset)
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to load chat history',
        success: false
      }
    }
  }

  // Load recent chat history with pagination support
  static async loadRecentChatHistory(
    userId: string,
    limit = 50
  ): Promise<DatabaseResult<ChatMessage[]> & { hasMore: boolean; totalCount?: number }> {
    try {
      const result = await DatabaseService.getRecentChatHistory(userId, limit)
      return {
        data: result.data,
        error: result.error,
        success: result.success,
        hasMore: result.hasMore,
        totalCount: result.totalCount
      }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to load recent chat history',
        success: false,
        hasMore: false
      }
    }
  }

  // Load older messages for pagination
  static async loadOlderMessages(
    userId: string,
    beforeDate: string,
    limit = 50
  ): Promise<DatabaseResult<ChatMessage[]> & { hasMore: boolean }> {
    try {
      const result = await DatabaseService.getOlderMessages(userId, beforeDate, limit)
      return {
        data: result.data,
        error: result.error,
        success: result.success,
        hasMore: result.hasMore
      }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to load older messages',
        success: false,
        hasMore: false
      }
    }
  }

  // Offline queue management
  private static addToQueue(queueItem: MessageQueue): void {
    this.messageQueue.push(queueItem)
    this.processQueue() // Try to process immediately
  }

  static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    try {
      const itemsToProcess = [...this.messageQueue]
      
      for (let i = itemsToProcess.length - 1; i >= 0; i--) {
        const item = itemsToProcess[i]
        
        try {
          const result = await DatabaseService.saveMessage(item.message)
          
          if (result.success) {
            // Remove from queue on success
            this.messageQueue = this.messageQueue.filter(q => q.id !== item.id)
          } else {
            // Increment retry count
            const queueIndex = this.messageQueue.findIndex(q => q.id === item.id)
            if (queueIndex !== -1) {
              this.messageQueue[queueIndex].retryCount++
              
              // Remove if max retries exceeded
              if (this.messageQueue[queueIndex].retryCount >= this.config.maxRetries) {
                this.messageQueue.splice(queueIndex, 1)
                console.warn(`Message ${item.id} removed from queue after ${this.config.maxRetries} failed attempts`)
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to process queued message ${item.id}:`, error)
          
          // Increment retry count on error
          const queueIndex = this.messageQueue.findIndex(q => q.id === item.id)
          if (queueIndex !== -1) {
            this.messageQueue[queueIndex].retryCount++
            
            if (this.messageQueue[queueIndex].retryCount >= this.config.maxRetries) {
              this.messageQueue.splice(queueIndex, 1)
              console.warn(`Message ${item.id} removed from queue after ${this.config.maxRetries} failed attempts`)
            }
          }
        }
      }
    } finally {
      this.isProcessingQueue = false
    }

    // Schedule next processing if queue is not empty
    if (this.messageQueue.length > 0) {
      setTimeout(() => this.processQueue(), this.config.retryDelay)
    }
  }

  // Get queue status for debugging
  static getQueueStatus(): {
    queueLength: number
    isProcessing: boolean
    items: MessageQueue[]
  } {
    return {
      queueLength: this.messageQueue.length,
      isProcessing: this.isProcessingQueue,
      items: [...this.messageQueue]
    }
  }

  // Clear the queue (useful for testing or manual intervention)
  static clearQueue(): void {
    this.messageQueue = []
  }

  // Update configuration
  static updateConfig(newConfig: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Check if we're online and can save messages
  static async isOnline(): Promise<boolean> {
    try {
      const healthCheck = await DatabaseService.healthCheck()
      return healthCheck.success
    } catch {
      return false
    }
  }
}