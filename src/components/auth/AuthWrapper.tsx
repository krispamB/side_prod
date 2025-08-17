'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthContainer from './AuthContainer';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, error } = useAuth();

  // Show loading state during authentication checks
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#b5a7d6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state only for critical authentication errors (not form-level errors)
  // Form-level errors should be handled by the individual auth forms
  const isCriticalError = error && (
    error.includes('session') || 
    error.includes('network') || 
    error.includes('server') ||
    error.includes('connection')
  );

  if (isCriticalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4fb5] text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conditional rendering based on authentication status
  if (!user) {
    // User is not authenticated - show auth pages
    return <AuthContainer />;
  }

  // User is authenticated - show the main app (chat interface)
  return <>{children}</>;
}