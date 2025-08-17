'use client';

import React, { useState } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface WelcomePageProps {
  onShowSignUp: () => void;
  onShowSignIn: () => void;
}

export default function WelcomePage({ onShowSignUp, onShowSignIn }: WelcomePageProps) {
  const [currentView, setCurrentView] = useState<'welcome' | 'signup' | 'signin'>('welcome');

  const handleShowSignUp = () => {
    setCurrentView('signup');
    onShowSignUp();
  };

  const handleShowSignIn = () => {
    setCurrentView('signin');
    onShowSignIn();
  };

  return (
    <div className="min-h-screen flex bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
      {/* Sidebar - matching existing design */}
      <aside className="hidden sm:flex w-16 bg-[#ede6f7] dark:bg-[#23232a] flex-col items-center py-4 border-r border-[#e0d7ee] dark:border-[#23232a] transition-colors">
        <button className="mb-4 p-2 rounded hover:bg-[#e0d7ee] dark:hover:bg-[#23232a]">
          {/* Hamburger icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <rect y="5" width="24" height="2" rx="1" fill="#888"/>
            <rect y="11" width="24" height="2" rx="1" fill="#888"/>
            <rect y="17" width="24" height="2" rx="1" fill="#888"/>
          </svg>
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar - matching existing design */}
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
            <span className="text-xs">Your smart and helpful AI friend</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
          </div>
        </header>

        {/* Welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-md">
            {/* Welcome message */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Welcome to</span>
                <br />
                <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Krismini</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Your personal AI companion that remembers every conversation
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign up or sign in to start chatting and keep your conversations forever
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <button
                onClick={handleShowSignUp}
                className="w-full bg-[#5b5fc7] hover:bg-[#4a4fb5] dark:bg-[#b5a7d6] dark:hover:bg-[#a396c9] text-white dark:text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Create Account
              </button>
              
              <button
                onClick={handleShowSignIn}
                className="w-full bg-white dark:bg-[#23232a] hover:bg-[#f8f6fc] dark:hover:bg-[#2a2a32] text-[#5b5fc7] dark:text-[#b5a7d6] font-semibold py-3 px-6 rounded-xl border-2 border-[#5b5fc7] dark:border-[#b5a7d6] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </div>

            {/* Features preview */}
            <div className="mt-12 text-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                What you'll get:
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#5b5fc7] dark:bg-[#b5a7d6]"></div>
                  <span>Persistent chat history across all devices</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#b15b6b] dark:bg-[#5b5fc7]"></div>
                  <span>Personalized AI responses that learn from you</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#5b5fc7] dark:bg-[#b5a7d6]"></div>
                  <span>Secure and private conversations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}