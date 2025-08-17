'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { supabase } from '@/lib/supabase';

interface SignInFormProps {
  onBackToWelcome: () => void;
  onShowSignUp: () => void;
}

export default function SignInForm({ onBackToWelcome, onShowSignUp }: SignInFormProps) {
  const { signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};

    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        }
        break;
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear auth error when user starts typing
    if (error) {
      clearError();
    }

    // Real-time validation
    const fieldErrors = validateField(name, value);
    setFormErrors(prev => {
      const newErrors = { ...prev };
      
      // Clear existing error for this field
      delete newErrors[name];
      
      // Add new errors if any
      return {
        ...newErrors,
        ...fieldErrors
      };
    });
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const fieldErrors = validateField(key, value);
      Object.assign(errors, fieldErrors);
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    
    if (!error) {
      // Success - user will be redirected by auth state change
      console.log('Sign in successful');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetError(error.message);
      } else {
        setResetMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
          setResetEmail('');
        }, 3000);
      }
    } catch (err: any) {
      setResetError('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(formData.email); // Pre-fill with current email
    setResetError('');
    setResetMessage('');
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetError('');
    setResetMessage('');
  };

  return (
    <div className="min-h-screen flex bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
      {/* Sidebar - matching existing design */}
      <aside className="hidden sm:flex w-16 bg-[#ede6f7] dark:bg-[#23232a] flex-col items-center py-4 border-r border-[#e0d7ee] dark:border-[#23232a] transition-colors">
        <button 
          onClick={showForgotPassword ? handleBackToSignIn : onBackToWelcome}
          className="mb-4 p-2 rounded hover:bg-[#e0d7ee] dark:hover:bg-[#23232a] transition-colors"
        >
          {/* Back arrow icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar - matching existing design */}
        <header className="w-full bg-[#2d2346] dark:bg-[#23232a] text-white flex items-center px-3 sm:px-6 py-2 justify-between transition-colors">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <button 
              onClick={showForgotPassword ? handleBackToSignIn : onBackToWelcome}
              className="mr-2 p-1 rounded hover:bg-[#3d3456] dark:hover:bg-[#2a2a32] transition-colors sm:hidden"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 29s-9-6.5-9-13.5A6.5 6.5 0 0 1 16 9a6.5 6.5 0 0 1 9 6.5C25 22.5 16 29 16 29z" fill="#ff6b81" stroke="#b15b6b" strokeWidth="1.5"/>
                <circle cx="13" cy="16" r="1.2" fill="#fff"/>
                <circle cx="19" cy="16" r="1.2" fill="#fff"/>
                <path d="M14 19c.5.5 1.5.5 2 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
                <g>
                  <circle cx="23.5" cy="10" r="2" fill="#5b5fc7"/>
                  <path d="M23.5 7.5v5M21 10h5" stroke="#ffe066" strokeWidth="0.8" strokeLinecap="round"/>
                </g>
              </svg>
            </span>
            Krismini
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs">
              {showForgotPassword ? 'Reset your password' : 'Welcome back'}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
          </div>
        </header>

        {/* Sign in form or forgot password form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-md">
            {!showForgotPassword ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                    <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Welcome</span>
                    <br />
                    <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Back</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sign in to continue your conversations with Krismini
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 ${
                        formErrors.email 
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#5b5fc7] dark:focus:ring-[#b5a7d6]'
                      }`}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 ${
                          formErrors.password 
                            ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:ring-[#5b5fc7] dark:focus:ring-[#b5a7d6]'
                        }`}
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Forgot password link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleShowForgotPassword}
                      className="text-sm text-[#5b5fc7] dark:text-[#b5a7d6] hover:underline"
                      disabled={loading}
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* Auth error display */}
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading || Object.keys(formErrors).length > 0}
                    className="w-full bg-[#5b5fc7] hover:bg-[#4a4fb5] dark:bg-[#b5a7d6] dark:hover:bg-[#a396c9] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white dark:text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        Signing In...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Sign up link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Don't have an account?{' '}
                    <button
                      onClick={onShowSignUp}
                      className="text-[#5b5fc7] dark:text-[#b5a7d6] hover:underline font-medium"
                      disabled={loading}
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Forgot Password Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                    <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Reset</span>
                    <br />
                    <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Password</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                {/* Forgot Password Form */}
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="resetEmail"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError('');
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5b5fc7] dark:focus:ring-[#b5a7d6] bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100"
                      placeholder="Enter your email"
                      disabled={resetLoading}
                    />
                    {resetError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{resetError}</p>
                    )}
                  </div>

                  {/* Success message */}
                  {resetMessage && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400">{resetMessage}</p>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="w-full bg-[#5b5fc7] hover:bg-[#4a4fb5] dark:bg-[#b5a7d6] dark:hover:bg-[#a396c9] disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white dark:text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {resetLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        Sending Reset Email...
                      </div>
                    ) : (
                      'Send Reset Email'
                    )}
                  </button>
                </form>

                {/* Back to sign in */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleBackToSignIn}
                    className="text-[#5b5fc7] dark:text-[#b5a7d6] hover:underline font-medium"
                    disabled={resetLoading}
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}