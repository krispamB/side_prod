import { useState, useEffect, useCallback } from 'react'
import { ChatService } from '@/lib/chatService'
import { ChatMessage, ChatMessageWithMetadata } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

export interface UseChatPersistenceReturn {
  messages: ChatMessageWithMetadata[]
  isLoading: boolean
  isLoadingMore: boolean
  isSaving: boolean
  hasMore: boolean
  totalCount?: number
  error: string | null
  sendMessage: (userMessage: string, aiMessage: string) => Promise<void>
  loadHistory: () => Promise<void>
  loadMoreHistory: () => Promise<void>
  retryFailedMessages: () => Promise<void>
  clearError: () => void
  queueStatus: {
    queueLength: number
    isProcessing: boolean
  }
}

export function useChatPersistence(): UseChatPersistenceReturn {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessageWithMetadata[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [queueStatus, setQueueStatus] = useState({ queueLength: 0, isProcessing: false })

  // Update queue status periodically
  useEffect(() => {
    const updateQueueStatus = () => {
      const status = ChatService.getQueueStatus()
      setQueueStatus({
        queueLength: status.queueLength,
        isProcessing: status.isProcessing
      })
    }

    updateQueueStatus()
    const interval = setInterval(updateQueueStatus, 2000)
    return () => clearInterval(interval)
  }, [])

  // Load chat history when user changes
  useEffect(() => {
    if (user?.id) {
      loadHistory()
    } else {
      setMessages([])
    }
  }, [user?.id])

  const loadHistory = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await ChatService.loadRecentChatHistory(user.id, 50)
      
      if (result.success && result.data) {
        const messagesWithMetadata: ChatMessageWithMetadata[] = result.data.map(msg => ({
          ...msg,
          isOptimistic: false
        }))
        setMessages(messagesWithMetadata)
        setHasMore(result.hasMore)
        setTotalCount(result.totalCount)
      } else {
        setError(result.error || 'Failed to load chat history')
        setMessages([])
        setHasMore(false)
        setTotalCount(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history')
      setMessages([])
      setHasMore(false)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  const loadMoreHistory = useCallback(async () => {
    if (!user?.id || !hasMore || isLoadingMore || messages.length === 0) return

    setIsLoadingMore(true)
    setError(null)

    try {
      // Get the oldest message's timestamp to load messages before it
      const oldestMessage = messages[0]
      const beforeDate = oldestMessage.created_at

      const result = await ChatService.loadOlderMessages(user.id, beforeDate, 50)
      
      if (result.success && result.data) {
        const olderMessagesWithMetadata: ChatMessageWithMetadata[] = result.data.map(msg => ({
          ...msg,
          isOptimistic: false
        }))
        
        // Prepend older messages to the beginning of the array
        setMessages(prev => [...olderMessagesWithMetadata, ...prev])
        setHasMore(result.hasMore)
      } else {
        setError(result.error || 'Failed to load more chat history')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more chat history')
    } finally {
      setIsLoadingMore(false)
    }
  }, [user?.id, hasMore, isLoadingMore, messages])

  const sendMessage = useCallback(async (userMessage: string, aiMessage: string) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Get optimistic messages and save promise
      const { userOptimistic, aiOptimistic, savePromise } = await ChatService.saveConversationPair(
        user.id,
        userMessage,
        aiMessage
      )

      // Immediately add optimistic messages to UI
      setMessages(prev => [...prev, userOptimistic, aiOptimistic])

      // Handle the save result
      const saveResult = await savePromise

      if (saveResult.success && saveResult.data && saveResult.data.length === 2) {
        // Replace optimistic messages with real ones
        setMessages(prev => {
          const filtered = prev.filter(
            msg => msg.tempId !== userOptimistic.tempId && msg.tempId !== aiOptimistic.tempId
          )
          
          const realMessages: ChatMessageWithMetadata[] = saveResult.data!.map(msg => ({
            ...msg,
            isOptimistic: false
          }))
          
          return [...filtered, ...realMessages]
        })
      } else {
        // Mark optimistic messages as failed but keep them visible
        setMessages(prev => prev.map(msg => {
          if (msg.tempId === userOptimistic.tempId || msg.tempId === aiOptimistic.tempId) {
            return { ...msg, isOptimistic: true, retryCount: 1 }
          }
          return msg
        }))

        if (saveResult.error) {
          setError(`Message queued for retry: ${saveResult.error}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSaving(false)
    }
  }, [user?.id])

  const retryFailedMessages = useCallback(async () => {
    if (!user?.id) return

    try {
      await ChatService.processQueue()
      // Update queue status after processing
      const status = ChatService.getQueueStatus()
      setQueueStatus({
        queueLength: status.queueLength,
        isProcessing: status.isProcessing
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry messages')
    }
  }, [user?.id])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    isLoadingMore,
    isSaving,
    hasMore,
    totalCount,
    error,
    sendMessage,
    loadHistory,
    loadMoreHistory,
    retryFailedMessages,
    clearError,
    queueStatus
  }
}