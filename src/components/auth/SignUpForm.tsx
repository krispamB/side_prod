'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface SignUpFormProps {
  onBackToWelcome: () => void;
  onShowSignIn: () => void;
}

export default function SignUpForm({ onBackToWelcome, onShowSignIn }: SignUpFormProps) {
  const { signUp, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const errors: { [key: string]: string } = {};

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
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        // Check confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          // Clear confirm password error if passwords now match
          const newErrors = { ...formErrors };
          delete newErrors.confirmPassword;
          setFormErrors(newErrors);
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear auth error and confirmation message when user starts typing
    if (error) {
      clearError();
    }
    if (showConfirmation) {
      setShowConfirmation(false);
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
    const errors: { [key: string]: string } = {};

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

    const { error } = await signUp(formData.email, formData.password);

    if (!error) {
      // Show confirmation message
      setShowConfirmation(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f0fa] dark:bg-[#18181b] transition-colors">
      {/* Sidebar - matching existing design */}
      <aside className="hidden sm:flex w-16 bg-[#ede6f7] dark:bg-[#23232a] flex-col items-center py-4 border-r border-[#e0d7ee] dark:border-[#23232a] transition-colors">
        <button
          onClick={onBackToWelcome}
          className="mb-4 p-2 rounded hover:bg-[#e0d7ee] dark:hover:bg-[#23232a] transition-colors"
        >
          {/* Back arrow icon */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top bar - matching existing design */}
        <header className="w-full bg-[#2d2346] dark:bg-[#23232a] text-white flex items-center px-3 sm:px-6 py-2 justify-between transition-colors">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <button
              onClick={onBackToWelcome}
              className="mr-2 p-1 rounded hover:bg-[#3d3456] dark:hover:bg-[#2a2a32] transition-colors sm:hidden"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 29s-9-6.5-9-13.5A6.5 6.5 0 0 1 16 9a6.5 6.5 0 0 1 9 6.5C25 22.5 16 29 16 29z" fill="#ff6b81" stroke="#b15b6b" strokeWidth="1.5" />
                <circle cx="13" cy="16" r="1.2" fill="#fff" />
                <circle cx="19" cy="16" r="1.2" fill="#fff" />
                <path d="M14 19c.5.5 1.5.5 2 0" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                <g>
                  <circle cx="23.5" cy="10" r="2" fill="#5b5fc7" />
                  <path d="M23.5 7.5v5M21 10h5" stroke="#ffe066" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              </svg>
            </span>
            Krismini
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs">Create your account</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
          </div>
        </header>

        {/* Sign up form */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="text-[#5b5fc7] dark:text-[#b5a7d6]">Create</span>
                <br />
                <span className="text-[#b15b6b] dark:text-[#5b5fc7]">Account</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Join Krismini and start your personalized AI journey
              </p>
            </div>

            {/* Confirmation Message */}
            {showConfirmation && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                      Check Your Email!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      We've sent a confirmation link to <strong>{formData.email}</strong>.
                      Please check your email and click the link to activate your account.
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={onShowSignIn}
                    className="text-sm text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 underline"
                  >
                    Already confirmed? Sign in here
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            {!showConfirmation && (
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
                    className={`w-full px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 ${formErrors.email
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
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 ${formErrors.password
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#5b5fc7] dark:focus:ring-[#b5a7d6]'
                        }`}
                      placeholder="Create a password"
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
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-[#23232a] text-gray-900 dark:text-gray-100 ${formErrors.confirmPassword
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#5b5fc7] dark:focus:ring-[#b5a7d6]'
                        }`}
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
                  )}
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
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Sign in link */}
            {!showConfirmation && (
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <button
                    onClick={onShowSignIn}
                    className="text-[#5b5fc7] dark:text-[#b5a7d6] hover:underline font-medium"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}