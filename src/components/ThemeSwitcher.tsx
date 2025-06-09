'use client';
import React, { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    // Default to dark mode unless localStorage is 'light'
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      setDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDark(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  function toggleTheme() {
    setDark((d) => {
      const next = !d;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#23232a] shadow hover:bg-gray-100 dark:hover:bg-[#23232a] transition-colors"
    >
      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{dark ? 'Dark' : 'Light'}</span>
      <span className={`w-8 h-4 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 ${dark ? 'justify-end' : 'justify-start'}`}>
        <span className="w-3 h-3 bg-[#5b5fc7] dark:bg-[#b5a7d6] rounded-full shadow-md transition-colors duration-300"></span>
      </span>
    </button>
  );
} 