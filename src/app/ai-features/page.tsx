'use client';
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { UserProfile } from '../../components/UserProfile';

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

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

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
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      if (!res.ok) throw new Error('Failed to get response from Gemini');
      const data = await res.json();
      setChat((prev) => [...prev, { role: 'ai', content: data.response }]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, loading]);

  return (
    <div className="min-h-screen flex bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
      {/* Sidebar */}
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
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar */}
        <header className="w-full bg-[#2d2346] dark:bg-[#23232a] text-white flex items-center px-3 sm:px-6 py-2 justify-between transition-colors">
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
            Krismini
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs">Talk to Chris, your very smart and helpful friend <a href="#" className="underline">Chat now</a></span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
            <UserProfile />
            <button>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" fill="none"/><path d="M12 8v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
            </button>
          </div>
        </header>

        {/* Chat history */}
        <div
          ref={chatContainerRef}
          className="flex flex-col items-center w-full max-w-2xl mx-auto mt-4 sm:mt-6 mb-2 px-1 sm:px-2 gap-2 overflow-y-auto flex-1"
          style={{ paddingBottom: '88px', minHeight: '0' }}
        >
          {chat.map((msg, idx) => (
            <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 max-w-[95%] sm:max-w-[80%] text-base border transition-colors ${msg.role === 'user' ? 'bg-[#d1c4e9] dark:bg-[#23232a] text-right text-gray-900 dark:text-gray-100 border-[#d1c4e9] dark:border-[#23232a]' : 'bg-white dark:bg-[#23232a] text-left text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'}`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="w-full flex justify-start">
              <div className="rounded-2xl px-3 py-2 sm:px-4 sm:py-2 bg-white dark:bg-[#23232a] border border-gray-200 dark:border-gray-700 max-w-[95%] sm:max-w-[80%] text-left">
                <TypingDots />
              </div>
            </div>
          )}
          {error && (
            <div className="w-full flex justify-center"><div className="text-red-500 text-sm">{error}</div></div>
          )}
        </div>

        {/* Greeting and features only if chat is empty */}
        {chat.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-2 pb-32">
            <div className="w-full max-w-5xl">
              <div className="mb-6 mt-8 sm:mb-8 sm:mt-10">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-center">
                  <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Hello,</span> <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Friend</span>
                </h1>
                <h2 className="text-lg sm:text-2xl md:text-3xl text-gray-400 dark:text-gray-300 font-light text-center mt-2">
                  How can I help you today?
                </h2>
              </div>
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 justify-center">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-[#e7e0ef] dark:bg-[#23232a] rounded-xl shadow-sm p-4 sm:p-6 flex flex-col items-start min-h-[100px] sm:min-h-[120px] hover:shadow-md transition-shadow cursor-pointer border border-transparent dark:border-gray-700 w-full"
                    onClick={() => setInput(feature.title)}
                  >
                    <div className="text-base sm:text-md font-medium text-gray-800 dark:text-gray-100 mb-2">{feature.title}</div>
                    {feature.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-300">{feature.description}</div>
                    )}
                    <div className="mt-auto self-end">
                      <span className="inline-block w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-300">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#bbb" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="2" fill="#bbb"/></svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom input bar */}
        <footer className="fixed bottom-0 left-0 sm:left-16 right-0 bg-white dark:bg-[#23232a] border-t border-gray-200 dark:border-gray-700 py-3 sm:py-4 px-2 sm:px-4 flex items-center transition-colors" style={{zIndex: 50}}>
          <form className="flex w-full max-w-full sm:max-w-3xl mx-auto items-center gap-2" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Enter a prompt here"
              className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#b5a7d6] dark:focus:ring-[#5b5fc7] bg-[#f5f0fa] dark:bg-[#18181b] text-gray-800 dark:text-gray-100 transition-colors text-base sm:text-base"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="button" className="p-2 rounded-full hover:bg-[#ede6f7] dark:hover:bg-[#23232a]" tabIndex={-1} disabled={loading}>
              {/* Mic icon */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="9" y="4" width="6" height="12" rx="3" fill="#b5a7d6"/><path d="M5 11v1a7 7 0 0014 0v-1" stroke="#b5a7d6" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <button type="submit" className="p-2 rounded-full hover:bg-[#ede6f7] dark:hover:bg-[#23232a]" disabled={loading || !input.trim()}>
              {/* Send icon */}
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M3 12l18-7-7 18-2.5-7L3 12z" stroke="#b5a7d6" strokeWidth="2" fill="#b5a7d6"/></svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
} 