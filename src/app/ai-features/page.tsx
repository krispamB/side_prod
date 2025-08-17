'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { UserProfile } from '../../components/UserProfile';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useAuth } from '@/contexts/AuthContext';
import { formatMessageTimestamp, formatDateSeparator, isSameDay } from '@/utils/dateUtils';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

const features = [
  {
    title: 'Give me a pep talk for my big day',
    description: '',
  },
  {
    title: 'Help me decide what to eat tonight',
    description: '',
  },
  {
    title: 'Remind me why I\'m awesome',
    description: '',
  },
  {
    title: 'Suggest a fun activity for us',
    description: '',
  },
];

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="w-2 h-2 rounded-full bg-[#b5a7d6] dark:bg-[#5b5fc7] animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-2 h-2 rounded-full bg-[#5b5fc7] dark:bg-[#b15b6b] animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2 h-2 rounded-full bg-[#b15b6b] dark:bg-[#b5a7d6] animate-bounce"></span>
    </span>
  );
}

export default function AIFeaturesPage() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Use the new chat persistence hook
  const {
    messages,
    isLoading: historyLoading,
    isLoadingMore,
    isSaving,
    hasMore,
    totalCount,
    error: persistenceError,
    sendMessage,
    loadMoreHistory,
    retryFailedMessages,
    clearError,
    queueStatus
  } = useChatPersistence();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    
    const userMessage = input.trim();
    setInput('');
    setApiLoading(true);
    setApiError(null);
    clearError();
    
    try {
      // Get AI response
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });
      
      if (!res.ok) {
        let errorMessage = 'Failed to get AI response';
        
        if (res.status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (res.status === 500) {
          errorMessage = 'AI service is temporarily unavailable. Please try again.';
        } else if (res.status === 403) {
          errorMessage = 'Access denied. Please check your account status.';
        } else if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network and try again.';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      
      if (!data.response) {
        throw new Error('AI response was empty. Please try rephrasing your message.');
      }
      
      const aiMessage = data.response;
      
      // Save both messages with persistence
      await sendMessage(userMessage, aiMessage);
      
    } catch (err: any) {
      let errorMessage = 'Something went wrong';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setApiError(errorMessage);
    } finally {
      setApiLoading(false);
    }
  }

  // Auto-scroll to bottom when new messages are added (but not when loading more history)
  useEffect(() => {
    if (chatContainerRef.current && !isLoadingMore) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, apiLoading, isLoadingMore]);

  // Handle scroll for pagination
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop } = chatContainerRef.current;
    
    // Load more when scrolled near the top (within 100px)
    if (scrollTop < 100) {
      loadMoreHistory();
    }
  }, [isLoadingMore, hasMore, loadMoreHistory]);

  // Add scroll listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Combined loading state (don't show main loading for pagination)
  const isLoading = apiLoading || historyLoading;
  
  // Combined error state
  const error = apiError || persistenceError;

  return (
    <div className="min-h-screen flex bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden sm:flex w-16 bg-[#ede6f7] dark:bg-[#23232a] flex-col items-center py-4 border-r border-[#e0d7ee] dark:border-[#23232a] transition-colors">
        <button className="mb-4 p-2 rounded hover:bg-[#e0d7ee] dark:hover:bg-[#23232a]">
          {/* Hamburger icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect y="5" width="24" height="2" rx="1" fill="#888"/><rect y="11" width="24" height="2" rx="1" fill="#888"/><rect y="17" width="24" height="2" rx="1" fill="#888"/></svg>
        </button>
        <button className="mt-auto mb-2 p-2 rounded-full bg-white dark:bg-[#23232a] shadow hover:bg-[#e0d7ee] dark:hover:bg-[#23232a]">
          {/* Plus icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#b5a7d6" strokeWidth="2" fill="#f5f0fa"/><path d="M12 8v8M8 12h8" stroke="#b5a7d6" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        {/* Top bar */}
        <header className="w-full bg-[#2d2346] dark:bg-[#23232a] text-white flex items-center px-3 sm:px-6 py-2 transition-colors">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <span>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 29s-9-6.5-9-13.5A6.5 6.5 0 0 1 16 9a6.5 6.5 0 0 1 9 6.5C25 22.5 16 29 16 29z" fill="#ff6b81" stroke="#b15b6b" strokeWidth="1.5"/>
                <circle cx="13" cy="16" r="1.2" fill="#fff"/>
                <circle cx="19" cy="16" r="1.2" fill="#fff"/>
                <path d="M14 19c.5.5 1.5.5 2 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                {/* Sparkle accent */}
                <g>
                  <circle cx="23.5" cy="10" r="2" fill="#5b5fc7"/>
                  <path d="M23.5 7.5v5M21 10h5" stroke="#ffe066" strokeWidth="0.8" strokeLinecap="round"/>
                </g>
              </svg>
            </span>
            <span className="hidden sm:inline">Krismini</span>
          </div>
          
          {/* Mobile-optimized center text */}
          <div className="flex-1 text-center px-2 sm:px-4">
            <div className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Talk to Chris, your very smart and helpful friend </span>
              <span className="sm:hidden">Talk to Chris, your very smart and helpful friend </span>
              <a href="#" className="underline whitespace-nowrap">Chat now</a>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeSwitcher />
            <UserProfile />
            <button className="hidden sm:block">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none"/><path d="M12 8v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
            </button>
          </div>
        </header>

        {/* Chat history */}
        <div
          ref={chatContainerRef}
          className="flex flex-col w-full max-w-2xl mx-auto mt-2 mb-2 overflow-y-auto flex-1 bg-[#f8f9fa] dark:bg-[#1C1C1E] px-2 sm:px-0"
          style={{ paddingBottom: '88px', minHeight: '0' }}
        >
          {/* Load more button/indicator */}
          {hasMore && (
            <div className="w-full flex justify-center py-4">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  Loading older messages...
                </div>
              ) : (
                <button
                  onClick={loadMoreHistory}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 px-4 py-2 rounded-full bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                >
                  ↑ Load older messages
                </button>
              )}
            </div>
          )}

          {messages.map((msg, idx) => {
            // Check if we need to show a date separator
            const showDateSeparator = idx === 0 || !isSameDay(messages[idx - 1].created_at, msg.created_at);
            
            // Check if we should show timestamp (show for last message in a group or if more than 5 minutes apart)
            const nextMsg = messages[idx + 1];
            const prevMsg = messages[idx - 1];
            const showTimestamp = !nextMsg || 
              nextMsg.role !== msg.role || 
              (new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime()) > 5 * 60 * 1000;
            
            // Check if this is the first message in a group (for spacing)
            const isFirstInGroup = !prevMsg || 
              prevMsg.role !== msg.role || 
              (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) > 5 * 60 * 1000;
            
            return (
              <React.Fragment key={msg.tempId || msg.id}>
                {/* Date separator */}
                {showDateSeparator && (
                  <div className="w-full flex justify-center py-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
                      {formatDateSeparator(msg.created_at)}
                    </div>
                  </div>
                )}
                
                {/* Message bubble */}
                <div className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} px-1 sm:px-2 ${isFirstInGroup ? 'mb-1 mt-2' : 'mb-0.5'}`}>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[85%] md:max-w-[75%]`}>
                    {/* Message content */}
                    <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-base shadow-sm relative transition-all duration-200 ${
                      msg.role === 'user' 
                        ? 'bg-[#007AFF] text-white rounded-br-md' // iOS blue for user messages
                        : 'bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                    } ${msg.isOptimistic ? 'opacity-75 scale-95' : 'opacity-100 scale-100'}`}>
                      {msg.role === 'ai' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                      
                      {/* Retry indicator */}
                      {msg.isOptimistic && msg.retryCount && msg.retryCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">!</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp - always visible for messaging app feel */}
                    {showTimestamp && (
                      <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatMessageTimestamp(msg.created_at)}
                        {msg.role === 'user' && !msg.isOptimistic && (
                          <span className="ml-1 text-blue-500">✓</span> // Delivered checkmark
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          {isLoading && (
            <div className="w-full flex justify-start px-2 mb-1">
              <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-gray-700 shadow-sm">
                  <TypingDots />
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                  Chris is typing...
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="w-full flex justify-center px-4 py-2">
              <div id="chat-error" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 max-w-sm" role="alert">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      {persistenceError ? 'Connection Issue' : 'Message Error'}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    {queueStatus.queueLength > 0 && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        {queueStatus.queueLength} message{queueStatus.queueLength > 1 ? 's' : ''} queued for retry
                      </div>
                    )}
                    <div className="mt-2 flex gap-2">
                      {queueStatus.queueLength > 0 && (
                        <button
                          onClick={retryFailedMessages}
                          className="text-xs text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                        >
                          Retry Now
                        </button>
                      )}
                      <button
                        onClick={clearError}
                        className="text-xs text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isSaving && (
            <div className="w-full flex justify-center px-4 py-1">
              <div className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving conversation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Greeting and features only if chat is empty */}
        {messages.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 pb-32">
            <div className="w-full max-w-5xl">
              <div className="mb-6 mt-4 sm:mb-8 sm:mt-10">
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center px-2">
                  <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Hello,</span> <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Friend</span>
                </h1>
                <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-400 dark:text-gray-300 font-light text-center mt-2 px-2">
                  How can I help you today?
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6 justify-center px-2">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-[#e7e0ef] dark:bg-[#23232a] rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 flex flex-col items-start min-h-[90px] sm:min-h-[100px] lg:min-h-[120px] hover:shadow-md transition-shadow cursor-pointer border border-transparent dark:border-gray-700 w-full active:scale-95 transition-transform"
                    onClick={() => setInput(feature.title)}
                  >
                    <div className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 mb-2 leading-tight">{feature.title}</div>
                    {feature.description && (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-300">{feature.description}</div>
                    )}
                    <div className="mt-auto self-end">
                      <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#bbb" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="2" fill="#bbb"/></svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom input bar */}
        <footer className="fixed bottom-0 left-0 sm:left-16 right-0 bg-white dark:bg-[#1C1C1E] border-t border-gray-200 dark:border-gray-700 py-2 sm:py-3 px-2 sm:px-4 flex items-center transition-colors safe-area-inset-bottom" style={{zIndex: 50}}>
          <form className="flex w-full max-w-2xl mx-auto items-end gap-2" onSubmit={handleSend}>
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#2C2C2E] rounded-full border border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-2 min-h-[44px]">
              <input
                type="text"
                placeholder="Message Chris..."
                className="flex-1 bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 text-base placeholder-gray-500 dark:placeholder-gray-400 min-h-[24px]"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading || !user}
                aria-label="Type your message to Chris"
                aria-describedby={error ? "chat-error" : undefined}
              />
              {!input.trim() && (
                <button type="button" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2" tabIndex={-1} disabled={isLoading || !user}>
                  {/* Mic icon */}
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <rect x="9" y="4" width="6" height="12" rx="3" fill="currentColor" className="text-gray-500 dark:text-gray-400"/>
                    <path d="M5 11v1a7 7 0 0014 0v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-500 dark:text-gray-400"/>
                  </svg>
                </button>
              )}
            </div>
            {input.trim() && (
              <button 
                type="submit" 
                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-[#007AFF] hover:bg-[#0056CC] disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center transition-colors flex-shrink-0" 
                disabled={isLoading || !input.trim() || !user}
              >
                {/* Send icon */}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path d="M3 12l18-7-7 18-2.5-7L3 12z" fill="white"/>
                </svg>
              </button>
            )}
          </form>
        </footer>
      </div>
    </div>
  );
} 